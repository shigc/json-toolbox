# JSON Toolbox

> 데스크톱 앱 스타일의 완전한 클라이언트 사이드 JSON 도구 모음. 12개 도구, 5개 언어, 데이터는 전송되지 않습니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

[English](./README.md) | [简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**[라이브 데모 →](https://json.shigc.top/)**

<p align="center">
  <img src="./docs/screenshot.png" alt="JSON Toolbox 홈 화면" width="900">
</p>

<p align="center">
  <img src="./docs/screenshot-format.png" alt="JSON 포맷 도구(왼쪽 입력, 오른쪽 결과)" width="900">
</p>

## 왜 또 다른 JSON 도구인가

대부분의 온라인 JSON 도구는 텍스트 영역 하나와 버튼 하나로 끝납니다. JSON
Toolbox는 데스크톱 앱의 사용 방식을 따릅니다. 메뉴 바, 다중 탭 작업 공간, 상태
표시줄, 단축키를 제공하고 모든 처리를 브라우저 안에서 완료합니다. 어떤 데이터도
기기를 떠나지 않으며, 단일 파일로 빌드하면 완전히 오프라인에서도 동작합니다.

## 특징

- **데스크톱 앱 스타일 작업 공간** — 메뉴 바, 다중 탭 편집, 상태 표시줄, 크기 조절 가능한 분할 창
- **12개 도구** — 포맷, 조회, 변환, 형식 간 상호 변환
- **100% 로컬 처리** — 백엔드 없음, 분석 없음, 실행 중 네트워크 요청 없음
- **오프라인 단일 파일** — `dist-single/index.html`을 더블클릭하면 바로 실행
- **5개 UI 언어** — English, 简体中文, 繁體中文, 日本語, 한국어
- **라이트 / 다크 / 시스템 테마**
- **키보드 단축키** 와 도구 메뉴
- 전체 **TypeScript** 기반, 빌드마다 엄격한 타입 검사 수행

## 도구 목록

| 도구 | 설명 |
| --- | --- |
| JSON 포맷 | 보기 좋게 정렬, 압축, 검증, 행/열 단위 오류 표시 |
| JSON 트리 보기 | 접이식 트리, 경로와 값 복사 |
| JSON 비교 | 구조적 diff, 추가·삭제·변경 강조 |
| JSONPath 쿼리 | 경로 쿼리와 필터 표현식 |
| JSON 평탄화 | 중첩 구조와 평탄한 키-값 상호 변환 |
| JSON 정렬 | 키 정렬, 재귀 정렬, 빈 값 제거 |
| 스키마 생성 | JSON Schema와 TypeScript 인터페이스 생성 |
| 목 데이터 | 템플릿으로 무작위 테스트 데이터 생성 |
| 형식 변환 | JSON ⇄ CSV / XML / YAML / TOML / INI |
| Excel 변환 | JSON ⇄ Excel(`.xlsx`) 가져오기·내보내기 |
| 이스케이프 / 언이스케이프 | JSON 이스케이프와 GET 쿼리 문자열 상호 변환 |
| 인코딩 / 디코딩 | Base64 / Unicode / URL 인코딩·디코딩 |

## 기술 스택

- [Vue 3](https://vuejs.org/) + TypeScript + [Vite 7](https://vite.dev/)
- 상태 관리는 [Pinia](https://pinia.vuejs.org/), 라우팅은 [Vue Router](https://router.vuejs.org/) hash 모드
- 에디터는 [CodeMirror 6](https://codemirror.net/)
- 다국어 지원은 [vue-i18n](https://vue-i18n.intlify.dev/)
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch), [jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath), [yaml](https://eemeli.org/yaml/), [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser), [smol-toml](https://github.com/squirrelchat/smol-toml), [papaparse](https://www.papaparse.com/), [SheetJS](https://sheetjs.com/), [Faker](https://fakerjs.dev/)

## 시작하기

### 요구 사항

- Node.js **20.19+** (또는 22.12+)
- npm 10+

### 설치 및 실행

```bash
git clone https://github.com/shigc/json-toolbox.git
cd json-toolbox
npm install
npm run dev
```

개발 서버가 로컬 주소(보통 `http://localhost:5173`)를 출력합니다.

> `xlsx`는 `https://cdn.sheetjs.com/...tgz`에서 설치합니다. SheetJS가 npm에
> 새 버전을 더 이상 배포하지 않기 때문입니다. 따라서 `npm install`에는 npm
> 레지스트리 외에 `cdn.sheetjs.com` 접속 권한이 필요합니다.

### 스크립트

| 스크립트 | 기능 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 시작 |
| `npm run build` | 타입 검사 후 압축하지 않은 결과물을 `dist/`에 빌드 |
| `npm run build:single` | 단일 파일 `dist-single/index.html` 빌드 |
| `npm run build:release` | 압축 + 난독화된 배포용 결과물을 `dist-release/`에 빌드 |
| `npm run preview` | `dist/` 결과물 미리보기 |
| `npm run preview:release` | `dist-release/` 결과물 미리보기 |
| `npm run typecheck` | `vue-tsc --noEmit` 실행 |
| `npm run deploy` | Wrangler를 통해 Cloudflare Pages에 배포 |

`SKIP_OBF=1 npm run build:release`를 사용하면 압축만 하고 난독화를 건너뛰어
배포 결과물을 디버깅하기 쉬워집니다.

### 빌드 결과물

| 디렉터리 | 용도 |
| --- | --- |
| `dist/` | 일반 정적 사이트용 결과물 |
| `dist-single/` | 모든 것을 인라인한 단일 HTML (`file://`로 열 수 있음) |
| `dist-release/` | 압축·난독화된 공개 배포용 결과물 |

## 디렉터리 구조

```
src/
├─ components/     레이아웃, 에디터, 공통 UI 컴포넌트
├─ composables/    재사용 가능한 컴포지션 함수
├─ directives/     사용자 정의 Vue 디렉티브
├─ locales/        zh-CN, zh-TW, en, ja, ko 메시지 카탈로그
├─ router/         도구 레지스트리에서 생성되는 hash 모드 라우트
├─ stores/         Pinia 스토어(설정, 작업 공간, 상태)
├─ styles/         전역 스타일과 CSS 변수
├─ tools/          도구 레지스트리와 타입
├─ utils/          순수 함수(json, diff, schema, mock, convert/*, encode)
└─ views/          도구별 뷰 컴포넌트
```

메뉴 바, 탭 바, 라우트, 홈 카드는 모두 `src/tools/registry.ts`에서 생성되므로
도구를 추가할 때 라우터를 수정할 필요가 없습니다.

## 도구 추가하기

1. `src/tools/registry.ts`의 `TOOLS`에 항목을 추가합니다(id, 카테고리, 아이콘, 입력 타입).
2. `src/views/`에 해당 뷰 컴포넌트를 만듭니다.
3. `src/locales/`의 **5개 언어 파일 모두**에 `tool.<id>.title`과 `tool.<id>.desc`를 추가합니다.
4. `npm run typecheck`를 실행합니다. `en.ts`, `ja.ts`, `ko.ts`, `zh-TW.ts`는
   `zh-CN.ts`의 키 구조와 비교되므로 키가 빠지면 빌드가 실패합니다.

## 개인정보 보호

백엔드가 없습니다. 모든 파싱, 변환, 생성은 브라우저에서 이루어지며 데이터는 기기를
떠나지 않습니다. 테마, 언어, 레이아웃 같은 설정은 `localStorage`에만 저장됩니다.

## 배포

### GitHub Pages

`.github/workflows/deploy.yml`이 `main`에 푸시할 때마다 `dist/`를 빌드하여
GitHub Pages에 게시합니다. 처음 사용할 때는 **Settings → Pages → Source**에서
**GitHub Actions**를 선택하세요.

라우터는 hash 모드이고 `base`가 `./`이므로
`https://<user>.github.io/json-toolbox/` 같은 하위 경로에서도 정상 동작합니다.

### Cloudflare Pages

```bash
npm run deploy
```

`deploy` 스크립트는 기본적으로 `json-toolbox`라는 Cloudflare Pages 프로젝트에
배포합니다. 포크한 경우 `package.json`의 `--project-name`을 수정하거나 Wrangler를
직접 실행하세요. 첫 배포 전에 `npx wrangler login`으로 로그인해야 합니다.

공식 데모는 <https://json.shigc.top/>에서 확인할 수 있습니다.

## 기여

이슈와 PR을 환영합니다. 작업 전에 [CONTRIBUTING.md](./CONTRIBUTING.md)를 읽어
주세요. 보안 문제는 [SECURITY.md](./SECURITY.md)의 절차에 따라 비공개로
보고하고 공개 이슈를 만들지 마세요.

## 라이선스

[MIT](./LICENSE) © 2026 JSON Toolbox contributors

서드파티 의존성은 각자의 라이선스를 따릅니다. 자세한 내용은 각 패키지의 메타데이터를
참조하세요.
