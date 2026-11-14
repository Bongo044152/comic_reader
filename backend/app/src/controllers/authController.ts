import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import { get } from '../utils/db.js';
import type { LoginRequestBody, User } from '../types/interface.js'

// 登入業務邏輯
// 只在密碼驗證成功後建立 session，其餘會傳錯誤碼
export async function login(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<any> {
    const { username, password } = req.body;
    try {
        const user = get<User>('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(404).json({ error: '請先申請帳號' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: '帳號或密碼錯誤' });
        }

        req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: '伺服器錯誤' });
            req.session.userId = user.id;
            return res.status(200).json({ message: '登入成功', user: { id: user.id, name: user.username } });
        });
    }
    catch (error) {
        logger.logger.error(error);
        return res.status(500).json({ error: '伺服器錯誤' });
    }
}

// 登出業務邏輯
// 不管是否登入皆清除 SessionId
export async function logout(req: Request, res: Response): Promise<any> {
    req.session.destroy(() => {
        res.clearCookie('sid');
        return res.status(204);
    });
}