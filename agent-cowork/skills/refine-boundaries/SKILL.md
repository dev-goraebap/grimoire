---
name: refine-boundaries
description: >
  AGENTS.md의 `## Boundaries` 섹션에 규칙을 한 번에 한 개씩 누적한다.
  사용자가 에이전트 실수를 지적하거나 규칙을 명시적으로 선언할 때 자동
  발화하거나 슬래시로 호출. 3-tier(Always do / Ask first / Never do)
  중 적절한 곳에 분류하고, 토픽 특정적이면 해당 섹션(Code Style, Testing,
  Git Workflow 등)에 인라인으로, 크로스커팅이면 Boundaries에 배치한다.
  기존 규칙은 건드리지 않는 **additive-only** 스킬.
  Triggers: "refine boundaries", "add boundary", "add never do",
  "add always do", "다시는 이렇게 하지 마", "항상 ~ 먼저 해",
  "에이전트가 실수했어", "/refine-boundaries".
  Auto-trigger: 사용자가 교정 발화를 할 때 ("the agent shouldn't have",
  "don't do X", "never do Y", "always do Z first" 등).
  에이전트 실수를 본 직후, 또는 사용자가 새 규칙을 선언할 때 사용.
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# refine-boundaries

AGENTS.md의 `## Boundaries` 섹션을 **프로젝트 수명 동안 지속적으로 성장시키는** 스킬. 에이전트가 실수할 때마다 교정 내용을 이 섹션에 누적해두면, 다음 에이전트가 같은 실수를 반복하기 전에 이 섹션을 읽고 참고한다.

## 철학

- **Error-driven growth.** 사용자가 프로젝트 초반에 모든 규칙을 완벽히 알 수는 없다. 에이전트 실수를 보고 나서 하나씩 추가하는 게 자연스러운 성장 방식.
- **Additive only.** 기존 규칙을 제거·재작성하지 않는다. 정리는 사용자가 수동으로.
- **정확한 자리 배치.** 규칙이 특정 토픽에 속하면 그 섹션에 인라인으로, 모든 작업에 적용되면 Boundaries에 크로스커팅으로.

## 범위

**In scope:**
- 규칙 1개 추가 (auto-trigger 또는 슬래시)
- 3-tier 분류 (Always / Ask / Never)
- 인라인 vs 크로스커팅 배치 결정
- `## Boundaries` 섹션 미존재 시 신규 생성

**Out of scope:**
- 기존 규칙 제거/수정 (사용자가 수동으로)
- 잘못 분류된 섹션 재구성 (후속 스킬 또는 수동)
- 여러 규칙 일괄 추가 (한 번의 호출 = 한 규칙)
- 자동 실수 감지 (Stop hook 연동은 별도 트랙)

## 가드레일

| # | 확인 | 실패 시 |
|---|---|---|
| 1 | `AGENTS.md`가 프로젝트 루트에 존재 | "AGENTS.md가 없습니다. `/draft-agents-md`로 먼저 생성하세요." |

## 언어 정책

사용자 대면 메시지는 **사용자 언어**. AGENTS.md에 기록하는 규칙 본문도 **사용자 언어** (draft-agents-md와 동일 정책). 단, 구조적 요소는 영어 고정:
- 섹션 헤딩(`## Boundaries`), 서브헤딩(`### Always do` / `### Ask first` / `### Never do`)
- tier prefix(`**ALWAYS**`, `**ASK FIRST**`, `**NEVER**`)

## 워크플로우

### Step 1: 진입 모드 결정

| 진입 신호 | 모드 |
|---|---|
| `/refine-boundaries` 명시 호출 | Slash → Step 2 |
| 교정 발화 감지 ("다시는 X 하지마", "never Y" 등) | Auto → Step 3 (바로 분류) |
| 명시적 규칙 선언 ("항상 X 먼저", "X는 금지") | Auto → Step 3 |

**Auto-trigger 원칙:** auto 모드에서는 인터뷰 생략. 사용자가 방금 말한 내용을 곧바로 분류·배치한다.

### Step 2: 규칙 입력 (slash 모드)

```
어떤 규칙을 추가할까요? 명령형 한 줄로:

  예:
    - "Never commit .env 파일"
    - "커밋 전 항상 pnpm test 실행"
    - "새 GitHub issue 만들기 전 확인"
```

### Step 3: Tier 분류

결정 트리:

1. 위반 시 **되돌릴 수 없는 피해**(데이터 손실, 공개된 실수, 시크릿 유출)?
   → **Never do**
2. **가역적이지만 외부에 보이는 행동**(PR, 이슈, 메시지, 외부 API)?
   → **Ask first**
3. 특정 작업의 **기본 행동**(테스트 실행, 상태 확인, 입력 검증)?
   → **Always do**

여러 개 해당하면 **강한 tier 우선** (Never > Ask > Always).

```
제안:

  Tier: Never do
  이유: 위반 시 되돌릴 수 없는 피해 (시크릿이 커밋됨)

맞나요? (y / 다른 tier)
```

### Step 4: 인라인 vs 크로스커팅 결정

**결정 질문:** *"이 규칙이 **한 종류의 작업을 어떻게 하는지**에 관한 것인가, 아니면 **어떤 행동이든 언제 멈춰 확인해야 하는지**에 관한 것인가?"*

| 규칙 성격 | 배치 |
|---|---|
| "코드 작성 시 ~" — 토픽 범위 | `## Code Style` 등에 인라인 |
| "테스트 작성 시 DB mock 금지" — 토픽 | `## Testing` 인라인 |
| "git 작업 시 main 브랜치 force-push 금지" — 토픽 | `## Git Workflow` 인라인 |
| "시크릿 커밋 금지" — 모든 행동 | `## Boundaries > Never do` |
| "파괴적 작업 전 확인" — 크로스커팅 | `## Boundaries > Ask first` |

토픽에 걸리는 경우 해당 섹션 존재 확인:

| 조건 | 처리 |
|---|---|
| 토픽 섹션 존재 | 그 섹션 끝에 tier prefix와 함께 인라인 추가 |
| 토픽 섹션 미존재 | 사용자에게 선택 제시: "인라인(섹션 신규 생성) / Boundaries에 배치" |
| 크로스커팅 | `## Boundaries`의 해당 sub-tier 끝에 추가 |

배치 제시:

```
배치: ## Git Workflow 에 인라인 (토픽 특정적 autonomy 규칙)

  ## Git Workflow
  ...
  - **NEVER** main 브랜치에 force-push

적용? (y / Boundaries로 이동)
```

### Step 5: 적용

- **인라인**: 해당 섹션 끝에 한 줄로 추가. Tier prefix를 볼드로:
  - `- **ALWAYS** 커밋 전 pnpm test 실행`
  - `- **ASK FIRST** 새 마이그레이션 파일 생성`
  - `- **NEVER** main 브랜치에 force-push`
- **크로스커팅**: `## Boundaries`의 해당 sub-section 끝에 한 줄로 추가 (tier prefix는 불필요 — sub-heading이 이미 암시).
- 기존 규칙 순서/내용 변경 금지.

### Step 6: Boundaries 섹션 신규 생성 (필요 시)

크로스커팅 규칙인데 `## Boundaries`가 없으면, 파일 끝에 다음 구조로 생성:

```markdown
## Boundaries

### Always do

### Ask first

### Never do

<!-- 에이전트 실수가 있을 때마다 여기 누적하세요. Error-driven growth. -->
```

그 후 첫 규칙을 해당 tier에 추가.

## 금지 행동

- 사용자 명시 요청 없이 **기존 규칙 제거** (이 스킬은 additive)
- 사용자가 직접 작성한 규칙 문구 재작성 (tier 재분류만 허용)
- **3-tier 구조 평탄화** — 항상 Always/Ask/Never 서브헤딩 보존
- **한 번의 호출에서 여러 규칙 배치 추가** (1 invocation = 1 rule, 분류의 신중성 유지)
- 토픽 섹션의 기존 규칙 순서 재배열
