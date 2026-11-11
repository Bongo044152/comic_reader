# 後端 API

> `dev.md` 第 5 章的附屬文件。第 1 章是總覽，先讀完它再看後面的 API 卡。
>
> 每支 API 對應 [frontend.md](frontend.md) 的功能，欄位引用 [data.md](data.md) 的資料定義，這裡不重複。
>
> 本文件為 API 設計的參考，涵蓋總表、共通規則與各 API 的行為語意。欄位型別、必填、範例與錯誤格式，之後以 Swagger 產生的文件為準，此處若有出入不再同步。

## 1. 總覽

### 1.1 範圍

這份文件只定義 Frontend 與 Backend 之間的 API，共 20 支，涵蓋 [frontend.md](frontend.md) 的 F-01 到 F-14。

不包含：

- Backend 與 plugin 之間的 API，包含 plugin 向 Backend 註冊的端點。晚一點再寫。
- Backend Management：它是 CLI，帳號建立、刪除與 plugin 管理不經過這些 API。
- [F-14](frontend.md#f-14-切換章節) 切換章節不需要 API，前端用手上的章節列表算出目標章節，再呼叫載入章節圖片清單（API-19）。

### 1.2 通用約定

這些約定適用所有 API，API 卡不再重複。

| 項目 | 約定 |
| --- | --- |
| 路徑與格式 | 路徑以 `/api` 開頭，請求與回應都是 JSON（圖片除外）。時間用 ISO 8601 字串（UTC） |
| 版本與相容 | 路徑不帶版本號。前後端放在同一個專案、一起部署，欄位變更時前後端一起改；之後如果要對外開放，再加 `/api/v2` |
| 前端檢查 | 前端攔截只是為了即時回饋，每支 API 仍然要自行檢查輸入 |
| 漫畫識別 | 對外一律用 `(source_id, remote_id)` 識別漫畫。作為路徑參數時需要 URL 編碼，編碼規則與檔案目錄名編碼是同一個問題，待定（data.md 的 Q-D6） |
| 本地與遠端 | 同一個路徑上，`GET` 只讀本地，`POST` 向來源請求並依規則寫入本地（詳情、章節列表、章節內容）；`POST` 的回應主體與 `GET` 相同，必要時另加狀態欄位（如 `persisted`），未寫入的資料沒有資料庫 `id`。例外：API-20 取得頁面圖片在書庫沒有時，會向 plugin 要圖 |

### 1.3 錯誤

錯誤的回應內容格式與錯誤代碼 V1 先不定，實作時看需求再定（Q-A4）。目前各 API 卡只寫可能出現的錯誤與原因，對應 [frontend.md](frontend.md#15-錯誤分類) 的三類錯誤。

（錯誤代碼與錯誤類型的對照表待補。）

API 卡的「錯誤」欄只列各 API 可能出現的錯誤（原因），登入過期與伺服器內部錯誤不再重複。

### 1.4 API 清單

| ID | 分類 | 方法與路徑 | 簡述 | 功能 |
| --- | --- | --- | --- | --- |
| [API-01](#api-01-登入) | 認證 | `POST /api/auth/login` | 登入，建立登入狀態 | [F-01](frontend.md#f-01-登入登出) |
| [API-02](#api-02-登出) | 認證 | `POST /api/auth/logout` | 登出，清除登入狀態 | [F-01](frontend.md#f-01-登入登出) |
| [API-03](#api-03-登入狀態) | 認證 | `GET /api/auth/me` | 確認登入狀態並取得目前使用者 | [F-01](frontend.md#f-01-登入登出) |
| [API-04](#api-04-列出資料夾) | 書庫與資料夾 | `GET /api/folders` | 列出該使用者的所有資料夾 | [F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾) |
| [API-05](#api-05-建立資料夾) | 書庫與資料夾 | `POST /api/folders` | 建立自訂資料夾，可同時放入一部漫畫 | [F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾) |
| [API-06](#api-06-重新命名資料夾) | 書庫與資料夾 | `PATCH /api/folders/{folderId}` | 重新命名自訂資料夾 | [F-06](frontend.md#f-06-資料夾管理) |
| [API-07](#api-07-刪除資料夾) | 書庫與資料夾 | `DELETE /api/folders/{folderId}` | 刪除自訂資料夾 | [F-06](frontend.md#f-06-資料夾管理) |
| [API-08](#api-08-列出資料夾內的漫畫) | 書庫與資料夾 | `GET /api/folders/{folderId}/mangas` | 列出資料夾內的漫畫；`library` 就是書庫列表 | [F-05](frontend.md#f-05-書庫列表)、[F-07](frontend.md#f-07-資料夾內容) |
| [API-09](#api-09-加入資料夾) | 書庫與資料夾 | `POST /api/folders/{folderId}/mangas` | 把書庫中的漫畫放進自訂資料夾 | [F-08](frontend.md#f-08-加入移出資料夾) |
| [API-10](#api-10-移出資料夾或移除漫畫) | 書庫與資料夾 | `DELETE /api/folders/{folderId}/mangas/{source_id}/{remote_id}` | 從自訂資料夾移出漫畫；對 `library` 則是移除漫畫（真正刪除） | [F-08](frontend.md#f-08-加入移出資料夾)、[F-09](frontend.md#f-09-移除漫畫) |
| [API-11](#api-11-加入書庫) | 書庫與資料夾 | `POST /api/library/mangas` | 把漫畫加入書庫，必要時一併建立 Manga | [F-04](frontend.md#f-04-加入書庫) |
| [API-12](#api-12-同步本地詳情) | 漫畫與同步 | `GET /api/mangas/{source_id}/{remote_id}` | 讀本地詳情與是否已加入，沒有則視為不存在 | [F-10](frontend.md#f-10-漫畫詳情) |
| [API-13](#api-13-同步遠端詳情) | 漫畫與同步 | `POST /api/mangas/{source_id}/{remote_id}` | 向來源同步詳情，有人加入才寫入 | [F-10](frontend.md#f-10-漫畫詳情)、[F-11](frontend.md#f-11-同步詳情) |
| [API-14](#api-14-本地搜尋) | 搜尋 | `GET /api/search/local` | 在自己的書庫中以標題搜尋 | [F-02](frontend.md#f-02-本地搜尋) |
| [API-15](#api-15-plugin-搜尋) | 搜尋 | `GET /api/search/remote` | 對勾選的 plugin 搜尋來源網站 | [F-03](frontend.md#f-03-plugin-搜尋) |
| [API-16](#api-16-列出-plugin) | 搜尋 | `GET /api/sources` | 列出已註冊的 plugin | [F-03](frontend.md#f-03-plugin-搜尋) |
| [API-17](#api-17-同步本地章節) | 章節與閱讀 | `GET /api/mangas/{source_id}/{remote_id}/chapters` | 讀本地章節列表，沒有則空陣列 | [F-10](frontend.md#f-10-漫畫詳情)、[F-14](frontend.md#f-14-切換章節) |
| [API-18](#api-18-同步遠端章節) | 章節與閱讀 | `POST /api/mangas/{source_id}/{remote_id}/chapters` | 向來源同步章節，有人加入且沒有衝突才寫入 | [F-12](frontend.md#f-12-同步章節) |
| [API-19](#api-19-載入章節圖片清單) | 章節與閱讀 | `GET` / `POST /api/mangas/{source_id}/{remote_id}/chapters/{remote_chapter_id}` | `GET` 讀書庫的圖片清單；`POST` 向 plugin 取得圖片清單，已被加入的漫畫同時存進書庫 | [F-13](frontend.md#f-13-閱讀章節內漫畫圖片)、[F-14](frontend.md#f-14-切換章節) |
| [API-20](#api-20-取得頁面圖片) | 章節與閱讀 | `GET /api/mangas/{source_id}/{remote_id}/chapters/{remote_chapter_id}/pages/{page}` | 取得單頁圖片；書庫沒有時由 plugin 提供 | [F-13](frontend.md#f-13-閱讀章節內漫畫圖片) |

### 1.5 API 卡欄位

| 欄位 | 內容 |
| --- | --- |
| 目的 | 一句話：這支 API 讓誰做什麼，對應哪個功能 |
| 路徑與方法 | 名詞路徑，動作交給 HTTP 方法 |
| 請求 | 路徑參數、query、body 的欄位、型別、必填 |
| 回應 | 成功時的結構與狀態碼 |
| 錯誤 | 這支 API 可能出現的錯誤，只寫原因，不寫錯誤代碼 |
| 認證與權限 | 誰能呼叫；除登入與登出外都需要有效 session，這裡只寫額外的限制 |
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

以 `Set-Cookie` 設定 session cookie，使用 `HttpOnly`、`Secure`（正式環境）及 `SameSite=Lax`；`Path` 限定為 `/api`，不設定 `Domain`。前後端跨 origin 時，請求需帶 credentials，後端只允許明確列出的前端 origin 並允許 credentials，不得使用 `*`。登入成功時建立新的 session ID，避免沿用登入前的識別值。

使用 cookie 認證時，所有會改變資料的 API 都必須驗證 `Origin` 或採用 CSRF token；若前後端部署為跨 site，需使用 `SameSite=None; Secure` 並採用 CSRF token。不得將 session ID 放在 URL、前端可讀的儲存空間或記錄檔中。

```json
{ "user": { "id": 1, "username": "alice" } }
```

**錯誤**
- 帳號或密碼為空。
- 帳號不存在與密碼錯誤統一視為登入失敗，不區分，避免洩漏帳號是否存在。

**認證與權限**：不需要登入。

**冪等性**：不是。每次成功都建立新的登入狀態與新的 session ID。

**規模**：單次請求。登入失敗的次數限制 V1 不處理。

### API-02 登出

**目的**：使用者登出（[F-01](frontend.md#f-01-登入登出)）。

**路徑與方法**：`POST /api/auth/logout`

**請求**：無。

**回應**：無論目前是否有有效 session，一律回 `204`，並以 `Set-Cookie` 清除 session cookie（`Max-Age=0`，且 `Path` 與登入時一致）。若請求帶有有效 session，後端同時撤銷伺服器端 session。

**錯誤**：無特有的錯誤。

**認證與權限**：不要求有效 session；登出對未登入狀態也成功。

**冪等性**：是。重複呼叫都回 `204`，登入狀態維持清除。

**規模**：單次請求。

---

### API-03 登入狀態

**目的**：確認目前登入狀態並取得使用者資料。

**路徑與方法**：`GET /api/auth/me`

**請求**：無；瀏覽器自動帶上 session cookie。

**回應**：`200`，使用者資料。

```json
{ "id": 1, "username": "alice" }
```

**錯誤**：未登入、session 無效或過期時回 `401`。

**認證與權限**：需帶有效 session。

**冪等性**：是。

**規模**：單次請求。

## 3. 書庫與資料夾

### API-04 列出資料夾

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

### API-05 建立資料夾

**目的**：建立自訂資料夾；加入資料夾時輸入新名稱，也經由這支 API 一起建立並加入（[F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾)）。

**路徑與方法**：`POST /api/folders`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `name` | body | 字串 | 是 | 不可為空，同一位使用者內不可重複 |
| `source_id` | body | 字串 | 否 | 與 `remote_id` 一起帶。有帶時，建立後立刻把這部漫畫放進去，漫畫必須已在書庫 |
| `remote_id` | body | 字串 | 否 | 與 `source_id` 一起帶 |

**回應**：`201`。有帶漫畫識別時，建立資料夾與加入漫畫一起成功或一起失敗。

```json
{ "id": 3, "name": "冒險", "is_default": false }
```

**錯誤**
- 名稱為空。
- `source_id` 與 `remote_id` 只帶了其中一個。
- 名稱重複，包含書庫的名稱「書庫」。
- 帶了漫畫識別，但這部漫畫不在書庫。
- 帶了漫畫識別，但這部漫畫不存在。

**認證與權限**：已登入。

**冪等性**：不是。重複送出相同名稱會因名稱重複而失敗。

**規模**：單次操作。

### API-06 重新命名資料夾

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
- 名稱為空。
- 名稱與其他資料夾重複。
- 對書庫重新命名。
- 資料夾不存在或不屬於該使用者。

**認證與權限**：已登入；只有擁有者。

**冪等性**：是。改成目前的名稱不報錯。

**規模**：單次操作。

### API-07 刪除資料夾

**目的**：刪除自訂資料夾（[F-06](frontend.md#f-06-資料夾管理)）。

**路徑與方法**：`DELETE /api/folders/{folderId}`

**請求**：路徑參數 `folderId`（整數，不可為 `library`）。

**回應**：`204`。該資料夾的成員關係連帶刪除，漫畫本身與書庫不受影響。

**錯誤**
- 刪除書庫。
- 資料夾不存在或不屬於該使用者。

**認證與權限**：已登入；只有擁有者。

**冪等性**：結果相同，但重複呼叫會因資源已不存在而失敗。

**規模**：單次操作。

### API-08 列出資料夾內的漫畫

**目的**：取得某個資料夾的漫畫列表；`folderId` 為 `library` 時就是書庫列表（[F-05](frontend.md#f-05-書庫列表)、[F-07](frontend.md#f-07-資料夾內容)）。

**路徑與方法**：`GET /api/folders/{folderId}/mangas`

**請求**：路徑參數 `folderId`（資料夾 `id` 或 `library`）。

**回應**：`200`。`latest_chapter` 來自 Chapter，資料庫還沒有章節時為 `null`。`cover_url` 在來源沒有封面時為 `null`。

```json
[
  {
    "source_id": "mangadex",
    "remote_id": "a1b2c3",
    "title": "範例漫畫",
    "cover_url": "https://example.com/cover.jpg",
    "latest_chapter": { "id": 778, "title": "第 778 話" }
  }
]
```

**錯誤**
- 資料夾不存在或不屬於該使用者。

**認證與權限**：已登入；只有擁有者。

**冪等性**：是。

**規模**：不分頁，整個資料夾一次回傳。

### API-09 加入資料夾

**目的**：把書庫中的漫畫放進自訂資料夾（[F-08](frontend.md#f-08-加入移出資料夾)）。

**路徑與方法**：`POST /api/folders/{folderId}/mangas`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `folderId` | 路徑 | 整數 | 是 | 不可為 `library`，加入書庫請用 API-11 |
| `source_id` | body | 字串 | 是 | 漫畫必須已在書庫 |
| `remote_id` | body | 字串 | 是 | |

**回應**：新加入回 `201`，已經在這個資料夾回 `200`，內容都是空。

**錯誤**
- 缺少 `source_id` 或 `remote_id`。
- 對書庫使用這支 API。
- 漫畫不在書庫。
- 資料夾不存在或不屬於該使用者，或這部漫畫不存在。

**認證與權限**：已登入；只有擁有者。

**冪等性**：是。已經在資料夾時不重複建立，也不報錯。

**規模**：單次操作。

### API-10 移出資料夾或移除漫畫

**目的**：從自訂資料夾移出漫畫；或在 `folderId` 為 `library` 時，從書庫移除漫畫，等於真正刪除（[F-08](frontend.md#f-08-加入移出資料夾)、[F-09](frontend.md#f-09-移除漫畫)）。

**路徑與方法**：`DELETE /api/folders/{folderId}/mangas/{source_id}/{remote_id}`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `folderId` | 路徑 | 整數或 `library` | 是 | |
| `source_id` | 路徑 | 字串 | 是 | |
| `remote_id` | 路徑 | 字串 | 是 | |

**回應**：`204`

- 自訂資料夾：只移除這個成員關係，不影響書庫與其他資料夾。
- `library`：移除該使用者書庫與其他資料夾中的這部漫畫，並更新 ref count，歸零才回收共用的 Manga 與 Chapter。圖片檔案不立即刪除，留給日後清理（Q-D11）。

**錯誤**
- 資料夾不存在或不屬於該使用者，或這部漫畫已不在這個資料夾。

**認證與權限**：已登入；只有擁有者。

**冪等性**：結果相同，但重複呼叫會因資源已不存在而失敗。

**規模**：單次操作。

### API-11 加入書庫

**目的**：把一部漫畫加入使用者的書庫，漫畫不在資料庫時一併建立（[F-04](frontend.md#f-04-加入書庫)）。

**路徑與方法**：`POST /api/library/mangas`

**請求**：標題與封面來自搜尋結果。

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `source_id` | body | 字串 | 是 | |
| `remote_id` | body | 字串 | 是 | |
| `title` | body | 字串 | 是 | |
| `cover_url` | body | 字串 | 否 | 來源沒有封面時可省略 |

**回應**：新加入回 `201`，已經在書庫回 `200`，內容都是空。不抓取詳情與章節。

**錯誤**
- 必填欄位缺漏或為空。

**認證與權限**：已登入。

**冪等性**：是。已在書庫時不重複建立，也不報錯。

**規模**：單次操作。

---

## 4. 漫畫與同步

### API-12 同步本地詳情

**目的**：取得一部漫畫在本地的詳情，以及這位使用者是否已加入書庫（[F-10](frontend.md#f-10-漫畫詳情)）。

**路徑與方法**：`GET /api/mangas/{source_id}/{remote_id}`

**請求**：路徑參數 `source_id`、`remote_id`，皆為字串。

**回應**：`200`。只讀資料庫，不向來源請求。空值欄位前端顯示「未知」。`cover_url` 在來源沒有封面時為 `null`。`folder_ids` 是這位使用者放了這部漫畫的自訂資料夾。

```json
{
  "manga": {
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
- 資料庫沒有這部漫畫。

**認證與權限**：已登入。漫畫資料全體共用；`in_library` 與 `folder_ids` 只反映目前使用者。

**冪等性**：是。

**規模**：單次查詢。

### API-13 同步遠端詳情

**目的**：向來源取得最新的漫畫詳情；有人加入這部漫畫時才寫入資料庫（[F-11](frontend.md#f-11-同步詳情)）。從 plugin 搜尋結果進入詳情頁、本地沒有這部漫畫時，也用這支取詳情（[F-10](frontend.md#f-10-漫畫詳情)）。

**路徑與方法**：`POST /api/mangas/{source_id}/{remote_id}`

**請求**：路徑參數 `source_id`、`remote_id`，皆為字串，沒有 body。

**回應**：`200`。`persisted` 為 `true` 表示已更新資料庫（含 `detail_synced_at`），為 `false` 表示沒有人加入，只回傳不寫入。不碰章節。`manga`、`in_library`、`folder_ids` 的結構同 API-12。

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
    "remote_updated_at": "2026-10-01T00:00:00Z",
    "detail_synced_at": "2026-11-07T00:00:00Z",
    "chapters_synced_at": null
  },
  "in_library": true,
  "folder_ids": [2, 3],
  "persisted": true
}
```

`persisted` 為 `false` 時（沒有人加入，資料庫沒有這部漫畫）：`detail_synced_at`、`chapters_synced_at` 為 `null`，`in_library` 為 `false`，`folder_ids` 為空陣列。

**錯誤**
- 來源無法存取、來源上沒有這部漫畫（含下架），或指定的 `source_id` 沒有已註冊的 plugin。
- 最短間隔內再次同步，不向來源抓取。

**認證與權限**：已登入。寫入的是全體共用的 Manga，所有把這部漫畫放進書庫的使用者都會看到。

**冪等性**：可重複呼叫，間隔內會被拒絕。

**規模**：受最短間隔限制，間隔值寫在設定檔；沒有人加入時資料庫沒有同步時間可比，不受間隔限制，但每次都會向來源發請求。逾時值待定（Q-A3）。

---

## 5. 搜尋

### API-14 本地搜尋

**目的**：以標題搜尋使用者書庫中的漫畫（[F-02](frontend.md#f-02-本地搜尋)）。

**路徑與方法**：`GET /api/search/local`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `q` | query | 字串 | 是 | 關鍵字，不可為空 |

**回應**：`200`。沒有符合的結果時回空陣列，不是錯誤。`cover_url` 在來源沒有封面時為 `null`。

```json
[
  { "source_id": "mangadex", "remote_id": "a1b2c3", "title": "範例漫畫", "cover_url": "https://example.com/cover.jpg" }
]
```

**錯誤**
- `q` 為空。前端已攔截，後端仍要檢查。

**認證與權限**：已登入；只搜自己的書庫。

**冪等性**：是。

**規模**：範圍是單一使用者的書庫，不分頁。

### API-15 plugin 搜尋

**目的**：對使用者勾選的 plugin 並行搜尋來源網站，合併結果；不寫入資料庫（[F-03](frontend.md#f-03-plugin-搜尋)）。

**路徑與方法**：`GET /api/search/remote`

**請求**

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `q` | query | 字串 | 是 | 關鍵字，不可為空 |
| `sources` | query | 字串 | 是 | 以逗號分隔的 `source_id`，至少一個 |

**回應**：`200`。`in_library` 表示這位使用者的書庫是否已有這部漫畫。單一 plugin 失敗或逾時不影響其他，失敗的來源列入 `failed_sources`。所有勾選的 plugin 都沒有符合的漫畫時，`results` 為空陣列，不是錯誤。`cover_url` 在來源沒有封面時為 `null`。

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
- `q` 為空，或沒有帶任何 `sources`。前端已攔截，後端仍要檢查。
- 勾選的 plugin 全部失敗。

**認證與權限**：已登入。

**冪等性**：是，但每次都會向來源發請求。

**規模**：plugin 約 10 個以內，並行呼叫；單一 plugin 的逾時值待定（Q-A3）。

### API-16 列出 plugin

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

## 6. 章節與閱讀

### API-17 同步本地章節

**目的**：取得本地的章節列表（[F-10](frontend.md#f-10-漫畫詳情)、[F-14](frontend.md#f-14-切換章節)）。

**路徑與方法**：`GET /api/mangas/{source_id}/{remote_id}/chapters`

**請求**：路徑參數 `source_id`、`remote_id`，皆為字串。

**回應**：`200`，只讀資料庫。還沒同步過章節，或這部漫畫不在資料庫時，`chapters` 為空陣列。

```json
{
  "chapters": [
    { "id": 778, "remote_id": "778", "title": "第 778 話", "sort_order": 778 }
  ]
}
```

**錯誤**：無特有的錯誤。

**認證與權限**：已登入。

**冪等性**：是。

**規模**：不分頁，一次回傳完整的本地章節列表。

### API-18 同步遠端章節

**目的**：向來源取得章節列表，與現有章節比對；有人加入且沒有衝突時才寫入（[F-12](frontend.md#f-12-同步章節)）。

**路徑與方法**：`POST /api/mangas/{source_id}/{remote_id}/chapters`

**請求**：路徑參數 `source_id`、`remote_id`，皆為字串。

| 欄位 | 位置 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- | --- |
| `limit` | body | 整數 | 否 | 每次要求的章節數量，控制粒度 |
| `cursor` | body | 字串 | 否 | 續取的位置，取自上一次回應的 `next_cursor` |

**回應**：`200`。不載入圖片。主體同 API-17，另加狀態欄位。

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
- `limit` 或 `cursor` 格式不合法。
- 來源無法存取、來源上沒有這部漫畫（含下架），或指定的 `source_id` 沒有已註冊的 plugin。
- 最短間隔內再次同步。

**認證與權限**：已登入。寫入的是全體共用的 Chapter。

**冪等性**：可重複呼叫，間隔內會被拒絕。

**規模**：對來源的請求用 `limit` 與 `cursor` 控制粒度，不一次取大量章節；受最短間隔限制。

### API-19 載入章節圖片清單

**目的**：取得一章的圖片清單；書庫沒有這章時，由 `POST` 向 plugin 取得。未加入書庫的漫畫也可以閱讀（[F-13](frontend.md#f-13-閱讀章節內漫畫圖片)）。

**路徑與方法**：`GET` / `POST /api/mangas/{source_id}/{remote_id}/chapters/{remote_chapter_id}`

**請求**：路徑參數皆為字串（`source_id`、`remote_id` 為來源與漫畫在來源上的 ID，`remote_chapter_id` 為章節在來源上的 ID）。目錄名編碼待定（Q-D6），路徑參數需要 URL 編碼。`POST` 沒有 body。

**回應**：`200`，`GET` 與 `POST` 的內容相同。

```json
{
  "page_count": 2,
  "pages": [
    "/api/mangas/mangadex/a1b2c3/chapters/778/pages/1",
    "/api/mangas/mangadex/a1b2c3/chapters/778/pages/2"
  ]
}
```

行為：

- `GET`：書庫的章節目錄中有 `manifest.json` 就回傳圖片清單，沒有則視為不存在，不向 plugin 請求。
- `POST`：向 plugin 取得這章的圖片清單並回傳。漫畫已被任何人加入（ref count 大於 0）時，同時請 plugin 把整章抓進 `library`（`manifest.json` 最後寫入；書庫已有這章時也重新抓取，新檔取代舊檔）；沒有人加入時只回傳圖片清單，系統不保存圖片。
- 同一章有 `POST` 進行中時，其他請求等待，不重複下載。

**錯誤**
- `GET` 時書庫還沒有這章。
- `POST` 時來源無法存取、來源上沒有這部漫畫（含下架）或這章、圖片載入失敗，或指定的 `source_id` 沒有已註冊的 plugin。
- `POST` 時需要寫入圖片，但圖片空間已達設定檔的上限。

**認證與權限**：已登入。

**冪等性**：`GET` 是。`POST` 結果相同，但每次都會重新向來源抓取。

**規模**：一章頁數不定；`POST` 會對來源發請求（C-4）。

### API-20 取得頁面圖片

**目的**：取得一頁圖片的內容（[F-13](frontend.md#f-13-閱讀章節內漫畫圖片)）。這是 1.2「`GET` 只讀本地」的唯一例外。

**路徑與方法**：`GET /api/mangas/{source_id}/{remote_id}/chapters/{remote_chapter_id}/pages/{page}`

**請求**：路徑參數 `page` 為頁碼（整數，從 1 開始），其餘同 API-19。

**回應**：`200`，圖片位元組；`Content-Type` 由 Backend 決定，不信任 plugin 回傳的值。先查 `library`，命中直接回；沒有就請 plugin 取得這一頁並回傳（plugin 的快取屬實作細節），不寫入 `library`。

**錯誤**
- `library` 沒有這頁，且 plugin 也取不到（來源無法存取、來源上沒有這頁，或 `source_id` 沒有已註冊的 plugin）。

**認證與權限**：已登入。`library` 的圖片所有已登入的使用者可讀。

**冪等性**：是。

**規模**：單張圖片，逐張載入；`library` 沒有時會對來源發請求（C-4）。

---

## 7. 待定項目

| 編號 | 問題 | 相關 API |
| --- | --- | --- |
| Q-A2 | 同步章節發現衝突後，使用者決定要套用時，後端的套用方式（frontend.md 的 Q-F7） | API-18 |
| Q-A3 | 對 plugin 與來源請求的逾時值（frontend.md 的 Q-F6） | API-13、API-15、API-18、API-19、API-20 |
| Q-A4 | 錯誤的回應內容格式與錯誤代碼；同一類錯誤有多種原因時前端如何區分（例如 API-05：名稱重複，或漫畫不在書庫） | 全部 |
| Q-A5 | 章節的 `sort_order` 方向：「最新話」與上一話、下一話以什麼判斷 | API-08、API-17 |
| Q-A6 | 同步章節（API-18）分批（`limit`、`cursor`）時：續取是否受最短間隔限制、有寫入時回傳整份列表還是該批；詳情與章節同步的最短間隔從何時起算（沒有人加入時資料庫沒有同步時間） | API-13、API-18 |
| Q-A7 | API-11 直接採用前端傳來的 `title` 與 `cover_url`，是否要向 plugin 驗證 | API-11 |
