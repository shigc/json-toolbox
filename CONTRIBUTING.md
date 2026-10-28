# Contributing to JSON Toolbox

Thanks for taking the time to contribute. This document covers the basics.

## Before you start

- Search [existing issues](https://github.com/shigc/json-toolbox/issues) to avoid duplicates.
- For anything larger than a small fix, open an issue first so we can agree on the approach.
- By participating you agree to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development setup

```bash
git clone https://github.com/shigc/json-toolbox.git
cd json-toolbox
npm install
npm run dev
```

Requirements: Node.js 20.19+ and npm 10+.

## Project conventions

- **Code style**: 2-space indentation, single quotes, no semicolons, UTF-8, LF line endings (see `.editorconfig`).
- **Types**: the project builds with `vue-tsc` in strict mode and `noUnusedLocals` / `noUnusedParameters` enabled. Avoid `any` where a real type is practical.
- **Tools**: every tool is registered in `src/tools/registry.ts`; the menu, tabs, routes and home cards are generated from it.
- **i18n**: UI strings must be added to **all five** locale files (`zh-CN`, `zh-TW`, `en`, `ja`, `ko`). `en`, `ja`, `ko` and `zh-TW` are type-checked against the key structure of `zh-CN`, so a missing key fails the build.
- **Utils**: keep parsing/conversion logic in `src/utils/` as pure functions so it can be tested and reused.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(jsonpath): support filter expressions in the query bar
fix(excel): keep leading zeros when importing a sheet
docs: add screenshot to README
chore(deps): bump vite to 7.3.8
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Before opening a pull request

```bash
npm run typecheck
npm run build
```

- [ ] The change is focused and does not include unrelated formatting churn.
- [ ] `npm run typecheck` and `npm run build` pass.
- [ ] New UI strings exist in all five locale files.
- [ ] New behaviour is described in the PR (and in `CHANGELOG.md` under `Unreleased` if user-facing).
- [ ] No secrets, tokens or personal data are included.

CI runs the same type-check and build on Node 20 and 22. Please make sure it is green.

## Reporting bugs and security issues

- Functional bugs: open a [bug report](https://github.com/shigc/json-toolbox/issues/new/choose).
- Security vulnerabilities: **do not** open a public issue — follow [SECURITY.md](./SECURITY.md).
