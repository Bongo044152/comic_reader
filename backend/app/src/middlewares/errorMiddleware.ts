import type { Request, Response, NextFunction } from 'express';

// 4 個參數才會被 Express 視為 error handler，必須註冊在所有 route 之後
export function errorMiddleware(err: Error & { status?: number }, req: Request, res: Response, next: NextFunction): any {
    req.log.error({ err, method: req.method, url: req.originalUrl });
    if (res.headersSent) {
        return next(err);
    }
    const status = err.status ?? 500;
    return res.status(status).json({ error: status >= 500 ? '伺服器錯誤' : '請求錯誤' });
}
