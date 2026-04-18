---
name: docs-to-md
description: >-
  기술 공식 문서 사이트 URL을 받아 여러 페이지를 자동 발견(llms-full.txt → llms.txt → sitemap.xml → nav 순)하고 로컬 Markdown 파일/폴더로 저장한다.
  1페이지면 단일 .md, 여러 개면 폴더 + index.md. 각 파일 frontmatter에 source_url·fetched_at·pages를 박아 stale 판별을 돕는다.
  Triggers — "공식문서를 md로", "docs 저장", "문서 크롤링해서 정리", "레퍼런스 로컬에 저장", "/docs-to-md <url>".
  사용자가 공식 문서/레퍼런스 URL을 주면서 로컬 md 파일로 변환하거나 보관하려 할 때 사용.
license: Apache-2.0
allowed-tools: WebFetch Bash Write Read
---

# docs-to-md

기술 공식 문서를 링크 하나로 받아 로컬 `.md`로 정리하는 스킬. 에이전트가 나중에 컨텍스트로 참조하기 좋은 형태로 떨어뜨리는 것이 목표다.

## 사용 시점

- 사용자가 **슬래시 커맨드** `/docs-to-md <url> [output]` 을 호출했을 때.
- 사용자가 공식 문서/레퍼런스/가이드 사이트의 URL을 주며 "이거 md로 떨어뜨려줘", "로컬에 저장해줘", "문서 정리해줘" 같은 요청을 했을 때.

`output`을 생략하면 `./docs/<url-slug>/` 에 저장한다 (slug는 도메인+경로 축약).

## 절차

### 1. 입력 파싱

- `<url>`에서 `origin`과 `pathPrefix` 추출. `pathPrefix`는 마지막 `/` 까지의 경로(예: `https://foo.com/guide/intro` → `/guide/`).
- `output`이 없으면 `./docs/<host>-<path-slug>/` 로 기본값 생성.

### 2. 페이지 발견 (discover)

`scripts/discover.mjs` 를 실행해 페이지 URL 리스트를 얻는다:

```bash
node <skill-path>/scripts/discover.mjs <url> --max=20
```

출력은 JSON `{ source, pages: [{ url, title? }] }`. `source`는 다음 중 하나이며, 폴백 순서대로 시도된다:

1. `llms-full.txt` — 이미 LLM용 풀텍스트가 제공됨. 이 한 파일만 받으면 끝.
2. `llms.txt` — 문서 링크 목록. 여기서 URL을 추출해 각각 fetch.
3. `sitemap` — `sitemap.xml` 의 `<loc>` 중 `pathPrefix`로 필터.
4. `nav` — 입력 페이지 HTML의 `href` 중 동일 `origin + pathPrefix` 링크.
5. `single` — 위가 모두 실패하면 입력 페이지 하나만.

상세 동작은 `scripts/discover.mjs` 를 읽어 확인.

### 3. 사용자 확인 (조건부)

- 페이지가 **5개 초과**이면 사용자에게 목록을 보여주고 **"전부 진행 / 일부만 선택 / 취소"** 중 하나를 확인한다. 기본 상한은 20개이며, 더 넓히려면 `--max=N`로 재실행.
- 5개 이하이면 확인 없이 바로 진행.

### 4. 각 페이지 fetch

각 URL에 대해 `WebFetch`를 호출해 Markdown을 얻는다. Claude Code의 WebFetch는 HTML→Markdown 변환이 내장돼 있어 정적 사이트엔 충분하다.

- `source === 'llms-full.txt'` 인 경우: `fetch`로 직접 받아 그대로 저장 (이미 텍스트).
- 그 외: 페이지마다 `WebFetch(url, prompt="Return the full page content as Markdown without summarizing.")` — 요약이 아니라 풀텍스트를 받도록 지시.
- 각 페이지의 상대 경로는 `pathPrefix`를 기준으로 계산 (예: `/guide/intro` → `intro.md`, `/guide/layers/shared` → `layers/shared.md`).

빈 결과/JS 렌더링 실패 감지 등 세부는 `references/failure-modes.md` 참조.

### 5. 출력 구조화

- **1페이지**: `<output>.md` 단일 파일. `<output>`이 폴더면 `<output>/index.md`.
- **2페이지 이상**: 폴더 구조. 각 페이지는 원본 경로를 반영한 `.md`로, 폴더 루트에 `index.md` 생성하여 목차를 제공한다.

폴더 예시:

```
docs/fsd/
├── index.md              # 목차 + 전체 메타
├── get-started/
│   ├── overview.md
│   └── tutorial.md
└── reference/
    └── layers.md
```

### 6. Frontmatter 삽입

**각 개별 md 파일** 상단에:

```yaml
---
source_url: https://feature-sliced.design/docs/get-started/overview
fetched_at: 2026-04-18
source: sitemap             # discover.mjs의 source 값
---
```

**`index.md` 상단에**:

```yaml
---
source_root: https://feature-sliced.design/
fetched_at: 2026-04-18
source: sitemap
pages:
  - url: https://feature-sliced.design/docs/get-started/overview
    path: get-started/overview.md
  - url: https://feature-sliced.design/docs/get-started/tutorial
    path: get-started/tutorial.md
---
```

`index.md` 본문에는 위 pages 리스트를 상대 링크 목차로 렌더한다.

### 7. 마무리 보고

사용자에게 다음을 알린다:

- 발견 소스(`llms-full.txt` / `sitemap` 등)
- 저장된 파일 수와 최상위 경로
- 스킵하거나 실패한 페이지가 있으면 목록

## 제약 / 기본값

- **페이지 상한**: 기본 20 (`--max=N` 으로 조정). 토큰·시간 폭주 방지.
- **이미지/다운로드 대상**: Markdown 내 링크는 보존하되 파일 다운로드는 하지 않음.
- **robots.txt / ToS**: 자동 검사하지 않음. 사용자 책임.
- **중복 실행 시**: 기존 파일은 덮어쓴다. 사용자가 대상 디렉토리를 비우는 책임.
- **버전 고정**: URL에 버전이 없으면 시간이 지나면 stale. `fetched_at` 으로 판별 가능.

## 실패 모드

- JS 렌더링 SPA, 차단, 대용량 등은 `references/failure-modes.md` 를 먼저 읽고 대응.

## 사이트별 팁

- Docusaurus, VitePress, Nextra, MkDocs 등 프레임워크별 특이사항은 `references/site-patterns.md` 참조.

## 예시

### 예시 1 — FSD 문서 전체 받기

입력:
```
/docs-to-md https://feature-sliced.design/ ./docs/fsd/
```

동작:
1. `discover.mjs` → `sitemap.xml` 에서 페이지 목록 획득 (수십 개 예상)
2. 사용자에게 개수 확인 요청 → "전부"
3. 각 페이지 `WebFetch` → md 변환
4. `./docs/fsd/index.md` + 하위 페이지들 생성

### 예시 2 — 단일 페이지만

입력:
```
/docs-to-md https://react.dev/reference/react/useState
```

동작:
1. `discover.mjs` → `source: single` (react.dev는 llms.txt 없음 & nav 링크 필터링 후 동일 페이지만 남음)
2. `./docs/react-dev-reference-react-useState.md` 단일 파일 생성
