import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db, get, run } from '../utils/db.js';
import type { LoginRequestBody, User } from '../types/interface.js';

// 新增使用者
export async function createUser(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<any> {
    const { username, password } = req.body ?? {};
    if (typeof username !== 'string' || !username || typeof password !== 'string' || !password || Buffer.byteLength(password) > 72 /* bcrypt 只看前 72 bytes */) {
        return res.status(400).json({ error: '帳號或密碼格式錯誤' });
    }

    const hash = await bcrypt.hash(password, 10);
    try {
        const info = run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
        return res.status(201).json({ id: info.lastInsertRowid, username });
    }
    catch (error) {
        if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: '帳號已存在' });
        }
        throw error;
    }
}

// 刪除使用者
export async function deleteUser(req: Request<{ username: string }>, res: Response): Promise<any> {
    const deleted = db.transaction((username: string) => {
        const user = get<User>('SELECT id FROM users WHERE username = ?', [username]);
        if (!user) return false;
        // delete session
        run(`DELETE FROM sessions WHERE json_extract(sess, '$.userId') = ?`, [user.id]);
        // delete user
        run('DELETE FROM users WHERE id = ?', [user.id]);
        return true;
    })(req.params.username);

    if (!deleted) {
        return res.status(404).json({ error: '帳號不存在' });
    }
    return res.status(204).end();
}
