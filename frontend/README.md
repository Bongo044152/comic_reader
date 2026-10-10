# Frontend

React + TypeScript + Vite 開發環境，API 請求使用 Axios。

## 開發

```powershell
npm install
npm run dev
```

Vite 預設在 `http://localhost:5173` 提供前端。`/api` 請求會代理到 `http://localhost:5090`，所以請先在另一個終端機啟動 Backend：

```powershell
cd ..\backend
docker compose up -d --build
```

首頁的「測試後端連線」會呼叫 `GET /api/test`。

## 正式建置

```powershell
npm run build
```
