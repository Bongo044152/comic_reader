# Frontend

React + TypeScript + Vite 開發環境，API 請求使用 Axios。

## 啟動

在專案根目錄用 compose 一次啟動前後端：

```powershell
docker compose up -d --build
```

Vite 在 `http://localhost:5173` 提供前端。`/api` 請求由 Vite 代理到環境變數 `VITE_PROXY_TARGET`。

若要在 host 直接跑前端，需先啟動 Backend，並自行指定代理目標：

```powershell
docker compose up -d --build backend
cd frontend
npm install
$env:VITE_PROXY_TARGET = "http://localhost:5090"
npm run dev
```

首頁的「測試後端連線」會呼叫 `GET /api/test`。
