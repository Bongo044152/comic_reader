# Backend

Express + TypeScript（ESM）後端，由 `tsc` 編譯到 `dist/` 後以 Node 執行。

## 啟動

在專案根目錄執行（compose 檔在根目錄）：

```bash
docker compose up -d --build backend
```

服務監聽 `5090`，驗證：

```bash
curl 127.0.0.1:5090/api/test    # hello world
```

> 瀏覽器填入 `http://127.0.0.1:5090/api/test` 也可以
