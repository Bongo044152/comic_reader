import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';
import { run, get } from '../utils/db.js';
import type { LoginRequestBody, User } from '../utils/interface.js'

// 登入業務邏輯
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
export async function logout(req: Request, res: Response): Promise<any> {
    req.session.destroy(() => {
        res.clearCookie('sid');
        return res.status(204).json();
    });
}

// 創建與刪除使用者只用來測試
export async function createUser(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<any> {
    const { username, password } = req.body;
    const user = get<User>('SELECT * FROM users WHERE username = ?', [username]);
    if (user) return res.status(500).json({ error: '帳號已存在' });
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const now = new Date(Date.now()).toISOString();
        run('INSERT INTO users (username, password_hash, created_at) VALUES(?, ?, ?)', [username, passwordHash, now]);
        const user = get<User>('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(500).json({ error: '伺服器錯誤' });
        }
        return res.status(200).json({ message: '登入成功', user: { id: user.id, name: user.username } });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: '伺服器錯誤' });
    }
}

export async function deleteUser(req: Request, res: Response): Promise<any> {
    const username = req.body.username;
    const user = get<User>('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(500).json({ error: '伺服器錯誤' });
    run('DELETE FROM users WHERE username = ?', [username]);
    req.session.destroy(() => {
        res.clearCookie('sid');
    });
    return res.status(200).json({ message: '帳號刪除成功' });
}