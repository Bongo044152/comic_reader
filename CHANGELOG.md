# Changelog

## [Unreleased]

### Documentation

- 重寫 Backend README，補充後端目錄結構、啟動方式、API 路由和 Swagger 文件流程。
- 補充 express-session、`sid` cookie、SQLite session store、users schema 與 Docker named volume 說明。
- 移除已不存在的 `/api/test` 使用範例，改列目前實際掛載的帳號 API。
- Swagger Autogen 改為自動掃描 `src/routes/**/*.ts`，並重新產生目前的帳號 API 路徑與 request body 文件。
