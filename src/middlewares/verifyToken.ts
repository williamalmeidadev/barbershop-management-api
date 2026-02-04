import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader) {
    [, token] = authHeader.split(' ');
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map((c) => c.trim());
    const adminFound = cookies.find((c) => c.startsWith('admin_token='));
    const clientFound = cookies.find((c) => c.startsWith('client_token='));
    const found = adminFound || clientFound;
    if (found) {
      token = decodeURIComponent(found.split('=')[1] || '');
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error("JWT_SECRET não definida no .env");
    }

    const decoded = jwt.verify(token, secret);
    
    req.user = decoded as TokenPayload;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

function resolveBasePath(req: Request): string {
  const envBase = process.env.BASE_PATH;
  if (envBase) return envBase;
  const forwardedPrefix = req.headers['x-forwarded-prefix'];
  const prefix =
    (typeof forwardedPrefix === 'string' && forwardedPrefix) ||
    (Array.isArray(forwardedPrefix) && forwardedPrefix[0]) ||
    '';

  if (prefix && prefix.includes('/server08')) return '/server08';
  if (req.originalUrl.startsWith('/server08')) return '/server08';
  if (req.baseUrl && req.baseUrl.startsWith('/server08')) return '/server08';
  if (req.path && req.path.startsWith('/server08')) return '/server08';
  return '';
}

function clearAuthCookie(res: Response, cookieName: 'admin_token' | 'client_token') {
  res.clearCookie(cookieName, { path: '/' });
  // Compatibilidade para instalações onde o cookie foi criado com path no subpath.
  res.clearCookie(cookieName, { path: '/server08' });
}

function redirectToAdminLogin(req: Request, res: Response) {
  clearAuthCookie(res, 'admin_token');
  const basePath = resolveBasePath(req);
  return res.redirect(`${basePath}/admin-login`);
}

function redirectToClientLogin(req: Request, res: Response) {
  clearAuthCookie(res, 'client_token');
  const basePath = resolveBasePath(req);
  return res.redirect(`${basePath}/login`);
}

export function verifyTokenPage(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader) {
    [, token] = authHeader.split(' ');
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map((c) => c.trim());
    const found = cookies.find((c) => c.startsWith('admin_token='));
    if (found) {
      token = decodeURIComponent(found.split('=')[1] || '');
    }
  }
  if (!token) {
    return redirectToAdminLogin(req, res);
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não definida no .env");
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded as TokenPayload;
    return next();
  } catch (err) {
    return redirectToAdminLogin(req, res);
  }
}

export function verifyTokenPageClient(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  if (authHeader) {
    [, token] = authHeader.split(' ');
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map((c) => c.trim());
    const found = cookies.find((c) => c.startsWith('client_token='));
    if (found) {
      token = decodeURIComponent(found.split('=')[1] || '');
    }
  }
  if (!token) {
    return redirectToClientLogin(req, res);
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não definida no .env");
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded as TokenPayload;
    return next();
  } catch (err) {
    return redirectToClientLogin(req, res);
  }
}
