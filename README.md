# MVP-001：Docker 前後端技術鏈驗證

確認 Docker 上的前端與後端能跑起來，並且前端能呼叫後端。這個分支只驗證技術鏈，不實作任何業務功能。

## 目標

| 模塊 | 要驗證的事 |
| --- | --- |
| 後端 | 提供一支 HTTP GET API，回傳 hello world |
| 前端 | 載入頁面時呼叫後端的 GET API，並把 hello world 顯示在畫面上 |
| Docker | 前後端各自有 Dockerfile，由 `docker-compose.yml` 一次啟動 |

## 驗收標準

- [ ] `docker compose up --build` 能一次啟動前端與後端，沒有錯誤
- [ ] 直接對後端發 GET 請求，回傳 hello world
- [ ] 瀏覽器開啟前端頁面，畫面顯示來自後端的 hello world（不是前端寫死的字串）
- [ ] `docker compose down` 能乾淨關閉

## 範圍

- 只做 hello world，不接資料庫、不接 plugin
- 後端 API 路徑以 `/api` 開頭，沿用 [dev.md](/docs/requirement/dev.md) 的通用約定
- 技術選型在這個分支決定，確認後會更新 dev.md 的技術鏈章節
