import { Request, Response, NextFunction } from 'express';
import { IUser } from '../interfaces/user';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user as IUser | undefined;

    if (!user) {
        return res.status(401).json({ 
            error: 'Usuário não autenticado' 
        });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Acesso negado: permissões de administrador necessárias' 
        });
    }

    return next();
};