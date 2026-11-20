# MVP-002：登入流程驗證

驗證登入與登出流程及相關 API。

## 目標

| 模塊 | 要驗證的事 |
| --- | --- |
| 後端 | 提供 login 和 logout API 能夠正常利用 Session 登入和登出 |
| Swagger | 提供 API 文件 |
| 資料庫 | Sqlite 資料庫掛載與使用正常，能夠用程式操作資料 |

## 驗收標準

- [ ] 登入登出業務邏輯流程
- [ ] 資料庫掛載與使用
- [ ] Swagger API 文件產生

## 範圍

- 只做登入登出 API
- 使用者資料與登入 Session 分別儲存在 users、sessions 資料表
