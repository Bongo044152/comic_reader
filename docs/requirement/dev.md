# 開發文件 V1

Oct 3, 2026 · @Bongo

> 文件分成「主章節」與「附屬章節」：主章節（`N.`）介紹該章的範圍與總覽，附屬章節（`N.M`）逐項詳細描述。
>
> 第 3 章的詳細內容在 [frontend.md](frontend.md)，第 4 章在 [data.md](data.md)，第 5 章在 [api.md](api.md)。

## 1. V1 的支援程度

V1 要涵蓋哪些 User Need、由哪些功能提供、做到什麼程度。想了解前端的功能，讀 [frontend.md 的總覽](frontend.md#1-總覽) 就足夠，需要細節再看各功能卡。

以下內容主要描述 User Need 對應 V1 的參考資訊，方便核對用。

支援程度分三種：

| 程度 | 意義 |
| --- | --- |
| 完整 | 需求本身全部做到 |
| 簡化 | 只做其中一部分，「V1 做到哪」欄說明範圍 |
| 後續 | V1 不做 |

### 1.1 主流程

V1 的最小功能是一條主流程能跑通，各模塊只負責這條流程需要的部分：

1. 管理者發配帳號、安裝 plugin（Backend Management）。
2. 使用者登入（[F-01](frontend.md#f-01-登入登出)）。
3. 用 plugin 搜尋漫畫（[F-03](frontend.md#f-03-plugin-搜尋)）。
4. 加入書庫（[F-04](frontend.md#f-04-加入書庫)），整理到資料夾（[F-06](frontend.md#f-06-資料夾管理)、[F-08](frontend.md#f-08-加入移出資料夾)）。
5. 閱讀（[F-10](frontend.md#f-10-漫畫詳情)、[F-13](frontend.md#f-13-閱讀章節)、[F-14](frontend.md#f-14-切換章節)）。
6. 檢查更新（[F-11](frontend.md#f-11-同步詳情)、[F-12](frontend.md#f-12-同步章節)）。

### 1.2 User Need 對應功能

| User Need | 功能 | 支援程度 | V1 做到哪 |
| --- | --- | --- | --- |
| UN-1 選擇閱讀方式 | [F-13](frontend.md#f-13-閱讀章節) | 簡化 | 手動捲動與手動翻頁，可切換；自動閱讀不做 |
| UN-2 快捷鍵 | — | 後續 | — |
| UN-3 護眼模式 | — | 後續 | — |
| UN-4 記住讀到哪一話 | — | 後續 | — |
| UN-5 檢查更新 | [F-11](frontend.md#f-11-同步詳情)、[F-12](frontend.md#f-12-同步章節) | 簡化 | 手動檢查更新；排程更新不做 |
| UN-6 深色／淺色主題 | — | 後續 | — |
| UN-7 載入動畫 | 共通行為（[frontend.md](frontend.md#14-共通行為) 1.4） | 完整 | — |
| UN-8 錯誤提示 | 共通行為（[frontend.md](frontend.md#14-共通行為) 1.4、1.5） | 完整 | — |
| UN-9 404 頁面 | 共通行為（[frontend.md](frontend.md#14-共通行為) 1.4） | 完整 | — |

### 1.3 其他需求對應功能

不是 User Need，但來自 C（衝突）與 A（模糊地帶）的決定，同樣由前端功能提供：

| 需求 | 功能 | 支援程度 | V1 做到哪 |
| --- | --- | --- | --- |
| 多人帳號：管理者發配、使用者登入（A-1、A-13） | [F-01](frontend.md#f-01-登入登出) | 完整 | — |
| 搜尋與加入新漫畫：本地搜尋與 plugin 搜尋（A-6、A-12） | [F-02](frontend.md#f-02-本地搜尋)、[F-03](frontend.md#f-03-plugin-搜尋)、[F-04](frontend.md#f-04-加入書庫) | 完整 | — |
| 書庫與資料夾分類（A-5、C-1） | [F-05](frontend.md#f-05-書庫列表)、[F-06](frontend.md#f-06-資料夾管理)、[F-07](frontend.md#f-07-資料夾內文)、[F-08](frontend.md#f-08-加入移出資料夾) | 完整 | — |
| 移除漫畫（C-7） | [F-09](frontend.md#f-09-移除漫畫) | 完整 | — |
| 漫畫詳情與同步（A-7、C-4） | [F-10](frontend.md#f-10-漫畫詳情)、[F-11](frontend.md#f-11-同步詳情)、[F-12](frontend.md#f-12-同步章節) | 完整 | — |
| 圖片儲存與快取（A-8） | [F-13](frontend.md#f-13-閱讀章節) | 完整 | — |
| 手機版（A-11） | — | 後續 | — |

### 1.4 Plugin 與 Backend Management

兩者都不在前端功能裡，V1 的範圍如下。

| 項目 | V1 範圍 | 說明 |
| --- | --- | --- |
| Plugin | 搜尋、漫畫資訊、章節列表、章節圖片、錯誤回報 | 需求細節見 [user_need.md](user_need.md) 的 Plugin 表（PL-02 到 PL-05、PL-07）；相容 Suwayomi 套件為後續 |
| Backend Management | 建立與刪除帳號、plugin 管理 | 預期為 CLI，功能範圍待定（Q-V2） |

### 1.5 待定項目

| 編號 | 問題 | 影響 |
| --- | --- | --- |
| Q-V2 | Backend Management 的功能範圍（A-14 擱置） | 1.4 |

## 2. Top View

這一章說明系統由哪些模塊組成、模塊之間怎麼連線，以及全文共用的名詞與前提。

### 2.1 架構圖

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

- Frontend 只經由 Backend 取資料（REST API）；Backend Management 是 CLI，主要與 Backend 互動，功能待定（Q-V2）。
- Backend 與 plugin 在同一個 Docker network；plugin 啟動後向 Backend 註冊，Backend 以 HTTP 呼叫 plugin。
- 只有 Backend 存取 Database（選型待定，data.md 的 Q-D1）。
- Backend 只讀 File Storage；plugin 只直接讀寫自己來源的目錄，圖片不經過 Backend 傳輸。
- plugin 向 External Websites 發出請求。
- Suwayomi api 尚未確認，圖中的 Plugin A/B/C 先代表任意一個 plugin container。

### 2.2 模塊

| 模塊 | 角色 | V1 最小功能 | 不負責 |
| --- | --- | --- | --- |
| Frontend | 使用者介面與操作 | 登入、書庫、搜尋、資料夾、詳情、手動同步、閱讀；載入動畫、錯誤提示 | 業務邏輯、直接存取 Database 或 plugin |
| Backend Management | 管理者的入口，預期為 CLI | 建立與刪除帳號、plugin 管理、修改設定檔；範圍待定（Q-V2） | 待定 |
| Backend | 唯一的業務邏輯層，統一對外 API | 帳號驗證與權限、書庫與資料夾、本地搜尋與 plugin 搜尋、手動同步與衝突偵測、圖片快取、plugin 註冊與生命週期管理、錯誤 log | 渲染畫面、爬取來源網站 |
| Database | 結構化資料 | User、Folder、FolderManga、Manga、Chapter | 圖片檔案 |
| File Storage | 章節圖片與快取，以漫畫 id 共用 | plugin 直接寫入各自的來源目錄、Backend 讀取並服務圖片 | 圖片以外的資料 |
| Plugin System | 每個 plugin 一個 Docker container，與來源網站溝通，啟動後向 Backend 註冊 | 搜尋、漫畫資訊、章節列表、章節圖片（直接寫檔）、註冊（V1 只檢查來源 IP）、可辨識的錯誤回報 | 存取 Database、使用者資料 |
| External Websites | 漫畫來源 | — | — |

### 2.3 名詞

| 名詞 | 意思 |
| --- | --- |
| 書庫 | 每位使用者的預設資料夾，不可刪除、不可重新命名；詳見 [data.md](data.md) 的 Folder |
| 資料夾 | 使用者自訂的分類，只存漫畫的成員關係，不存漫畫本身 |
| 來源 | 漫畫所在的網站，每個來源對應一個 plugin，以 `source_id` 識別 |
| 漫畫 id | 來源加上漫畫在該來源上的 ID（`source_id` 與 `remote_id`），同名漫畫不同來源視為不同條目 |
| 加入 | 把漫畫放進自己的書庫 |
| 同步 | 向來源網站取得最新的資料，分成詳情同步與章節同步，見 3.1 |
| ref count | 有多少位使用者把這部漫畫放在書庫，歸零才回收共用的漫畫資料 |
| library、scratch | 章節圖片的兩個目錄：已加入的漫畫放 `library`，全體共用；未加入的放 `scratch`，使用者私有 |

### 2.4 設計規模

使用者約 10 位，家用或小團體；plugin 約 10 個。各項上限（章節圖片的空間、同步的最短間隔）寫在設定檔，可以透過 Backend Management 修改，也可以直接編輯。規模超過約 10 倍時，要重新評估資料庫選型與列表是否分頁，細節見 [data.md](data.md) 1.4。

## 3. 前端 / 功能 / 使用者流程

前端只經由 Backend 的 REST API 取得資料，負責呈現、導覽與基本的輸入檢查；業務邏輯在後端。

使用者流程、頁面之間怎麼跳轉、每個頁面有哪些功能，都可以到 [frontend.md](frontend.md) 看：

- 使用者流程與頁面導覽：1.2（主流程見本文件 1.1）
- 功能清單 F-01 到 F-14：1.3
- 共通行為與錯誤分類：1.4、1.5
- 各功能的功能卡（包含每個功能的動作步驟）：第 2 到 6 章

### 3.1 同步模型

- 資料流是 User ↔ Database ↔ Remote。Database 是 Remote 的快取層，Remote 的成本比較高。
- 後端對單一漫畫提供四種資料：詳情（遠端、本地）、章節（遠端、本地）。
- 同步是否寫入資料庫，看有沒有關聯（ref count），有才寫入。新增只發生在「加入」，所以不會有從未被加入的孤兒，ref count 從建立起至少是 1。搜尋結果也不寫入。
- 同步分兩種：詳情同步（便宜）與章節同步（貴）。使用者視角是先詳情後章節，兩者各自獨立。
- 同步章節不載入圖片，圖片在點選章節閱讀時才載入。
- 詳情頁等於漫畫詳情加章節列表；章節列表有內容，表示資料庫有這個章節的內容。
- 使用者進入詳情頁有三種狀態：
  - 正常操作：本地詳情加本地章節，提供同步詳情、同步章節按鈕。
  - 本地搜尋：從本地取漫畫列表，進入詳情頁。
  - 遠端（plugin）搜尋：從遠端取漫畫列表，進入詳情頁時額外向遠端取詳情，再取本地詳情與本地章節。
- 前端取遠端資料要有顆粒度，例如不要一次要很多章節。
- 前端保留實作空間，例如未來的「一鍵同步」就是詳情加章節。
- 對應功能：[F-04](frontend.md#f-04-加入書庫)、[F-09](frontend.md#f-09-移除漫畫)、[F-10](frontend.md#f-10-漫畫詳情)、[F-11](frontend.md#f-11-同步詳情)、[F-12](frontend.md#f-12-同步章節)。

## 4. 資料庫、資料

資料依特性分兩種方式管理，metadata 放資料庫，圖片等二進位資料放檔案系統。資料庫裡的資料再分成使用者相關（User、Folder、FolderManga）與漫畫資料（共用，Manga、Chapter）兩類。登入狀態與 Plugin registry 是運行時狀態，不長期保存。

詳細內容在 [data.md](data.md)：

- 總覽與資料清單（1）
- 使用者相關資料（2）
- 漫畫資料（3）
- 章節圖片（4）
- 運行時狀態（5）

### 4.1 資料庫選型與共通規則

資料庫選型尚未決定，見 [data.md](data.md) 的 Q-D1。共通的設計（surrogate id、連帶刪除的規則等）已寫在 data.md 各資料卡。

## 5. 後端 API

這一章只定義 Frontend 與 Backend 之間的 API，共 21 支，涵蓋前端功能 F-01 到 F-14；Backend 與 plugin 之間的 API 晚一點再寫。

詳細內容在 [api.md](api.md)：

- 通用約定與錯誤（1.2、1.3）
- API 清單（1.4）
- 各 API 的 API 卡（第 2 到 6 章）

## 6. 備忘

### 6.1 待決定清單

各章的待定項目分別記在各自的文件：

| 範圍 | 位置 |
| --- | --- |
| 支援程度（Q-V） | 本文件 1.5 |
| 前端功能（Q-F） | [frontend.md](frontend.md) 第 7 章 |
| 資料（Q-D） | [data.md](data.md) 第 6 章 |
| API（Q-A） | [api.md](api.md) 第 7 章 |

### 6.2 Plugin System 已定方向

- Plugin System 是一個小型 Docker 網路：一個 backend container 加最多約 10 個 plugin container。
- 原因：每個 plugin 的撰寫語言可能不同，container 提供最佳隔離。
- plugin 啟動後向 backend 的固定位址註冊自己。V1 認證只檢查來源 IP（同一個內部 network）。
- 清理、暫停、重起透過 Docker 操作。Docker 為 rootless，backend 可較自由地操作；socket 權限是該使用者的，不是 host root，前面討論時說「等於 host root」不適用。
- 資源：runtime 佔用很小，10 個以內不是問題。
- 實作先從小範圍開始，不貪心。

### 6.3 暫不討論

- **休息機制**：plugin 長時間沒人呼叫時由內部邏輯自行停止。container stop 會釋放記憶體，比 process 自己閒置省資源。
  - restart policy 要改成 `no` 或 `on-failure`，否則 exit 後會被 Docker 立刻拉起。
  - 自行停止後需要有人負責冷啟動，也就是要依賴 Docker 控制權。
  - V1 先不做。
- **預先準備 package 與 runtime 再掛載**：可進一步省資源，但有限制、實作較複雜，先不做。同一個 base image 的 layer 本來就共用。

### 6.4 待確認

- Suwayomi api 要確認（是否採用、如何呼叫）；Suwayomi 套件邏輯：一個 Suwayomi container 內含多個 source，還是一個 source 一個 container。決定後要回頭更新 2.1 與 2.2。
- plugin 以名稱或 id 識別，不要把 IP 當身分，因為 container 重建後 IP 會變。
- 心跳或 health check：還沒討論，plugin 掉線後 registry 如何清理。

### 6.5 plugin 直接寫檔

已同意的方向：

- 圖片由 plugin 直接寫入共享 volume，不經過 Backend 傳輸。目錄以「來源網站」為 key，plugin 可以換，檔案佈局不變。
- Database 只由 Backend 管，plugin 不碰。plugin 只回傳 JSON 和寫圖片。隔離靠「沒有掛載給 plugin」達成，只用一個 Docker network。
- 競爭問題的兩種解法互補：`rename()` 管可見性，檔案鎖或 Backend in-flight 去重管重複工作。
- `scratch` 的「最近 5 章」以讀取時 `touch` 記錄的時間判斷，不依賴 `atime`；總量是使用者數乘以 5 章，有界，不需要另外的淘汰規則。

可選的最佳化（改 plugin 的邏輯即可）：

- 共用 `scratch`：寫入前先查其他使用者是否已有這一章，有就用硬連結（`link(2)`，`i_nlink` 加 1，不複製資料）。前提：同一個 mount（跨 mount 會 `EXDEV`）、只能連結檔案不能連結目錄、檔案不原地修改。
- 加入書庫時，把已在 `scratch` 的章節用 `rename()` 或硬連結移到 `library`，省一次重抓。

太早討論，待後續深挖：

- **章節是一組檔案**：單檔 `rename()` 原子，但一章多頁需要目錄層級的原子。強制刷新無法原子覆蓋非空目錄，可用版本目錄加 symlink 切換，或以 manifest 當完成標記（檔案存在不代表完整）。
- **重複工作**：同一章兩個請求同時觸發會下載兩次，打到來源網站（C-4）。
- **繞過 Backend 寫入後失去控制**：空間上限（C-6）放在 plugin 寫入時攔截不到，需要先檢查額度或用 quota；圖片驗證（magic bytes、Content-Type 由 Backend 決定）；檔名由規則決定。
- **crash 與 container 被停**：`.tmp-*` 孤兒清理；有進行中寫入時不能 stop，與休息機制相關。
- **實作細節**：`rename()` 不能跨 filesystem（EXDEV），暫存目錄要在同一個 mount；rootless Docker 的 bind mount uid 對應；fsync 持久性（快取可重建）。
- plugin 只掛自己的來源目錄（read-write），Backend 掛整個根目錄，需要 read-write（快取淘汰要 `unlink`）。
- 尚未確定：使用者直覺中還有沒考慮到的部分。

### 6.6 Docker 網路與註冊端點

- 只用一個 Docker network，Backend 與 plugin 在內；Database 與 File Storage 在網路外，隔離靠「沒有掛載給 plugin」。兩個 network 會讓 Backend 有兩張網卡，複雜度不划算。
- 「檢查來源 IP」有陷阱：會改寫來源的不是 bridge（L2），而是 port publishing 這一層。外部流量經 `docker-proxy`（user space 轉發，對 Backend 是一條新連線）或 rootless 的 RootlessKit port driver 時，來源可能變成 bridge gateway，而 gateway 落在 plugin 網段內，外部請求會被誤判成 plugin。
- 解法：Backend 開第二個 listener（例如 3001）放 `/register`，不 publish 到 host，只有同 network 的 container 連得到；對外 API 留在 3000。隔離靠可達性，不靠程式碼分辨內外，來源 IP 檢查降為第二層。
- 後續選項：前面放 reverse proxy container，只有它 publish port，註冊路徑不轉發。Frontend 部署需要靜態檔 server 時再考慮。
- 待驗證：用 rootless Docker 實測 published port 時 Backend 看到的來源 IP（目前只是推論，未實測）。

### 6.7 爭奪問題

Backend 是 Node.js 單一 event loop，兩個 listener 共用同一個 thread，不會有 data race。真正的風險是跨 `await` 的邏輯競爭（check-then-act）。對應規則：

- 寫 registry 集中在少數函式，內部不含 `await`。
- 更新時整個 entry 換掉，讀的一方視為不可變。
- 讀的一方開始時取 snapshot，不依賴它在 `await` 後仍然有效。
- 呼叫 plugin 失敗視為正常的錯誤路徑。
- 若改成 cluster 或多 process，registry 不再共用，需要外部存放。

擔心的爭奪場景分三類：

- **兩個使用者**：同時要同一章、同時強制刷新、一人閱讀時另一人觸發同步、同時加入與移除同一部漫畫（ref count 歸零時的 check-then-act）。漫畫資料與快取是全體共用的。
- **使用者和 plugin**：user 在 3000 讀 registry，plugin 在 3001 註冊、重起、移除；使用者讀圖時 plugin 正在寫同一章。
- **外部資料存取**：同時對來源網站發太多請求被封鎖（C-4）、同一部漫畫被同時同步、外部資料回來時本地狀態已經變（例如漫畫已被移除）。

這三類目前只是整理問題，還沒決定解法。
