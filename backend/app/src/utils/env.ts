// 所有環境變數一律必填，沒有預設值；未設定（或空字串）就直接 throw
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is null or undefined!`);
    }
    return value;
}
