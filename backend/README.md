# Backend

Comic Reader 後端使用 Express 5、TypeScript 與 SQLite。
登入狀態由 `express-session` 管理，session 存放在 SQLite 資料庫中，Session 表為 `express-session` 預設，不另外設計。

## Build

在專案根目錄啟動或重建後端：

```powershell
docker compose up -d --build backend
```

查看服務狀態與日誌：

```powershell
docker compose ps backend
docker compose logs -f backend
```

## 使用者管理

新增、刪除使用者在另一個端口，且不預期對外開放。

`scripts/user.sh` 是這兩個 API 的包裝，如下範例：

```bash
export ADMIN_URL=http://localhost:4096
./backend/scripts/user.sh add alice
./backend/scripts/user.sh del alice
```

> 路徑依照環境變數 `PORT` 而有些許變化。

## Logging

```powershell
docker compose logs -f backend
```
