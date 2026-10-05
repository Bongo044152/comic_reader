# 開發文件 V1

Oct 3, 2026 · @Bongo

## 1. Top View

V1 的最小功能 = 一條主流程能跑通：管理者發配帳號、安裝 plugin → 使用者登入 → plugin 搜尋 → 加入書庫與資料夾 → 閱讀 → 寫入閱讀紀錄 → 檢查更新。各模塊只負責這條流程需要的部分。

```text
    +--------------------+          +------------+
    | Backend Management |          |  Frontend  |
    |  (CLI, scope TBD)  |          +------+-----+
    +----------+---------+                 |
               |                           | REST API
               |                           |
               +---------------+-----------+
                               |
  +----------------------------|-------------------------------------+
  | Docker network             |                                     |
  |                            v                                     |
  |                     +-------------+                              |
  |                     |   Backend   |                              |
  |                     +------+------+                              |
  |                            | HTTP call / plugin registers        |
  |           +----------------+----------------+                    |
  |           |                |                |                    |
  |           v                v                v                    |
  |     +-----------+    +-----------+    +-----------+              |
  |     |  Plugin A |    |  Plugin B |    |  Plugin C |  (up to ~10) |
  |     +-----+-----+    +-----+-----+    +-----+-----+              |
  |           |                |                |                    |
  +-----------|----------------|----------------|--------------------+
              | Web Request    |                |
              v                v                v
        +---------------------------------------------+
        |              External Websites              |
        +---------------------------------------------+


  Outside the Docker network:

  +--------------------+          +----------------------------+
  |      Database      |          |        File Storage        |
  |     (type TBD)     |          |   library/ and scratch/    |
  +--------------------+          +----------------------------+


  Backend ---- read / write ----> Database
  Backend ---- read  only   ----> File Storage
  Plugin  ---- read / write ----> File Storage (its own source dir only)
```

圖說：

- Frontend 只經由 Backend 取資料（REST API）；Backend Management 是 CLI，主要與 Backend 互動，功能待定。
- Backend 與 plugin 在同一個 Docker network；plugin 啟動後向 Backend 註冊，Backend 以 HTTP 呼叫 plugin。
- 只有 Backend 存取 Database（選型待定）。
- Backend 只讀 File Storage；plugin 只直接讀寫入自己來源的目錄。
- Plugin 向 External Websites 發出請求。

只有 Backend 存取 Database（選型待定）；plugin 與 Backend 在同一個 Docker network，圖片由 plugin 直接寫入各自的來源目錄（省網路請求），Backend 負責 metadata 與服務圖片。Suwayomi api 尚未確認，圖中的 Plugin A/B/C 先代表任意一個 plugin container。

| 模塊 | 角色 | V1 最小功能 | 不負責 |
| --- | --- | --- | --- |
| Frontend | 使用者介面與操作 | 登入、書庫、搜尋、主頁、詳情頁、閱讀、資料夾管理、手動檢查更新；載入動畫、錯誤提示 | 業務邏輯、直接存取 Database 或 plugin |
| Backend Management | 主要與 Backend 互動的管理模塊，預期為 CLI | 待定（相關需求：A-14、BE-02、BE-10） | 待定 |
| Backend | 唯一的業務邏輯層，統一對外 API | 帳號驗證與權限、書庫與資料夾、閱讀紀錄、本地搜尋與 plugin 搜尋、更新檢查與衝突偵測、圖片快取、plugin 註冊與生命週期管理、錯誤 log | 渲染畫面、爬取來源網站 |
| Database | 結構化資料 | Manga Data, User Data | 圖片檔案 |
| File Storage | 章節圖片與快取，以漫畫 id 共用 | plugin 直接寫入各自的來源目錄、Backend 讀取並服務圖片、支援強制刷新 | 圖片以外的資料 |
| Plugin System | 每個 plugin 一個 Docker container，與來源網站溝通，啟動後向 Backend 註冊 | 搜尋、漫畫資訊、章節列表、章節圖片（直接寫檔）、註冊（V1 只檢查來源 IP）、可辨識的錯誤回報（PL-02～05、PL-07） | 存取 Database、使用者資料 |
| External Websites | 漫畫來源 | — | — |

排程更新（BE-11）視為 Backend 內部功能，不單列模塊；Scheduler 的技術選型留到技術鏈確認。

## 2. 前端界面

> 標記 Action 表示會影響後端邏輯（與後端交互）
>
> 標記 Jump 表示有跳轉頁面的邏輯（不會離開這個網站，這裡的跳轉類似 router 機制）
>
> 標記 Render 表示有專門的畫面渲染邏輯（但不會 Jump）

登入界面：

- 帳號、密碼輸入
- 登入按鈕（Action/Jump -> 主頁）

主頁：

- 搜尋輸入框、搜尋按鈕（Action/Render）
- 資料夾頁面跳轉按鈕（Action/Jump -> 資料夾頁面）
- 漫畫列表（Action/Jump -> 漫畫詳情頁）
- 刪除漫畫（Action/Render）

資料夾頁面：

- 資料結列表（Action/Jump -> 資料夾內文）
- 刪除資料夾（Action/Render）
- 重新命名資料夾（Action/Render）
- 建立資料夾（Action/Render）

資料夾內文：

- 漫畫列表（Action/Jump -> 漫畫詳情頁）
- 刪除漫畫（Action/Render）

漫畫詳情頁：

- （遠端）同步詳情（Action/Render->小範圍）
- （遠端）同步章節（Action/Render->小範圍）
- 加入按鈕（Action/Render->小範圍）
- 刪除按鈕（Action/Jump -> 回前一頁）
- 級數列表（Action/Jump -> 閱讀器頁面）
- 漫畫詳情（Action）
- 加入資料夾（Action）

閱讀器頁面：

- 漫畫圖片
- 下一級（Action/Jump -> 閱讀器頁面）
- 上一級（Action/Jump -> 閱讀器頁面）

### 元素互動行為

> 備註："Side effect" 表示為淺在的交互作用（容易被忽略的行為）。

| 頁面 | 元素 | Action | Side effect | Error |
| --- | --- | --- | --- | --- |
| 登入界面 | 登入按鈕 | 送出帳號與密碼；成功後 Jump 主頁 | Session / Token 管理。 | 來源端：不適用。 使用者端：帳號或密碼錯誤（統一顯示登入失敗）、帳號不存在、輸入格式錯誤。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 主頁 | 搜尋輸入框、搜尋按鈕 | 送出關鍵字，觸發搜尋邏輯 | 搜尋邏輯：本地書庫搜尋、plugin 搜尋。 | 來源端：未響應搜尋。 使用者端：登入過期（401，回登入頁）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 主頁 | 資料夾頁面跳轉按鈕 | Jump 資料夾頁面，並載入該使用者的資料夾列表 | 無 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 主頁 | 刪除漫畫 | 從預設資料夾（書庫）移除漫畫，這是真正的刪除；Render 書庫的漫畫列表。與「資料夾內文」共用同一個頁面元件 | 同詳情頁的「刪除按鈕」：只移除該使用者的書庫關係，連動移除其他資料夾中的關係，共用的 Manga / Chapter 以 ref count 管理，歸零才回收（C-7）。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；這部漫畫已不在書庫（404）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 主頁 | 漫畫列表 | 載入預設資料夾（書庫）的漫畫；點擊 Jump 漫畫詳情頁 | 「最新話」來自共用的 Manga / Chapter，「讀到哪一話」來自使用者自己的 Reading History，兩邊要對齊。更新衝突待確認的漫畫（BE-12）在列表如何呈現，需對齊。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；漫畫已被移除（404 頁面）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 資料夾頁面 | 資料夾列表 | Jump 資料夾內文，並載入該資料夾內的漫畫 | 無 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；資料夾不存在或不屬於該使用者（404 / 403）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 資料夾頁面 | 建立資料夾 | 輸入名稱並建立資料夾；Render 資料夾列表 | 名稱在同一位使用者內不可重複（UNIQUE(user\_id, name)）。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；名稱為空；名稱重複。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 資料夾頁面 | 重新命名資料夾 | 修改資料夾名稱；Render 資料夾列表 | 無 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；資料夾不存在或不屬於該使用者（404 / 403）；名稱為空；名稱重複；預設資料夾（書庫）不可重新命名。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 資料夾頁面 | 刪除資料夾 | 刪除資料夾；Render 資料夾列表 | 該資料夾的 FolderManga 關係連帶刪除（CASCADE）；漫畫本身與書庫不受影響（資料夾只存關係，C-1）。預設資料夾（書庫）不能刪除。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；資料夾不存在或不屬於該使用者（404 / 403）；預設資料夾（書庫）不能刪除。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 資料夾內文 | 漫畫列表 | 載入該資料夾內的漫畫；點擊 Jump 漫畫詳情頁 | 同主頁的漫畫列表：「最新話」與「讀到哪一話」的來源不同，要對齊。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；資料夾或漫畫已被移除（404 頁面）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 資料夾內文 | 刪除漫畫 | 將漫畫從這個資料夾移出（在預設資料夾「書庫」中則是真正的刪除）；Render 資料夾內的漫畫列表 | 自訂資料夾：只移除 FolderManga 關係，不影響書庫與 ref count，也不影響其他資料夾。預設資料夾（書庫）：等同詳情頁的刪除按鈕，連動移除其他資料夾中的關係，並影響 ref count。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；資料夾不存在或不屬於該使用者（404 / 403）；漫畫已不在這個資料夾（404）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | 漫畫詳情 | 載入本地詳情與本地章節（章節列表有內容，表示資料庫有這個章節的內容） | 無 | 來源端：無。 使用者端：登入過期（401，回登入頁）；本地沒有這部漫畫（404 頁面）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | （遠端）同步詳情 | 觸發詳情同步（向遠端取詳情並寫入）；Render 更新後的詳情 | 是否寫入資料庫，看這部漫畫有沒有關聯（ref count）：有才寫入；沒有（例如從遠端搜尋進來、尚未加入）只回傳給前端顯示，不寫入。 詳情同步不碰章節，不影響閱讀紀錄。 寫入全體共用的 Manga，所有書庫裡有這部漫畫的使用者都會看到。 最短間隔（C-4）：間隔內不重複向來源抓取。 | 來源端：來源無法存取（被封鎖、Cloudflare、網站改版）、漫畫下架；與畫面元素綁在一起顯示。 使用者端：登入過期（401，回登入頁）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | （遠端）同步章節 | 觸發章節同步（向遠端取章節列表並寫入）；Render 章節列表 | 是否寫入資料庫同樣看有沒有關聯（ref count）：有才寫入；沒有只回傳章節列表，不寫入。章節同步不載入圖片，圖片在點選章節進入閱讀時才載入（overcommit）。 章節同步若會改變已讀章節（重新編號、刪除章節、換源），不自動套用，標記待使用者確認；確認後不再維護該漫畫的閱讀紀錄（BE-12、C-5）。 同步的回應直接帶回章節列表，前端據此更新，不另外再打 API。 對遠端的請求要控制顆粒度，不一次取大量章節；最短間隔（C-4）內不重複向來源抓取。 | 來源端：來源無法存取（被封鎖、Cloudflare、網站改版）、漫畫下架；與畫面元素綁在一起顯示。 使用者端：登入過期（401，回登入頁）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | 加入按鈕 | 加入預設資料夾（書庫），即建立使用者與這部漫畫的關聯；Render 小範圍 | 漫畫不在資料庫時，先建立漫畫記錄（漫畫 id = 漫畫 + 來源，BE-04）；ref count 從這裡開始。 建立關聯後，同步詳情與同步章節的結果才會寫入資料庫。 加入不抓取詳情與章節，兩者分開處理（成本不同）。 冪等：已有關聯時不重複建立。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | 加入資料夾 | 將這部漫畫加入某個資料夾（建立資料夾與漫畫的關係） | 只有已加入書庫的漫畫才能放進資料夾（自訂資料夾的成員必須也在書庫內）；未加入時此動作是否可用待定。 一部漫畫可以放進多個資料夾（C-1）；資料夾只存關係，不複製漫畫資料。選擇的資料夾若不存在則同時建立（隱含建立資料夾），建立資料夾與加入關係要在同一個 transaction 完成。 冪等：已在該資料夾時不重複建立。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；資料夾不存在或不屬於該使用者（404 / 403）；漫畫尚未加入書庫。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | 刪除按鈕 | 從預設資料夾（書庫）移除漫畫，這是真正的刪除；成功後 Jump 回前一頁 | 只移除該使用者的書庫關係，共用的 Manga / Chapter 以 ref count 管理，歸零才回收（C-7）。 該使用者資料夾中這部漫畫的關係（Folder-Manga）要一併移除。 回前一頁後，列表（書庫、資料夾內文）要反映已移除，不能顯示舊資料。 只在漫畫已加入書庫時才有這個按鈕。 | 來源端：不適用。 使用者端：登入過期（401，回登入頁）；這部漫畫已不在書庫（404 頁面）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 漫畫詳情頁 | 章節列表 | 載入章節列表與讀到哪一話（資料庫有這部漫畫時才顯示）；點擊章節 Jump 閱讀器頁面 | 「讀到哪一話」以章節 ID 記錄；來源重新編號或刪除章節後可能對不上（C-5，依 BE-12 處理）。 | 來源端：不適用（章節列表來自已同步的資料）。 使用者端：登入過期（401，回登入頁）；漫畫已被移除（404 頁面）。 伺服器：5xx，通用紅色提示，後端記 log。 |
| 閱讀器頁面 | 漫畫圖片 | 載入該章節的圖片（快取命中直接回傳；未命中由 plugin 抓取並寫入 File Storage） | 快取未命中時會對來源網站發請求（C-4）；同一章被多人同時請求的重複下載（見備忘「爭奪問題」）。 進入章節時是否更新閱讀紀錄（記到章節 ID），寫入時機需對齊。 | 來源端：來源無法存取、圖片載入失敗；與畫面元素綁在一起顯示。 使用者端：登入過期（401）；章節不存在（404 頁面）。 伺服器：5xx，通用紅色提示，後端記 log；磁碟空間不足為後續版本（C-6）。 |
| 閱讀器頁面 | 下一章、上一章 | Jump 閱讀器頁面，載入下一章或上一章 | 切章時更新閱讀紀錄，寫入時機需對齊（與進入章節同一個決定）。 目標章節尚未快取時，會觸發 plugin 抓取，同上。 | 來源端：同「漫畫圖片」。 使用者端：已是最新章節 / 已是第一章；登入過期（401）。 伺服器：5xx，通用紅色提示，後端記 log。 |

## 3. 資料格式與 API

### 3.1 資料庫（草稿）

資料庫選型待定，下表的結構對 PostgreSQL 與 SQLite 都適用。

| 表 | 欄位 | 鍵與關聯 | 說明 |
| --- | --- | --- | --- |
| User | id、username、password\_hash、created\_at | PK id；UNIQUE username | 刪除帳號時，其 Folder、FolderManga、ReadingHistory、UserSettings 連帶刪除 |
| Manga | id、source\_id、remote\_id、title、cover\_url（必填）；author、status、region、tags、summary、remote\_updated\_at（可空，空值顯示「未知」A-7）；detail\_synced\_at、chapters\_synced\_at（可空） | PK id；UNIQUE(source\_id, remote\_id) 即「漫畫 id = 漫畫 + 來源」BE-04 | 全體共用。由「加入」建立，必填欄位來自搜尋結果，其餘由同步詳情補上 |
| Chapter | id、manga\_id、remote\_id、title（章節標題，不一定是數字）、sort\_order | PK id；UNIQUE(manga\_id, remote\_id)；manga\_id → Manga（CASCADE） | 全體共用。章節 id 供閱讀紀錄引用 |
| Folder | id、user\_id、name、is\_default | PK id；UNIQUE(user\_id, name)；UNIQUE(id, user\_id)（供 FolderManga 參照）；user\_id → User（CASCADE） | 資料夾屬於個別使用者。每位使用者有一個預設資料夾「書庫」（is\_default），帳號建立時一併建立，不能刪除、不能重新命名 |
| FolderManga | folder\_id、user\_id、manga\_id | PK(folder\_id, manga\_id)；(folder\_id, user\_id) → Folder(id, user\_id)（CASCADE），確保資料夾與成員屬於同一位使用者；索引 (user\_id, manga\_id) 供詳情頁查詢，(manga\_id) 供 ref count | 所有資料夾（含預設資料夾「書庫」）的成員都存在這裡，只存關係（C-1）。自訂資料夾裡的漫畫必須也在書庫內；從書庫移除漫畫時，由程式在同一個 transaction 刪除該使用者所有資料夾中的這部漫畫，對應刪除按鈕的 side effect |
| ReadingHistory | user\_id、manga\_id、chapter\_id、updated\_at | PK(user\_id, manga\_id)；user\_id → User（CASCADE）；manga\_id → Manga（CASCADE）；chapter\_id → Chapter | 記到章節 id（A-9）。移除漫畫時由程式預設連帶刪除，保留與否待定 |
| UserSettings | user\_id、data（JSON） | PK user\_id；→ User（CASCADE） | 閱讀模式、暖色濾鏡、主題等個人設定 |

設計決定：

- Manga 用 surrogate id 加 UNIQUE(source\_id, remote\_id)。檔案路徑用 (source\_id, remote\_id, 章節 remote\_id)，不用資料庫 id，這樣圖片可以在漫畫進資料庫之前就存在。
  - **名詞**：`source_id` = 哪個來源（哪個 plugin / 網站），如 `mangadex`；`remote_id` = 漫畫在該來源網站上自己的 ID（通常是網址裡那段），如 `a1b2c3`。章節同理，也有自己的 `remote_id`。
  - **為什麼 UNIQUE(source\_id, remote\_id)**：`remote_id` 只在單一來源內唯一，不同網站可能撞號；兩欄合起來才能指出「哪個網站的哪部漫畫」，並防止同一部漫畫重複入庫。
  - **為什麼另外要 surrogate id**：資料庫內部的外鍵（Chapter、FolderManga、ReadingHistory）只需帶一個整數，比到處帶兩個字串欄位短、好 join。
  - **為什麼檔案路徑不用 surrogate id**：surrogate id 要漫畫入庫後才產生，但系統允許閱讀未加入的漫畫，plugin 抓圖時可能還沒有 Manga 記錄；`(source_id, remote_id)` 由來源本身提供，抓的當下就知道。
  - **例子**：`Manga(id=42, source_id=mangadex, remote_id=a1b2c3)` 第 778 話第 1 頁 → `images/mangadex/a1b2c3/778/001.jpg`。路徑裡沒有 42，所以 42 出現之前圖片就能寫入，入庫後也不必搬檔或改名。
- 書庫就是預設資料夾（出現在列表、不可刪除、不可重新命名），成員和其他資料夾一樣存在 FolderManga，不另設 UserManga。「自訂資料夾 ⊆ 書庫」由程式在 transaction 內維持（加入自訂資料夾時檢查書庫、從書庫移除時刪除所有資料夾中的關係）；若要由資料庫保證，可在 FolderManga 加自我參照的外鍵。ref count 不另存欄位，用預設資料夾中該漫畫的筆數推導（FolderManga join Folder where is\_default），避免兩處不一致；移除時在同一個 transaction 檢查，歸零才刪 Manga（連帶刪 Chapter）。競爭細節後面處理。
- **圖片不入資料庫**。允許閱讀未加入的漫畫（沒有 Manga 記錄），所以圖片存不存在由檔案系統決定。這取代前面備忘「資料庫只存圖片 metadata」的說法。

待確認：

- BE-12 與 C-5：章節同步若會改變已讀章節，「不自動套用、待使用者確認」的更新要存在哪裡？Chapter 是全體共用，一個使用者的決定會影響其他人。
- 封面：只存 cover\_url，還是也快取到檔案系統。
- Session 表：JWT 或 server-side session，取決於認證方式（待定）。
- Plugin 的註冊紀錄在記憶體，不入資料庫；source\_id 目前只是字串，沒有 Source 表。

### 3.2 檔案存放（草稿）

草稿目錄（來源放第一層、目錄名編碼先不決定，見待定）：

```text
/data/{source}/library/{遠端漫畫 id}/{遠端章節 id}/      已有人加入的漫畫，全體共用
/data/{source}/scratch/{userId}/{遠端漫畫 id}/{遠端章節 id}/   未加入的漫畫，使用者私有
```

規則：

- 寫入目標由 Backend 決定：這部漫畫有人加入（ref count > 0）寫 `library`，否則寫該使用者的 `scratch`。
- 未加入的漫畫每位使用者只保留最近 5 章，超過就刪最舊的（讀取時 `touch` 記錄時間，不依賴 `atime`）。總量 = 使用者數 × 5 章，有界，不需要淘汰規則。
- `scratch` 只給屬主本人讀（用 session 比對）；刪除帳號時直接刪除該使用者的 `scratch` 目錄。
- 章節目錄：頁面檔按頁碼命名，最後寫入 `manifest.json` 當完成標記；先寫到同一個 mount 內的 `.tmp-*` 再 `rename()`。檔案不原地修改，只用新檔取代。
- 圖片的存在與完整性由檔案系統決定，資料庫不記路徑、不記頁數。路徑由欄位組出：Manga.source\_id + Manga.remote\_id + Chapter.remote\_id（以 manga\_id 查 Chapter.remote\_id），章節名稱在 Chapter.title；未加入的漫畫沒有資料列，路徑由請求帶的遠端 id 組出。ref count 歸零只刪資料庫記錄，`library` 的檔案留給淘汰。

可選的最佳化（改 plugin 的邏輯即可）：

- 共用 `scratch`：寫入前先查其他使用者是否已有這一章，有就用硬連結（`link(2)`，`i_nlink` 加 1，不複製資料）。前提：同一個 mount（跨 mount 會 `EXDEV`）、只能連結檔案不能連結目錄、檔案不原地修改。
- 加入時把已在 `scratch` 的章節用 `rename()` 或硬連結移到 `library`，省一次重抓。

待定：

- 目錄的第一層要不要是來源（讓 plugin 只掛自己的 `/data/{source}`）。
- 目錄名編碼：遠端 id 可能含 `/`、`..` 或特殊字元，直接當路徑有穿越風險。
- 封面的放置：已加入的可以放 `library/{漫畫 id}/cover.jpg`；搜尋結果中未加入漫畫的封面數量多，尚未決定。

### 3.3 前後端 API（草稿）

只定義 Frontend 與 Backend 之間的 API，Backend 與 plugin 之間的 API 晚一點再寫。

通用約定：

- 路徑以 `/api` 開頭，JSON 交換。除登入外，每支 API 都需要登入狀態，沒有或過期一律回 401。登入狀態的實作（JWT 或 session）待定。
- 資料庫已有的漫畫用 `manga_id`，可能還不在資料庫的漫畫（搜尋結果、試讀）用遠端鍵 `(source_id, remote_id)`。
- `folderId` 可以是資料夾的 id，也可以是字串 `library`，代表該使用者的預設資料夾。
- 每支 API 都要檢查資源屬於目前登入的使用者（資料夾、書庫、閱讀紀錄），不屬於回 403 或 404。
- 錯誤回傳 `{error: {type, code, message}}`，`type` 分三類對應頁面的 Error 欄位：`user`（使用者端，4xx）、`source`（來源端，502）、`server`（伺服器，5xx，後端記 log）。
- 重複的「加入」「加入資料夾」是冪等的，重複送出不報錯。

**認證**

| 方法與路徑 | 對應元素 | 請求與回應 | 操作內容 |
| --- | --- | --- | --- |
| `POST /api/auth/login` | 登入按鈕 | 請求 `{username, password}`；回應 `{user: {id, username}}` | 驗證帳號與密碼，建立登入狀態。帳號不存在與密碼錯誤統一回 401 登入失敗 |
| `POST /api/auth/logout` | （UI 尚無元素） | 無；204 | 清除登入狀態 |

**資料夾與書庫**

| 方法與路徑 | 對應元素 | 請求與回應 | 操作內容 |
| --- | --- | --- | --- |
| `GET /api/folders` | 資料夾列表、資料夾頁面、主頁的資料夾跳轉按鈕 | 回應 `[{id, name, is_default}]` | 回傳該使用者所有資料夾，預設資料夾（書庫）排第一 |
| `POST /api/folders` | 建立資料夾、加入資料夾（隱含建立） | 請求 `{name, manga_id?}`；201 `{id, name, is_default: false}` | 建立資料夾；若帶 `manga_id`，在同一個 transaction 內把這部漫畫加進去（漫畫須已在書庫）。名稱為空 400、同一使用者重名 409 |
| `PATCH /api/folders/{folderId}` | 重新命名資料夾 | 請求 `{name}`；回應 `{id, name}` | 預設資料夾不可重新命名（403）。名稱為空 400、重名 409 |
| `DELETE /api/folders/{folderId}` | 刪除資料夾 | 204 | 刪除 Folder，其 FolderManga 連帶刪除，漫畫與書庫不受影響。預設資料夾不可刪除（403） |
| `GET /api/folders/{folderId}/mangas` | 漫畫列表（主頁 = `library`、資料夾內文） | 回應 `[{manga_id, source_id, remote_id, title, cover_url, latest_chapter, last_read_chapter, update_pending}]` | 查 FolderManga 中該資料夾的成員再對應 Manga。「最新話」來自 Chapter，「讀到哪一話」來自 ReadingHistory，在這支 API 合併回傳 |
| `POST /api/folders/{folderId}/mangas` | 加入資料夾 | 請求 `{manga_id}`；201 | 只限自訂資料夾；漫畫必須已在書庫（否則 409）。建立 FolderManga，已存在則不重複 |
| `DELETE /api/folders/{folderId}/mangas/{mangaId}` | 刪除漫畫（主頁、資料夾內文、詳情頁刪除按鈕） | 204 | 自訂資料夾：只移除成員關係。`library`：真正的刪除，在同一個 transaction 內刪除該使用者所有資料夾中的這部漫畫、其 ReadingHistory，並檢查 ref count，歸零才刪 Manga（連帶刪 Chapter）；檔案不動，留給淘汰 |
| `POST /api/library/mangas` | 加入按鈕 | 請求 `{source_id, remote_id, title, cover_url}`；201 `{manga_id}` | Manga 不在資料庫時先建立（標題與封面來自搜尋結果），再在預設資料夾建立成員。不抓取詳情與章節 |

**漫畫與同步**

| 方法與路徑 | 對應元素 | 請求與回應 | 操作內容 |
| --- | --- | --- | --- |
| `GET /api/mangas/{mangaId}` | 漫畫詳情（本地） | 回應 `{manga: {id, source_id, remote_id, title, cover_url, author, status, region, tags, summary, remote_updated_at}, in_library, folder_ids}` | 只讀資料庫。空值欄位前端顯示「未知」。`in_library` 與 `folder_ids` 來自 FolderManga 的 `(user_id, manga_id)` 查詢 |
| `GET /api/mangas/lookup?source_id=&remote_id=` | 漫畫詳情（本地，從遠端搜尋進入） | 同上；資料庫沒有則 404 | 用遠端鍵查本地有沒有這部漫畫，前端以 404 判斷不在資料庫 |
| `GET /api/remote/mangas?source_id=&remote_id=` | 漫畫詳情（遠端） | 回應詳情欄位 | 經 plugin 向來源讀取，不寫入資料庫。來源無法存取回 502 |
| `GET /api/mangas/{mangaId}/chapters` | 章節列表 | 回應 `{chapters: [{id, remote_id, title, sort_order}], last_read_chapter_id, update_pending}` | 只讀資料庫；資料庫沒有章節則 `chapters` 為空 |
| `POST /api/mangas/sync-detail` | 同步詳情 | 請求 `{source_id, remote_id}`；回應 `{manga, persisted}` | 向 plugin 取詳情。寫入前先查 ref count，大於 0 才更新 Manga（含 `detail_synced_at`），`persisted: true`；否則只回傳，`persisted: false`。不碰章節 |
| `POST /api/mangas/sync-chapters` | 同步章節 | 請求 `{source_id, remote_id, limit?, cursor?}`；回應 `{chapters, next_cursor, persisted, update_pending}` | 向 plugin 取章節列表，`limit` / `cursor` 控制要求的顆粒度。ref count 大於 0 才寫入 Chapter。不載入圖片。若更新會改變使用者已讀章節（BE-12），不自動套用，`update_pending: true` |

**搜尋**

| 方法與路徑 | 對應元素 | 請求與回應 | 操作內容 |
| --- | --- | --- | --- |
| `GET /api/search/local?q=` | 搜尋輸入框、搜尋按鈕（本地） | 回應 `[{manga_id, source_id, remote_id, title, cover_url}]` | 在該使用者的書庫（預設資料夾）以標題比對。空關鍵字的行為待定 |
| `GET /api/search/remote?q=&sources=` | 搜尋輸入框、搜尋按鈕（plugin） | `sources` 為逗號分隔的 source\_id；回應 `{results: [{source_id, remote_id, title, cover_url, in_library}], failed_sources}` | 對勾選的 plugin 並行搜尋並合併。單一 plugin 失敗或逾時不影響其餘，列入 `failed_sources`；全部失敗回 502。不寫資料庫 |
| `GET /api/sources` | 搜尋的 plugin 勾選框 | 回應 `[{id, name}]` | 列出目前已註冊的 plugin |

**閱讀**

| 方法與路徑 | 對應元素 | 請求與回應 | 操作內容 |
| --- | --- | --- | --- |
| `GET /api/read/{source_id}/{remote_manga_id}/{remote_chapter_id}` | 漫畫圖片（載入章節）、點選章節 | 回應 `{page_count, pages: [url]}` | 確保這一章已在檔案系統：manifest 存在就直接回；否則請 plugin 抓取。寫入目標：ref count 大於 0 寫 `library`，否則寫該使用者的 `scratch`（保留最近 5 章）。同一章有請求進行中時等待而不重複下載。未加入也可讀 |
| `GET /api/images/{source_id}/{remote_manga_id}/{remote_chapter_id}/{page}` | 漫畫圖片（單張） | 回應圖片位元組 | 從檔案系統讀取。`scratch` 只給屬主本人。`Content-Type` 由 Backend 決定 |
| `PUT /api/mangas/{mangaId}/progress` | （記錄進度；UI 未標記，時機待定） | 請求 `{chapter_id}`；204 | 漫畫須已在書庫（否則 409）。建立或更新 ReadingHistory。未加入的漫畫前端不呼叫 |

**其他**

| 方法與路徑 | 對應元素 | 請求與回應 | 操作內容 |
| --- | --- | --- | --- |
| `GET /api/settings`、`PUT /api/settings` | （UI 尚無元素） | `{data}`（JSON） | 讀寫 UserSettings |
| `GET /api/covers/{source_id}/{remote_manga_id}` | 封面顯示 | 圖片位元組 | 經 Backend 從檔案系統服務（封面放置待定） |

當前沒有對應 API 的操作：

- 「下一章、上一章」不需要 API，前端用手上的章節列表算出目標章節，再呼叫「載入章節」。
- 排程更新是系統內部行為，不對外開 API。
- Backend Management 是 CLI，帳號建立、刪除、plugin 管理不在這裡。

待補（之前核對出但尚未決定）：登出元素、設定頁、閱讀紀錄寫入時機、BE-12 更新衝突的確認與儲存位置、修改密碼、封面放置、路徑編碼、登入狀態實作。

## 備忘

### Plugin System 已定方向

- Plugin System 是一個小型 Docker 網路：一個 backend container 加最多約 10 個 plugin container。
- 原因：每個 plugin 的撰寫語言可能不同，container 提供最佳隔離。
- plugin 啟動後向 backend 的固定位址註冊自己。V1 認證只檢查來源 IP（同一個內部 network）。
- 清理、暫停、重起透過 Docker 操作。Docker 為 rootless，backend 可較自由地操作；socket 權限是該使用者的，不是 host root，前面討論時說「等於 host root」不適用。
- 資源：runtime 佔用很小，10 個以內不是問題。
- 實作先從小範圍開始，不貪心。

### 暫不討論

- **休息機制**：plugin 長時間沒人呼叫時由內部邏輯自行停止。container stop 會釋放記憶體，比 process 自己閒置省資源。
  - restart policy 要改成 `no` 或 `on-failure`，否則 exit 後會被 Docker 立刻拉起。
  - 自行停止後需要有人負責冷啟動，也就是要依賴 Docker 控制權。
  - V1 先不做。
- **預先準備 package 與 runtime 再掛載**：可進一步省資源，但有限制、實作較複雜，先不做。同一個 base image 的 layer 本來就共用。

### 待確認

- Suwayomi api 要確認（是否採用、如何呼叫）；Suwayomi 套件邏輯：一個 Suwayomi container 內含多個 source，還是一個 source 一個 container。決定後要回頭更新第 1 點的圖與表。
- plugin 以名稱或 id 識別，不要把 IP 當身分，因為 container 重建後 IP 會變。
- 心跳或 health check：還沒討論，plugin 掉線後 registry 如何清理。

### 資料庫不存圖片

- 圖片本體放 File Storage，Database 不存圖片的任何 metadata（不存路徑、頁數、大小）。圖片存不存在、完不完整由檔案系統決定（章節目錄的 manifest 是完成標記），路徑由 Manga 與 Chapter 的欄位組出（見 3.2）。
- 原因：大 blob 會經過 buffer pool 與 WAL、拖慢備份；讀圖得經過 DB connection，檔案系統可直接 `sendfile`；快取淘汰用 `unlink` 即可，DB 需要 `DELETE` 加 vacuum。
- Side effect：因為資料庫不記圖片，沒有「兩邊要一起刪、對不上」的問題。只剩單向：資料庫記錄被刪（ref count 歸零）後，留下沒人引用的檔案，留給淘汰清理。
- File Storage 實際技術（本機磁碟或 S3 類）留到第 5 點技術鏈決定。

### plugin 直接寫檔

已同意的方向：

- 圖片由 plugin 直接寫入共享 volume，不經過 Backend 傳輸。目錄以「來源網站」為 key，plugin 可以換，檔案佈局不變。
- Database 只由 Backend 管，plugin 不碰。plugin 只回傳 JSON 和寫圖片。隔離靠「沒有掛載給 plugin」達成，只用一個 Docker network。Database 選型晚點再決定。
- 競爭問題的兩種解法互補：`rename()` 管可見性，檔案鎖或 Backend in-flight 去重管重複工作。

太早討論，待後續深挖：

- **章節是一組檔案**：單檔 `rename()` 原子，但一章多頁需要目錄層級的原子。強制刷新無法原子覆蓋非空目錄，可用版本目錄加 symlink 切換，或以 manifest 當完成標記（檔案存在不代表完整）。
- **重複工作**：同一章兩個請求同時觸發會下載兩次，打到來源網站（C-4）。
- **繞過 Backend 寫入後失去控制**：空間上限（C-6）放在 plugin 寫入時攔截不到，需要先檢查額度或用 quota；圖片驗證（magic bytes、Content-Type 由 Backend 決定）；檔名由規則決定。
- **crash 與 container 被停**：`.tmp-*` 孤兒清理；有進行中寫入時不能 stop，與休息機制相關。
- **實作細節**：`rename()` 不能跨 filesystem（EXDEV），暫存目錄要在同一個 mount；rootless Docker 的 bind mount uid 對應；fsync 持久性（快取可重建）。
- plugin 只掛自己的來源目錄（read-write），Backend 掛整個根目錄，需要 read-write（快取淘汰要 \`unlink\`）。
- 尚未確定：使用者直覺中還有沒考慮到的部分。

### Docker 網路與註冊端點

討論結果：

- 只用一個 Docker network，Backend 與 plugin 在內；Database 與 File Storage 在網路外，隔離靠「沒有掛載給 plugin」。兩個 network 會讓 Backend 有兩張網卡，複雜度不划算。
- 「檢查來源 IP」有陷阱：會改寫來源的不是 bridge（L2），而是 port publishing 這一層。外部流量經 `docker-proxy`（user space 轉發，對 Backend 是一條新連線）或 rootless 的 RootlessKit port driver 時，來源可能變成 bridge gateway，而 gateway 落在 plugin 網段內，外部請求會被誤判成 plugin。
- 解法：Backend 開第二個 listener（例如 3001）放 `/register`，不 publish 到 host，只有同 network 的 container 連得到；對外 API 留在 3000。隔離靠可達性，不靠程式碼分辨內外，來源 IP 檢查降為第二層。
- 後續選項：前面放 reverse proxy container，只有它 publish port，註冊路徑不轉發。Frontend 部署需要靜態檔 server 時再考慮。
- 待驗證：用 rootless Docker 實測 published port 時 Backend 看到的來源 IP（目前只是推論，未實測）。

### 爭奪問題（擔心的部分）

Backend 是 Node.js 單一 event loop，兩個 listener 共用同一個 thread，不會有 data race。真正的風險是跨 `await` 的邏輯競爭（check-then-act）。對應規則：

- 寫 registry 集中在少數函式，內部不含 `await`。
- 更新時整個 entry 換掉，讀的一方視為不可變。
- 讀的一方開始時取 snapshot，不依賴它在 `await` 後仍然有效。
- 呼叫 plugin 失敗視為正常的錯誤路徑（PL-07）。
- 若改成 cluster 或多 process，registry 不再共用，需要外部存放。

擔心的爭奪場景分三類：

- **兩個使用者**：同時要同一章、同時強制刷新、一人閱讀時另一人觸發更新檢查。漫畫資料與快取是全體共用的。
- **使用者和 plugin**：user 在 3000 讀 registry，plugin 在 3001 註冊、重起、移除；使用者讀圖時 plugin 正在寫同一章。
- **外部資料存取**：同時對來源網站發太多請求被封鎖（C-4）、手動檢查和排程檢查同時打同一部漫畫、外部資料回來時本地狀態已經變（例如漫畫已被移除）。

這三類目前只是整理問題，還沒決定解法。

### 資料分層與同步模型

- 資料流是 User ↔ Database ↔ Remote。Database 是 Remote 的快取層，類似記憶體分層，Remote 的成本比較高。
- 後端對單一漫畫的服務：取詳情（遠端、本地）、取章節（遠端、本地）。
- **同步是否寫入資料庫，看有沒有關聯（ref count）：有才寫入**；新增只發生在「加入」。所以不會有從未被加入的孤兒，ref count 從建立起就至少是 1。搜尋結果也不寫入。
- 同步分兩種：詳情同步（便宜）、章節同步（貴）。使用者視角先詳情後章節。
- 加入：建立關聯（漫畫不在資料庫時先建立漫畫記錄）。同步詳情、同步章節各自獨立；同步章節不載入圖片，點選章節時才載入圖片（overcommit）。
- 詳情頁 = 漫畫詳情 + 章節列表。章節列表有內容，表示資料庫有這個章節的內容。
- 三種使用者狀態：
  - 正常操作：本地詳情加本地章節，提供更新詳情、更新章節按鈕。
  - 本地搜尋：本地取漫畫列表，進入詳情頁。
  - 遠端（plugin）搜尋：遠端取漫畫列表，進入詳情頁時額外向遠端取詳情，再取本地詳情與本地章節。
- 前端取遠端要有顆粒度調整，例如不要一次要很多章節。
- 前端保留實作空間，例如未來的「一鍵同步」就是詳情加章節。
- 暫不決定（輔助功能，後續擴展成本低）：排程更新同步哪一種、最短間隔如何計時。
- 對應 `user_need.md`：FE-08、FE-18、BE-11、BE-13、C-7。
