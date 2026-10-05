# Contributing

## 分支

- `main` 永遠可跑，只透過 PR 合併，不直接 push
- 功能分支命名：`feat/xxx`、`fix/xxx`、`docs/xxx`、`chore/xxx`
- 合併用 squash，一個 PR 一個 commit

## Commit

使用 Conventional Commits：

```text
feat: 新增書庫加入 API
fix: 修正資料夾重名檢查
docs: 補充檔案存放規則
chore: 更新 CI 設定
```
- 參考：https://ithelp.ithome.com.tw/articles/10228738

## Issue 建議

- 標題以需求編號開頭，例如 `[BE-11] 同步與更新檢查`，編號對應 [user_need.md](/docs/requirement/user_need.md)
- PR 描述寫 `Closes #編號`，合併時自動關閉 Issue
- 進度用 GitHub Projects 看板：Todo / In Progress / Review / Done

## Pull Request

- 由另一人 review，至少 1 個 approval
- 內容依 [PR 模板](/.github/pull_request_template.md) 填寫
