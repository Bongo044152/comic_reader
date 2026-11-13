# Backend

Comic Reader 後端使用 Express 5 與 TypeScript，提供帳號操作 API、session 驗證和 Swagger 文件。SQLite 由 `better-sqlite3` 操作，登入 session 也儲存在同一個 SQLite 資料庫，Session表為express-session預設，不另外設計。

## 啟動

從專案根目錄啟動後端：

```powershell
docker compose up -d --build backend
```

查看啟動狀態和日誌：

```powershell
docker compose ps backend
docker compose logs -f backend
```

後端預設監聽 `5090`。API 文件網址：<http://localhost:5090/api/docs>。

Docker build 會執行 `npm run build`；該 script 先產生 Swagger JSON，再編譯 TypeScript。需要單獨更新本機 Swagger JSON 時，從 `backend/app` 執行：

```powershell
npm run swagger
```

本機 build 指令：

```powershell
cd backend/app
npm ci
npm run build
npm start
```

`better-sqlite3` 是原生模組；Docker build stage 會安裝 Python、make 和 g++ 供編譯使用。

## Backend 結構

```text
backend/
├── Dockerfile                 # 多階段映像建置
└── app/
    ├── package.json           # scripts 和套件
    └── src/
        ├── index.ts           # Express app、middleware、session 和路由掛載
        ├── swagger.json       # Swagger Autogen 產生的 OpenAPI 文件
        ├── routes/            # API 路由
        ├── controllers/       # HTTP handler 和帳號操作
        ├── middlewares/       # session 驗證 middleware
        └── utils/
            ├── db.ts          # SQLite 連線、schema 和查詢 helper
            ├── interface.ts   # TypeScript 資料型別
            ├── logger.ts      # Pino HTTP logger
            └── swagger.ts    # Swagger Autogen 設定
```

## API

所有帳號 API 目前掛載在 `/api/auth`：

| Method | Path | 用途 | JSON body |
| --- | --- | --- | --- |
| POST | `/api/auth/logout` | 登出並清除 session cookie | 無 |
| POST | `/api/auth/login` | 登入並建立 session | `username`, `password` |
下面api只為測試用途
| POST | `/api/auth/createUser` | 建立使用者 | `username`, `password` |
| POST | `/api/auth/deleteUser` | 刪除使用者 | `username` |

Swagger UI 提供互動式 API 文件：<http://localhost:5090/api/docs>。Swagger 設定位於 `src/utils/swagger.ts`，會自動掃描 `src/routes/**/*.ts`，並輸出到 `src/swagger.json`。執行 `npm run build` 會先產生 Swagger JSON，再編譯 TypeScript；新增 route 檔不需逐一加入清單。

目前 Swagger server 前綴和 Express mount path 都是 `/api/auth`。若新增掛載在不同前綴的 router，需同步調整 Swagger 路徑設定，或先統一 API router 的掛載方式，避免 Try it out 呼叫錯誤網址。

## Session 與 express-session

- `express-session` 管理登入 session，cookie 名稱為 `sid`。
- cookie 設定為 `httpOnly`、`sameSite: 'lax'`，有效期限為七天；目前 `secure: false`，供本機 HTTP 使用。
- 成功登入後，使用者 ID 存入 `req.session.userId`。
- `better-sqlite3-session-store` 將 session 記錄存入 SQLite 的 `sessions` 表。
- `authMiddleware` 會檢查 `req.session.userId`。目前它略過整個 `/api/auth` 前綴，因此此路徑下的所有操作都不會被 session 保護；調整刪除使用者等操作前，應先確認預期的權限規則。
- Session secret 目前寫在 `src/index.ts`；部署正式環境前應改由環境變數提供，並設定安全的 cookie 選項。

## SQLite

資料庫路徑由 `DB_PATH` 環境變數指定；未設定時使用工作目錄下的 `app.db`。Compose 將它設為 `/data/app.db`，並以 named volume `dbdata:/data` 保存資料。重新建立容器時，named volume 會保留資料；`docker compose down -v` 則會刪除該 volume。

`src/utils/db.ts` 啟動時會設定 WAL 模式，並以 `CREATE TABLE IF NOT EXISTS` 建立 `users` 表：

| 欄位 | 用途 |
| --- | --- |
| `id` | 自動遞增主鍵 |
| `username` | 唯一使用者名稱 |
| `password_hash` | bcrypt 密碼雜湊 |
| `created_at` | 建立時間 |

若需查看容器內的使用者資料，可執行：

```powershell
docker compose exec -T backend node -e "const D=require('better-sqlite3');const d=new D('/data/app.db',{readonly:true});console.log(d.prepare('SELECT id, username, created_at FROM users').all())"
```

## Logging

Logger 使用 `pino-http`，等級由 `LOG_LEVEL` 設定，預設為 `info`。容器日誌輸出到 stdout，可用 `docker compose logs -f backend` 查看。
