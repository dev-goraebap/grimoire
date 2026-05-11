# ddd-workshop

**1:1 환경에서 DDD/EventStorming 워크숍을 돌리는 도구 모음.** 그룹 워크숍을 못 하는 환경(SI·소규모·1인 개발)에서 도메인 학습 → EventStorming 사이클 → 구조적 결정(ADR) → 한 워크플로 전술 plan 까지 한 사람이 AI와 함께 누적합니다. 그리고 *언제 어느 스킬을 쓸지* 가이드를 공개 지침 파일에 박제해 매 세션이 자동으로 따르게 합니다.

다섯 스킬이 파이프라인을 이룹니다:

0. **playbook** — 인스톨러. ddd-workshop 사용 가이드(설치 + 스킬 라인업 + 상황별 호출)를 `AGENTS.md`/`CLAUDE.md`에 박제. 한 번 설치 후 상시 로드 컨텍스트.
1. **domain-classroom** — 낯선 도메인 학습 (강의 모드)
2. **eventstorming** — Big Picture · Process Modeling · BC + Subdomain 후보 식별 (3 레벨 단일 사이클)
3. **software-design** — 구조적 결정(폴더 구조·CQRS·BC 통합 등)을 ADR로 박제
4. **tactical-design** — 한 워크플로의 전술적 plan (Aggregate·invariant·Command 매핑·Event 페이로드·Repository) — 코드 작성 직전 호출

1~4번은 호출형 도구, 0번은 한 번 설치 후 상시 로드 컨텍스트 엔지니어링 도구입니다.

## 이 플러그인의 설계 원칙

- **권위 출처와 정렬** — Brandolini *Introducing EventStorming*, Evans *DDD 2003*, Vernon *IDDD/Distilled/Effective Aggregate Design*, Khononov *Learning DDD*. EventStorming 3 레벨과 DDD Strategic/Tactical Design을 통합 매핑.
- **시각 보드 → 텍스트 산출물** — 물리 벽·포스트잇 대신 마크다운 폴더 구조.
- **한국어 자연어 + Code Identifier 이중 표기** — 도메인 전문가 친화 + 코드 매핑 명확.
- **4기준 게이트** — 도메인 이벤트 판별 4기준으로 UI/Telemetry/기술 이벤트 혼입 차단.
- **합의는 박제, 의문은 핫스팟** — 결정은 ADR/index.md 부록으로 immutable 박제, 미해결은 ID·확신도 태그.
- **자급자족 SKILL.md** — 에이전트 활성화 시 외부 참조 없이 작동. SKILL.md는 라우터, 세부는 `references/`.
- **단계 책임 분리** — 발견(eventstorming)·결정(software-design)·전술 plan(tactical-design)·구현(코드)을 의도적으로 갈라 stale 위험 차단.
- **오케스트레이션은 컨텍스트 엔지니어링** — 매 호출 결정 부담을 줄이기 위해 playbook이 AGENTS.md/CLAUDE.md에 사용 가이드 박제.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install ddd-workshop@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill domain-classroom --skill eventstorming --skill software-design --skill tactical-design --skill playbook
```

## 포함된 스킬

### 파이프라인

```
[ playbook ]  →  AGENTS.md/CLAUDE.md에 ddd-workshop 사용 가이드 박제 (한 번 설치, 상시 로드)
                  ↓
[ domain-classroom ]  →  [ eventstorming ]  →  [ software-design ]  →  [ tactical-design ]
   도메인 일반 패턴       3 레벨 단일 사이클       구조적 결정 박제        워크플로 전술 plan
        ↓                       ↓                       ↓                       ↓
  learning-notes/        eventstorming/             docs/adr/             (in-conversation,
  {domain}-                index.md +               {NNNN}-{slug}.md       코드가 진실)
  classroom.md             {NN-phase}/              (immutable)
                           bigpicture.md
                           {NN-phase}/
                           {workflow}.md
```

| # | 스킬 | 역할 |
|---|---|---|
| 0 | [`playbook`](skills/playbook/SKILL.md) | **인스톨러.** ddd-workshop 사용 가이드(설치 + 스킬 라인업 + 상황→스킬 매핑 + 원칙)를 공개 지침 파일에 박제. 기존 워크플로(Git/이슈/CI/테스트/스타일)는 손대지 않고 slot-in. 충돌 시 사용자 선택지. 한 번 설치 후 상시 로드. |
| 1 | [`domain-classroom`](skills/domain-classroom/SKILL.md) | AI가 가상 도메인 전문가(선생님)가 되어 낯선 도메인의 일반 산업 패턴을 강의. 인지과학 8원칙 기반. 메뉴 → 페이즈 잠수 → Q&A → Feynman 자기 설명. |
| 2 | [`eventstorming`](skills/eventstorming/SKILL.md) | Big Picture · Process Modeling · BC+Subdomain 후보 식별을 단일 사이클 도구로 통합. 호출 한 번에 현재 상태 감지 → 적절한 사이클 진입. references/ 하위 모듈로 세부 분리되어 활성 사이클만 로드. BC + Subdomain 분류는 *후보* 까지, ADR 박제는 software-design 위임. |
| 3 | [`software-design`](skills/software-design/SKILL.md) | Strategic → Tactical 다리. 폴더 구조·CQRS 깊이·cross-BC 접근·BC 통합 패턴·Aggregate 트랜잭션 경계 등 구조적 결정을 사용자와 토론(2~4 옵션 + 트레이드오프 표) 후 ADR 1장으로 박제. 한 호출 = 한 결정. immutable. |
| 4 | [`tactical-design`](skills/tactical-design/SKILL.md) | 한 워크플로의 전술 plan 생성기 — Aggregate 정의·invariant 배치·Command-메서드 매핑·Domain Event 페이로드·Repository 인터페이스·Read Model 위치·Cross-BC 참조. Vernon 4 rules + ADR 결정 적용. 산출물 .md 안 만듦 — 코드가 진실. 핵심 invariant만 모듈 README 권장. |

## 산출물 구조

```
docs/
├── learning-notes/
│   └── {domain}-classroom.md              # domain-classroom 산출물
├── eventstorming/
│   ├── index.md                           # 빅픽처 메타 (페이즈 맵·횡단·핫스팟·Subdomain 후보)
│   ├── 01-onboarding/
│   │   ├── bigpicture.md                  # 빅픽처 페이즈 산출물
│   │   └── activation.md                  # Process Modeling 워크플로
│   ├── 02-annual-leave/
│   │   ├── bigpicture.md
│   │   ├── grant.md                       # 워크플로 N개
│   │   ├── consume.md
│   │   └── promotion.md                   # cross-phase (owner=P2)
│   └── _shared/                           # escape hatch
└── adr/
    ├── 0001-bc-split-{domain}.md          # software-design 산출물 (immutable)
    ├── 0002-folder-structure.md
    └── 0003-cross-bc-data-access.md

AGENTS.md or CLAUDE.md                     # playbook 산출물 한 섹션 (상시 로드)
src/modules/{bc}/README.md                 # tactical-design 권장 박제 (핵심 invariant)
```

## 단계 간 책임 경계

| 단계 | 단위 | 모드 | 산출물 |
|---|---|---|---|
| playbook | 사용 가이드 1세트 | 인스톨 (한 번) | AGENTS.md / CLAUDE.md 한 섹션 |
| domain-classroom | 도메인 일반 패턴 | 학습 | 학습 노트 |
| eventstorming — Big Picture | **Phase** (시간축) | 탐색 (divergent) | 페이즈별 빅픽처 .md |
| eventstorming — Process Modeling | **Workflow** (가치 흐름) | 합의 (convergent) | 워크플로별 .md |
| eventstorming — BC+Subdomain Discovery | **BC 후보** (논리 경계) | 후보 식별 | index.md 부록 B 갱신 |
| software-design | **결정 1개** | 트레이드오프 + 박제 | ADR (immutable) |
| tactical-design | **워크플로 1개** | 전술 plan | in-conversation (코드 + 모듈 README) |
| **코드 영역** (별도) | **Aggregate / Module** | 구현 | 소스코드 |

EventStorming 3 레벨이 우리 라인업에 자연 매핑됩니다:

| Brandolini 레벨 | 우리 스킬 |
|---|---|
| Big Picture | eventstorming (사이클 1·2) |
| Process Modeling | eventstorming (사이클 3) |
| **Software Design** | software-design (ADR — 구조적 결정) + tactical-design (구현 plan — 워크플로 단위) |
| (오케스트레이션) | playbook |

## Sticky 컨벤션 (전체 개요)

물리 EventStorming 보드는 *크기·모양*으로 sticky를 구분하지만, 텍스트는 색만 표현 가능 → **각 sticky 의미당 1개 이모지**로 10종 충돌 없이 매핑.

각 SKILL.md는 자신이 쓰는 sticky 표를 **자급자족으로 포함**합니다. 이 섹션은 전체 개요·인간 독자용.

### 빅픽처 단계

| 이모지 | 의미 | 시제·형식 | 예시 |
|---|---|---|---|
| 🟧 | **Domain Event** | 과거형 | `🟧 사원 활성화됨 EmployeeActivated` |
| ⭐ | **Pivotal Event** | Event 위 별 — 페이즈 전이점 | `⭐ 사원 사전 등록됨 EmployeePreRegistered` |
| 🟨 | **Actor** | 사람·시스템 (작은 노랑) | `🟨 인사담당자`, `🟨 CRON` |
| 🟥 | **External System** | 외부 결합 (큰 분홍) | `🟥 Google SMTP` |
| 🔥 | **Hotspot** | 의문·갈등·위험·미해결 | `🔥 H1-K 사전등록 이메일 오타 정책` |

### Process Modeling 추가 (위 5종 + 다음 4종)

| 이모지 | 의미 | 시제·형식 | 예시 |
|---|---|---|---|
| 🟦 | **Command** | 현재형 — 의도 | `🟦 사원 활성화 요청 RequestEmployeeActivation` |
| 🟪 | **Policy** | Whenever event → then command | `🟪 OnEmployeeActivated → SendWelcome` |
| 🟩 | **Read Model** | 의사결정 정보 | `🟩 활성화 대기 목록 PendingActivationList` |
| 🟫 | **Aggregate** (후보) | 일관성 경계 — 정식 정의는 tactical-design | `🟫 Employee (status 머신)` |

### 선택 (코드 영역과 함께)

| 이모지 | 의미 | 비고 |
|---|---|---|
| ⬜ | **UI Mockup** | 화면 와이어 (선택) |

### 원본 Brandolini 컨벤션과의 차이 (텍스트화 시 색 충돌 해소)

- **Hotspot 🔥** — 원본은 분홍이지만 External(🟥)과 색 충돌 → 분리
- **Aggregate 🟫** — 원본은 큰 노랑 사각이지만 Actor(🟨)와 색 충돌 → 분리 (큰 노랑 → 갈색 톤 비유)
- **Pivotal ⭐** — 원본은 보라이지만 Policy(🟪)와 색 충돌 → 분리

## 트리거 예시

```
"이 프로젝트에 ddd-workshop 가이드 박제해줘"   → playbook
"{도메인명} 도메인 학습 시작"                  → domain-classroom
"빅픽처 만들어줘"                             → eventstorming (Big Picture Initial)
"{페이즈명} 페이즈 깊게 파보자"                → eventstorming (Process Modeling)
"이제 BC 식별하자"                            → eventstorming (BC + Subdomain Discovery)
"폴더 구조 ADR 작성"                          → software-design
"BC 통합 패턴 결정해줘"                        → software-design
"P1 활성화 코드 작성 직전 plan"                → tactical-design
"Employee Aggregate 정의해줘"                  → tactical-design
```

## References

- Alberto Brandolini, *Introducing EventStorming* — https://www.eventstorming.com/book/
- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003)
- Eric Evans, *DDD Reference* (2015) — https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf
- Vaughn Vernon, *Implementing DDD* (2013), *Domain-Driven Design Distilled* (2016)
- Vaughn Vernon, *Effective Aggregate Design* (3-part paper) — https://www.dddcommunity.org/library/vernon_2011/
- Vlad Khononov, *Learning Domain-Driven Design* (O'Reilly, 2021)
- Context Mapper — https://contextmapper.org/
- 전역 규칙: [`~/AGENTS.md`](../../AGENTS.md), 저장소 규칙: [`../AGENTS.md`](../AGENTS.md)
