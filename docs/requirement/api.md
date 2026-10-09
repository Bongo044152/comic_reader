# 後端 API

> `dev.md` 第 5 章的附屬文件。第 1 章是總覽，先讀完它再看後面的 API 卡。
>
> 每支 API 對應 [frontend.md](frontend.md) 的功能，欄位引用 [data.md](data.md) 的資料定義，這裡不重複。

## 1. 總覽

### 1.1 範圍

這份文件只定義 Frontend 與 Backend 之間的 API，共 21 支，涵蓋 [frontend.md](frontend.md) 的 F-01 到 F-14。

不包含：

- Backend 與 plugin 之間的 API，包含 plugin 向 Backend 註冊的端點。晚一點再寫。
- Backend Management：它是 CLI，帳號建立、刪除與 plugin 管理不經過這些 API。
- [F-14](frontend.md#f-14-切換章節) 切換章節不需要 API，前端用手上的章節列表算出目標章節，再呼叫載入章節（API-20）。

### 1.2 通用約定

這些約定適用所有 API，API 卡不再重複。

| 項目 | 約定 |
| --- | --- |
| 路徑與格式 | 路徑以 `/api` 開頭，請求與回應都是 JSON（圖片除外）。時間用 ISO 8601 字串（UTC） |
| 版本與相容 | 路徑不帶版本號。前後端放在同一個專案、一起部署，欄位變更時前後端一起改；之後如果要對外開放，再加 `/api/v2` |
| 前端檢查 | 前端攔截只是為了即時回饋，每支 API 仍然要自行檢查輸入 |

### 1.3 錯誤

錯誤的回應內容格式與錯誤碼 V1 先不定，實作時看需求再定（Q-A4）。目前只用 HTTP 狀態碼，並對應 [frontend.md](frontend.md#15-錯誤分類) 的三類錯誤。

| HTTP | 類型 | 意義 |
| --- | --- | --- |
| 400 | 使用者端 | 欄位缺漏、為空或格式不合法 |
| 401 | 使用者端 | 沒有登入或登入已過期，前端導回登入頁；登入 API 的 401 則是帳號不存在或密碼錯誤 |
| 403 | 使用者端 | 書庫的限制：不可刪除、不可重新命名，也不能用「加入資料夾」加入漫畫 |
| 404 | 使用者端 | 資源不存在，或不屬於目前登入者 |
| 409 | 使用者端 | 與現有資料衝突：資料夾名稱重複，或漫畫還沒有加入書庫 |
| 429 | 使用者端 | 最短間隔內再次同步（C-4） |
| 502 | 來源端 | 來源無法存取（被封鎖、Cloudflare、網站改版、漫畫下架、plugin 逾時或失敗）；plugin 搜尋時勾選的 plugin 全部失敗 |
| 500 | 伺服器 | 後端內部錯誤，後端記入 log |
| 507 | 伺服器 | 圖片空間已達設定檔的上限，寫入失敗 |

API 卡的「錯誤」欄只列各 API 特有的錯誤，401 與 500 不再重複。

### 1.4 API 清單

| ID | 方法與路徑 | 簡述 | 功能 |
| --- | --- | --- | --- |
| [API-01](#api-01-登入) | `POST /api/auth/login` | 登入，建立登入狀態 | [F-01](frontend.md#f-01-登入登出) |
| [API-02](#api-02-登出) | `POST /api/auth/logout` | 登出，清除登入狀態 | [F-01](frontend.md#f-01-登入登出) |
| [API-03](#api-03-列出資料夾) | `GET /api/folders` | 列出該使用者的所有資料夾 | [F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾) |
| [API-04](#api-04-建立資料夾) | `POST /api/folders` | 建立自訂資料夾，可同時放入一部漫畫 | [F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾) |
| [API-05](#api-05-重新命名資料夾) | `PATCH /api/folders/{folderId}` | 重新命名自訂資料夾 | [F-06](frontend.md#f-06-資料夾管理) |
| [API-06](#api-06-刪除資料夾) | `DELETE /api/folders/{folderId}` | 刪除自訂資料夾 | [F-06](frontend.md#f-06-資料夾管理) |
| [API-07](#api-07-列出資料夾內的漫畫) | `GET /api/folders/{folderId}/mangas` | 列出資料夾內的漫畫；`library` 就是書庫列表 | [F-05](frontend.md#f-05-書庫列表)、[F-07](frontend.md#f-07-資料夾內文) |
| [API-08](#api-08-加入資料夾) | `POST /api/folders/{folderId}/mangas` | 把書庫中的漫畫放進自訂資料夾 | [F-08](frontend.md#f-08-加入移出資料夾) |
| [API-09](#api-09-移出資料夾或移除漫畫) | `DELETE /api/folders/{folderId}/mangas/{mangaId}` | 從自訂資料夾移出漫畫；對 `library` 則是移除漫畫（真正刪除） | [F-08](frontend.md#f-08-加入移出資料夾)、[F-09](frontend.md#f-09-移除漫畫) |
| [API-10](#api-10-加入書庫) | `POST /api/library/mangas` | 把漫畫加入書庫，必要時一併建立 Manga | [F-04](frontend.md#f-04-加入書庫) |
| [API-11](#api-11-取得漫畫詳情) | `GET /api/mangas/{mangaId}` | 以 id 取得本地漫畫詳情與是否已加入 | [F-10](frontend.md#f-10-漫畫詳情) |
| [API-12](#api-12-以來源識別查詢漫畫) | `GET /api/mangas/lookup` | 以來源識別查本地有沒有這部漫畫 | [F-10](frontend.md#f-10-漫畫詳情) |
| [API-13](#api-13-取得遠端詳情) | `GET /api/remote/mangas` | 向來源取得漫畫詳情，不寫入資料庫 | [F-10](frontend.md#f-10-漫畫詳情) |
| [API-14](#api-14-列出章節) | `GET /api/mangas/{mangaId}/chapters` | 列出本地的章節列表 | [F-10](frontend.md#f-10-漫畫詳情)、[F-14](frontend.md#f-14-切換章節) |
| [API-15](#api-15-同步詳情) | `POST /api/mangas/sync-detail` | 向來源同步詳情，有人加入才寫入 | [F-11](frontend.md#f-11-同步詳情) |
| [API-16](#api-16-同步章節) | `POST /api/mangas/sync-chapters` | 向來源同步章節，有人加入且沒有衝突才寫入 | [F-12](frontend.md#f-12-同步章節) |
| [API-17](#api-17-本地搜尋) | `GET /api/search/local` | 在自己的書庫中以標題搜尋 | [F-02](frontend.md#f-02-本地搜尋) |
| [API-18](#api-18-plugin-搜尋) | `GET /api/search/remote` | 對勾選的 plugin 搜尋來源網站 | [F-03](frontend.md#f-03-plugin-搜尋) |
| [API-19](#api-19-列出-plugin) | `GET /api/sources` | 列出已註冊的 plugin | [F-03](frontend.md#f-03-plugin-搜尋) |
| [API-20](#api-20-載入章節) | `GET /api/read/{source_id}/{remote_manga_id}/{remote_chapter_id}` | 確保一章的圖片已就緒，回傳頁面清單 | [F-13](frontend.md#f-13-閱讀章節)、[F-14](frontend.md#f-14-切換章節) |
| [API-21](#api-21-取得頁面圖片) | `GET /api/images/{source_id}/{remote_manga_id}/{remote_chapter_id}/{page}` | 取得單頁圖片 | [F-13](frontend.md#f-13-閱讀章節) |

### 1.5 API 卡欄位

| 欄位 | 內容 |
| --- | --- |
| 目的 | 一句話：這支 API 讓誰做什麼，對應哪個功能 |
| 路徑與方法 | 名詞路徑，動作交給 HTTP 方法 |
| 請求 | 路徑參數、query、body 的欄位、型別、必填 |
| 回應 | 成功時的結構與狀態碼 |
| 錯誤 | 這支 API 特有的錯誤，寫成「狀態碼：原因」，狀態碼的類型見 1.3 |
| 認證與權限 | 誰能呼叫；除登入外都需要登入，這裡只寫額外的限制 |
| 冪等性 | 重複呼叫的結果是否相同 |
| 規模 | 筆數上限、逾時、並發 |

「版本與相容」對所有 API 相同，寫在 1.2。

---

## 2. 認證

### API-01 登入

**目的**：使用者送出帳號密碼登入（[F-01](frontend.md#f-01-登入登出)）。

**路徑與方法**：`POST /api/auth/login`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `username` | body | 字串 | 是 | |
| `password` | body | 字串 | 是 | |

**回應**：`200`，並建立登入狀態。

```json
{ "user": { "id": 1, "username": "alice" } }
```

**錯誤**
- 400：帳號或密碼為空。
- 401：帳號不存在與密碼錯誤統一回這個，不區分，避免洩漏帳號是否存在。

**認證與權限**：不需要登入。

**冪等性**：不是。每次成功都建立新的登入狀態。

**規模**：單次請求。登入失敗的次數限制 V1 不處理。

### API-02 登出

**目的**：使用者登出（[F-01](frontend.md#f-01-登入登出)）。

**路徑與方法**：`POST /api/auth/logout`

**請求**：無。

**回應**：`204`，清除登入狀態。

**錯誤**：無特有的錯誤。

**認證與權限**：已登入。

**冪等性**：效果相同（登入狀態都已清除），但第二次呼叫因為沒有登入狀態會回 401，前端視為已登出。

**規模**：單次請求。

---

## 3. 書庫與資料夾

### API-03 列出資料夾

**目的**：取得該使用者所有資料夾，供資料夾頁面與「加入資料夾」選擇（[F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾)）。

**路徑與方法**：`GET /api/folders`

**請求**：無。

**回應**：`200`，書庫（`is_default` 為 `true`）排第一。

```json
[
  { "id": 1, "name": "書庫", "is_default": true },
  { "id": 2, "name": "熱血", "is_default": false }
]
```

**錯誤**：無特有的錯誤。

**認證與權限**：已登入；只回傳自己的資料夾。

**冪等性**：是。

**規模**：不分頁。

### API-04 建立資料夾

**目的**：建立自訂資料夾；加入資料夾時輸入新名稱，也經由這支 API 一起建立並加入（[F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾)）。

**路徑與方法**：`POST /api/folders`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `name` | body | 字串 | 是 | 不可為空，同一位使用者內不可重複 |
| `manga_id` | body | 整數 | 否 | 有帶時，建立後立刻把這部漫畫放進去，漫畫必須已在書庫 |

**回應**：`201`。有帶 `manga_id` 時，建立資料夾與加入漫畫一起成功或一起失敗。

```json
{ "id": 3, "name": "冒險", "is_default": false }
```

**錯誤**
- 400：名稱為空。
- 409：名稱重複，包含書庫的名稱「書庫」。
- 409：帶了 `manga_id`，但這部漫畫不在書庫。
- 404：帶了 `manga_id`，但這部漫畫不存在。

**認證與權限**：已登入。

**冪等性**：不是。重複送出相同名稱會得到 409。

**規模**：單次操作。

### API-05 重新命名資料夾

**目的**：修改自訂資料夾的名稱（[F-06](frontend.md#f-06-資料夾管理)）。

**路徑與方法**：`PATCH /api/folders/{folderId}`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `folderId` | 路徑 | 整數 | 是 | 不可為 `library` |
| `name` | body | 字串 | 是 | 不可為空，同一位使用者內不可重複 |

**回應**：`200`

```json
{ "id": 3, "name": "冒險故事", "is_default": false }
```

**錯誤**
- 400：名稱為空。
- 409：名稱與其他資料夾重複。
- 403：對書庫重新命名。
- 404：資料夾不存在或不屬於該使用者。

**認證與權限**：已登入；只有擁有者。

**冪等性**：是。改成目前的名稱不報錯。

**規模**：單次操作。

### API-06 刪除資料夾

**目的**：刪除自訂資料夾（[F-06](frontend.md#f-06-資料夾管理)）。

**路徑與方法**：`DELETE /api/folders/{folderId}`

**請求**：路徑參數 `folderId`（整數，不可為 `library`）。

**回應**：`204`。該資料夾的成員關係連帶刪除，漫畫本身與書庫不受影響。

**錯誤**
- 403：刪除書庫。
- 404：資料夾不存在或不屬於該使用者。

**認證與權限**：已登入；只有擁有者。

**冪等性**：結果相同，但重複呼叫會回 404。

**規模**：單次操作。

### API-07 列出資料夾內的漫畫

**目的**：取得某個資料夾的漫畫列表；`folderId` 為 `library` 時就是書庫列表（[F-05](frontend.md#f-05-書庫列表)、[F-07](frontend.md#f-07-資料夾內文)）。

**路徑與方法**：`GET /api/folders/{folderId}/mangas`

**請求**：路徑參數 `folderId`（資料夾 `id` 或 `library`）。

**回應**：`200`。`latest_chapter` 來自 Chapter，資料庫還沒有章節時為 `null`。

```json
[
  {
    "manga_id": 42,
    "source_id": "mangadex",
    "remote_id": "a1b2c3",
    "title": "範例漫畫",
    "cover_url": "https://example.com/cover.jpg",
    "latest_chapter": { "id": 778, "title": "第 778 話" }
  }
]
```

**錯誤**
- 404：資料夾不存在或不屬於該使用者。

**認證與權限**：已登入；只有擁有者。

**冪等性**：是。

**規模**：不分頁，整個資料夾一次回傳。

### API-08 加入資料夾

**目的**：把書庫中的漫畫放進自訂資料夾（[F-08](frontend.md#f-08-加入移出資料夾)）。

**路徑與方法**：`POST /api/folders/{folderId}/mangas`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `folderId` | 路徑 | 整數 | 是 | 不可為 `library`，加入書庫請用 API-10 |
| `manga_id` | body | 整數 | 是 | 漫畫必須已在書庫 |

**回應**：新加入回 `201`，已經在這個資料夾回 `200`，內容都是空。

**錯誤**
- 400：缺少 `manga_id`。
- 403：對書庫使用這支 API。
- 409：漫畫不在書庫。
- 404：資料夾不存在或不屬於該使用者，或 `manga_id` 不存在。

**認證與權限**：已登入；只有擁有者。

**冪等性**：是。已經在資料夾時不重複建立，也不報錯。

**規模**：單次操作。

### API-09 移出資料夾或移除漫畫

**目的**：從自訂資料夾移出漫畫；或在 `folderId` 為 `library` 時，從書庫移除漫畫，等於真正刪除（[F-08](frontend.md#f-08-加入移出資料夾)、[F-09](frontend.md#f-09-移除漫畫)）。

**路徑與方法**：`DELETE /api/folders/{folderId}/mangas/{mangaId}`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `folderId` | 路徑 | 整數或 `library` | 是 | |
| `mangaId` | 路徑 | 整數 | 是 | |

**回應**：`204`

- 自訂資料夾：只移除這個成員關係，不影響書庫與其他資料夾。
- `library`：移除該使用者書庫與其他資料夾中的這部漫畫，並更新 ref count，歸零才回收共用的 Manga 與 Chapter。圖片檔案不立即刪除，留給淘汰清理。

**錯誤**
- 404：資料夾不存在或不屬於該使用者，或這部漫畫已不在這個資料夾。

**認證與權限**：已登入；只有擁有者。

**冪等性**：結果相同，但重複呼叫會回 404。

**規模**：單次操作。

### API-10 加入書庫

**目的**：把一部漫畫加入使用者的書庫，漫畫不在資料庫時一併建立（[F-04](frontend.md#f-04-加入書庫)）。

**路徑與方法**：`POST /api/library/mangas`

**請求**：標題與封面來自搜尋結果。

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `source_id` | body | 字串 | 是 | |
| `remote_id` | body | 字串 | 是 | |
| `title` | body | 字串 | 是 | |
| `cover_url` | body | 字串 | 是 | |

**回應**：新加入回 `201`，已經在書庫回 `200`，內容相同。不抓取詳情與章節。

```json
{ "manga_id": 42 }
```

**錯誤**
- 400：欄位缺漏或為空。

**認證與權限**：已登入。

**冪等性**：是。已在書庫時不重複建立，也不報錯。

**規模**：單次操作。

---

## 4. 漫畫與同步

### API-11 取得漫畫詳情

**目的**：以資料庫 id 取得本地的漫畫詳情，以及是否已加入書庫（[F-10](frontend.md#f-10-漫畫詳情)）。

**路徑與方法**：`GET /api/mangas/{mangaId}`

**請求**：路徑參數 `mangaId`（整數）。

**回應**：`200`。只讀資料庫，空值欄位前端顯示「未知」。`folder_ids` 是這位使用者放了這部漫畫的自訂資料夾。

```json
{
  "manga": {
    "id": 42,
    "source_id": "mangadex",
    "remote_id": "a1b2c3",
    "title": "範例漫畫",
    "cover_url": "https://example.com/cover.jpg",
    "author": null,
    "status": null,
    "region": null,
    "tags": [],
    "summary": null,
    "remote_updated_at": null,
    "detail_synced_at": null,
    "chapters_synced_at": null
  },
  "in_library": true,
  "folder_ids": [2, 3]
}
```

**錯誤**
- 404：資料庫沒有這部漫畫。

**認證與權限**：已登入。漫畫資料全體共用；`in_library` 與 `folder_ids` 只反映目前使用者。

**冪等性**：是。

**規模**：單次查詢。

### API-12 以來源識別查詢漫畫

**目的**：從 plugin 搜尋結果進入詳情頁時，用 `source_id` 與 `remote_id` 查本地有沒有這部漫畫（[F-10](frontend.md#f-10-漫畫詳情)）。

**路徑與方法**：`GET /api/mangas/lookup`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `source_id` | query | 字串 | 是 | |
| `remote_id` | query | 字串 | 是 | |

**回應**：`200`，結構同 API-11。

**錯誤**
- 400：缺少參數。
- 404：資料庫沒有這部漫畫。前端以此判斷「不在資料庫」，改呼叫 API-13 向遠端取詳情。

**認證與權限**：已登入。

**冪等性**：是。

**規模**：單次查詢。

### API-13 取得遠端詳情

**目的**：資料庫沒有的漫畫，向來源取詳情顯示，不寫入資料庫（[F-10](frontend.md#f-10-漫畫詳情)）。

**路徑與方法**：`GET /api/remote/mangas`

**請求**：query 為 `source_id`、`remote_id`，皆必填。

**回應**：`200`，欄位同 API-11 的 `manga`，但沒有 `id` 與兩個 `*_synced_at`。

```json
{
  "manga": {
    "source_id": "mangadex",
    "remote_id": "a1b2c3",
    "title": "範例漫畫",
    "cover_url": "https://example.com/cover.jpg",
    "author": "某作者",
    "status": "連載中",
    "region": null,
    "tags": ["冒險"],
    "summary": "簡介",
    "remote_updated_at": "2026-10-01T00:00:00Z"
  }
}
```

**錯誤**
- 400：缺少參數。
- 502：來源無法存取，或指定的 `source_id` 沒有已註冊的 plugin。

**認證與權限**：已登入。

**冪等性**：是，但每次都會向來源發請求。

**規模**：逾時值待定（Q-A3）。

### API-14 列出章節

**目的**：取得本地的章節列表（[F-10](frontend.md#f-10-漫畫詳情)、[F-14](frontend.md#f-14-切換章節)）。

**路徑與方法**：`GET /api/mangas/{mangaId}/chapters`

**請求**：路徑參數 `mangaId`（整數）。

**回應**：`200`，只讀資料庫，還沒同步過章節時 `chapters` 為空陣列。

```json
{
  "chapters": [
    { "id": 778, "remote_id": "778", "title": "第 778 話", "sort_order": 778 }
  ]
}
```

**錯誤**
- 404：資料庫沒有這部漫畫。

**認證與權限**：已登入。

**冪等性**：是。

**規模**：不分頁，一次回傳完整的本地章節列表。

### API-15 同步詳情

**目的**：向來源取得最新的漫畫詳情；有人加入這部漫畫時才寫入資料庫（[F-11](frontend.md#f-11-同步詳情)）。

**路徑與方法**：`POST /api/mangas/sync-detail`

**請求**：body 為 `source_id`、`remote_id`，皆必填。

**回應**：`200`。`persisted` 為 `true` 表示已更新資料庫（含 `detail_synced_at`），為 `false` 表示沒有人加入，只回傳不寫入。不碰章節。

```json
{ "manga": { "source_id": "mangadex", "remote_id": "a1b2c3", "title": "範例漫畫" }, "persisted": true }
```

`manga` 的欄位同 API-13，`persisted` 為 `true` 時另有 `id`。

**錯誤**
- 400：缺少參數。
- 502：來源無法存取或漫畫下架。
- 429：最短間隔內再次同步，不向來源抓取。

**認證與權限**：已登入。寫入的是全體共用的 Manga，所有把這部漫畫放進書庫的使用者都會看到。

**冪等性**：可重複呼叫，間隔內回 429。

**規模**：受最短間隔限制，間隔值寫在設定檔。

### API-16 同步章節

**目的**：向來源取得章節列表，與現有章節比對；有人加入且沒有衝突時才寫入（[F-12](frontend.md#f-12-同步章節)）。

**路徑與方法**：`POST /api/mangas/sync-chapters`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `source_id` | body | 字串 | 是 | |
| `remote_id` | body | 字串 | 是 | |
| `limit` | body | 整數 | 否 | 每次要求的章節數量，控制顆粒度 |
| `cursor` | body | 字串 | 否 | 續取的位置，取自上一次回應的 `next_cursor` |

**回應**：`200`。不載入圖片。

```json
{
  "chapters": [
    { "id": 778, "remote_id": "778", "title": "第 778 話", "sort_order": 778 }
  ],
  "next_cursor": null,
  "persisted": true,
  "conflict": false
}
```

- `persisted`：是否已寫入資料庫。沒有人加入時為 `false`，`chapters` 的 `id` 欄位不存在。
- `conflict`：為 `true` 表示發現與現有章節衝突（來源重新編號、刪除章節或換源，C-5）。此時不自動套用，`persisted` 為 `false`，`chapters` 是來源上的列表，供前端讓使用者決定。使用者決定後的套用方式待定（Q-A2）。
- `next_cursor`：還有下一批時有值，沒有時為 `null`。

**錯誤**
- 400：缺少參數。
- 502：來源無法存取或漫畫下架。
- 429：最短間隔內再次同步。

**認證與權限**：已登入。寫入的是全體共用的 Chapter。

**冪等性**：可重複呼叫，間隔內回 429。

**規模**：對來源的請求用 `limit` 與 `cursor` 控制顆粒度，不一次取大量章節；受最短間隔限制。

---

## 5. 搜尋

### API-17 本地搜尋

**目的**：以標題搜尋使用者書庫中的漫畫（[F-02](frontend.md#f-02-本地搜尋)）。

**路徑與方法**：`GET /api/search/local`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `q` | query | 字串 | 是 | 關鍵字，不可為空 |

**回應**：`200`。沒有符合的結果時回空陣列，不是錯誤。

```json
[
  { "manga_id": 42, "source_id": "mangadex", "remote_id": "a1b2c3", "title": "範例漫畫", "cover_url": "https://example.com/cover.jpg" }
]
```

**錯誤**
- 400：`q` 為空。前端已攔截，後端仍要檢查。

**認證與權限**：已登入；只搜自己的書庫。

**冪等性**：是。

**規模**：範圍是單一使用者的書庫，不分頁。

### API-18 plugin 搜尋

**目的**：對使用者勾選的 plugin 並行搜尋來源網站，合併結果；不寫入資料庫（[F-03](frontend.md#f-03-plugin-搜尋)）。

**路徑與方法**：`GET /api/search/remote`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `q` | query | 字串 | 是 | 關鍵字，不可為空 |
| `sources` | query | 字串 | 是 | 以逗號分隔的 `source_id`，至少一個 |

**回應**：`200`。`in_library` 表示這位使用者的書庫是否已有這部漫畫。單一 plugin 失敗或逾時不影響其他，失敗的來源列入 `failed_sources`。所有勾選的 plugin 都沒有符合的漫畫時，`results` 為空陣列，不是錯誤。

```json
{
  "results": [
    { "source_id": "mangadex", "remote_id": "a1b2c3", "title": "範例漫畫", "cover_url": "https://example.com/cover.jpg", "in_library": false }
  ],
  "failed_sources": [
    { "source_id": "other", "reason": "timeout" }
  ]
}
```

**錯誤**
- 400：`q` 為空，或沒有帶任何 `sources`。前端已攔截，後端仍要檢查。
- 502：勾選的 plugin 全部失敗。

**認證與權限**：已登入。

**冪等性**：是，但每次都會向來源發請求。

**規模**：plugin 約 10 個以內，並行呼叫；單一 plugin 的逾時值待定（Q-A3）。

### API-19 列出 plugin

**目的**：取得目前已註冊的 plugin，供搜尋時勾選（[F-03](frontend.md#f-03-plugin-搜尋)）。

**路徑與方法**：`GET /api/sources`

**請求**：無。

**回應**：`200`。讀自 [Plugin registry](data.md#草稿-plugin-registry)，使用者無法直接存取，只能經由這支 API 取得。

```json
[
  { "id": "mangadex", "name": "MangaDex" }
]
```

**錯誤**：無特有的錯誤。沒有任何 plugin 時回空陣列。

**認證與權限**：已登入。

**冪等性**：是。

**規模**：最多約 10 筆。

---

## 6. 閱讀

### API-20 載入章節

**目的**：確保一章的圖片已在檔案系統，並回傳頁面清單；未加入書庫的漫畫也可以閱讀（[F-13](frontend.md#f-13-閱讀章節)）。

**路徑與方法**：`GET /api/read/{source_id}/{remote_manga_id}/{remote_chapter_id}`

**請求**：路徑參數都是字串，來源與來源上的 ID。目錄名編碼待定（Q-D6），路徑參數需要 URL 編碼。

**回應**：`200`

```json
{
  "page_count": 2,
  "pages": [
    "/api/images/mangadex/a1b2c3/778/1",
    "/api/images/mangadex/a1b2c3/778/2"
  ]
}
```

行為：

- 章節目錄中有 `manifest.json` 就直接回傳，否則請 plugin 抓取。
- 寫入位置由後端決定：ref count 大於 0 寫入 `library`，否則寫入該使用者的 `scratch`（每位使用者只保留最近 5 章）。
- 同一章有請求進行中時，其他請求等待，不重複下載。

**錯誤**
- 404：章節不存在。
- 502：來源無法存取或圖片載入失敗。
- 507：需要寫入圖片，但圖片空間已達設定檔的上限。

**認證與權限**：已登入。

**冪等性**：是。重複呼叫不會重複下載。

**規模**：一章頁數不定；未命中快取時會對來源發請求（C-4）。

### API-21 取得頁面圖片

**目的**：取得一頁圖片的內容（[F-13](frontend.md#f-13-閱讀章節)）。

**路徑與方法**：`GET /api/images/{source_id}/{remote_manga_id}/{remote_chapter_id}/{page}`

**請求**：路徑參數 `page` 為頁碼（整數，從 1 開始），其餘同 API-20。

**回應**：`200`，圖片位元組；`Content-Type` 由 Backend 決定，不信任 plugin 回傳的值。

**錯誤**
- 404：圖片不存在，或這是別人的 `scratch`。

**認證與權限**：已登入。`library` 的圖片所有已登入的使用者可讀；`scratch` 只給屬主本人。

**冪等性**：是。

**規模**：單張圖片，逐張載入。

---

## 7. 待定項目

| 編號 | 問題 | 相關 API |
| --- | --- | --- |
| Q-A1 | 登入狀態的傳遞方式：JWT 或 session，放在 cookie 或 `Authorization` header（data.md 的 Q-D3） | 全部 |
| Q-A2 | 同步章節發現衝突後，使用者決定要套用時，後端的套用方式（frontend.md 的 Q-F7） | API-16 |
| Q-A3 | 對 plugin 與來源請求的逾時值（frontend.md 的 Q-F6） | API-13、API-18 |
| Q-A4 | 錯誤的回應內容格式與錯誤碼；同一個狀態碼對應多種錯誤時前端如何區分（例如 API-04 的 409：名稱重複，或漫畫不在書庫） | 全部 |
| Q-A5 | 章節的 `sort_order` 方向：「最新話」與上一話、下一話以什麼判斷 | API-07、API-14 |
| Q-A6 | 同步章節分批（`limit`、`cursor`）時：續取是否受最短間隔限制、有寫入時回傳整份列表還是該批；最短間隔從何時起算（沒有人加入時資料庫沒有同步時間） | API-15、API-16 |
| Q-A7 | API-10 直接採用前端傳來的 `title` 與 `cover_url`，是否要向 plugin 驗證 | API-10 |
| Q-A8 | 重新整理頁面後如何取得目前登入者（目前沒有 `GET /api/auth/me`） | API-01 |
