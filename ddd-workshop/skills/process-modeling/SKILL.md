---
name: process-modeling
description: >
  ddd-workshop 파이프라인의 **Process Modeling 단계**. 빅픽처(bigpicture)
  산출물에서 식별된 페이즈 하나를 잡아 **end-to-end 워크플로**로 깊게 펼친다.
  빅픽처가 "탐색·합의 스냅샷"이라면 이 스킬은 "워크플로 합의·재설계". 한 페이즈 안에서
  Command(파랑)·Policy(라일락)·Read Model(초록)·Aggregate 후보·대안 경로를 명시화한다.
  Aggregate 정식 정의·invariant·트랜잭션 경계는 다음 단계(software-design)로 위임 — 후보까지만.
  산출물은 페이즈 폴더 안에 워크플로별 .md 1개씩 (`docs/eventstorming/{phase}/{process}.md`).
  횡단 워크플로는 owner phase 규칙(무게중심 페이즈가 진실, 다른 페이즈는 링크). 빅픽처가
  평탄 .md 11개 형태면 첫 실행 시 페이즈 폴더로 in-place 마이그레이션. 빅픽처에서
  새 핫스팟·BC 후보 변동이 발견되면 빅픽처 파일도 양방향 갱신. **닫는 활동으로
  BC Discovery 모드 — 모든 워크플로 누적 후 6 신호로 BC 클러스터링 → ADR로 박제**
  (`docs/adr/{N}-bc-split-{domain}.md`). 코드 모듈 매핑·소스코드 작성은 이 스킬
  밖 별도 영역. Initial/Update/Cycle/BC-Discovery 4 모드.
  Triggers — "프로세스 모델링", "process modeling", "이 페이즈 깊게", "워크플로 분석",
  "Command 정리", "Policy 명시", "결재 흐름 펼쳐줘", "BC 식별",
  "context map", "/process-modeling".
allowed-tools: Read Write Edit Bash Glob Grep
metadata:
  author: dev-goraebap
  version: "0.4.0"
---

# process-modeling 스킬

ddd-workshop 파이프라인의 **Process Modeling 단계**. 빅픽처에서 식별된 페이즈 하나를 잡아 워크플로 단위로 깊게 펼친다.

## 1. 정체성

**빅픽처의 *탐색 합의*를 워크플로의 *명시적 합의*로 변환하는 단계.** 빅픽처가 "어떤 페이즈가 있는가·어떤 도메인 이벤트가 있는가"에 답했다면, 이 스킬은 **"이 워크플로가 어떻게 반응해야 하는가"**에 답한다. **닫는 활동으로 모든 워크플로 누적 후 BC Discovery 토론 → ADR 박제**까지가 이 스킬 책임. 코드 모듈 매핑·소스코드 작성은 별도 영역.

| | bigpicture (이전 단계) | process-modeling (이 스킬) |
|------|----------------------|---------------------------|
| 모드 | 탐색 (divergent) | 합의 (convergent) |
| 단위 | 페이즈 (시간축 분할) | 워크플로 (end-to-end) |
| 등장 sticky | 🟧 Event · ⭐ Pivotal · 🔥 Hotspot · 🟨 Actor · 🟥 External | + 🟦 Command · 🟪 Policy · 🟩 Read Model · 🟫 Aggregate 후보 |
| 산출물 | 페이즈별 빅픽처 .md | **페이즈 폴더 안 워크플로별 .md** |
| 갱신 빈도 | 거의 안 변함 (안정 합의) | 워크플로 합의 변경 시 (중빈도) |

다음 단계(software-design)는 코드 + 모듈 README + ADR로 흡수되므로 별도 .md를 만들지 않는다 (이 스킬에서는 **Aggregate 후보까지만**).

## 2. 핵심 원칙

### 2.1 Process Modeling 정통과 정렬

권위 출처(Brandolini *Introducing EventStorming*, eventstorming.com)의 Process Modeling 산출물만 다룬다:

| 산출물 | Process Modeling 포함 |
|--------|---------------------|
| 🟦 Command (현재형, 의도) | ✅ |
| 🟪 Policy ("Whenever event, then command") | ✅ |
| 🟩 Read Model (의사결정 정보) | ✅ |
| 대안·실패 경로 | ✅ |
| Aggregate **후보** (책임 명시는 X) | ✅ |
| BC 경계 강화 (빅픽처 후보 → 더 명확) | ✅ |
| Aggregate 정식 정의·invariant | ❌ Software Design 단계 |
| 트랜잭션 경계·Saga 설계 | ❌ Software Design 단계 |
| Context Map | ❌ Software Design 단계 |

### 2.2 워크플로 단위 (페이즈 ≠ 워크플로)

페이즈 하나에 워크플로가 1개일 수도 N개일 수도 있다.

| 빅픽처 페이즈 | 워크플로 후보 |
|---|---|
| 온보딩 (P1) | 활성화 (1개) |
| 휴가 결재 (P3) | 신청·결재 (1개) |
| 연차 회계 (P2) | 발급 / 차감 / 만료 / 사용 촉진 (4개) |
| 조직 운영 (P6) | 발령 / 부서장 임명 / RBAC (3개) |
| 알림 (P8) | **횡단** — 다른 페이즈의 Policy 섹션에 분산 |

→ **한 워크숍 = 한 워크플로**. 페이즈에 워크플로 N개면 **세션 N번**.

### 2.3 횡단 워크플로 — Owner Phase 규칙

**판별 질문**: *"이 워크플로가 사라지면 어느 페이즈가 가장 망가지나?"*

규칙:
1. 무게중심 페이즈를 owner로 → 그 페이즈 폴더에 진실 1개
2. 다른 페이즈는 빅픽처 파일에 링크만
3. Owner 정하기 모호하면 → **워크플로를 더 작게 쪼갠다** (보통 둘 이상이 엉킨 신호)
4. 분해 후에도 못 정하면 → `docs/eventstorming/_shared/` (escape hatch, 마지막 수단)

워크플로 .md 첫 줄에 **반드시 Scope 표기**:

```markdown
> **Scope**: phase-local. **Owner**: P1.
```

또는

```markdown
> **Scope**: cross-phase. **Owner**: P2. **Participates**: P2 (회계 결정), P8 (알림 채널)
```

### 2.4 Sticky 컨벤션 (process-modeling 단계)

물리 EventStorming 보드는 *크기·모양*으로 sticky를 구분하지만 텍스트는 색만 표현되므로 의미당 1개 이모지로 못박는다. 이 단계에서 사용하는 9종 — 빅픽처 5종 + 신규 4종(Command·Policy·Read Model·Aggregate):

| 이모지 | 의미 | 시제·형식 | 단계 |
|---|---|---|---|
| 🟧 | **Domain Event** | 과거형 (사원 활성화됨) | 빅픽처 계승 |
| ⭐ | **Pivotal Event** | 페이즈 전이 — Event 위 별 강조 | 빅픽처 계승 |
| 🟨 | **Actor** | 사람·시스템 (작은 노랑) | 빅픽처 계승 |
| 🟥 | **External System** | 외부 결합 | 빅픽처 계승 |
| 🔥 | **Hotspot** | 의문·갈등·위험 | 빅픽처 계승 |
| 🟦 | **Command** | 현재형 (사원 활성화 요청) | 🆕 process-modeling |
| 🟪 | **Policy** | Whenever event → then command | 🆕 process-modeling |
| 🟩 | **Read Model** | 의사결정 정보 | 🆕 process-modeling |
| 🟫 | **Aggregate** (후보) | 일관성 경계 — 정식 정의는 코드 영역 | 🆕 process-modeling |

원본 Brandolini 컨벤션과의 차이:
- **Hotspot 🔥** — 원본은 분홍(🟥)이지만 External System(🟥)과 색이 겹쳐 분리
- **Aggregate 🟫** — 원본은 큰 노란 사각이지만 Actor(🟨)와 색이 겹쳐 분리 (큰 노랑 → 갈색 톤 비유)
- **Pivotal ⭐** — 원본은 보라(🟪)이지만 Policy(🟪)와 색이 겹쳐 분리

### 2.5 Command·Event·Policy 표기 — 한국어 + Code Identifier 이중

빅픽처의 이중 표기 규약을 그대로 이어간다.

```
🟦 사원 활성화 요청 `RequestEmployeeActivation`     (현재형, 의도)
🟧 사원 활성화됨 `EmployeeActivated`                (과거형, 사실)
🟪 활성화 시 환영 알림 `OnEmployeeActivated→SendWelcome` (Whenever→Then)
🟩 활성화 대기 사원 목록 `PendingActivationList`     (의사결정 정보)
```

### 2.6 Aggregate 후보 — 정의 X, 후보 식별만

이 단계의 Aggregate는 **"이 명령들을 묶어서 받을 객체로 보이는 후보"** 수준. 책임·invariant·필드 정의는 software-design 단계.

```
[후보] Employee — RequestEmployeeActivation, SuspendEmployee 받는 후보
       (invariant 정의: software-design 단계)
```

## 3. 언제 트리거하는가

- `/ddd-workshop:process-modeling`
- "이 페이즈 깊게 파보자", "워크플로 분석해줘", "Command 정리"
- bigpicture 산출물이 있고 한 페이즈를 코드로 옮기기 직전
- 코드 작성 중 워크플로 합의 재검토가 필요할 때 (Cycle 모드)
- **모든 워크플로 누적 후 BC 식별이 필요할 때** — "BC 식별", "context map", `/process-modeling --bc` (BC Discovery 모드)

**전제**: bigpicture 산출물(`docs/eventstorming/`)이 존재해야 함. 없으면 bigpicture 스킬 먼저 실행 권장.

## 4. 입력 정책

### 4.1 입력 우선순위

| # | 입력 | 활용 |
|---|------|------|
| 1 | **빅픽처 페이즈 산출물** (`docs/eventstorming/{phase}/bigpicture.md` 또는 `{NN-phase}.md`) | 페이즈의 도메인 이벤트·액터·외부시스템·핫스팟 |
| 2 | **빅픽처 index** (`docs/eventstorming/index.md`) | 페이즈 맵·횡단 매트릭스·BC 후보 |
| 3 | domain-classroom 학습 노트 | 도메인 일반 패턴 (선택) |
| 4 | 사용자 발화 — 워크플로 추가 디테일·실패 경로·UI 아이디어 | 빅픽처에 없는 디테일 |

### 4.2 빅픽처 형태 자동 감지

| 발견 형태 | 동작 |
|---|---|
| `docs/eventstorming/{phase}/bigpicture.md` | 폴더 구조 — 그대로 사용 |
| `docs/eventstorming/{NN-phase}.md` (평탄) | **In-place 마이그레이션 모드** 진입 (5.0 단계) |
| `docs/eventstorming.md` 단일 파일 | 사용자에게 "페이즈 분리부터 하시겠어요?" 안내 후 bigpicture 스킬로 위임 |
| 없음 | 사용자에게 "bigpicture 먼저 실행하시겠어요?" 권유 |

## 5. 진행 절차

### Step 0 — 마이그레이션 (필요 시)

작업 대상 페이즈가 평탄 .md(`{NN-phase}.md`) 형태면, **그 페이즈만** 폴더로 in-place 승격:

```
docs/eventstorming/01-onboarding.md
                ↓ git mv
docs/eventstorming/01-onboarding/bigpicture.md
```

다른 페이즈는 건드리지 않는다 — 점진적 마이그레이션. 사용자에게 한 줄 확인:

> "01-onboarding.md → 01-onboarding/bigpicture.md 폴더로 옮기고 진행할까요? (y/n)"

승낙 시 `git mv` (Bash 도구 사용). 거절 시 작업 중단.

### Step 1 — 모드 감지 (Initial / Update / Cycle)

| 모드 | 트리거 | 동작 |
|------|--------|------|
| **Initial** | `{phase}/{process}.md` 없음 | 새 워크플로 .md 생성 |
| **Update** | 같은 워크플로 .md 있음 + 동일 세션 추가 입력 | 변경분 누적 |
| **Cycle** | 워크플로 .md 있음 + 시간 지남 (코드 작성 후 등) | 기존 + 새 발견 → 갱신 |
| **BC Discovery** | 사용자 명시 ("BC 식별", "context map", `--bc`) | 모든 워크플로 종합 → BC 토론 → ADR 박제 (Step 11) |

### Step 2 — 페이즈 선택 + 워크플로 분해

사용자에게 **어느 페이즈**를 다룰지 확인. 그 페이즈의 빅픽처 파일을 읽어 **워크플로 후보 식별**:

> "P2 연차 페이즈는 4개의 워크플로로 보입니다:
> 1. 발급 (grant) — FY 시작 시
> 2. 차감 (consume) — 휴가 승인 시
> 3. 만료 (expire) — FY 종료 시
> 4. 사용 촉진 (promotion) — §61 트리거
>
> 어느 워크플로부터 진행할까요?"

한 응답 = 한 워크플로. 여러 워크플로면 한 번에 한 개씩.

### Step 3 — 횡단 여부 판별

워크플로가 횡단인지 판별 → Scope/Owner 결정 (2.3 규칙).

```
판별 질문: 이 워크플로가 사라지면 어느 페이즈가 가장 망가지나?

예: "사용 촉진"
- P2(연차)가 가장 망가짐 (회계 결정의 무게중심)
- P8(알림)은 채널 역할만 빠짐
→ Owner: P2, Participates: P2·P8
```

판별 결과를 사용자에게 한 줄 확인 후 진행.

### Step 4 — 워크플로 시간순 펼치기

다음 표를 누적:

```markdown
## 2. Workflow (시간순)

| # | Type | 한국어 | Code Identifier | 행위자 | 디테일 |
|---|------|-------|-----------------|--------|--------|
| 1 | 🟦 Command | 사원 활성화 요청 | `RequestEmployeeActivation` | 인사담당자 OR CRON | 입사일 도래 시 |
| 2 | 🟧 Event | 사원 활성화됨 | `EmployeeActivated` | (시스템) | status: INVITED→ACTIVE |
| 3 | 🟪 Policy | 환영 알림 정책 | `OnEmployeeActivated→SendWelcome` | NotificationPolicy | listen |
| 4 | 🟦 Command | 환영 알림 발송 | `SendWelcomeNotification` | 시스템 | |
| 5 | 🟧 Event | 환영 알림 발송됨 | `WelcomeNotificationSent` | (시스템) | |
| 6 | 🟩 Read Model | 활성화 대기 목록 | `PendingActivationList` | 인사담당자 화면 | status=INVITED |
```

규칙:
- Event는 빅픽처에서 가져오되 누락 시 추가 발견 가능
- Command는 모두 *누가 호출하는지* 명시 (사람·CRON·다른 시스템)
- Policy는 반드시 *Whenever (event) → then (command)* 짝
- Read Model은 *어떤 화면·결정에 쓰이는지* 명시

### Step 5 — 대안·실패 경로

본 흐름(happy path) 후 대안 경로 명시:

```markdown
## 3. Alternative Paths

### A. 활성화 거부 (수동 토글 취소)
- 인사담당자가 활성화 토글을 끄려는 경우 (오류 정정)
- Command: `CancelEmployeeActivation` → Event: `EmployeeActivationCanceled`
- 핫스팟: H1-? 활성화 취소가 가능한 시간 윈도우?

### B. CRON 실패 → 재시도
- CRON 실행 실패 시 재시도 정책 (3회·exponential backoff?)
- 핫스팟: H1-? 재시도 정책 미정
```

### Step 6 — Policy / Read Model 요약 (별도 섹션)

워크플로 표에서 추출한 Policy·Read Model을 별도 섹션에 요약. 다른 워크플로·BC와의 결합 가시화.

```markdown
## 4. Policies (요약)
| Policy | Trigger Event | 결과 Command | 모드 | Owner BC |
|--------|---------------|--------------|------|----------|
| 환영 알림 | EmployeeActivated | SendWelcomeNotification | 자동 | notification |

## 5. Read Models
| 이름 | 용도 | 소스 이벤트 | 사용 화면 |
|------|------|-------------|----------|
| PendingActivationList | 활성화 대기 사원 조회 | EmployeePreRegistered, EmployeeActivated | HR Admin 대시보드 |
```

### Step 7 — Aggregate 후보 + Hotspot

```markdown
## 6. Aggregate Candidates (정의는 software-design)
- **Employee** — RequestEmployeeActivation 받는 후보
  - 후보 invariant: 활성화는 1회만 (status=INVITED→ACTIVE 단방향)
  - 후보 invariant: activated_at IS NULL일 때만 사전등록 정보 수정 가능

## 7. 빅픽처 Hotspot 해소
| Hotspot ID | 결정 / 살아있음 |
|------------|----------------|
| H1-K | 사전등록 시 틀린 이메일 — **결정**: 활성화 전까지 인사담당자 수정 허용 + 활성화 후 5.D 워크플로 재사용 |
| H1-D | 장기 미접속 사원 처리 — 살아있음, 운영 정책 미정 |

## 8. 새로 발견한 Hotspot
| ID | 내용 | 답할 위치 |
|----|------|----------|
| H1-N | 활성화 취소 시간 윈도우 | 운영 + 시스템 |
```

### Step 8 — 빅픽처 양방향 갱신 (필요 시)

Process Modeling 중 **빅픽처 차원의 변경**이 발견되면 빅픽처 파일도 갱신:

| 빅픽처 차원 변경 | 갱신 대상 |
|---|---|
| 새 Hotspot 발견 | `{phase}/bigpicture.md` 의 Hotspot 표 + `index.md` 누적 핫스팟 |
| BC 후보 추가/제거 | `index.md` 부록 B |
| 새 액터/외부시스템 | `{phase}/bigpicture.md` + `index.md` 횡단 매트릭스 |
| Hotspot 해소 (✅) | `index.md` 누적 핫스팟에 ✅ 마크 |

워크플로 디테일(Command·Policy·Read Model)은 **빅픽처에 절대 추가하지 않는다** — 이건 워크플로 .md 전용.

### Step 9 — 종료 신호 체크리스트

워크플로가 software-design으로 넘어갈 준비됐는지 체크:

```markdown
## 9. 다음 단계 신호
- [ ] 모든 Command가 *누가 호출하는지* 명확
- [ ] 모든 Event가 *누가 발행하는지* 명확
- [ ] 모든 Policy가 listen → command 짝 명시
- [ ] 대안/실패 경로 1개 이상 명시
- [ ] Aggregate 후보 1개 이상 식별
- [ ] 빅픽처 Hotspot 중 이 워크플로에 걸린 것 처리
```

전부 ✅면 software-design (코드 + 모듈 README + ADR) 단계로 진행 가능.

### Step 10 — 산출물 갱신 확인

워크플로 끝에 사용자에게:

> "이 워크플로를 `docs/eventstorming/{phase}/{process}.md`에 갱신하고, 빅픽처 변경분 N개를 함께 반영할까요? (y / 다른 경로 / 저장 안 함)"

추가로 워크플로 .md를 닫을 때 한 줄 안내:

> "다른 워크플로가 다 끝났다면 BC Discovery 모드(`/process-modeling --bc`)로 BC를 식별·박제할 수 있습니다."

### Step 11 — BC Discovery 모드 (닫는 활동)

**전제**: 사용자 명시적 호출. 자동 발동 X.

**발동 조건 안내** (호출 시 점검):
- `docs/eventstorming/*/` 폴더에 워크플로 .md가 충분히 누적되었는가? (페이즈 1개로는 부족 — 횡단 신호가 안 보임)
- 부족하면 사용자에게 "현재 워크플로 N개. 더 누적 후 진행 권장" 안내, 그래도 진행 의사면 계속.

**절차**:

1. **모든 워크플로 .md 수집** — Glob `docs/eventstorming/*/*.md` (단 `bigpicture.md` 제외).
2. **6 신호 추출**:

| # | 신호 | 추출 위치 |
|---|------|----------|
| 1 | Aggregate 클러스터링 (항상 같이 변하는 것) | "Aggregate Candidates" 섹션 |
| 2 | Linguistic boundary (같은 단어 다른 의미) | Code Identifier 비교 |
| 3 | Policy 방향 (cross-workflow listen) | "Policies" 섹션 |
| 4 | External system 결합 위치 | "Workflow" 표 행위자 |
| 5 | Read Model의 source 이벤트 다수 결합 | "Read Models" 섹션 |
| 6 | Transactional consistency 요구 | "Aggregate 후보 invariant" |

3. **BC 후보 클러스터링 → 사용자에게 제시**:

```markdown
6 신호 분석 결과 BC 후보 N개 제안합니다:

| BC 후보 | 책임 | 포함 Aggregate | 등장 워크플로 | 신호 근거 |
|---|---|---|---|---|
| identity | 사원 활성화·인증 | Employee (status) | activation.md | 신호 1·2 |
| approval-mechanism | 결재 메커니즘 (공통) | ApprovalRequest | leave.md, overtime.md | 신호 1·3 |
| ... |

추가 토론 포인트:
- 핫스팟 X: BC A·B를 묶을지 가를지
- 핫스팟 Y: 횡단 Policy의 owner BC 결정
- 핫스팟 Z: 같은 Aggregate가 두 BC에 등장 — 정말 같은 객체인가?
```

4. **사용자와 토론** — 위 후보를 합의하거나 갈라거나 묶거나. 모호하면 *살아있는 의문* 섹션에 박제.
5. **합의 후 ADR 작성**:

위치: `docs/adr/{NNNN}-bc-split-{domain}.md` (4자리 일련번호, 도메인별 N장 가능)

템플릿:

```markdown
# {NNNN}. {도메인} BC 분할

## Status
Accepted — YYYY-MM-DD

## Context
종합한 워크플로:
- docs/eventstorming/01-onboarding/activation.md
- docs/eventstorming/02-leave/grant.md
- ... (전부 나열)

분할 신호 (6 신호 중 적용된 것):
- 신호 1 Aggregate 클러스터링: ...
- 신호 2 Linguistic boundary: ...
- 신호 3 Policy direction: ...

## Decision
| BC 이름 | 책임 | 포함 Aggregate | 등장 워크플로 |
|---|---|---|---|
| identity | 사원 활성화·인증 | Employee (status 머신) | activation.md |
| leave-accounting | 연차 회계 | LeaveBalance, LeaveHolder | grant.md, consume.md |
| approval-mechanism | 결재 공통 메커니즘 | ApprovalRequest | leave-request.md, overtime.md |

## BC 간 통합
- approval-mechanism → leave-accounting: Policy listen (LeaveRequestApproved → DeductBalance)
- 모든 BC → notification: domain event listen (NotificationPolicy 패턴)
- identity → 모든 BC: shared kernel (employeeId)

## Consequences
- 코드 모듈 분할의 입력이 됨 (코드 영역 별도)
- 경계 변경 시 새 ADR 추가 (이 ADR은 immutable, status를 Superseded로 전환)

## 살아있는 의문
- {결정 못 한 경계 후보 — 계속 모니터링}
```

6. **빅픽처 양방향 갱신**:
   - `index.md` 부록 B(서브도메인/BC 후보)가 있으면 ADR 링크 추가
   - 부록 B의 추측 후보를 *Accepted* 결정으로 승격 (✅ 표시)

7. **갱신 확인** 후 ADR 파일 생성. ADR은 한 번 박으면 immutable. 변경 시 새 ADR.

## 6. 산출물 구조

### 6.1 파일 위치

```
docs/
├── eventstorming/
│   ├── index.md                      # 빅픽처 — 페이즈 맵·횡단 매트릭스
│   ├── 01-onboarding/
│   │   ├── bigpicture.md             # 빅픽처 페이즈 산출물
│   │   └── activation.md             # 🆕 워크플로 1개
│   ├── 02-annual-leave/
│   │   ├── bigpicture.md
│   │   ├── grant.md                  # 🆕 워크플로 N개
│   │   ├── consume.md
│   │   ├── expire.md
│   │   └── promotion.md              # cross-phase, owner=P2
│   ├── 08-notification-push/
│   │   └── bigpicture.md             # 횡단 페이즈 — 자체 워크플로 X
│   └── _shared/                      # escape hatch (마지막 수단)
│       └── notification-policy-pattern.md
└── adr/                              # 🆕 BC Discovery 산출물
    ├── 0001-bc-split-hr.md
    └── 0002-bc-split-billing.md
```

평탄 — `processes/` 같은 중간 폴더 X. ADR은 BC Discovery 모드 발동 시에만 생성.

### 6.2 워크플로 .md 구조

```markdown
# {워크플로명} — Process Modeling

> **Scope**: phase-local. **Owner**: P1.
> (또는: **Scope**: cross-phase. **Owner**: P2. **Participates**: P2, P8)
> **빅픽처**: [01-onboarding/bigpicture.md](./bigpicture.md)

## 1. Scope
- Trigger event:
- Outcome event:
- 한 줄 핵심:

## 2. Workflow (시간순)
| # | Type | 한국어 | Code Identifier | 행위자 | 디테일 |

## 3. Alternative Paths
### A. {대안 이름}
### B. ...

## 4. Policies (요약)

## 5. Read Models

## 6. Aggregate Candidates (정의는 software-design)

## 7. 빅픽처 Hotspot 해소

## 8. 새로 발견한 Hotspot

## 9. 다음 단계 신호 체크리스트

---

## 변경 이력
- YYYY-MM-DD: Initial.
```

## 7. Anti-patterns (절대 하지 말 것)

- **빅픽처 .md를 워크플로 디테일로 덮어쓰기** — Command·Policy·Read Model은 워크플로 .md 전용
- **한 .md에 워크플로 N개 욱여넣기** — 워크플로 1개 = .md 1개
- **Aggregate 정식 정의·invariant 박제·트랜잭션 경계** — software-design 단계. 후보까지만
- **Saga·Process Manager 코드 설계** — software-design 단계
- **횡단 워크플로를 여러 페이즈에 중복 작성** — owner phase 1곳만 진실
- **Owner 모호한 채로 진행** — 더 작게 쪼개거나 `_shared/` 사용
- **Policy를 "어떤 컴포넌트가 처리"로 명시** — 그건 software-design. Process Modeling은 *Whenever→Then* 규칙만
- **현재형 Event / 과거형 Command** — Event 과거형, Command 현재형 (호환성 무관 정통 표기)
- **빅픽처에 없는 도메인 이벤트 임의 추가** — 새 이벤트 발견 시 빅픽처도 함께 갱신 (Step 8)
- **사용자 확인 없이 빅픽처 양방향 갱신** — 빅픽처 변경은 항상 한 줄 확인
- **마이그레이션을 모든 페이즈 한꺼번에** — 작업 대상 페이즈만 in-place 승격
- **워크플로 1~2개로 BC 확정** — BC Discovery는 충분한 누적(여러 페이즈) 후 발동. 한두 개로는 횡단 신호가 안 보임
- **ADR을 mutable 문서로 다루기** — ADR은 immutable. 변경 시 새 ADR 작성, 기존 status를 Superseded로
- **BC Discovery에서 코드 모듈 폴더 생성** — 이 스킬은 *논리 BC 결정*까지. 코드 모듈 매핑은 별도 영역

## 8. 사이클 정책

워크플로 .md는 **중빈도 갱신**:

- **갱신 트리거**:
  - 새 대안 경로 발견 (운영 중 edge case)
  - Policy 변경 (비즈니스 규칙 추가)
  - 새 Read Model 등장 (UI 추가)
  - 빅픽처 Hotspot 해소
  - 코드 작성 중 모순 발견 → 워크플로 재합의 후 갱신
- **사이클 트리거되지 않는 변경** (코드만 갱신):
  - 변수명·함수명 리팩토링
  - 성능 최적화
  - 테스트 추가

각 사이클은 Update/Cycle 모드. 변경 이력은 .md 끝에 자동 기록.

## 9. 짧은 예시 (호호컴퍼니 P1 온보딩 — 활성화)

```
사용자: "/process-modeling P1 온보딩"

→ Step 0: docs/eventstorming/01-onboarding.md 평탄 발견 → 마이그레이션 확인
   "01-onboarding/bigpicture.md 로 옮기고 진행할까요?" → y
   git mv 실행

→ Step 1: Initial 모드 (activation.md 없음)

→ Step 2: P1 워크플로 분해
   "P1은 워크플로 1개로 보입니다: 활성화. 진행할까요?" → y

→ Step 3: 횡단 판별
   "이 워크플로는 phase-local (P1 owner). 진행합니다."

→ Step 4: Workflow 시간순
   1. 🟦 사원 사전등록 요청 — 인사담당자
   2. 🟧 사원 사전등록됨 — 시스템 (status=INVITED)
   3. 🟦 사원 활성화 요청 — CRON OR 인사담당자
   4. 🟧 사원 활성화됨 — 시스템 (status=ACTIVE)
   5. 🟪 환영 알림 정책 — NotificationPolicy
   6. 🟦 환영 알림 발송 — 시스템
   7. 🟧 환영 알림 발송됨

→ Step 5: 대안 경로
   A. 활성화 취소 (수동 토글 끄기)
   B. CRON 실패 재시도

→ Step 6: Policy/ReadModel 요약
   - 환영 알림 Policy
   - PendingActivationList read model

→ Step 7: Aggregate 후보 + Hotspot
   - 후보: Employee (활성화 1회 invariant)
   - 빅픽처 H1-K 결정 박제
   - 새 H1-N 발견: 활성화 취소 시간 윈도우

→ Step 8: 빅픽처 양방향 갱신
   - 01-onboarding/bigpicture.md 에 H1-N 추가
   - index.md 누적 핫스팟에 H1-K ✅ 마크
   "빅픽처 2곳 변경 함께 반영할까요?" → y

→ Step 9: 종료 신호 체크리스트 → 6/6 ✅

→ Step 10: 갱신 확인
   docs/eventstorming/01-onboarding/activation.md 생성
   안내: "다른 워크플로 다 끝났다면 BC Discovery (`/process-modeling --bc`) 호출 가능"
```

### 9.2 BC Discovery 모드 예시 (모든 페이즈 워크플로 누적 후)

```
사용자: "/process-modeling --bc" (또는 "BC 식별하자")

→ Step 11.1: Glob docs/eventstorming/*/*.md (bigpicture.md 제외)
   - 발견 워크플로 12개 (P1·P2·P3·P5·P6·P9·P10·P11)
   - "충분한 누적입니다. 진행합니다."

→ Step 11.2: 6 신호 추출
   - Aggregate: Employee, LeaveBalance, ApprovalRequest, Department, ...
   - Linguistic: "활성화"가 P1·P11에서 다른 의미 (입사 vs 휴직 복귀)
   - Policy: NotificationPolicy가 모든 도메인 이벤트 listen → 횡단
   - ...

→ Step 11.3: BC 후보 7개 제시
   | identity | leave-accounting | approval-mechanism | organization | ... |

→ Step 11.4: 사용자 토론
   - 사용자: "leave-accounting과 special-leave 묶을지 분리할지?"
   - "회계 성격이 다르므로 분리" → BC 8개 확정

→ Step 11.5: ADR 작성
   docs/adr/0001-bc-split-hr.md 생성

→ Step 11.6: 빅픽처 부록 B 갱신
   index.md 부록 B의 추측 후보 → ✅ Accepted (ADR 0001 링크)

→ Step 11.7: 갱신 확인 → ADR 파일 + index.md 동시 갱신
```

## 10. 한 줄로 정리

> **빅픽처 페이즈 1개를 잡아 워크플로 단위로 깊게 펼친다. Command·Policy·Read Model·Aggregate 후보를 명시화하되, 정식 Aggregate·트랜잭션 경계는 코드 영역으로 위임. 횡단은 owner phase 규칙. 페이즈 폴더 안 워크플로 .md가 진실, 빅픽처는 양방향 갱신. 닫는 활동으로 BC Discovery 모드 — 6 신호로 BC 클러스터링 → ADR 박제. 코드 모듈 매핑은 별도 영역.**
