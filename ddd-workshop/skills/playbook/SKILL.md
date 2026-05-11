---
name: playbook
description: >
  ddd-workshop 파이프라인의 **0번 인스톨러** — 사용자 프로젝트의 공개 지침
  파일(트랙 A: 루트 `AGENTS.md` / 트랙 B: 루트 `CLAUDE.md`)에
  *ddd-workshop 스킬들을 언제 어떻게 호출할지* 안내하는 섹션을 박제한다.
  설치 후 상시 로드 컨텍스트로 작동 — 매 세션이 자동으로 "지금 어느 스킬을
  쓸 단계인가"를 안다. 박제하는 내용: (1) ddd-workshop 설치 방법
  (Claude Code 플러그인 + `npx skills add` 두 가지) — 사용자 외 협업자가
  ddd-workshop 미설치 환경일 수 있으니 필수. (2) 각 스킬(domain-classroom·
  eventstorming·software-design·tactical-design) 호출 시점·트리거 발화 예시·
  산출물 위치. (3) 자주 발생하는 상황 → 호출 매핑 (신규 프로젝트 시작 /
  새 페이즈 분석 / BC 식별 / 결정 박제 / 코드 작성 직전 / 코드 작성 중
  발견 등). 기존 워크플로(Git/이슈/CI/테스트/코드 스타일)는 손대지 않고,
  ddd-workshop 사용 가이드만 추가. 기존 섹션이 있으면 slot-in 제안, 없으면
  신규 섹션 추가. 충돌 시 사용자 선택지. 트랙 A/B 자동 감지. Install/Merge/
  Update/Conflict 4 모드. 한 번 설치 후 재호출은 갱신·재정렬 시에만.
  Triggers — "playbook 설치", "ddd 워크플로 박제", "AGENTS.md에 ddd 가이드",
  "팀에 ddd-workshop 공유", "/playbook".
allowed-tools: Read Write Edit Glob Grep
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# playbook 스킬

ddd-workshop의 **0번 인스톨러**. 사용 가이드를 공개 지침 파일에 박제해 매 세션이 자동으로 *언제 어느 스킬을 쓸지* 알게 한다.

## 1. 정체성

ddd-workshop은 4개 호출형 스킬(`domain-classroom`·`eventstorming`·`software-design`·`tactical-design`)로 구성된다. 사용자가 매번 "어느 스킬을 쓸지" 결정하기엔 인지 부담. 이 스킬은 그 *오케스트레이션 가이드*를 AGENTS.md/CLAUDE.md에 박제해 **컨텍스트 엔지니어링**으로 해결.

| | 다른 ddd-workshop 스킬 (1~4번) | playbook (0번) |
|---|---|---|
| 호출 패턴 | 작업마다 명시 호출 | **한 번 설치 → 상시 로드** |
| 산출물 | docs/eventstorming/, docs/adr/ | **AGENTS.md / CLAUDE.md 한 섹션** |
| 작동 시점 | 호출 시 | **매 세션 자동** (컨텍스트 엔지니어링) |
| 역할 | 도구 | **오케스트레이션 가이드** |

## 2. 박제하는 내용 (3 블록)

### 2.1 설치 가이드 (필수)

사용자 외 협업자·다른 에이전트가 ddd-workshop 미설치 환경일 수 있다. 박제 섹션에 두 가지 설치 방법 명시:

```markdown
### ddd-workshop 설치

#### Claude Code 플러그인
/plugin marketplace add dev-goraebap/grimoire
/plugin install ddd-workshop@grimoire

#### 그 외 에이전트 (`skills.sh`)
npx skills add dev-goraebap/grimoire --skill domain-classroom --skill eventstorming --skill software-design --skill tactical-design --skill playbook
```

### 2.2 스킬 호출 가이드 (필수)

각 스킬의 *호출 시점·트리거 예시·산출물 위치* 박제:

```markdown
| 스킬 | 호출 시점 | 산출물 |
|---|---|---|
| domain-classroom | 낯선 도메인 학습 필요 시 | docs/learning-notes/{domain}-classroom.md |
| eventstorming | 도메인 분석 사이클 (Big Picture / Process / BC+Subdomain 후보) | docs/eventstorming/ |
| software-design | 구조적 결정 박제 필요 시 (폴더 구조·CQRS·BC 통합 등) | docs/adr/{NNNN}-{slug}.md |
| tactical-design | 한 워크플로 코드 작성 직전 plan | (in-conversation, 코드가 진실) |
```

### 2.3 상황 → 스킬 매핑 (필수)

자주 발생하는 상황을 *호출 결정 표*로 박제:

```markdown
### 상황별 스킬 호출

| 상황 | 호출 |
|---|---|
| 신규 프로젝트 시작 — 낯선 도메인 | /domain-classroom → /eventstorming |
| 신규 프로젝트 시작 — 친숙한 도메인 | /eventstorming (Big Picture Initial) |
| 새 페이즈 추가 | /eventstorming (모드 자동 감지) |
| 한 페이즈 깊게 분석 | /eventstorming → "P{N} 깊게" |
| 모든 페이즈 누적 끝, BC 정리 | /eventstorming → "BC 식별" |
| 구조적 결정 박제 (폴더 구조·CQRS·BC 통합) | /software-design |
| 한 워크플로 코드 작성 직전 | /tactical-design "P{N}/{workflow}" |
| 코드 작성 중 새 요구사항 발견 | /eventstorming (Cycle 모드) → /software-design (필요시) → /tactical-design |
| 설계 ↔ 코드 어긋남 발견 | /eventstorming Cycle 모드로 설계 먼저 갱신 |
```

## 3. 박제하지 않는 영역 (Out of scope)

ddd-workshop 사용 가이드만 박제. **다음은 절대 손대지 않음**:
- Git workflow (브랜치·커밋·머지 정책)
- 이슈 트래킹 (Linear/Jira/GitHub Issues)
- PR 정책 (리뷰어·승인·머지 전략)
- CI/CD 파이프라인
- 테스트 정책
- 코드 스타일·린트
- 일반 보안 규약

이들이 기존 워크플로에 있으면 **위치 참고용으로만 읽고**, ddd-workshop 가이드를 *그 흐름의 적절한 지점*에 끼워넣을 뿐.

## 4. 가드레일

| # | 확인 | 실패 시 |
|---|---|---|
| 1 | 공개 지침 파일(`AGENTS.md` 또는 `CLAUDE.md`)이 프로젝트 루트에 존재 | "공개 지침 파일이 없습니다. `agent-cowork:draft-public-rules`로 먼저 생성하세요." |
| 2 | 둘 다 존재 시 트랙 결정 | AGENTS.md > CLAUDE.md 우선. `CLAUDE.md`가 `@AGENTS.md` 한 줄(import-only)이면 AGENTS.md가 source |
| 3 | 기존 ddd-workshop 가이드 섹션 중복 감지 | Update 모드로 전환 — 덮어쓰기 X, diff 보여주고 동의 |
| 4 | 충돌 워크플로 발견 ("코드부터, 설계는 나중에" 류) | Conflict 모드 — 사용자 선택지 |

## 5. 언어 정책

사용자 대면 메시지·박제 본문은 **사용자 언어**. 단 구조적 요소는 영어 고정:
- 섹션 헤딩 (예: `## DDD Workflow`, `## ddd-workshop`)
- 단계 라벨

## 6. 워크플로우

### Step 1 — 환경 스캔

| 스캔 대상 | 추출 |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | 트랙 결정 + 기존 워크플로 섹션 흔적 + 기존 ddd-workshop 가이드 |
| `docs/eventstorming/` | 빅픽처/process 산출물 존재 여부 (가이드에 반영) |
| `docs/adr/` | ADR 존재 여부 |

### Step 2 — 모드 결정

| 모드 | 조건 | 동작 |
|---|---|---|
| **Install** | 워크플로 섹션 없음 + 가이드 섹션 없음 | 신규 섹션 추가 (Step 3-A) |
| **Merge** | 기존 워크플로 섹션 있음 + 가이드 섹션 없음 | 기존 흐름에 slot-in 제안 (Step 3-B) |
| **Update** | 가이드 섹션 이미 있음 | 변경 diff 보여주고 동의 (Step 3-C) |
| **Conflict** | 모순되는 기존 규칙 발견 | 선택지 제시 (Step 3-D) |

### Step 3-A — Install 모드 (신규 섹션)

표준 텍스트 (7장) 기반으로 신규 섹션 작성. 위치:
- 트랙 A (AGENTS.md): 새 `## DDD Workflow` 섹션
- 트랙 B (CLAUDE.md): 동일

전체 변경안 표시 → 동의 → 파일 갱신.

### Step 3-B — Merge 모드 (slot-in)

기존 워크플로 단계를 분석하여 *DDD 가이드가 들어갈 자연 지점* 식별:

| 기존 단계 패턴 | Slot-in 지점 |
|---|---|
| `1. 이슈 확인 → 2. 브랜치 생성 → 3. 코드` | 2.5에 "관련 docs/eventstorming/, ADR 읽기" + 2.6에 "scope 점검" |
| `1. 요구사항 분석 → 2. 설계 → 3. 구현` | 2 단계 안에 ddd-workshop 스킬 호출 안내 + 2와 3 사이 tactical-design |
| Boundaries 인라인 | 새 bullet 추가 |

slot-in diff (`+` 라인) 표시 → 동의.

### Step 3-C — Update 모드

기존 가이드 ↔ 현재 프로젝트 상태(새 ADR·새 스킬 버전) 차이 식별:
- 새 스킬 추가됨 → 호출 매핑 표에 추가
- 새 산출물 경로 → 박제 경로 갱신
- 사용자 요청 변경

diff 보여주고 동의.

### Step 3-D — Conflict 모드

모순 예:
- "코드부터, 설계는 PR 직전"
- "설계 문서는 보조 — 코드가 진실"
- "ADR은 큰 결정에만 — 일상 결정은 그냥 코드"

자동 변경 X. 선택지:
```
⚠️ 충돌 발견: "{원문}" — DDD 가이드와 모순.
A. 기존 규칙 대체
B. 부분 수정 — 기존 규칙 유지하되 일부 조정 제안
C. 그만두기
```

### Step 4 — 사용자 동의

변경안 전체 표시 → 사용자 명시 동의(`y` 또는 명시 발화) 후 적용. 부분 동의 가능.

### Step 5 — 적용 + 후속 안내

파일 갱신 후:
> "playbook 설치 완료. 이후 모든 세션은 이 가이드를 자동으로 따릅니다.
>  ddd-workshop 스킬 추가/갱신 시 `/playbook` 재호출."

## 7. 표준 박제 텍스트 (사용자 언어)

### 7.1 한국어 템플릿

```markdown
## DDD Workflow (ddd-workshop 사용 가이드)

이 프로젝트는 [ddd-workshop](https://github.com/dev-goraebap/grimoire)으로 DDD/EventStorming을 운영합니다.
스킬 미설치 환경(다른 에이전트·동료)일 수 있으므로 설치 방법부터 박제합니다.

### 설치

#### Claude Code 플러그인
```
/plugin marketplace add dev-goraebap/grimoire
/plugin install ddd-workshop@grimoire
```

#### 그 외 에이전트 (`skills.sh` / agentskills.io 표준)
```bash
npx skills add dev-goraebap/grimoire --skill domain-classroom --skill eventstorming --skill software-design --skill tactical-design --skill playbook
```

### 스킬 라인업

| 스킬 | 역할 | 산출물 |
|---|---|---|
| `/domain-classroom` | 낯선 도메인 학습 | docs/learning-notes/ |
| `/eventstorming` | Big Picture · Process Modeling · BC+Subdomain 후보 식별 (자동 모드 감지) | docs/eventstorming/ |
| `/software-design` | 구조적 결정 박제 (ADR) | docs/adr/{NNNN}-{slug}.md |
| `/tactical-design` | 한 워크플로 코드 작성 직전 plan | (in-conversation, 코드가 진실) |
| `/playbook` | 이 가이드 자체 (한 번 설치 후 재호출은 갱신 시에만) | AGENTS.md/CLAUDE.md 한 섹션 |

### 상황별 호출

| 상황 | 호출 |
|---|---|
| 신규 프로젝트 — 낯선 도메인 | `/domain-classroom` → `/eventstorming` |
| 신규 프로젝트 — 친숙한 도메인 | `/eventstorming` (자동 Big Picture Initial) |
| 새 페이즈 분석 | `/eventstorming` (자동 모드 감지) |
| 한 페이즈 깊게 | `/eventstorming` → "P{N} 깊게" |
| 모든 페이즈 누적 끝, BC 정리 | `/eventstorming` → "BC 식별" |
| 구조적 결정 박제 (폴더 구조·CQRS·BC 통합 등) | `/software-design` |
| 한 워크플로 코드 작성 직전 | `/tactical-design "P{N}/{workflow}"` |
| 코드 작성 중 새 요구사항 발견 | `/eventstorming Cycle` → 필요 시 `/software-design` → `/tactical-design` |
| 설계 ↔ 코드 어긋남 발견 | `/eventstorming Cycle`로 설계 먼저 갱신 |

### 원칙

- **문서 합의 → 코드 변경** 순서. 코드 먼저 짜고 문서 나중에 정리 X.
- 설계 산출물이 진실. 코드와 어긋나면 *문서 합의*가 우선.
- 각 스킬은 자신의 책임 범위 안에서만 작동. 다른 영역(Git/이슈/CI/테스트/스타일)은 별도 워크플로.
```

### 7.2 영어 템플릿

(영어 트리거 시 위 7.1 구조를 영어로 출력 — SKILL.md에서 반복 생략)

## 8. Anti-patterns

- **Git/이슈/CI/테스트/스타일 정책 수정** — out-of-scope, 위치 참고만
- **기존 워크플로 섹션 덮어쓰기** — 항상 slot-in 또는 신규 섹션
- **설치 가이드 누락** — 다른 협업자 미설치 환경 대비 필수
- **충돌 발견 시 자동 해결** — 사용자 선택지 제시
- **변경안 미리보기 없이 파일 갱신** — diff 보여주고 동의 필수
- **트랙 자동 변경** — A↔B 전환은 별도 마이그레이션, 본 스킬 책임 X
- **CLAUDE.md가 `@AGENTS.md` import-only인데 거기 쓰기** — 항상 source 파일에만
- **스킬 라인업 정보 하드코딩** — ddd-workshop README와 일치하도록 박제. 갱신 시 `/playbook` 재호출로 동기화
- **설계 산출물 자체 수정** — eventstorming/software-design 스킬 영역

## 9. 짧은 예시

### 시나리오 A — 신규 설치

```
사용자: "/playbook"

→ Step 1: 환경 스캔
   - AGENTS.md 감지 (트랙 A)
   - 기존 워크플로 섹션 없음
   - docs/eventstorming/ ✅ (11 페이즈)
   - docs/adr/ ❌

→ Step 2: Install 모드

→ Step 3-A: 표준 텍스트 + 현재 산출물 반영 (ADR 부분 회색)
   변경안: AGENTS.md 뒤에 ## DDD Workflow 섹션 추가

→ Step 4: 동의 → y

→ Step 5: 적용
```

### 시나리오 B — 기존 워크플로에 slot-in

```
사용자: "/playbook"

→ Step 1: 환경 스캔
   - CLAUDE.md만 존재 (트랙 B)
   - ## Development Workflow 발견 (단계 1~6)
   - docs/eventstorming/ ✅, docs/adr/ ✅

→ Step 2: Merge 모드

→ Step 3-B: slot-in 지점 식별
   - 단계 2와 3 사이에 "관련 docs/eventstorming/, ADR 읽기 + scope 점검"
   - 단계 3 직전에 "/tactical-design" 호출 안내

→ Step 4: diff 동의 → y

→ Step 5: CLAUDE.md 갱신 완료
```

### 시나리오 C — 갱신 (스킬 추가됨)

```
사용자: "/playbook" (이전 설치 후 새 스킬 추가됨)

→ Step 1: 기존 ## DDD Workflow 섹션 발견 (4 스킬 라인업)

→ Step 2: Update 모드 — 현재 라인업 5 스킬

→ Step 3-C: diff
   + tactical-design 스킬 호출 매핑 추가
   + 상황별 호출 표에 "한 워크플로 코드 작성 직전" 추가

→ Step 4: 동의 → y → 적용
```

## 10. 한 줄로 정리

> **ddd-workshop 4개 호출형 스킬을 *언제 어떻게 쓸지* 가이드를 공개 지침 파일(AGENTS.md/CLAUDE.md)에 박제. 설치 방법 포함(다른 협업자 미설치 대비). Git/이슈/CI/테스트/스타일은 안 건드림 — slot-in. 충돌은 사용자 선택지. 한 번 설치 후 상시 로드 컨텍스트 엔지니어링.**
