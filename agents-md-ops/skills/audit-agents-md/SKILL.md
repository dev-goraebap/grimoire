---
name: audit-agents-md
description: >
  AGENTS.md와 관련 브릿지 파일(CLAUDE.md, .claude/CLAUDE.md,
  CLAUDE.local.md)을 모범 사례에 대조해 진단하고, 이슈를 보고한 뒤
  사용자 동의를 받아 선택적으로 개선한다. anti-pattern 감지(자명한 조언,
  linter 중복, 코드로 읽히는 내용, 오래된 경로, 크로스툴 중복, 개인
  설정 유출 등), 토큰 효율, 구조 체크, 레퍼런스 경로 검증을 수행.
  Triggers: "audit AGENTS.md", "check AGENTS.md", "review agent config",
  "AGENTS.md 검토", "규칙 점검", "에이전트 설정 진단", "/audit-agents-md".
  AGENTS.md를 수정한 뒤 품질을 확인하거나, 시간이 지나 규칙이 쌓였을
  때 정리가 필요할 때 사용.
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# audit-agents-md

AGENTS.md와 관련 브릿지 파일을 진단해 **이슈를 보고하고, 사용자 동의를 받아 선택적으로 개선**한다.

**핵심 원칙: 진단 → 보고 → 동의 질문 → 승인된 것만 적용.**

## 범위

**스캔 대상:**

| 파일 | 비고 |
|---|---|
| `AGENTS.md` | 메인 진단 대상 |
| `CLAUDE.md`, `.claude/CLAUDE.md` | Claude Code 브릿지 |
| `CLAUDE.local.md` | 개인 설정 (존재 시만) |

존재하는 파일만 검사. 하나도 없으면: "스캔할 파일이 없습니다. `/draft-agents-md`로 AGENTS.md를 먼저 생성하세요."

## 언어 정책

사용자 대면 보고(이슈 설명, 제안 메시지, 요약)는 **사용자 언어**. 파일 본문을 수정할 때는 **기존 언어 유지** (AGENTS.md가 한국어로 적혀있으면 수정도 한국어).

## 진단 항목

### Anti-pattern (A)

| ID | 이름 | Severity | 기준 |
|---|---|---|---|
| A1 | Self-evident advice | Medium | "write clean code", "follow best practices" 같이 행동 변화를 주지 못하는 문구 |
| A2 | Linter/formatter overlap | Medium | indentation·세미콜론 등 Prettier/Biome/ESLint이 이미 처리하는 스타일 규칙 |
| A3 | Code-readable content | Medium | `package.json` scripts 복붙, 기술 스택 나열, 디렉토리 트리 붙여넣기 |
| A4 | Stale references | High | 존재하지 않는 파일/디렉토리 언급 |
| A5 | Cross-tool duplication | Medium | AGENTS.md와 CLAUDE.md에 같은 내용이 중복 |
| A6 | Malformed Boundaries | Medium | `## Boundaries` 존재하지만 3-tier(Always/Ask/Never) 서브헤딩 누락 |
| A7 | Private settings in public file | High | AGENTS.md에 응답 언어, 개인 URL, 개인 습관 포함됨 |

### Token efficiency (T)

| ID | 항목 | 기준 |
|---|---|---|
| T1 | Total length | AGENTS.md 150줄 이하 권장, 300 경고, 500+ 위험 |
| T2 | Section balance | 한 섹션이 전체의 40% 초과 시 Medium 경고 |
| T3 | Bridge inefficiency | CLAUDE.md가 `@AGENTS.md`/`@../AGENTS.md` 한 줄이 아니라 중복 내용을 담음 |

### Structure (S)

| ID | 항목 | Severity | 기준 |
|---|---|---|---|
| S1 | Missing Boundaries | Low | `## Boundaries` 섹션 없음 — `/refine-boundaries`로 누적 시작 추천 |
| S2 | Missing bridge | Medium | AGENTS.md는 있지만 `CLAUDE.md` / `.claude/CLAUDE.md` 둘 다 없음 |

### References (R)

| ID | 항목 | Severity | 기준 |
|---|---|---|---|
| R1 | Dead reference paths | High | `## References` 섹션의 경로 중 디스크에 실제로 없는 것 |

## 워크플로우

### Step 1: 파일 수집

스캔 대상 파일들을 읽고 줄 수, 근사 토큰(줄 × 3)을 계산. 내용을 메모리에 유지해 Step 2에서 반복 파싱 없이 사용.

### Step 2: 체크리스트 실행

모든 anti-pattern / token / structure / references 항목을 순회.

**A4 (stale refs)**: 파일 내용에서 경로 토큰 추출 — 백틱 경로(`` `src/foo.ts` ``), 마크다운 링크 타깃(`[x](path)`), 리스트 내 경로. URL은 제외. 각 경로가 디스크에 존재하는지 확인.

**A5 (cross-tool duplication)**: AGENTS.md와 CLAUDE.md 양쪽에 있는 섹션·규칙 문장 비교. CLAUDE.md가 한 줄짜리 브릿지면 자동 통과.

**A7 (private settings)**: AGENTS.md에서 "항상 한국어로 응답", "내 X 선호" 등 개인 대명사/개인 선호 표현 탐지.

**R1**: `## References` 섹션 존재 시만 실행. 없으면 skip.

### Step 3: 진단 보고

Severity High → Medium → Low 순으로 정렬해 보고:

```
📋 AGENTS.md 진단 보고

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
| S2 (missing bridge) | `/draft-agents-md`의 브릿지 단계 재실행 |
| A6 (malformed Boundaries) | 수동 재구성 필요 (restructure 기능은 향후 릴리스) |
| A7 (private settings) | 해당 내용을 `CLAUDE.local.md`로 이동 권장 |
| A5 (cross-tool duplication) | 중복 내용은 AGENTS.md에만 두고 CLAUDE.md는 `@AGENTS.md` 한 줄로 |

## 금지 행동

- **사용자 동의 없이 파일 수정** — 항상 선택을 받은 뒤 적용
- **이슈가 없을 때 억지로 문제 만들기** — "모두 통과"를 정직하게 보고
- **파일 전체 재작성 제안** — 항상 부분 수정만 제안
- **fix-all을 기본값으로 제시** — 사용자가 명시적으로 "전부 적용" 선택해야만
- **존재하지 않는 파일 생성** — 이 스킬은 기존 파일 수정 전용
