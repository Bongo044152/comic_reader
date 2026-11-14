# Backend

Comic Reader 後端使用 Express 5、TypeScript 與 SQLite。登入狀態由 `express-session` 管理，session 存放在 SQLite 資料庫中，Session表為 `express-session` 預設，不另外設計。

## 使用 Docker Compose

在專案根目錄啟動或重建後端：

```powershell
docker compose up -d --build backend
```

查看服務狀態與日誌：

```powershell
docker compose ps backend
docker compose logs -f backend
```

後端預設監聽 `http://localhost:5090`，Swagger UI 位於 <http://localhost:5090/api/docs>。

## 本機開發

在 `backend/app` 安裝相依套件並建置：

```powershell
cd backend/app
npm ci
npm run build
npm start
```

`npm run build` 會先執行 Swagger 文件產生器，再用 TypeScript 編譯 `src` 到 `dist`。執行 `npm start` 前，請確認 `DB_PATH` 指向可寫入的位置；未設定時會使用工作目錄中的 `app.db`。

`better-sqlite3` 含原生模組。Dockerfile 在 build 階段安裝 Python、make 和 g++，用來建置相依套件。

## 建立使用者

可以在後端容器中執行以下命令，將使用者寫入 Compose 使用的資料庫。命令會先以 bcrypt 產生密碼雜湊，再寫入 `/data/app.db`：

```powershell
docker compose exec -T backend node -e "const bcrypt=require('bcrypt');const Database=require('better-sqlite3');const db=new Database('/data/app.db');const username=process.argv[1],password=process.argv[2];if(!username||!password)throw Error('Usage: create-user <username> <password>');db.prepare('INSERT INTO users (username,password_hash) VALUES (?,?)').run(username,bcrypt.hashSync(password,10));console.log('Created user:',username)" alice secret
```

將 `alice` 和 `secret` 換成要建立的帳號與密碼。帳號名稱必須唯一；重複名稱會因資料庫的唯一性限制而失敗。

## API

認證路由掛載在 `/api/auth`：

| Method | Path | 說明 | Body |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | 驗證帳密並建立 session | `username`, `password` |
| `POST` | `/api/auth/logout` | 登出並清除 session cookie | 無 |

完整 API 定義請查看 Swagger UI：<http://localhost:5090/api/docs>。規格由 `src/utils/swagger.ts` 產生，輸出至 `src/swagger.json`。

## Session 與型別

- `src/index.ts` 設定 `express-session`，cookie 名稱為 `sid`，session store 使用 `better-sqlite3-session-store`。
- `src/types/express-session.d.ts` 擴充 `SessionData`，加入 `userId` 欄位。這是對既有 `express-session` 型別的模組擴充。
- `src/types/better-sqlite3-session-store.d.ts` 為沒有附 TypeScript 宣告的 session store 套件提供型別。它必須維持獨立的環境模組宣告檔。
- Session store 會在資料庫中建立 `sessions` 表，並定期清除過期 session。

## SQLite 資料庫

Compose 設定 `DB_PATH=/data/app.db`，並將 named volume `dbdata` 掛載至 `/data`。首次啟動時 Docker 會自動建立 named volume，SQLite 會建立資料庫檔案；`src/utils/db.ts` 會建立目錄、設定 WAL，並以 `CREATE TABLE IF NOT EXISTS` 初始化 `users` 表。因此目前設定不需要事先建立資料庫檔案或資料表。若改用主機 bind mount，請先建立並確認主機端的掛載目錄存在；SQLite 仍會在該目錄中建立資料庫檔案。

| 欄位 | 說明 |
| --- | --- |
| `id` | 自動遞增的使用者 ID |
| `username` | 唯一的使用者名稱 |
| `password_hash` | bcrypt 密碼雜湊，不存放明文密碼 |
| `created_at` | 建立時間 |

查看使用者清單（不會讀取密碼雜湊）：

```powershell
docker compose exec -T backend node -e "const Database=require('better-sqlite3');const db=new Database('/data/app.db',{readonly:true});console.log(db.prepare('SELECT id,username,created_at FROM users').all())"
```

單筆 SQL 寫入由 SQLite 原子執行。若新增功能需要多筆資料庫操作一起成功或失敗，請使用 `better-sqlite3` 的 `db.transaction(...)`。

Named volume 會在容器重建後保留資料。`docker compose down -v` 會刪除 Compose 管理的 volume，請勿在需要保留資料時使用。

參考文件：[better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)、[better-sqlite3 效能與 WAL](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md)、[Docker volumes](https://docs.docker.com/engine/storage/volumes/)、[Express session](https://expressjs.com/en/resources/middleware/session.html)。

## Logging

後端使用 `pino-http` 記錄請求，Compose 預設 `LOG_LEVEL=info`。查看即時日誌：

```powershell
docker compose logs -f backend
```
