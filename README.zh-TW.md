# JSON Toolbox

> 桌面軟體風格的純前端 JSON 工具箱。12 個工具、5 種語言、資料不外傳。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**[線上 Demo →](https://json.shigc.top/)**

<p align="center">
  <img src="./docs/screenshot.png" alt="JSON Toolbox 首頁" width="900">
</p>

<p align="center">
  <img src="./docs/screenshot-format.png" alt="JSON 格式化工具，左側輸入、右側結果" width="900">
</p>

## 為什麼還需要一個 JSON 工具？

大多數線上 JSON 工具只有一個輸入框和一個按鈕。JSON Toolbox 改用桌面軟體的
操作方式——選單列、多標籤工作區、狀態列、快速鍵——並把所有處理都留在瀏覽器
中完成。沒有任何資料離開裝置，建置成單一檔案後甚至可以完全離線使用。

## 功能特性

- **桌面軟體式工作區**：選單列、多標籤編輯、狀態列、可拖曳分割窗格
- **12 個工具**，涵蓋格式化、檢視、轉換與格式互轉
- **100% 本機處理**：無後端、無統計、執行時不發送網路請求
- **離線單一檔案**：`dist-single/index.html` 雙擊即可執行，不需要伺服器
- **5 種介面語言**：English、简体中文、繁體中文、日本語、한국어
- **明暗主題**：亮色 / 暗色 / 跟隨系統
- **快速鍵** 與「工具」選單
- 全程 **TypeScript**，每次建置都做嚴格型別檢查

## 工具列表

| 工具 | 說明 |
| --- | --- |
| JSON 格式化 | 美化、壓縮、驗證，並定位到行/欄錯誤 |
| JSON 樹狀檢視 | 摺疊瀏覽，複製路徑與值 |
| JSON 比對 | 結構化 diff，標記新增、刪除與修改 |
| JSONPath 查詢 | 路徑查詢與過濾表達式 |
| JSON 扁平化 | 巢狀結構與扁平鍵值對互轉 |
| JSON 排序 | 鍵排序、遞迴排序、移除空值 |
| Schema 產生 | 產生 JSON Schema 與 TypeScript 介面 |
| Mock 資料 | 依範本產生隨機測試資料 |
| 格式轉換 | JSON ⇄ CSV / XML / YAML / TOML / INI |
| Excel 轉換 | JSON ⇄ Excel（`.xlsx`）匯入匯出 |
| 跳脫 / 反跳脫 | JSON 跳脫與 GET 查詢字串互轉 |
| 編碼 / 解碼 | Base64 / Unicode / URL 編解碼 |

## 技術棧

- [Vue 3](https://vuejs.org/) + TypeScript + [Vite 7](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) 管理狀態，[Vue Router](https://router.vuejs.org/) 使用 hash 模式
- [CodeMirror 6](https://codemirror.net/) 作為編輯器
- [vue-i18n](https://vue-i18n.intlify.dev/) 處理多語系
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch)、[jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath)、[yaml](https://eemeli.org/yaml/)、[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)、[smol-toml](https://github.com/squirrelchat/smol-toml)、[papaparse](https://www.papaparse.com/)、[SheetJS](https://sheetjs.com/)、[Faker](https://fakerjs.dev/)

## 快速開始

### 環境需求

- Node.js **20.19+**（或 22.12+）
- npm 10+

### 安裝並啟動

```bash
git clone https://github.com/shigc/json-toolbox.git
cd json-toolbox
npm install
npm run dev
```

開發伺服器會印出本機位址（通常是 `http://localhost:5173`）。

> `xlsx` 從 `https://cdn.sheetjs.com/...tgz` 安裝，因為 SheetJS 已不再向 npm
> 發布新版本。因此 `npm install` 除了 npm registry 外，還需要能連線到
> `cdn.sheetjs.com`。

### 指令

| 指令 | 作用 |
| --- | --- |
| `npm run dev` | 啟動 Vite 開發伺服器 |
| `npm run build` | 型別檢查並建置未壓縮產物到 `dist/` |
| `npm run build:single` | 建置單一檔案 `dist-single/index.html` |
| `npm run build:release` | 建置壓縮 + 混淆的發布產物到 `dist-release/` |
| `npm run preview` | 預覽 `dist/` 產物 |
| `npm run preview:release` | 預覽 `dist-release/` 產物 |
| `npm run typecheck` | 執行 `vue-tsc --noEmit` |
| `npm run deploy` | 透過 Wrangler 建置並部署到 Cloudflare Pages |

執行 `SKIP_OBF=1 npm run build:release` 可以只壓縮不混淆，便於排查發布產物。

### 建置產物

| 目錄 | 用途 |
| --- | --- |
| `dist/` | 一般靜態網站產物 |
| `dist-single/` | 全部內嵌的單一 HTML，可透過 `file://` 開啟 |
| `dist-release/` | 壓縮混淆後的公開發布產物 |

## 目錄結構

```
src/
├─ components/     版面、編輯器與通用 UI 元件
├─ composables/    可重用的組合式函式
├─ directives/     自訂 Vue 指令
├─ locales/        zh-CN、zh-TW、en、ja、ko 語言包
├─ router/         由工具登錄表產生的 hash 模式路由
├─ stores/         Pinia 狀態（偏好、工作區、狀態列）
├─ styles/         全域樣式與 CSS 變數
├─ tools/          工具登錄表與型別
├─ utils/          純函式（json、diff、schema、mock、convert/*、encode）
└─ views/          每個工具一個檢視元件
```

選單列、標籤列、路由與首頁卡片都由 `src/tools/registry.ts` 驅動，新增工具
不需要修改路由。

## 新增工具

1. 在 `src/tools/registry.ts` 的 `TOOLS` 中追加一項（id、分類、圖示、接受的輸入型別）。
2. 在 `src/views/` 下建立對應的檢視元件。
3. 在 `src/locales/` 的**全部五個**語言包補上 `tool.<id>.title` 與 `tool.<id>.desc`。
4. 執行 `npm run typecheck`。`en.ts`、`ja.ts`、`ko.ts`、`zh-TW.ts` 都會與
   `zh-CN.ts` 的鍵結構比對，缺少鍵會直接導致建置失敗。

## 隱私

專案沒有後端。所有解析、轉換與產生都在瀏覽器中完成，資料不會離開裝置。
主題、語言、版面等偏好只儲存在 `localStorage` 中。

## 部署

### GitHub Pages

`.github/workflows/deploy.yml` 會在每次推送到 `main` 時建置 `dist/` 並發布到
GitHub Pages。首次使用需在 **Settings → Pages → Source** 選擇
**GitHub Actions**。

路由使用 hash 模式，`base` 為 `./`，因此部署在
`https://<user>.github.io/json-toolbox/` 這類子路徑下也能正常運作。

### Cloudflare Pages

```bash
npm run deploy
```

`deploy` 指令預設部署到名為 `json-toolbox` 的 Cloudflare Pages 專案。如果你
fork 了本專案，請修改 `package.json` 裡的 `--project-name`，或直接呼叫 Wrangler。
首次部署前需要執行 `npx wrangler login` 登入。

官方 Demo 位於 <https://json.shigc.top/>。

## 貢獻

歡迎提交 Issue 與 PR。動手前請先閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md)。
如果是安全性漏洞，請依 [SECURITY.md](./SECURITY.md) 的方式私下回報，不要開
公開 Issue。

## 授權

[MIT](./LICENSE) © 2026 JSON Toolbox contributors

第三方相依套件各自遵循其原有授權，詳見各套件的詮釋資料。
