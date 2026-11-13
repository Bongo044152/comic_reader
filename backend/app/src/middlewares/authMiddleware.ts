import type { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): any {
    if (req.path.startsWith('/api/auth')) {
        return next();
    }
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Session不存在或過期，請重新登入' });
    }
    next();
}