# misc

**개인 잡동사니 스킬 모음** (개인 트랙).

`agent-cowork` 같이 주제가 명확한 플러그인으로 묶기 애매한 유틸리티들이 여기 모입니다. 공개 트랙과 달리 품질 보증이나 인터페이스 일관성은 보장하지 않으며, 개인 필요에 따라 변경·제거될 수 있습니다.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install misc@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill pdf-parser --skill claude-hook-notify-setup --skill docs-to-md --skill fsd-docs --skill lean-prd --skill erd
```

## 포함된 스킬

### `pdf-parser` (v1.0)

PDF 파일에서 텍스트를 추출해 `.txt`로 저장합니다. Node.js + `pdf-parse` 라이브러리 기반. 첫 실행 시 의존성을 자동 설치합니다.

**사용 예:**

```
PDF 읽어줘 → ./some-document.pdf
이 PDF의 텍스트를 추출해서 notes.txt로 저장해줘
```

**한계:**
- 암호화된 PDF는 비밀번호 해제 후 재시도 필요
- 스캔본(이미지 PDF)은 OCR 불가 — Adobe Acrobat, tesseract 등 별도 도구 필요

**요구:** Node.js 18+

자세한 절차는 [SKILL.md](skills/pdf-parser/SKILL.md) 참조.

---

### `claude-hook-notify-setup` (v1.2)

Claude Code hook에 **OS 네이티브 토스트 알림**을 연결하는 **세팅 스킬**. `node-notifier` 기반으로 Windows(SnoreToast), macOS(알림 센터), Linux(libnotify)를 모두 지원합니다.

**알림이 뜨는 3가지 상황:**

| Hook | 발화 시점 | 토스트 내용 |
|---|---|---|
| `Stop` | Claude 턴 종료 | 프로젝트명 + 마지막 응답 요약(300자) |
| `PermissionRequest` | 도구 권한 요청 시 | Bash 명령어 또는 AskUserQuestion 질문 |
| `Notification` | 시스템 알림 | 알림 메시지 |

**사용 예:**

```
claude 알림 받고 싶어
작업 완료 알림 설정해줘
```

스킬 실행 시 `~/.claude/skills/claude-hook-notify-setup/`에 스크립트를 배포하고 `~/.claude/settings.json`의 `hooks` 섹션에 명령을 등록합니다.

**요구:** Node.js 18+, Claude Code

**호환성:** Claude Code 전용 (다른 에이전트는 hook 구조가 달라 적용 불가)

자세한 설치·등록 절차는 [SKILL.md](skills/claude-hook-notify-setup/SKILL.md) 참조.

---

### `docs-to-md` (v1.0)

기술 공식 문서 사이트의 URL을 받아 **로컬 Markdown**으로 저장합니다. `llms-full.txt` → `llms.txt` → `sitemap.xml` → nav 링크 → 단일 페이지 순으로 페이지를 자동 발견하고, `WebFetch`로 각 페이지를 Markdown 변환해 1페이지면 단일 `.md`, 여러 개면 폴더 + `index.md` 구조로 떨어뜨립니다.

**사용 예:**

```
/docs-to-md https://feature-sliced.design/ ./docs/fsd/
https://react.dev/reference/react/useState 이거 md로 저장해줘
```

**특징:**
- `llms-full.txt` 제공 사이트(Vercel, Supabase, Next.js 등)는 한 파일로 풀텍스트 확보
- 5페이지 초과 시 사용자에게 목록 확인 후 진행
- 각 파일 frontmatter에 `source_url`, `fetched_at` 자동 기록 (stale 판별)

**요구:** Node.js 18+ (스크립트는 의존성 없음)

자세한 절차·폴백 전략·프레임워크별 팁은 [SKILL.md](skills/docs-to-md/SKILL.md) 참조.

---

### `fsd-docs` (v1.0)

**Feature-Sliced Design v2.1 공식 문서** 지식 스킬. SKILL.md는 라우팅 테이블 역할만 하고, 실제 지식은 8개 섹션(`references/00-overview.md` ~ `07-philosophy-and-faq.md`)으로 분할되어 필요할 때만 로드됩니다(Progressive Disclosure).

**사용 예:**

```
FSD에서 pages-first 마이그레이션이 뭐야?
우리 프로젝트에 FSD 도입하는 게 맞을까?
FSD에서 cross-import는 어떻게 처리해?
```

**포함 섹션:**
- `00-overview.md` — 개요, 적합성 판단, incremental adoption
- `01-core-reference.md` — Layers, Public API, Slices/Segments
- `02-tutorial.md` — 실전 튜토리얼 (on paper + in code)
- `03-cross-imports-and-antipatterns.md` — cross-import, desegmentation, excessive entities, routing
- `04-migration.md` — **v2.0→v2.1 (pages-first)**, v1→v2, Custom→FSD ⭐
- `05-framework-integrations.md` — Next.js, NuxtJS, SvelteKit, React Query, Electron
- `06-practical-guides.md` — API, Auth, i18n, Types, Page layouts, Theme, SSR
- `07-philosophy-and-faq.md` — Alternatives 비교(DDD/Clean/Atomic), 철학, FAQ

**라이선스:** 원문은 MIT (© 2018-2026 Feature-Sliced Design core-team). [`LICENSE.md`](skills/fsd-docs/LICENSE.md)에 전문 포함.

자세한 인덱스는 [SKILL.md](skills/fsd-docs/SKILL.md) 참조.

---

### `lean-prd` (v1.0)

프로젝트 기획 문서(**Lean PRD**)를 Markdown으로 생성·관리하는 스킬. 7개 섹션(Overview / Background / Goals / Non-goals / Scope / Later / Constraints)으로 구성된 **한 페이지 분량의 가벼운 기획서**를 대화형 인터뷰로 채웁니다.

**사용 예:**

```
PRD 만들어줘
이 아이디어를 lean PRD로 정리해줘
기획서 초안 써줘
```

**특징:**
- 프로젝트 유형 3종(개인/사내/상용) 레퍼런스 내장 — 톤·어휘 자동 조정
- Goals 스타일 선택 (엄격한 수치·기한 vs 정성 목표)
- 유형 전환 지원 (개인 → 상용으로 승격 시 재프레이밍)
- "Product" 같은 세일즈 어휘 자동 중립화
- **Non-goals**(영구 배제)와 **Later**(다음 버전 후보)를 엄격히 분리

**요구:** 없음

자세한 절차·인터뷰 스크립트는 [SKILL.md](skills/lean-prd/SKILL.md) 참조.

---

### `erd` (v1.0)

PRD·도메인 설명·테이블 목록에서 **Mermaid ERD(`.mmd`)**를 생성합니다. 다크 테마 + handDrawn 스타일 기본, 개념·논리·물리 3수준을 모두 지원합니다.

**사용 예:**

```
ERD 만들어줘
이 도메인 설명으로 논리 ERD 그려줘
현재 ERD를 물리 수준으로 올려줘
```

**특징:**
- 3수준 지원 (개념: 엔티티+관계 / 논리: 속성+추상타입 / 물리: 컬럼+인덱스)
- 수준 간 전환 가능 (개념↔논리↔물리)
- 엔티티별 15색 팔레트 자동 배정
- VS Code Mermaid 프리뷰에서 바로 렌더링

**요구:** 없음 (VS Code Mermaid 프리뷰 확장 권장)

자세한 문법·색상 가이드는 [SKILL.md](skills/erd/SKILL.md) 참조.

## 주의

- **개인 트랙이라 변경이 잦을 수 있습니다.** 버전을 따라 자동 업데이트하면 동작이 달라질 수 있으니 필요한 버전을 고정 사용하는 걸 권장합니다.
- **스킬 간 결합도 없음.** 각 스킬은 독립적으로 동작하며 서로 의존하지 않습니다.

## 라이선스

[MIT](../LICENSE).
