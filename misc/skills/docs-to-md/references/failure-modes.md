# 실패 모드와 대응

`docs-to-md` 실행 중 흔히 만나는 실패 상황과 권장 대응.

## 1. JS 렌더링 SPA (HTML이 비어있음)

**증상**
- `discover.mjs`가 `single` 또는 `nav`로 폴백.
- `WebFetch` 결과가 짧고(수백 자 미만) `<div id="root">` 수준만 보임.
- 실제 문서 내용이 Markdown으로 전혀 잡히지 않음.

**원인**
클라이언트 사이드 라우팅 SPA라서 초기 HTML에 콘텐츠가 없음.

**대응**
1. 사용자에게 "이 사이트는 JS 렌더링 기반으로 보여 WebFetch로는 본문을 가져올 수 없습니다"라고 즉시 보고.
2. **Chrome MCP 폴백 제안** — `mcp__Claude_in_Chrome__navigate` + `mcp__Claude_in_Chrome__get_page_text`로 실제 렌더링된 텍스트 추출.
3. 또는 프린트 가능한 버전(`?plain=true`, `/print`, `?format=md` 같은 별도 엔드포인트)이 있는지 확인.
4. 최후엔 사용자에게 "각 페이지를 수동으로 복붙" 요청.

Chrome MCP는 무겁고 스킬 기본 경로가 아니므로, **자동 전환하지 말고 사용자 확인 후 전환**.

## 2. 차단 응답 (403 / 429 / 503)

**증상**
- `discover.mjs`가 모든 엔드포인트에서 null 반환 → `single` 폴백.
- `WebFetch`가 "Access Denied" 또는 Cloudflare challenge 페이지를 Markdown으로 반환.

**원인**
- Cloudflare / Fastly bot protection
- User-Agent 기반 차단
- Rate limit

**대응**
1. 10분 이상 간격 두고 재시도 제안.
2. 다른 경로로 접근 가능한지 확인 (예: GitHub raw, 공식 PDF, 아카이브).
3. 자동 우회는 금지. 사이트 ToS 존중.

## 3. 너무 많은 페이지 (수백 개 이상)

**증상**
- `sitemap` 소스에서 수백 URL 감지.

**대응**
1. 스킬 본체 절차 3번의 "5개 초과 시 확인"을 이 경우에도 적용. 목록을 보여주고 범위를 좁힐 것.
2. `pathPrefix`를 더 구체적으로 주도록 유도 (예: `https://site.com/docs/` → `https://site.com/docs/guide/`).
3. `--max=N` 으로 상한 상향 전엔 토큰 예산 고려 (`20 * 5k ≈ 100k` 정도가 기본 한계 감각).

## 4. 중복 URL (trailing slash, 쿼리)

**증상**
- `/foo`와 `/foo/`가 둘 다 잡힘.
- `?v=2` 같은 쿼리 파라미터 차이로 중복.

**대응**
- discover.mjs는 해시(`#`)만 제거한다. 필요하면 사용자에게 보여주기 전에 에이전트가 수동으로 정규화(trailing slash 통일, 쿼리 제거).
- 기본적으론 sitemap이 정제된 URL만 담고 있어 크게 문제가 안 된다.

## 5. WebFetch가 "요약"을 돌려줌

**증상**
- 지시문에 "return as Markdown"이라 썼는데도 결과가 짧고 요약 톤.

**원인**
Claude Code WebFetch는 내부 모델이 프롬프트를 해석해 페이지를 요약하기도 함.

**대응**
- `prompt`를 강하게 지정: `"Output the entire page content as Markdown. Do not summarize, paraphrase, or omit any section. Include code blocks and tables verbatim."`
- 여전히 요약이면 해당 페이지를 재시도.
- 그래도 안 되면 `scripts/discover.mjs`가 시도하는 `fetch` 로 HTML을 직접 받고 md 변환을 다른 도구로 하는 방안 검토 (이 스킬 기본 경로 아님).

## 6. 인코딩/언어 문제

**증상**
- 한글/일본어 사이트에서 깨진 글자.

**대응**
- 거의 드물다. `fetch`가 `Content-Type`의 charset을 따른다.
- 이슈 발생 시 사용자에게 사이트 URL과 증상 공유 요청 후 스킬을 개선.

## 7. 대상 디렉토리 충돌

**증상**
- `output`이 이미 존재하고 비어있지 않음.

**대응**
- 스킬은 **덮어쓴다**. 사용자에게 사전 공지.
- 덮어쓰기 원치 않으면 다른 경로 제안.
- 자동 백업은 하지 않는다 (사용자의 VCS가 책임).

## 8. llms.txt가 있지만 링크가 외부 도메인

**증상**
- `llms.txt` 안의 링크가 GitHub raw, CDN 등 origin 바깥.

**대응**
- `discover.mjs`는 origin 체크를 하지 않고 그대로 반환한다 (llms.txt는 관리자가 의도한 목록으로 신뢰).
- fetch 단계에서 외부 도메인이 보이면 사용자에게 한 번 확인 후 진행.
