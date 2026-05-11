---
name: eventstorming
description: >
  Brandolini의 EventStorming 1:1 분석 도구 — Big Picture · Process Modeling ·
  BC/Subdomain Discovery 3 레벨을 **하나의 사이클 도구로 통합**. 그룹 워크숍을
  못 하는 환경(SI·소규모·1인)에서 도메인 빅픽처 산출물부터 BC + Subdomain 후보
  식별까지를 한 사람이 누적해 나간다. 호출 한 번에 현재 상태를 자동 감지해
  적절한 사이클(Initial / Phase 누적 / Process Modeling / BC+Subdomain
  Discovery / Cycle) 진입. **ADR 박제는 software-design 스킬로 위임** —
  여기는 *후보 식별*까지. 페르소나·서사 없는 분석 톤. 도메인 이벤트 판별
  4기준(전문가 관심·상태 변화·법적 의미·트리거)을 명시 적용해 UI/Telemetry
  혼입 방지. 한국어 자연어 + Code Identifier 이중 표기. Sticky 컨벤션은 10종
  자급자족 (외부 참조 X). 산출물: `docs/eventstorming/index.md` +
  `{NN-phase}/bigpicture.md` + `{NN-phase}/{workflow}.md`. 빅픽처가 평탄
  .md 형태면 작업 페이즈만 in-place 폴더 마이그레이션. 빅픽처 ↔ process .md
  양방향 갱신. references/ 하위 모듈로 세부 분리 — 활성 모드에 해당하는
  references만 로드되어 컨텍스트 가벼움.
  Triggers — "이벤트스토밍", "빅픽처", "도메인 분석", "페이즈 정리",
  "워크플로 분석", "Command 정리", "Policy 명시", "BC 식별",
  "Subdomain 분류", "context map", "/eventstorming".
allowed-tools: Read Write Edit Glob Grep Bash
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# eventstorming 스킬

Brandolini의 EventStorming 1:1 분석 도구 — Big Picture / Process Modeling / BC + Subdomain Discovery 3 레벨을 **하나의 사이클 도구로 통합**.

## 1. 정체성

물리 EventStorming은 *큰 벽 + 포스트잇*으로 그룹 워크숍 한다. 이 스킬은 그 워크숍을 **한 사람 + AI 1:1 환경**에서 마크다운으로 누적·진화시키는 도구. 호출 한 번 = 현재 상태 자동 감지 = 적절한 사이클 진입.

| | 물리 EventStorming | 이 스킬 |
|---|---|---|
| 매체 | 벽 + 포스트잇 | docs/eventstorming/ 폴더 |
| 참여자 | 도메인 전문가 + 개발자 다수 | 사용자 1명 + AI |
| 단계 분리 | 3개 워크숍 일정 | **한 스킬 사이클 모드 자동 전환** |
| 산출물 | 벽 사진 | 페이즈별·워크플로별 .md |

**책임 경계**:
- ✅ Big Picture · Process Modeling · BC/Subdomain *후보* 식별
- ❌ ADR 박제 — `software-design` 스킬 영역
- ❌ 코드 작성·tactical 구현 — 코드 영역
- ❌ AGENTS.md 워크플로 박제 — `playbook` (phase 2) 영역

## 2. 핵심 원칙 (공통)

### 2.1 권위 출처 정렬

Brandolini *Introducing EventStorming* + Vernon *IDDD/DDD Distilled* + Khononov *Learning DDD* 합의 산출물만 다룬다. UL 정식·BC 확정·Aggregate 정의는 다음 단계 위임.

### 2.2 도메인 이벤트 판별 4기준 (필수)

이벤트 표 추가 전 4기준 통과 필수. UI/Telemetry/기술 이벤트 혼입 방지.

| # | 질문 |
|---|------|
| 1 | 도메인 전문가가 관심 있어 하나? |
| 2 | 비즈니스 상태가 영구 변했나? |
| 3 | 법적·규제적 의미가 있나? |
| 4 | 다른 흐름의 트리거가 되나? |

**2개 이상 ✅ = 도메인 이벤트.**

배제 예: ❌ "회원가입 폼 진입함" (UI) / ✅ "회원 등록됨" (비즈니스 사실)

### 2.3 한국어 자연어 + Code Identifier 이중 표기

```
🟧 사원 사전 등록됨 `EmployeePreRegistered`
```

한국어 1차, Code Identifier 보조. 코드 식별자만 박는 건 코드 영역 표기.

### 2.4 Sticky 컨벤션 (자급자족, 10종)

물리 보드는 *크기·모양*으로 sticky를 구분하지만 텍스트는 색(이모지)만 표현 가능 → 의미당 1개 이모지로 못박는다.

| 이모지 | 의미 | 시제·형식 | 등장 사이클 |
|---|---|---|---|
| 🟧 | **Domain Event** | 과거형 | Big Picture · Process |
| ⭐ | **Pivotal Event** | Event 위 별 (페이즈 전이) | Big Picture |
| 🟨 | **Actor** | 사람·시스템 (작은 노랑) | Big Picture · Process |
| 🟥 | **External System** | 외부 결합 (큰 분홍) | Big Picture · Process |
| 🔥 | **Hotspot** | 의문·갈등·위험 | 전 사이클 |
| 🟦 | **Command** | 현재형 (의도) | Process |
| 🟪 | **Policy** | Whenever event → then command | Process |
| 🟩 | **Read Model** | 의사결정 정보 | Process |
| 🟫 | **Aggregate** (후보) | 일관성 경계 | Process |
| ⬜ | **UI Mockup** | (선택) 화면 와이어 | 코드 영역 |

원본 Brandolini 컨벤션과의 차이 (텍스트화 시 색 충돌 해소):
- **Hotspot 🔥** — 원본 분홍이지만 External(🟥)과 충돌해 분리
- **Aggregate 🟫** — 원본 큰 노랑이지만 Actor(🟨)와 충돌해 분리
- **Pivotal ⭐** — 원본 보라이지만 Policy(🟪)와 충돌해 분리

## 3. 통합 사이클 모델

```
사이클 1: Big Picture 초안
  └─ 페이즈·액터·외부시스템·Subdomain 후보 (러프)

사이클 2: 첫 페이즈 깊게 (Process Modeling)
  └─ 워크플로 .md 작성 + 빅픽처 양방향 갱신

사이클 N: 다른 페이즈들 누적
  └─ 워크플로 .md 추가

사이클 (닫는): BC + Subdomain Discovery
  └─ 6 신호 BC 클러스터링 + Subdomain 분류 → index.md 부록 B 갱신
  └─ ADR 박제는 software-design 위임

이후 사이클: 코드 작성 중 발견 → Cycle 모드로 빅픽처/process 역방향 갱신
```

## 4. 모드 자동 감지

| 현재 상태 | 자동 진입 모드 | 첫 질문 |
|---|---|---|
| `docs/eventstorming/` 없음 | **🌱 Big Picture Initial** | "도메인은? 학습 노트나 클라이언트 자료 있나요?" |
| 빅픽처 있음 + 페이즈 부족 | **🗺 Big Picture 페이즈 누적** | "다음 페이즈 어떤 걸?" |
| 빅픽처 충분 + process 없음 | **🌊 Process Modeling 진입** | "어느 페이즈 깊게?" |
| process 일부 있음 | **🌊 Process 추가** | "이어서 어떤 워크플로?" |
| 모든 페이즈 process 누적 | **🎯 BC + Subdomain Discovery 권유** | "워크플로 N개 누적. BC 식별 진행할까요?" |
| ADR 있음 + 시간 지남 | **🔄 Cycle (역방향 갱신)** | "코드 작성 중 발견 사항?" |

사용자가 명시 발화로 모드 강제 가능:
- "빅픽처부터 새로" → Big Picture Initial
- "{페이즈} 깊게" → Process Modeling
- "BC 식별" → BC + Subdomain Discovery
- "발견 사항 반영" → Cycle

## 5. 입력 정책

| 입력 | 활용 |
|---|---|
| `docs/learning-notes/{domain}-classroom.md` (있으면) | 보편 페이즈 + 일반 액터 + 법령 |
| `docs/eventstorming/index.md` + `{phase}/` | 기존 산출물 (Update/Cycle 모드 필수 입력) |
| `docs/adr/*.md` (있으면) | BC/Subdomain 결정 박제 — Cycle 모드 정합성 검증 |
| 사용자 발화·클라이언트 자료 | 누락된 디테일 |

## 6. 진행 워크플로우 (모드별 references 로드)

활성 모드에 해당하는 references/ 파일만 추가 로드 — 컨텍스트 가볍게 유지.

| 모드 | 추가 로드할 references |
|---|---|
| 🌱 Big Picture Initial / 🗺 페이즈 누적 | [`references/big-picture.md`](references/big-picture.md) |
| 🌊 Process Modeling | [`references/process-modeling.md`](references/process-modeling.md) |
| 🎯 BC + Subdomain Discovery | [`references/bc-subdomain-discovery.md`](references/bc-subdomain-discovery.md) |
| 🔄 Cycle (역방향 갱신) | 영향 받는 사이클에 해당하는 references |

각 references는 *해당 사이클의 상세 절차·표기·산출물 양식·종료 신호*를 담는다. SKILL.md는 라우터·공통 규약만.

## 7. 산출물 구조

```
docs/eventstorming/
├── index.md                              # 빅픽처 메타 (페이즈 맵·횡단·핫스팟·Subdomain 후보)
├── 01-onboarding/
│   ├── bigpicture.md                     # 페이즈 빅픽처
│   └── activation.md                     # 워크플로 (Process Modeling)
├── 02-annual-leave/
│   ├── bigpicture.md
│   ├── grant.md                          # 워크플로 N개
│   ├── consume.md
│   └── promotion.md                      # cross-phase (owner=P2)
├── 08-notification-push/
│   └── bigpicture.md                     # 횡단 페이즈
└── _shared/                              # escape hatch
    └── notification-policy-pattern.md
```

**ADR(`docs/adr/`)은 이 스킬 산출물 X** — `software-design` 스킬 영역.

평탄 .md 형태 (`{NN-phase}.md`) 발견 시: **작업 대상 페이즈만** in-place 폴더 승격 (다른 페이즈 그대로). git mv 사용. 자세한 절차는 process-modeling references 참조.

## 8. Anti-patterns (전 사이클 공통)

- **현재형 Event** — 반드시 과거형
- **코드 식별자만** — 한국어 1차, 영문 보조
- **UI/Telemetry 이벤트 혼입** — 4기준 게이트
- **페르소나 시점 서사** — 학습 톤 X, 분석 톤
- **Aggregate 정식 정의·invariant·트랜잭션 경계** — 코드 영역 (`tactical-design`)
- **ADR 직접 작성** — `software-design` 스킬 위임
- **사용자 확인 없는 산출물 갱신** — 매 사이클 끝 한 줄 확인
- **여러 사이클 한 응답에 욱여넣기** — 한 응답 = 한 사이클 단위 (한 페이즈 / 한 워크플로 / 한 결정)
- **모든 페이즈 한꺼번에 폴더 마이그레이션** — 작업 대상만 in-place

## 9. 짧은 예시

```
[Day 1] /eventstorming
  → 자동 감지: docs/eventstorming/ 없음 → Big Picture Initial
  → references/big-picture.md 로드
  → 도메인 윤곽 + P1 페이즈 누적
  → 갱신 확인 → docs/eventstorming/index.md + 01-onboarding/bigpicture.md 생성

[Day 2] /eventstorming
  → 자동 감지: 빅픽처 있음 + process 없음 → "어느 페이즈 깊게?"
  → 사용자: "P1 활성화"
  → references/process-modeling.md 로드
  → 워크플로 누적 → docs/eventstorming/01-onboarding/activation.md 생성
  → 빅픽처 새 핫스팟 발견 → 양방향 갱신

[Day N+1] /eventstorming
  → 자동 감지: 모든 페이즈 process 누적 → BC + Subdomain Discovery 권유
  → references/bc-subdomain-discovery.md 로드
  → 6 신호 분석 → BC 후보 8개 + Subdomain 분류
  → docs/eventstorming/index.md 부록 B 갱신 (✅ Accepted 표시)
  → 안내: "ADR 박제는 /software-design으로 진행하세요"

[Day N+2] /eventstorming
  → 사용자: "코드 작성 중 발견. P2 만료 정책에 새 case"
  → Cycle 모드 → process-modeling.md + bigpicture.md 양방향 갱신
```

## 10. 한 줄로 정리

> **Brandolini EventStorming 3 레벨을 1:1 환경에서 단일 사이클 도구로 통합. 호출 한 번 = 현재 상태 자동 감지 = 적절한 사이클. BC/Subdomain *후보 식별*까지가 책임. ADR은 software-design, tactical 구현은 tactical-design (phase 2), 워크플로 박제는 playbook (phase 2). 산출물은 페이즈 폴더 구조로 누적·진화.**
