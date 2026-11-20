export interface LoginRequestBody {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
}