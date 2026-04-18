---
name: audit-public-rules
description: >
  공개 지침 파일(트랙 A: 루트 `AGENTS.md` + Claude/Gemini 브릿지 / 트랙 B:
  루트 `CLAUDE.md`)을 모범 사례에 대조해 진단하고, 이슈를 보고한 뒤 사용자
  동의를 받아 선택적으로 개선한다. 트랙은 루트 파일 존재로 자동 감지하며
  보고 헤더에 `Detected track: X` 형태로 명시(사용자가 1초에 반박 가능).
  anti-pattern 감지(자명한 조언, linter 중복, 코드로 읽히는 내용, 오래된
  경로, 크로스툴 중복, 개인 설정 유출 등), 토큰 효율, 구조 체크, 레퍼런스
  경로 검증을 수행. 둘 다 본격 규칙으로 존재하면 트랙 마이그레이션 옵션도
  제시.
  Triggers: "audit AGENTS.md", "check AGENTS.md", "audit CLAUDE.md",
  "review agent config", "AGENTS.md 검토", "CLAUDE.md 검토",
  "공개 지침 점검", "팀 규칙 진단", "에이전트 설정 진단",
  "/audit-public-rules".
  공개 지침 파일을 수정한 뒤 품질을 확인하거나, 시간이 지나 규칙이
  쌓였을 때 정리가 필요할 때 사용.
metadata:
  author: dev-goraebap
  version: "0.2.0"
---

# audit-public-rules

공개 지침 파일을 진단해 **이슈를 보고하고, 사용자 동의를 받아 선택적으로 개선**한다. 트랙 A(`AGENTS.md` + 브릿지) / 트랙 B(`CLAUDE.md` 단독) 모두 지원하며, 트랙은 루트 파일 존재로 자동 감지한다.

**핵심 원칙: 진단 → 보고 → 동의 질문 → 승인된 것만 적용.**

## 범위

**스캔 대상 (트랙별):**

| 트랙 | 파일 | 비고 |
|---|---|---|
| A | `AGENTS.md` | 메인 진단 대상 (source-of-truth) |
| A | `CLAUDE.md`, `.claude/CLAUDE.md` | Claude Code 브릿지 |
| B | `CLAUDE.md` | 메인 진단 대상 (source-of-truth, 브릿지 아님) |
| 공통 | `CLAUDE.local.md` | 개인 설정 (존재 시만) |

존재하는 파일만 검사. 두 트랙 source 파일이 모두 없으면: "스캔할 파일이 없습니다. `/draft-public-rules`로 공개 지침을 먼저 생성하세요."

## 언어 정책

사용자 대면 보고(이슈 설명, 제안 메시지, 요약)는 **사용자 언어**. 파일 본문을 수정할 때는 **기존 언어 유지** (AGENTS.md가 한국어로 적혀있으면 수정도 한국어).

## 진단 항목

"트랙" 컬럼: `A+B` = 두 트랙 공통, `A only` = 트랙 A에서만 적용 (트랙 B는 스킵).

### Anti-pattern (A)

| ID | 이름 | Severity | 트랙 | 기준 |
|---|---|---|---|---|
| A1 | Self-evident advice | Medium | A+B | "write clean code", "follow best practices" 같이 행동 변화를 주지 못하는 문구 |
| A2 | Linter/formatter overlap | Medium | A+B | indentation·세미콜론 등 Prettier/Biome/ESLint이 이미 처리하는 스타일 규칙 |
| A3 | Code-readable content | Medium | A+B | `package.json` scripts 복붙, 기술 스택 나열, 디렉토리 트리 붙여넣기 |
| A4 | Stale references | High | A+B | 존재하지 않는 파일/디렉토리 언급 |
| A5 | Cross-tool duplication | Medium | **A only** | AGENTS.md와 CLAUDE.md에 같은 내용이 중복 (트랙 B는 CLAUDE.md가 source라 무관) |
| A6 | Malformed Boundaries | Medium | A+B | `## Boundaries` 존재하지만 3-tier(Always/Ask/Never) 서브헤딩 누락 |
| A7 | Private settings in public file | High | A+B | source 파일에 응답 언어, 개인 URL, 개인 습관 포함됨 |

### Token efficiency (T)

| ID | 항목 | 트랙 | 기준 |
|---|---|---|---|
| T1 | Total length | A+B | source 파일 150줄 이하 권장, 300 경고, 500+ 위험 |
| T2 | Section balance | A+B | 한 섹션이 전체의 40% 초과 시 Medium 경고 |
| T3 | Bridge inefficiency | **A only** | CLAUDE.md가 `@AGENTS.md`/`@../AGENTS.md` 한 줄이 아니라 중복 내용을 담음 |

### Structure (S)

| ID | 항목 | Severity | 트랙 | 기준 |
|---|---|---|---|---|
| S1 | Missing Boundaries | Low | A+B | `## Boundaries` 섹션 없음 — `/refine-boundaries`로 누적 시작 추천 |
| S2 | Missing bridge | Medium | **A only** | AGENTS.md는 있지만 `CLAUDE.md` / `.claude/CLAUDE.md` 둘 다 없음 (트랙 B는 브릿지 자체가 불필요) |

### References (R)

| ID | 항목 | Severity | 기준 |
|---|---|---|---|
| R1 | Dead reference paths | High | `## References` 섹션의 경로 중 디스크에 실제로 없는 것 |

## 워크플로우

### Step 0: 트랙 자동 감지

루트에서 다음 순서로 source-of-truth 결정:

| 케이스 | 판정 | 동작 |
|---|---|---|
| `AGENTS.md`만 존재 | 트랙 A | Step 1로 진행 |
| `CLAUDE.md`만 존재 | 트랙 B | Step 1로 진행 |
| 둘 다 + `CLAUDE.md`가 import-only(`@AGENTS.md` 한 줄, 혹은 매우 짧은 import 블록) | 트랙 A | 자동 판정, 질문 생략 |
| 둘 다 + `CLAUDE.md`에 본격 규칙(섹션 헤딩 다수) | 사용자 질문 | "어느 게 source-of-truth인가요? a) AGENTS.md (CLAUDE.md는 따로 검사) b) CLAUDE.md (AGENTS.md는 무시) c) **통합 마이그레이션** (둘 중 한 쪽으로 일원화 — `/draft-public-rules` 재실행 안내)" |
| 둘 다 없음 | 종료 | "스캔할 파일이 없습니다. `/draft-public-rules`로 공개 지침을 먼저 생성하세요." |

판정된 트랙은 Step 3 보고 헤더에 `Detected track: X` 형태로 명시 → 사용자가 1초에 반박 가능.

### Step 1: 파일 수집

Step 0에서 결정된 트랙에 따라 스캔 대상 파일들을 읽고 줄 수, 근사 토큰(줄 × 3)을 계산. 내용을 메모리에 유지해 Step 2에서 반복 파싱 없이 사용.

- 트랙 A: `AGENTS.md` + 존재하는 브릿지(`CLAUDE.md`, `.claude/CLAUDE.md`) + `CLAUDE.local.md`
- 트랙 B: `CLAUDE.md` + `CLAUDE.local.md`

### Step 2: 체크리스트 실행

모든 anti-pattern / token / structure / references 항목을 순회.

**A4 (stale refs)**: 파일 내용에서 경로 토큰 추출 — 백틱 경로(`` `src/foo.ts` ``), 마크다운 링크 타깃(`[x](path)`), 리스트 내 경로. URL은 제외. 각 경로가 디스크에 존재하는지 확인.

**A5 (cross-tool duplication, 트랙 A 한정)**: AGENTS.md와 CLAUDE.md 양쪽에 있는 섹션·규칙 문장 비교. CLAUDE.md가 한 줄짜리 브릿지면 자동 통과. 트랙 B에서는 항목 자체를 skip.

**A7 (private settings)**: source 파일(트랙 A: AGENTS.md / 트랙 B: CLAUDE.md)에서 "항상 한국어로 응답", "내 X 선호" 등 개인 대명사/개인 선호 표현 탐지.

**R1**: `## References` 섹션 존재 시만 실행. 없으면 skip.

### Step 3: 진단 보고

Severity High → Medium → Low 순으로 정렬해 보고:

```
📋 공개 지침 진단 보고

Detected track: A (AGENTS.md as source-of-truth + bridge). 다른 트랙으로 보시려면 알려주세요.

파일: AGENTS.md (187줄, ~561 토큰)
파일: .claude/CLAUDE.md (1줄, @../AGENTS.md 브릿지)

발견된 이슈 (5개)

🔴 [A4] Stale reference
   Line 32: `src/utils/auth.ts` — 파일이 존재하지 않음
   → 제안: 해당 줄 제거 또는 실제 경로로 갱신

🔴 [R1] Dead reference path
   Line 78: `docs/old-prd.md` — 파일이 존재하지 않음
   → 제안: `## References`에서 제거

🟡 [A2] Linter overlap
   Lines 45-48: "2-space indent, 세미콜론 필수" — .prettierrc가 자동 처리
   → 제안: 4줄 삭제

🟡 [A1] Self-evident advice
   Line 71: "항상 clean code 작성"
   → 제안: 삭제 (구체적 행동 지시가 아님)

🟢 [S1] Missing Boundaries
   `## Boundaries` 섹션 없음
   → 제안: `/refine-boundaries`로 에이전트 실수에서 규칙 누적 시작

통과한 항목 (8개)
✅ 브릿지 파일 존재
✅ 섹션 균형 40% 이내
✅ Private settings 유출 없음
...
```

**이슈가 없으면:** "✅ 모두 통과 (N개 항목 확인)"만 보고하고 종료. Step 4 생략.

### Step 4: 개선 여부 질문

```
이슈가 발견됐습니다. 개선할까요?

  1. 예 — 수정할 항목 선택
  2. 아니오 — 보고만 남기고 종료
```

**"아니오"**면 여기서 종료.

### Step 5: 항목 선택 및 적용

```
어떤 항목을 적용할까요?
번호로 선택(예: "1,3,4") 또는 "전부 적용"
```

선택된 항목만 수정:
- 각 수정에 대해 **before/after diff**를 보여준 뒤 적용 (여러 개면 일괄 diff로)
- 사용자 동의 없이 원본을 재작성하지 않는다

완료 후 갱신된 줄 수/토큰 표시:

```
✅ 4개 항목 적용
   AGENTS.md: 187줄 → 171줄 (-16줄, ~48 토큰 절약)
```

## 다른 스킬과의 연계

진단 결과에 따라 추천:

| 발견 | 추천 |
|---|---|
| S1 (missing Boundaries) | `/refine-boundaries` 실행 |
| S2 (missing bridge, 트랙 A) | `/draft-public-rules`의 브릿지 단계(Step 7) 재실행 |
| A6 (malformed Boundaries) | 수동 재구성 필요 (restructure 기능은 향후 릴리스) |
| A7 (private settings) | 해당 내용을 `CLAUDE.local.md`로 이동 권장 |
| A5 (cross-tool duplication, 트랙 A) | 중복 내용은 AGENTS.md에만 두고 CLAUDE.md는 `@AGENTS.md` 한 줄로 |
| 트랙 마이그레이션 (둘 다 본격 규칙으로 존재) | `/draft-public-rules`로 새로 생성하여 한 트랙으로 일원화. 기존 파일은 백업 후 통합 |

## 금지 행동

- **사용자 동의 없이 파일 수정** — 항상 선택을 받은 뒤 적용
- **이슈가 없을 때 억지로 문제 만들기** — "모두 통과"를 정직하게 보고
- **파일 전체 재작성 제안** — 항상 부분 수정만 제안
- **fix-all을 기본값으로 제시** — 사용자가 명시적으로 "전부 적용" 선택해야만
- **존재하지 않는 파일 생성** — 이 스킬은 기존 파일 수정 전용
- **트랙을 사용자 동의 없이 변경** — 자동 감지 결과는 보고 헤더에 명시하되, 다른 트랙으로 다시 검사하려면 사용자가 명시 요청해야 함
- **트랙 B에서 트랙 A 한정 항목(S2/A5/T3) 강요** — 해당 항목은 트랙 B에서 항상 skip (보고에서도 등장 안 함)
