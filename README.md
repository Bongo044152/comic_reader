# Comic Reader

基於網頁前後端的多人漫畫閱讀系統。後端透過 plugin 從來源網站取得並儲存漫畫，前端負責閱讀與管理介面。

靈感來自 [Suwayomi](https://github.com/Suwayomi)，為東華資工「接案社」的練習專案。

> 狀態：規劃階段，尚無可執行的程式碼。

## V1 功能

- 多人帳號：由管理者發配，每人有自己的書庫、資料夾與閱讀紀錄
- Plugin 來源：每個來源網站一個 plugin，可安裝、更新、移除
- 搜尋：搜尋自己的書庫，或勾選 plugin 搜尋來源網站並加入書庫
- 資料夾分類：一部漫畫可放進多個資料夾
- 閱讀：手動捲動或翻頁、快捷鍵、暖色濾鏡
- 閱讀紀錄：記住每部漫畫讀到哪一話
- 檢查更新：排程與手動；會影響閱讀紀錄的更新交由使用者決定
- 圖片快取：章節圖片存在伺服器，全體使用者共用

規劃中：自動閱讀、深色／淺色主題、手機版。

## 架構

```text
Frontend --REST--> Backend --HTTP--> Plugin (每個來源一個 Docker container) --> 來源網站
                      |                 |
                   Database         File Storage（章節圖片）
```

- Backend 是唯一的業務邏輯層，也是唯一存取 Database 的模塊
- Plugin 只負責與來源網站溝通，圖片直接寫入 File Storage 中屬於自己來源的目錄
- Database 不存圖片，圖片是否存在由檔案系統決定

細節見 [docs/requirement/dev.md](/docs/requirement/dev.md)。

## 文件

| 文件 | 內容 |
| --- | --- |
| [docs/requirement/user_need.md](/docs/requirement/user_need.md) | User Need、衝突、模糊地帶、系統需求 |
| [docs/requirement/dev.md](/docs/requirement/dev.md) | 架構、前端界面、資料庫、檔案存放、API 草稿 |

## 開發

技術選型尚未確定，建置與執行方式待補。協作流程見 [CONTRIBUTING.md](/CONTRIBUTING.md)。
