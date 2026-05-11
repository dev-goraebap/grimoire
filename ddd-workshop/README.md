# ddd-workshop

**1:1 환경에서 DDD/EventStorming 워크숍을 돌리는 도구 모음.** 그룹 워크숍을 못 하는 환경(SI·소규모·1인 개발)에서 도메인 학습 → 빅픽처 → 프로세스 모델링 → BC 박제까지를 한 사람이 AI와 함께 누적하고, 그 산출물이 코드와 어긋나지 않도록 구현 단계 워크플로까지 박제해 운영합니다.

네 스킬이 파이프라인을 이룹니다:

1. **domain-classroom** — 낯선 도메인 학습 (강의 모드)
2. **bigpicture** — Big Picture EventStorming (페이즈·이벤트·핫스팟)
3. **process-modeling** — Process Modeling + BC Discovery (워크플로·Command·Policy + ADR 박제)
4. **implementation-protocol** — 코딩 단계 워크플로 인스톨러 (설계 정렬 규약을 AGENTS.md/CLAUDE.md에 박제)

각 스킬은 독립 실행 가능하지만, 순서대로 돌리면 산출물이 자연스럽게 다음 단계 입력이 됩니다. 1~3은 명시 호출 도구, 4는 한 번 설치 후 상시 로드되는 컨텍스트 엔지니어링 도구입니다.

## 이 플러그인의 설계 원칙

- **권위 출처와 정렬.** Brandolini *Introducing EventStorming*, Vaughn Vernon *DDD Distilled*의 정통 산출물만 다룬다. 페이즈·도메인 이벤트는 빅픽처, Command/Policy/Read Model은 프로세스 모델링, Aggregate 정의는 코드 영역 — 단계를 섞지 않는다.
- **시각 보드 → 텍스트 산출물.** 물리 벽·포스트잇 대신 마크다운 폴더 구조. 페이즈마다 폴더, 워크플로마다 .md.
- **한국어 자연어 + Code Identifier 이중 표기.** 도메인 전문가 친화 + 코드 매핑 명확.
- **4기준 게이트.** 도메인 이벤트 판별 4기준(도메인 전문가 관심·비즈니스 상태 변화·법적 의미·다른 흐름 트리거)으로 UI/Telemetry/기술 이벤트 혼입 차단.
- **합의는 박제, 의문은 핫스팟.** 결정은 ADR/문서로 immutable 박제, 미해결은 ID·확신도 태그 붙여 누적.
- **코드 영역과 분리.** 이 플러그인은 *논리 모델 결정*까지. 코드 모듈 폴더 생성·소스코드 작성은 별도 영역.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install ddd-workshop@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill domain-classroom --skill bigpicture --skill process-modeling --skill implementation-protocol
```

## 포함된 스킬

### 파이프라인

```
[ domain-classroom ] → [ bigpicture ] → [ process-modeling ] → [ implementation-protocol ]
   도메인 일반 패턴      클라이언트 매핑      워크플로 + BC 박제      구현 단계 워크플로 박제
        ↓                   ↓                   ↓                       ↓
  learning-notes/     eventstorming/      eventstorming/         AGENTS.md or CLAUDE.md
  {domain}-             index.md +          {phase}/*.md           안 한 섹션
  classroom.md          {NN-phase}/         + docs/adr/            (상시 로드 컨텍스트)
                        bigpicture.md
                                            (1~3 = 명시 호출)      (4 = 한 번 설치, 상시 로드)
```

| 스킬 | 단계 | 역할 |
|---|---|---|
| [`domain-classroom`](skills/domain-classroom/SKILL.md) | **학습** | AI가 가상 도메인 전문가(선생님)가 되어 낯선 도메인의 일반 산업 패턴을 강의. 인지과학 8원칙(Cognitive Load·Practice Testing·Self-Explanation 등) 기반. 메뉴 → 페이즈 잠수 → Q&A → Feynman 자기 설명. |
| [`bigpicture`](skills/bigpicture/SKILL.md) | **빅픽처** | 빅픽처 EventStorming의 1:1 분석 도구. 학습 노트 + 클라이언트 자료(RFP·요구사항·기존 스키마)를 페이즈·도메인 이벤트·액터·외부 시스템·핫스팟·피벗으로 매핑. 페이즈별 폴더 구조로 처음부터 시작. |
| [`process-modeling`](skills/process-modeling/SKILL.md) | **프로세스** | 빅픽처 페이즈 1개를 잡아 end-to-end 워크플로로 펼침. Command·Policy·Read Model·Aggregate 후보·대안 경로. 횡단 워크플로는 owner-phase 규칙. **닫는 활동으로 BC Discovery 모드** — 6 신호 클러스터링 → 토론 → ADR 박제. |
| [`implementation-protocol`](skills/implementation-protocol/SKILL.md) | **구현 프로토콜** | 매 코딩 세션이 *설계 문서 검토 → 범위 확인 → 일치하면 코드, 불일치면 설계 갱신 먼저* 흐름을 따르도록 `AGENTS.md` / `CLAUDE.md`에 박제. 기존 워크플로(Git·이슈·CI·테스트)는 손대지 않고 slot-in 제안. 충돌 시 사용자 선택지. 한 번 설치 후 상시 로드. |

1~3번 스킬은 Initial / Update / Cycle 모드를 지원하여 코드 작성 후에도 다시 사이클을 돌 수 있습니다. 4번 스킬은 Install / Merge / Update / Conflict 모드로 한 번 설치 후 상시 로드 컨텍스트로 작동합니다.

## 산출물 구조

```
docs/
├── learning-notes/
│   └── {domain}-classroom.md           # domain-classroom 산출물
├── eventstorming/
│   ├── index.md                        # 빅픽처 — 페이즈 맵·횡단 매트릭스·핫스팟
│   ├── 01-onboarding/
│   │   ├── bigpicture.md               # 빅픽처 페이즈 산출물
│   │   └── activation.md               # process-modeling 워크플로 .md
│   ├── 02-annual-leave/
│   │   ├── bigpicture.md
│   │   ├── grant.md
│   │   ├── consume.md
│   │   └── promotion.md                # cross-phase, owner=P2
│   └── _shared/                        # escape hatch (마지막 수단)
└── adr/
    └── 0001-bc-split-{domain}.md       # BC Discovery 산출물 (immutable)
```

## 단계 간 책임 경계

| 단계 | 단위 | 모드 | 산출물 |
|---|---|---|---|
| domain-classroom | 도메인 일반 패턴 | 학습 (declarative + active recall) | 학습 노트 |
| bigpicture | **Phase** (시간축) | 탐색 (divergent) | 페이즈별 빅픽처 .md |
| process-modeling | **Workflow** (가치 흐름) | 합의 (convergent) | 워크플로별 .md |
| process-modeling — BC Discovery | **BC** (논리 경계) | 결정 박제 | ADR |
| implementation-protocol | **작업 단위** (이슈/티켓/기능) | 상시 로드 프로토콜 | AGENTS.md / CLAUDE.md 안 한 섹션 |
| **코드 영역** (별도) | **Aggregate / Module** | 구현 (constructive) | 소스코드 + 모듈 README |

EventStorming 3 레벨(Big Picture / Process Modeling / Software Design)에서 Software Design은 **코드 영역으로 흡수**되어 별도 .md를 만들지 않습니다 — 코드 자체가 가장 정확한 진실이기 때문에. BC라는 *논리 경계 결정*만 ADR로 박제합니다.

## Sticky 컨벤션 (전체 개요)

물리 EventStorming 보드는 *크기·모양*으로 sticky를 구분하지만, 텍스트 산출물은 색(이모지) 외 표현이 약합니다. **각 sticky 의미당 1개 이모지**로 10종 충돌 없이 매핑한 컨벤션입니다.

각 SKILL.md는 자신이 쓰는 sticky 표를 **자급자족으로 포함**합니다 (에이전트가 SKILL.md만 보고도 충돌 없이 표기 가능). 이 섹션은 전체 개요·인간 독자용.

### 빅픽처 단계 (bigpicture)

| 이모지 | 의미 | 시제·형식 | 예시 |
|---|---|---|---|
| 🟧 | **Domain Event** | 과거형 | `🟧 사원 활성화됨 EmployeeActivated` |
| ⭐ | **Pivotal Event** | Event 위 별 — 페이즈 전이점 | `⭐ 사원 사전 등록됨 EmployeePreRegistered` |
| 🟨 | **Actor** | 사람·시스템 (작은 노랑) | `🟨 인사담당자`, `🟨 CRON` |
| 🟥 | **External System** | 외부 결합 (큰 분홍) | `🟥 Google SMTP` |
| 🔥 | **Hotspot** | 의문·갈등·위험·미해결 | `🔥 H1-K 사전등록 이메일 오타 정책` |

### process-modeling 단계 추가 (빅픽처 5종 + 다음 4종)

| 이모지 | 의미 | 시제·형식 | 예시 |
|---|---|---|---|
| 🟦 | **Command** | 현재형 — 의도 | `🟦 사원 활성화 요청 RequestEmployeeActivation` |
| 🟪 | **Policy** | Whenever event → then command | `🟪 OnEmployeeActivated → SendWelcome` |
| 🟩 | **Read Model** | 의사결정 정보 | `🟩 활성화 대기 목록 PendingActivationList` |
| 🟫 | **Aggregate** (후보) | 일관성 경계 — 정식 정의는 코드 영역 | `🟫 Employee (status 머신)` |

### 선택 (software design / 코드 영역)

| 이모지 | 의미 | 비고 |
|---|---|---|
| ⬜ | **UI Mockup** | 화면 와이어 (코드 영역과 함께 다룰 때만) |

### 원본 Brandolini 컨벤션과의 차이 (텍스트화 시 색 충돌 해소)

- **Hotspot 🔥** — 원본은 분홍이지만 External System(🟥)과 색이 겹쳐 분리
- **Aggregate 🟫** — 원본은 큰 노랑 사각이지만 Actor(🟨)와 색이 겹쳐 분리 (큰 노랑 → 갈색 톤 비유)
- **Pivotal ⭐** — 원본은 보라이지만 Policy(🟪)와 색이 겹쳐 분리

## 트리거 예시

```
"{도메인명} 도메인 학습 시작"           → domain-classroom
"빅픽처 만들어줘"                      → bigpicture
"{페이즈명} 페이즈 깊게 파보자"         → process-modeling (워크플로 작성)
"이제 BC 식별하자"                     → process-modeling (BC Discovery 모드)
"구현 프로토콜 설치해줘"                → implementation-protocol (한 번만 호출, 이후 상시 로드)
```

## References

- Alberto Brandolini, *Introducing EventStorming* — https://www.eventstorming.com/book/
- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003)
- Vaughn Vernon, *Domain-Driven Design Distilled* (2016)
- Vlad Khononov, *Learning Domain-Driven Design* (O'Reilly, 2021)
- 전역 규칙: [`~/AGENTS.md`](../../AGENTS.md), 저장소 규칙: [`../AGENTS.md`](../AGENTS.md)
