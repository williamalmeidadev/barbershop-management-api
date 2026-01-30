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

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');

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

export function verifyTokenPage(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.redirect('/login');
  }
  const [, token] = authHeader.split(' ');
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não definida no .env");
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded as TokenPayload;
    return next();
  } catch (err) {
    return res.redirect('/login');
  }
}
