# JSON Toolbox

> デスクトップアプリ風の完全クライアントサイド JSON ツールボックス。12 のツール、5 言語対応、データは一切アップロードされません。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**[ライブデモ →](https://json.shigc.top/)**

<p align="center">
  <img src="./docs/screenshot.png" alt="JSON Toolbox ホーム画面" width="900">
</p>

<p align="center">
  <img src="./docs/screenshot-format.png" alt="JSON フォーマットツール（左に入力、右に結果）" width="900">
</p>

## なぜもう一つ JSON ツールが必要なのか

多くのオンライン JSON ツールは、テキストエリアとボタンが 1 つずつあるだけです。
JSON Toolbox はデスクトップアプリの操作感——メニューバー、タブ式ワークスペース、
ステータスバー、キーボードショートカット——を取り入れ、処理のすべてをブラウザ内
で完結させます。データが端末の外に出ることはなく、単一ファイルとしてビルドすれば
完全にオフラインでも動作します。

## 特徴

- **デスクトップアプリ風のワークスペース** — メニューバー、複数タブ、ステータスバー、ドラッグでサイズ変更できるペイン
- **12 のツール** — 整形、閲覧、変換、フォーマット間の相互変換
- **100% ローカル処理** — バックエンドなし、解析なし、実行時の通信なし
- **オフライン単一ファイル** — `dist-single/index.html` をダブルクリックするだけで動作
- **5 言語の UI** — English、简体中文、繁體中文、日本語、한국어
- **ライト / ダーク / システム連動テーマ**
- **キーボードショートカット** と「ツール」メニュー
- 全体を **TypeScript** で記述し、ビルドのたびに厳格な型チェックを実行

## ツール一覧

| ツール | 説明 |
| --- | --- |
| JSON フォーマット | 整形・圧縮・検証、行/列単位のエラー表示 |
| JSON ツリー表示 | 折りたたみ表示、パスと値のコピー |
| JSON 比較 | 構造的な diff、追加・削除・変更を強調 |
| JSONPath クエリ | パスクエリとフィルタ式 |
| JSON フラット化 | ネスト構造とフラットなキー・バリューを相互変換 |
| JSON ソート | キーソート、再帰ソート、空値の削除 |
| スキーマ生成 | JSON Schema と TypeScript インターフェースを生成 |
| モックデータ | テンプレートからランダムなテストデータを生成 |
| フォーマット変換 | JSON ⇄ CSV / XML / YAML / TOML / INI |
| Excel 変換 | JSON ⇄ Excel（`.xlsx`）のインポート・エクスポート |
| エスケープ / アンエスケープ | JSON エスケープと GET クエリ文字列を相互変換 |
| エンコード / デコード | Base64 / Unicode / URL のエンコード・デコード |

## 技術スタック

- [Vue 3](https://vuejs.org/) + TypeScript + [Vite 7](https://vite.dev/)
- 状態管理に [Pinia](https://pinia.vuejs.org/)、ルーティングに [Vue Router](https://router.vuejs.org/)（hash モード）
- エディタに [CodeMirror 6](https://codemirror.net/)
- 多言語対応に [vue-i18n](https://vue-i18n.intlify.dev/)
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch)、[jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath)、[yaml](https://eemeli.org/yaml/)、[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)、[smol-toml](https://github.com/squirrelchat/smol-toml)、[papaparse](https://www.papaparse.com/)、[SheetJS](https://sheetjs.com/)、[Faker](https://fakerjs.dev/)

## はじめに

### 動作環境

- Node.js **20.19+**（または 22.12+）
- npm 10+

### インストールと起動

```bash
git clone https://github.com/shigc/json-toolbox.git
cd json-toolbox
npm install
npm run dev
```

開発サーバーがローカル URL（通常は `http://localhost:5173`）を表示します。

> `xlsx` は `https://cdn.sheetjs.com/...tgz` からインストールされます。SheetJS は
> npm での新しいリリースを行っていないためです。そのため `npm install` には
> npm レジストリに加えて `cdn.sheetjs.com` への接続が必要です。

### スクリプト

| スクリプト | 内容 |
| --- | --- |
| `npm run dev` | Vite 開発サーバーを起動 |
| `npm run build` | 型チェック後に未圧縮の成果物を `dist/` へビルド |
| `npm run build:single` | 単一ファイル `dist-single/index.html` をビルド |
| `npm run build:release` | 圧縮 + 難読化した公開用成果物を `dist-release/` へビルド |
| `npm run preview` | `dist/` の成果物をプレビュー |
| `npm run preview:release` | `dist-release/` の成果物をプレビュー |
| `npm run typecheck` | `vue-tsc --noEmit` を実行 |
| `npm run deploy` | Wrangler 経由で Cloudflare Pages へデプロイ |

`SKIP_OBF=1 npm run build:release` を指定すると、圧縮のみで難読化を省略でき、
公開用成果物の調査が容易になります。

### ビルド成果物

| ディレクトリ | 用途 |
| --- | --- |
| `dist/` | 通常の静的サイト用成果物 |
| `dist-single/` | すべてをインライン化した単一 HTML（`file://` で開けます） |
| `dist-release/` | 圧縮・難読化した公開用成果物 |

## ディレクトリ構成

```
src/
├─ components/     レイアウト、エディタ、共通 UI コンポーネント
├─ composables/    再利用可能なコンポジション関数
├─ directives/     カスタム Vue ディレクティブ
├─ locales/        zh-CN、zh-TW、en、ja、ko のメッセージカタログ
├─ router/         ツール登録情報から生成される hash モードのルート
├─ stores/         Pinia ストア（設定、ワークスペース、ステータス）
├─ styles/         グローバルスタイルと CSS 変数
├─ tools/          ツール登録情報と型定義
├─ utils/          純粋関数（json、diff、schema、mock、convert/*、encode）
└─ views/          ツールごとのビューコンポーネント
```

メニューバー、タブバー、ルート、ホームのカードはすべて
`src/tools/registry.ts` から生成されるため、ツールを追加してもルーターを
変更する必要はありません。

## ツールの追加

1. `src/tools/registry.ts` の `TOOLS` に項目を追加（id、カテゴリ、アイコン、受け付ける入力）。
2. `src/views/` に対応するビューコンポーネントを作成。
3. `src/locales/` の**5 つすべて**の言語ファイルに `tool.<id>.title` と `tool.<id>.desc` を追加。
4. `npm run typecheck` を実行。`en.ts`、`ja.ts`、`ko.ts`、`zh-TW.ts` は
   `zh-CN.ts` のキー構造と照合されるため、キーが不足するとビルドが失敗します。

## プライバシー

バックエンドはありません。解析、変換、生成はすべてブラウザ内で完結し、データが
端末の外に出ることはありません。テーマ、言語、レイアウトなどの設定は
`localStorage` にのみ保存されます。

## デプロイ

### GitHub Pages

`.github/workflows/deploy.yml` が `main` へのプッシュごとに `dist/` をビルドし、
GitHub Pages へ公開します。初回は **Settings → Pages → Source** で
**GitHub Actions** を選択してください。

ルーターは hash モードで `base` は `./` のため、
`https://<user>.github.io/json-toolbox/` のようなサブパスでも動作します。

### Cloudflare Pages

```bash
npm run deploy
```

`deploy` スクリプトは既定で `json-toolbox` という Cloudflare Pages プロジェクトへ
デプロイします。フォークした場合は `package.json` の `--project-name` を変更するか、
Wrangler を直接実行してください。初回は `npx wrangler login` でのログインが必要です。

公式デモは <https://json.shigc.top/> で公開しています。

## コントリビュート

Issue と PR を歓迎します。作業前に [CONTRIBUTING.md](./CONTRIBUTING.md) を
お読みください。セキュリティ上の問題は [SECURITY.md](./SECURITY.md) の手順で
非公開で報告し、公開 Issue は作成しないでください。

## ライセンス

[MIT](./LICENSE) © 2026 JSON Toolbox contributors

サードパーティの依存パッケージはそれぞれのライセンスに従います。詳細は各パッケージの
メタデータを参照してください。
