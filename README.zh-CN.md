# JSON Toolbox

> 桌面软件风格的纯前端 JSON 工具箱。12 个工具、5 种语言、数据不出本机。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**[在线 Demo →](https://json.shigc.top/)**

<p align="center">
  <img src="./docs/screenshot.png" alt="JSON Toolbox 首页" width="900">
</p>

## 为什么还要再做一个 JSON 工具？

大多数在线 JSON 工具只是一个输入框加一个按钮。JSON Toolbox 借用桌面软件的
交互方式——菜单栏、多标签工作区、状态栏、快捷键——同时把所有处理都放在浏览器
里完成。没有任何数据离开设备，构建成单文件后甚至可以完全离线使用。

<p align="center">
  <img src="./docs/screenshot-format.png" alt="JSON 格式化工具，左侧输入、右侧结果" width="900">
</p>

## 特性

- **桌面软件式工作区**：菜单栏、多标签编辑、状态栏、可拖拽分栏
- **12 个工具**，覆盖格式化、查看、转换与格式互转
- **100% 本地处理**：无后端、无统计、运行时不发起网络请求
- **离线单文件**：`dist-single/index.html` 双击即可运行，不需要服务器
- **5 种界面语言**：English、简体中文、繁體中文、日本語、한국어
- **明暗主题**：亮色 / 暗色 / 跟随系统
- **快捷键** 与「工具」菜单
- 全程 **TypeScript**，每次构建都做严格类型检查

## 工具列表

| 工具 | 说明 |
| --- | --- |
| JSON 格式化 | 美化、压缩、校验，并定位到行/列错误 |
| JSON 树形查看 | 折叠浏览，复制路径与值 |
| JSON 对比 | 结构化 diff，标记新增、删除与修改 |
| JSONPath 查询 | 路径查询与过滤表达式 |
| JSON 扁平化 | 嵌套结构与扁平键值对互转 |
| JSON 排序 | 键排序、递归排序、去除空值 |
| Schema 生成 | 生成 JSON Schema 与 TypeScript 接口 |
| Mock 数据 | 按模板生成随机测试数据 |
| 格式转换 | JSON ⇄ CSV / XML / YAML / TOML / INI |
| Excel 转换 | JSON ⇄ Excel（`.xlsx`）导入导出 |
| 转义 / 反转义 | JSON 转义与 GET 查询串互转 |
| 编码 / 解码 | Base64 / Unicode / URL 编解码 |

## 技术栈

- [Vue 3](https://vuejs.org/) + TypeScript + [Vite 7](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) 管理状态，[Vue Router](https://router.vuejs.org/) 使用 hash 模式
- [CodeMirror 6](https://codemirror.net/) 作为编辑器
- [vue-i18n](https://vue-i18n.intlify.dev/) 做国际化
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch)、[jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath)、[yaml](https://eemeli.org/yaml/)、[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)、[smol-toml](https://github.com/squirrelchat/smol-toml)、[papaparse](https://www.papaparse.com/)、[SheetJS](https://sheetjs.com/)、[Faker](https://fakerjs.dev/)

## 快速开始

### 环境要求

- Node.js **20.19+**（或 22.12+）
- npm 10+

### 安装并启动

```bash
git clone https://github.com/shigc/json-toolbox.git
cd json-toolbox
npm install
npm run dev
```

开发服务器会打印本地地址（通常是 `http://localhost:5173`）。

> `xlsx` 从 `https://cdn.sheetjs.com/...tgz` 安装，因为 SheetJS 已不再向 npm
> 发布新版本。因此 `npm install` 除了 npm registry 外，还需要能访问
> `cdn.sheetjs.com`。

### 脚本

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 类型检查并构建未压缩产物到 `dist/` |
| `npm run build:single` | 构建单文件 `dist-single/index.html` |
| `npm run build:release` | 构建压缩 + 混淆的发布产物到 `dist-release/` |
| `npm run preview` | 预览 `dist/` 产物 |
| `npm run preview:release` | 预览 `dist-release/` 产物 |
| `npm run typecheck` | 执行 `vue-tsc --noEmit` |
| `npm run deploy` | 通过 Wrangler 构建并部署到 Cloudflare Pages |

执行 `SKIP_OBF=1 npm run build:release` 可以只压缩不混淆，便于排查发布产物。

### 构建产物

| 目录 | 用途 |
| --- | --- |
| `dist/` | 常规静态站点产物 |
| `dist-single/` | 全部内联的单个 HTML，可通过 `file://` 打开 |
| `dist-release/` | 压缩混淆后的公开发布产物 |

## 目录结构

```
src/
├─ components/     布局、编辑器与通用 UI 组件
├─ composables/    可复用的组合式函数
├─ directives/     自定义 Vue 指令
├─ locales/        zh-CN、zh-TW、en、ja、ko 语言包
├─ router/         由工具注册表生成的 hash 模式路由
├─ stores/         Pinia 状态（偏好、工作区、状态栏）
├─ styles/         全局样式与 CSS 变量
├─ tools/          工具注册表与类型
├─ utils/          纯函数（json、diff、schema、mock、convert/*、encode）
└─ views/          每个工具一个视图组件
```

菜单栏、标签栏、路由和首页卡片都由 `src/tools/registry.ts` 驱动，新增工具
不需要改动路由。

## 新增一个工具

1. 在 `src/tools/registry.ts` 的 `TOOLS` 中追加一项（id、分类、图标、接受的输入类型）。
2. 在 `src/views/` 下创建对应的视图组件。
3. 在 `src/locales/` 的**全部五个**语言包里补充 `tool.<id>.title` 和 `tool.<id>.desc`。
4. 运行 `npm run typecheck`。`en.ts`、`ja.ts`、`ko.ts`、`zh-TW.ts` 都会与
   `zh-CN.ts` 的键结构做比对，缺键会直接导致构建失败。

## 隐私

项目没有后端。所有解析、转换与生成都在浏览器中完成，数据不会离开设备。
主题、语言、布局等偏好只保存在 `localStorage` 中。

## 部署

### GitHub Pages

`.github/workflows/deploy.yml` 会在每次推送到 `main` 时构建 `dist/` 并发布到
GitHub Pages。首次使用需在 **Settings → Pages → Source** 中选择
**GitHub Actions**。

路由使用 hash 模式，`base` 为 `./`，因此部署在
`https://<user>.github.io/json-toolbox/` 这类子路径下也能正常工作。

### Cloudflare Pages

```bash
npm run deploy
```

`deploy` 脚本默认部署到名为 `json-toolbox` 的 Cloudflare Pages 项目。如果你
fork 了本项目，请修改 `package.json` 里的 `--project-name`，或直接调用 Wrangler。
首次部署前需要执行 `npx wrangler login` 登录。

## 贡献

欢迎提交 Issue 和 PR。动手前请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。
如果是安全漏洞，请按 [SECURITY.md](./SECURITY.md) 的方式私下报告，不要开公开
Issue。

## 许可证

[MIT](./LICENSE) © 2026 JSON Toolbox contributors

第三方依赖各自遵循其原有许可证，详见各包的元数据。
