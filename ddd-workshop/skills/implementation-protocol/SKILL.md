---
name: implementation-protocol
description: >
  ddd-workshop 파이프라인의 **구현 단계 프로토콜 인스톨러**. 빅픽처·process-modeling·ADR 같은
  설계 산출물이 누적된 프로젝트에서, 매 작업 단위(이슈·티켓·기능)마다 *설계 문서 검토 →
  범위 일치 확인 → 일치하면 코드, 불일치면 설계 문서 먼저 갱신 → 그 다음 코드*의
  흐름을 공개 지침 파일(트랙 A: `AGENTS.md` / 트랙 B: `CLAUDE.md`)에 박제한다.
  설치 후 상시 로드 컨텍스트로 작동 — 매번 스킬을 호출하지 않아도 모든 코딩 세션이
  자동으로 이 프로토콜을 따른다. **기존 워크플로(Git/이슈 트래킹/CI/PR 정책 등)는
  손대지 않고**, 이미 워크플로 섹션이 있으면 *적절한 지점에 slot-in 제안*, 없으면 신규
  섹션 추가. 충돌하는 워크플로(예: "코드부터 짜고 docs는 나중에")는 자동 변경 X —
  사용자에게 선택지(대체/부분 수정/그만두기) 제시. 트랙 A/B 자동 감지(우선순위:
  AGENTS.md > CLAUDE.md). 설계 산출물 부분 누락(빅픽처만 있음, ADR 없음 등) graceful
  degradation. Install/Update/Merge/Cycle 4 모드.
  Triggers — "구현 프로토콜 설치", "코딩 워크플로 박제", "implementation protocol",
  "설계-코드 정렬 규칙 추가", "/implementation-protocol".
allowed-tools: Read Write Edit Glob Grep
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# implementation-protocol 스킬

ddd-workshop 파이프라인의 **구현 단계 프로토콜 인스톨러**. 설계 산출물(빅픽처/process-modeling/ADR)이 누적된 프로젝트에서, *코드 작업이 설계 문서와 어긋나지 않도록* 보장하는 워크플로 규약을 공개 지침 파일에 박제한다.

## 1. 정체성

**One-shot 호출 도구가 아니라 *프로토콜 인스톨러***. 설치 후 상시 로드 컨텍스트로 작동 — 매 코딩 세션이 자동으로 이 프로토콜을 따른다.

| | 다른 ddd-workshop 스킬 | implementation-protocol (이 스킬) |
|---|---|---|
| 호출 패턴 | 작업할 때마다 명시 호출 | **한 번 설치 → 상시 로드** |
| 산출물 위치 | `docs/eventstorming/`, `docs/adr/` | **`AGENTS.md` 또는 `CLAUDE.md` 안 한 섹션** |
| 다루는 단계 | 학습·빅픽처·workflow·BC 박제 | **코드 구현 단계 워크플로** |
| 작동 시점 | 사용자 명시 호출 시 | **매 코딩 세션 자동** |

설치되는 프로토콜의 핵심 흐름:

```
작업 단위 시작
   ↓
설계 문서 검토 (빅픽처/process-modeling/ADR 중 관련된 것 읽기)
   ↓
이 작업이 설계 범위 안인가?
   ├─ YES → 계획·코드 작성
   └─ NO  → 사용자와 토론 → 설계 문서 갱신 → 계획·코드 작성
```

## 2. 철학

- **설치형, 비-즉발형.** 호출 빈도 < 1회/프로젝트 (재설치 시 Update). 작동은 매 세션 자동.
- **Slot-in, not replace.** 기존 워크플로(Git/이슈 트래킹/CI/PR/테스트 정책)는 손대지 않고, 그 흐름의 적절한 지점에 설계-정렬 단계를 끼워넣을 뿐.
- **충돌은 명시화.** 모순되는 기존 워크플로 발견 시 자동 변경 X — 사용자에게 선택지.
- **변경안 → 동의 → 적용.** 직접 덮어쓰기 절대 X. 항상 *제안 → 검토 → 적용*.
- **Graceful degradation.** 빅픽처·ADR·process-modeling 중 일부만 있어도 동작. 없는 산출물은 프로토콜 본문에서 생략하거나 *조건부* 단계로 표기.

## 3. 범위

**In scope:**
- 공개 지침 파일에 *설계-코드 정렬* 단계 박제
- 기존 워크플로 섹션 감지 + slot-in 제안
- 충돌 발견 시 선택지 제시
- 설계 산출물 자동 감지 (빅픽처·process-modeling·ADR)
- 트랙 A/B 자동 감지

**Out of scope (절대 손대지 않음):**
- Git workflow (브랜치 전략·커밋 컨벤션·머지 정책)
- 이슈 트래킹 (Linear/Jira/GitHub Issues 정책)
- PR 정책 (리뷰어·승인 수·머지 전략)
- CI/CD 파이프라인 단계
- 테스트 정책 (커버리지·TDD/BDD 등)
- 코드 스타일·린트 규칙
- 설계 산출물 자체의 생성·수정 — 이건 bigpicture/process-modeling 스킬 영역

→ 위 항목들이 기존 워크플로에 존재하면 **위치 참고용으로만 읽고**, 설계-정렬 단계를 *그 흐름 안에 끼워넣음*.

## 4. 가드레일

| # | 확인 | 실패 시 |
|---|---|---|
| 1 | 공개 지침 파일(`AGENTS.md` 또는 `CLAUDE.md`)이 프로젝트 루트에 존재 | "공개 지침 파일이 없습니다. `agent-cowork:draft-public-rules`로 먼저 생성하세요." |
| 2 | 둘 다 존재 시 트랙 결정 | AGENTS.md > CLAUDE.md 우선. `CLAUDE.md`가 `@AGENTS.md` 한 줄(import-only)이면 AGENTS.md가 source |
| 3 | 설계 산출물(`docs/eventstorming/` 등) 중 최소 1종 존재 | 모두 없으면 "이 프로토콜은 설계 산출물이 있어야 의미가 있습니다. bigpicture부터 시작 권장." 안내 후 사용자가 강제 진행 의사면 *빈 프로토콜* 설치 |
| 4 | 기존 프로토콜 섹션 중복 감지 | 같은 의미의 섹션 발견 시 Update 모드로 전환 (덮어쓰기 X — diff 보여주고 동의) |

## 5. 언어 정책

사용자 대면 메시지는 **사용자 언어**. 공개 지침 파일에 기록하는 프로토콜 본문도 **사용자 언어** (refine-boundaries 정책과 동일). 단 구조적 요소는 영어 고정:
- 섹션 헤딩 (예: `## Implementation Protocol`, `## Development Workflow`)
- 단계 라벨 (예: `Step 1`, `Step 2`)

## 6. 워크플로우

### Step 1 — 환경 스캔

| 스캔 대상 | 추출 정보 |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | 트랙 결정 + 기존 워크플로 섹션 흔적 |
| `docs/eventstorming/index.md` | 빅픽처 존재 + 페이즈 목록 |
| `docs/eventstorming/*/` | 페이즈 폴더 + process-modeling 산출물 |
| `docs/adr/*.md` | ADR 존재 + BC 분할 결정 박제 위치 |
| 루트의 다른 `*.md` (README 등) | 워크플로 언급 흔적 |

기존 워크플로 패턴 검색 키워드 (사용자 언어 기준):
- 한국어: "워크플로", "프로세스", "작업 흐름", "코딩 절차", "개발 단계"
- 영어: "workflow", "process", "development flow", "coding procedure"
- 섹션 헤딩: `## Workflow`, `## Development`, `## Process`, `## How we work`
- Boundaries 안 인라인 규칙 (`Always do` 안 작업 절차 류)

### Step 2 — 모드 결정

| 모드 | 조건 | 동작 |
|---|---|---|
| **Install** | 워크플로 섹션 없음 + 프로토콜 섹션 없음 | 신규 섹션 추가 (Step 3-A) |
| **Merge** | 기존 워크플로 섹션 있음 + 프로토콜 섹션 없음 | 기존 흐름에 slot-in 제안 (Step 3-B) |
| **Update** | 프로토콜 섹션 이미 있음 | 변경 사항 diff 보여주고 동의 (Step 3-C) |
| **Conflict** | 프로토콜과 모순되는 규칙 발견 ("코드부터, docs는 나중에" 류) | 선택지 제시 (Step 3-D) |

### Step 3-A — Install 모드 (신규 섹션)

설계 산출물 감지 결과에 따라 프로토콜 본문 생성 (7장 표준 텍스트 기반). 위치 결정:
- 트랙 A (AGENTS.md): `## Development Workflow` 또는 `## Implementation Protocol` 신규 섹션
- 트랙 B (CLAUDE.md): 동일

사용자에게 *전체 변경안* 제시 → 동의 → 파일 갱신.

### Step 3-B — Merge 모드 (기존 워크플로에 slot-in)

기존 워크플로 단계를 분석하여 *설계 정렬 단계가 들어갈 자연 지점* 식별:

| 기존 단계 패턴 | Slot-in 지점 |
|---|---|
| `1. 이슈 확인 → 2. 브랜치 생성 → 3. 코드` | 2.5/2.6에 설계 검토·갱신 |
| `1. 요구사항 분석 → 2. 설계 → 3. 구현` | 2와 3 사이 (설계 = 본 프로토콜이 다루는 설계 정렬) |
| Boundaries `Always do` 인라인 | 새 bullet 추가, `Ask first`에 "범위 외 작업" 추가 |
| 단일 paragraph 자연어 | 단계화 제안 + 설계 정렬 추가 |

사용자에게 *제안 diff* 제시 (`+` 추가 라인 + 기존 단계 유지):

```diff
  ## Development Workflow
  1. 이슈 확인 (Linear)
  2. 브랜치 생성: feat/{ticket-id}
+ 2.5. 설계 문서 정렬 확인 — 관련 docs/eventstorming/, ADR 읽기
+ 2.6. 작업 범위가 설계 범위 안인가?
+      - YES → 3
+      - NO  → 사용자와 토론 → 설계 문서 갱신 (eventstorming/ADR) → 3
  3. 코드 작성
  ...
```

동의 받기 전 적용 X.

### Step 3-C — Update 모드 (기존 프로토콜 갱신)

기존 프로토콜과 *현재 프로젝트 상태*(새 ADR·새 페이즈) 사이 차이 식별:
- 새 산출물 추가됨 → 프로토콜의 "검토 대상" 목록에 추가
- 산출물 위치 변경됨 → 경로 갱신
- 사용자 요청 변경

diff 보여주고 동의.

### Step 3-D — Conflict 모드 (모순 발견)

모순되는 기존 규칙 예:
- "코드부터 짜고 docs는 나중에 정리"
- "설계 문서는 보조 — 코드가 진실"
- "docs/ 안 .md는 참고용"

자동 변경 절대 X. 사용자에게 명시:

```
⚠️ 충돌 발견: AGENTS.md의 다음 규칙이 본 프로토콜과 모순됩니다.
   "코드부터 짜고 docs는 나중에 정리" (Boundaries > Always do)

선택지:
A. 기존 규칙 대체 — 본 프로토콜로 완전 교체
B. 부분 수정 — 기존 규칙 유지하되 일부 조정 제안
C. 그만두기 — 설치 안 함

A/B/C?
```

### Step 4 — 사용자 동의

변경안 전체 표시 → 사용자 명시적 동의(`y` 또는 명시 발화) 후 적용. 부분 동의 가능.

### Step 5 — 적용 + 후속 안내

파일 갱신 후 사용자에게:

> "프로토콜 설치 완료. 이후 모든 코딩 세션은 이 워크플로를 자동으로 따릅니다.
>  Update 필요 시 `/implementation-protocol` 재호출."

## 7. 표준 프로토콜 텍스트 (설치되는 본문)

산출물 감지 결과에 따라 *해당 부분만 포함*. 사용자 언어로 출력.

### 7.1 한국어 템플릿

```markdown
## Implementation Protocol

**적용 범위**: 모든 코드 작성·수정 작업 (이슈/티켓/기능 단위).
**out-of-scope**: Git workflow, 이슈 트래킹, PR 정책, CI/CD, 테스트 정책 — 이들은 별도 섹션 참조.

### 매 작업 단위마다 따를 순서

**Step 1. 설계 문서 정렬 확인**

작업 시작 전 다음을 읽는다 (관련된 것만):
- `docs/eventstorming/index.md` — 빅픽처 페이즈 맵·횡단 매트릭스·핫스팟
- `docs/eventstorming/{관련 페이즈}/bigpicture.md` — 페이즈 빅픽처
- `docs/eventstorming/{관련 페이즈}/{관련 워크플로}.md` — process-modeling 산출물
- `docs/adr/*.md` — BC 분할·기타 결정 박제

부수적 이해를 위한 인접 페이즈도 필요 시 읽는다.

**Step 2. 작업 범위 vs 설계 범위 비교**

이 작업이 다음 중 어디인가?
- [a] 기존 설계 범위 안 — 단순 구현
- [b] 설계 범위 확장 — 새 Command/Event/Policy/Read Model 등장
- [c] 설계 범위 변경 — Aggregate 경계·BC 분할·횡단 정책 영향
- [d] 새 페이즈 — 빅픽처에 없는 비즈니스 영역

**Step 3. 분기**

| 분류 | 행동 |
|---|---|
| [a] 범위 안 | 곧장 Step 4 (계획·코드) |
| [b] 범위 확장 | 사용자와 토론 → 해당 process .md 갱신 → Step 4 |
| [c] 범위 변경 | 사용자와 토론 → process .md + 빅픽처 페이즈 .md (필요 시 ADR 추가) 갱신 → Step 4 |
| [d] 새 페이즈 | 사용자와 토론 → 빅픽처 신규 페이즈 추가 + process .md 신규 → Step 4 |

설계 문서 갱신은 ddd-workshop 스킬 활용 권장:
- 빅픽처 갱신 → `/ddd-workshop:bigpicture`
- process-modeling 갱신·추가 → `/ddd-workshop:process-modeling`
- BC 분할 추가 → `/ddd-workshop:process-modeling --bc`

**Step 4. 계획 + 코드 작성**

작업 단위(이슈/티켓) 안에서 계획 → 코드. 이 단계의 구체적 내용(브랜치·테스트·PR 등)은 별도 워크플로 섹션 참조.

### 어긋남 방지 원칙

- **코드 변경 → 문서 갱신**이 아니라 **문서 합의 → 코드 변경** 순서를 지킨다.
- 코드가 문서와 어긋난 채 commit 되면 *둘 다 stale의 시작*.
- 작은 변경은 ADR 1장으로 박제, 큰 변경은 process .md/빅픽처 갱신.
```

### 7.2 영어 템플릿

(트리거 언어가 영어면 위 7.1 구조를 영어로 출력. 본 SKILL.md에는 반복 생략 — 트리거 시 동일 구조로 영어 작성)

## 8. Anti-patterns (절대 하지 말 것)

- **기존 워크플로 섹션을 덮어쓰기** — 항상 slot-in 또는 신규 섹션
- **Git/이슈/CI/테스트 정책 수정** — out-of-scope, 위치 참고만
- **충돌 발견 시 자동 해결** — 사용자 선택지 제시
- **설계 산출물 없는 상태에서 강제 설치** — 안내 + 사용자 강제 의사 확인
- **변경안 미리보기 없이 파일 갱신** — diff 보여주고 동의 필수
- **프로토콜 안에 구체 구현 가이드 (DB 스키마·라이브러리·패턴 등)** — 그건 모듈 README 또는 ADR
- **설계 문서 자체를 이 스킬에서 수정** — bigpicture/process-modeling 스킬 영역. 본 스킬은 안내만
- **트랙 자동 변경** — 트랙 A↔B 전환은 별도 마이그레이션 활동, 본 스킬 책임 X
- **CLAUDE.md가 `@AGENTS.md` import-only인데 거기 쓰기** — 항상 source 파일에만

## 9. 짧은 예시

### 시나리오 A — 워크플로 섹션 신설

```
사용자: "/implementation-protocol"

→ Step 1: 환경 스캔
   - 트랙 A 감지 (AGENTS.md 존재)
   - 기존 워크플로 섹션 없음
   - docs/eventstorming/ ✅ (11 페이즈)
   - docs/adr/ ❌ (없음)

→ Step 2: Install 모드

→ Step 3-A: 표준 텍스트 + ADR 부분 회색 처리 (없음)
   - 변경안 표시: AGENTS.md 뒤에 ## Implementation Protocol 추가

→ Step 4: 사용자 동의 → y

→ Step 5: 적용
```

### 시나리오 B — 기존 워크플로에 slot-in

```
사용자: "/implementation-protocol"

→ Step 1: 환경 스캔
   - 트랙 B 감지 (CLAUDE.md만 존재)
   - 기존 ## Development Workflow 발견 (단계 1~6 정의)
   - docs/eventstorming/ ✅
   - docs/adr/0001-bc-split-hr.md ✅

→ Step 2: Merge 모드

→ Step 3-B: slot-in 지점 식별
   - 단계 2 (브랜치 생성)와 3 (코드 작성) 사이
   - 변경안 diff 표시

→ Step 4: 사용자 동의 → y

→ Step 5: CLAUDE.md 갱신 완료
```

### 시나리오 C — 모순 발견

```
사용자: "/implementation-protocol"

→ Step 1: 환경 스캔
   - AGENTS.md Boundaries > Always do 에 "코드 먼저, docs는 PR 직전" 발견

→ Step 2: Conflict 모드

→ Step 3-D: 선택지 제시
   "충돌: 'docs는 PR 직전' 규칙과 본 프로토콜이 모순. A 대체 / B 부분수정 / C 그만두기?"
   → 사용자: B

→ 부분 수정 제안 — 기존 규칙은 "큰 변경 없는 경우" 한정으로 좁히고,
   범위 외 변경 시 docs 먼저 흐름 추가

→ Step 4: 사용자 동의 → y

→ Step 5: 적용
```

## 10. 한 줄로 정리

> **빅픽처/process-modeling/ADR이 있는 프로젝트에서, 매 코딩 세션이 *설계 문서 검토 → 범위 확인 → 일치하면 코드, 불일치면 설계 문서 먼저 갱신* 흐름을 자동으로 따르도록 AGENTS.md/CLAUDE.md에 박제하는 일회성 인스톨러. Git/이슈/CI/테스트는 손대지 않고, 기존 워크플로에 slot-in. 충돌은 사용자 선택지로 해소. 설치 후 상시 로드 컨텍스트로 작동.**
