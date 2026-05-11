---
name: software-design
description: >
  ddd-workshop 파이프라인의 **Strategic → Tactical 다리 + 구현 결정 박제 도구**.
  EventStorming에서 식별된 BC + Subdomain 후보 + Workflow를 입력으로 받아,
  코드 진입 직전에 필요한 *구조적 결정*(도메인 폴더 스트럭처·CQRS 깊이·
  cross-BC 데이터 접근·BC 간 통합 패턴·Aggregate 트랜잭션 경계·Domain Event
  발행 방식 등)을 사용자와 토론하고 **ADR 1장으로 박제**한다. 한 호출 =
  결정 1개 = ADR 1장. 다회 호출 패턴 (호호컴퍼니라면 0001 폴더 구조,
  0002 CQRS 깊이, 0003 cross-BC 접근, 0004 BC 통합 패턴 같은 식).
  Anthropic `/architecture` 스킬의 ADR 양식(Status·Context·Decision·
  Options Considered·Trade-off Analysis·Consequences·Action Items)을 따른다.
  옵션 도출 시 DDD 정통 + 실무 변형 2~4개를 트레이드오프 표(복잡도·환경
  적합도·결합도·변경 비용 등)로 비교 제시. 사용자 제약 조건 인터뷰
  (DB 환경·팀 규모·DBA 유무·성능 목표·SI/제품 환경) 후 추천. 산출물 위치:
  `docs/adr/{NNNN}-{slug}.md` (immutable — 변경 시 새 ADR + status: Superseded).
  Triggers — "ADR 작성", "결정 박제", "software design", "아키텍처 결정",
  "폴더 구조 정해줘", "CQRS 어디까지", "BC 통합 방식", "cross-BC 접근",
  "/software-design".
allowed-tools: Read Write Edit Glob Grep Bash
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# software-design 스킬

EventStorming에서 식별된 BC + Workflow를 입력으로, **Strategic → Tactical 다리** 결정을 사용자와 토론해 ADR로 박제하는 도구.

## 1. 정체성

EventStorming 스킬이 *후보 식별*까지라면, 이 스킬은 그 후보를 *코드 진입 직전 구체적 결정*으로 박제. 한 호출 = 한 결정 = 한 ADR.

| | eventstorming (이전) | software-design (이 스킬) |
|---|---|---|
| 단계 | Strategic Design 발견 | Strategic → Tactical 다리 |
| 단위 | 사이클 (페이즈/워크플로/BC 후보) | **결정 1개 = ADR 1장** |
| 호출 | 자동 모드 감지 | **명시 호출, 다회** |
| 산출물 위치 | `docs/eventstorming/` | `docs/adr/{NNNN}-{slug}.md` |
| immutable | X (사이클로 진화) | ✅ (변경 시 새 ADR) |

EventStorming Software Design 레벨에 해당하는 *결정 박제* 부분만 다룬다. 코드 작성·tactical Aggregate 정식 정의는 별도(`tactical-design`).

## 2. 다루는 결정 주제

기본 주제 카탈로그 (사용자 호출 시 자유 토픽도 가능):

| 주제 | 예시 결정 |
|---|---|
| **도메인 폴더 스트럭처** | `src/modules/{bc}/` vs `src/domains/{bc}/` vs flat — BC당 layer 구조 (application·domain·infrastructure 등) |
| **CQRS 깊이** | (a) 얇은 CQRS — Read Model = infrastructure Query Service · (b) 두꺼운 — 별도 read DB + projection |
| **Cross-BC 데이터 접근** | (A) Domain Event listen only · (B) Public API + ACL · (C) Shared Kernel (식별자만) · (D) 단일 DB cross-BC join 허용 (Query Service 한정) · (E) Read replica/materialized view |
| **BC 간 통합 패턴** | DDD 9 패턴 중 자주 쓰는 5종 — **ACL · OHS+Published Language · Customer-Supplier · Conformist · Shared Kernel** |
| **Aggregate 트랜잭션 경계** | "1 transaction = 1 aggregate" 정통 / pragmatic 위반 허용 범위·보완책 (outbox·saga) |
| **Domain Event 발행** | sync emit / outbox pattern / message broker — 단일 DB 환경 vs 분산 |
| **Repository 추상화** | Abstract Repository + impl / ORM 직접 노출 / Query Service 분리 |
| **Read Model 영속성** | projection / materialized view / 매번 query |
| **Read Model 위치 정통/실용** | Read Model을 도메인에 둘지 infrastructure 레이어에 둘지 |
| **(자유 주제)** | 사용자가 새 주제 제기 가능 |

## 3. 호출 흐름

```
사용자: /software-design "BC 간 cross-BC 참조 정책"
       또는 "/software-design" (주제 미정 → 인터뷰)

→ Step 1: 컨텍스트 수집 (자동)
→ Step 2: 결정 주제 명확화
→ Step 3: 제약 조건 인터뷰
→ Step 4: 옵션 도출 (DDD 정통 + 실무 변형)
→ Step 5: 트레이드오프 분석 (표)
→ Step 6: 추천 + 근거
→ Step 7: ADR draft → 사용자 검토 → 저장
```

## 4. Step 1 — 컨텍스트 수집 (자동)

| 읽기 대상 | 추출 |
|---|---|
| `docs/eventstorming/index.md` | BC 후보 + Subdomain 분류 + 횡단 패턴 |
| `docs/eventstorming/*/bigpicture.md` | 외부 시스템·액터·핫스팟 |
| `docs/eventstorming/*/*.md` (워크플로) | Policy direction · Read Model · Aggregate 후보 |
| `docs/adr/*.md` (기존) | 관련 결정 — 중복·충돌 회피 |
| 루트 `AGENTS.md` / `CLAUDE.md` | 프로젝트 제약 (트랙 A/B 자동 감지) |

이전 ADR이 있으면 **번호 자동 결정** (마지막 NNNN + 1). 새 ADR이 기존 ADR을 대체하는 경우 기존 status: Superseded로 표시.

## 5. Step 2 — 결정 주제 명확화

사용자가 주제 제공한 경우: 그대로 진행.
주제 미정인 경우: 2장 카탈로그 + 컨텍스트 분석 결과 기반으로 후보 제시:

> "ADR 후보:
> 1. 도메인 폴더 스트럭처 (가장 시급 — 코드 시작 전)
> 2. Cross-BC 데이터 접근 (BC 5개 식별됨, 통합 방식 미정)
> 3. CQRS 깊이 (Read Model 위치 모호)
>
> 어떤 결정부터?"

## 6. Step 3 — 제약 조건 인터뷰

ADR의 *Context* 섹션을 채우기 위한 표준 질문 (이미 알면 스킵):

| # | 질문 | 영향 |
|---|------|------|
| 1 | 데이터베이스 환경 — 단일 DB vs BC별 분리 vs 하이브리드? | cross-BC 접근·CQRS 옵션 |
| 2 | 팀 규모·DBA 존재? | 추상화 깊이·운영 부담 |
| 3 | 환경 — SI / 제품 / 스타트업? | pragmatic 위반 허용도 |
| 4 | 성능 목표 — RPS·동시 사용자 추정? | sync vs async·CQRS 깊이 |
| 5 | 변경 빈도 추정? | abstract 비용 vs 직접성 |
| 6 | 사용 ORM·언어·프레임워크? | type-safe 정도·repository 패턴 적합도 |
| 7 | 외부 통합 시스템·레거시 ACL 필요? | 통합 패턴 선택 |

답변 누락 항목은 ADR Context에 "{미정 — 가정 사용}"으로 명시.

## 7. Step 4 — 옵션 도출

DDD 정통 + 실무 변형 2~4개 옵션. 각 옵션에 다음 차원으로 평가:

| 차원 | 평가 |
|---|---|
| 복잡도 | 저/중/고 |
| 환경 적합도 (SI/소규모/단일 DB 등) | 저/중/고 |
| 결합도 | 약/중/강 |
| 변경 비용 (나중에 바꿀 때) | 저/중/고 |
| 팀 학습 곡선 | 저/중/고 |
| DDD 정통과의 거리 | 정통/근사/실용 변형 |

### 옵션 도출 시 권위 자료 참조

- **DDD 통합 패턴** — Evans Ch.14, Vernon *IDDD* ch.3, Khononov *Learning DDD* ch.4
- **Aggregate 트랜잭션** — Vernon *Effective Aggregate Design* 3부작
- **CQRS** — Greg Young 정통 / Vernon *IDDD* ch.4·14
- **이벤트 발행** — Outbox pattern (Chris Richardson *Microservices Patterns*)
- **Repository** — Evans *DDD* ch.6 / Vernon *IDDD* ch.12

## 8. Step 5 — 트레이드오프 분석 표

옵션을 차원 × 옵션 매트릭스로 표시:

```markdown
| 차원 | Option A | Option B | Option C | Option D |
|---|---|---|---|---|
| 복잡도 | 중 | 고 | 저 | 저 |
| SI 적합 | 중 | 저 | 고 | **고** |
| 결합도 | 약 | 약 | 중 | 강 |
| 변경 비용 | 저 | 고 | 중 | 고 |
| DDD 정통도 | 정통 | 정통 | 근사 | 실용 변형 |
```

## 9. Step 6 — 추천 + 근거

다음 형식:

> "{프로젝트 컨텍스트}이므로 추천:
> - 쓰기 경로: **Option A (Domain Event Listen)** — 정통, 결합 약화
> - 읽기 경로: **Option D (Cross-BC Query Join 명시 허용)** — SI 환경 적합, 보고서 쿼리 단순화
>
> 근거: ..."

추천은 **권유**이지 강제 X. 사용자가 다른 옵션 선호 시 그대로 진행 (ADR에 합의된 결정 박제).

## 10. Step 7 — ADR 작성

위치: `docs/adr/{NNNN}-{slug}.md` (4자리 zero-padded, slug는 영문 소문자+하이픈).

**번호 결정**:
- 기존 ADR 스캔 → 최대 NNNN + 1
- 기존 ADR이 0개면 0001부터

**ADR 양식 (Anthropic /architecture 형식 + DDD 확장)**:

```markdown
# ADR-{NNNN}: {Title}

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
**Date:** YYYY-MM-DD
**Deciders:** {결재 라인 — 보통 사용자 본인 + 도메인 전문가}

## Context

### 사실 (Facts)
- 컨텍스트 수집 결과: BC N개, Subdomain 분류 표, ...
- 관련 워크플로: docs/eventstorming/.../activation.md 등

### 제약 (Constraints)
- 데이터베이스: {단일 PostgreSQL / ...}
- 팀: {21명 SI / ...}
- 성능 목표: {추정치 또는 "미정"}
- 환경: {SI / 제품 / 스타트업}

### 관련 ADR
- ADR-0001 BC 분할 (이 결정의 입력)

## Decision

{선택한 옵션 명시 — 한 문장}

추가 세부 결정:
- {sub-decision 1}
- {sub-decision 2}

## Options Considered

### Option A: {이름}

| 차원 | 평가 |
|-----|------|
| 복잡도 | 중 |
| SI 적합 | 중 |
| 결합도 | 약 |
| 변경 비용 | 저 |
| DDD 정통도 | 정통 |

**Pros:**
- ...

**Cons:**
- ...

### Option B: ... (같은 형식)
### Option C: ...
### Option D: ...

## Trade-off Analysis

{차원 × 옵션 매트릭스 + 결정의 핵심 트레이드오프 설명}

## Consequences

- **쉬워지는 것**: ...
- **어려워지는 것**: ...
- **재검토 필요 시점**: ... (예: 데이터 100K 사용자 도달 시)

## Action Items

1. [ ] {구현 단계 1}
2. [ ] {구현 단계 2}
3. [ ] {후속 ADR 필요 시 — "ADR-{NNNN+1}에서 X 결정 예정"}

## 살아있는 의문 (Open Questions)

{결정 후에도 모니터링할 점}

---

## 변경 이력
- YYYY-MM-DD: Accepted.
```

## 11. immutable 정책

- ADR은 한 번 박으면 immutable
- 변경 시 → **새 ADR 작성** + 기존 ADR status: `Superseded by ADR-NNNN`
- 살아있는 의문·후속 작업은 ADR 내부 섹션에 추가 가능 (결정 자체는 불변)

## 12. eventstorming 부록 B 양방향 갱신

BC 분할 ADR 작성 시 `docs/eventstorming/index.md` 부록 B의 BC 후보에 ADR 링크 추가:

```markdown
| ✅ identity | 사원 활성화·인증 | Employee | activation.md | Core | [ADR-0001](../adr/0001-bc-split-hr.md) |
```

## 13. Anti-patterns

- **ADR 1장에 여러 결정 욱여넣기** — 한 호출 = 한 결정 = 한 ADR
- **컨텍스트 수집 생략** — eventstorming 산출물 못 읽으면 가정 박힌 ADR이 됨
- **옵션 1개만 제시** — 항상 2~4개 (균형 분석)
- **사용자 추천 따라가기 강제** — 추천은 권유, 사용자 선택 우선
- **ADR 수정** — immutable. 변경 시 새 ADR
- **번호 임의 부여** — 마지막 + 1 자동 결정
- **DDD 정통만 제시** — 실용 변형도 옵션에 포함 (특히 SI·소규모 환경)
- **EventStorming 산출물 변경** — software-design은 ADR만, eventstorming 갱신은 eventstorming 스킬

## 14. 짧은 예시

```
사용자: /software-design "BC 간 cross-BC 참조 정책"

→ Step 1: 컨텍스트 자동 수집
   - eventstorming index.md → BC 5개 + Subdomain 분류
   - 기존 ADR: 0001-bc-split-hr.md 발견
   - 트랙: AGENTS.md 감지

→ Step 2: 주제 명확화
   "Cross-BC 참조 정책 — 쓰기 경로·읽기 경로 둘 다 다룰까요?" → y

→ Step 3: 제약 인터뷰
   - DB: 단일 PostgreSQL (Drizzle)
   - 팀: 21명 SI, DBA 없음
   - 환경: SI
   - 성능: 100명 사용자 추정

→ Step 4: 옵션 4개 도출
   A. Domain Event Listen only
   B. Public API + ACL
   C. Shared Kernel
   D. Single DB cross-BC join 허용

→ Step 5: 트레이드오프 표

→ Step 6: 추천 — 쓰기 A + 읽기 D 하이브리드
   "단일 PG + SI + DBA 없음 → A·D 하이브리드 권장
    쓰기 결합 약화 + 읽기 성능 단순화"

→ Step 7: ADR draft
   docs/adr/0002-cross-bc-data-access.md
   사용자 검토 → y → 저장
   index.md 부록 B에 ADR-0002 링크 추가
```

## 15. 한 줄로 정리

> **EventStorming에서 식별된 BC + Workflow를 입력으로, 코드 진입 직전 *구조적 결정*을 사용자와 토론해 ADR 1장으로 박제. 한 호출 = 한 결정. immutable. DDD 정통 + 실무 변형 2~4 옵션 + 트레이드오프 표 + 추천. 산출물은 `docs/adr/{NNNN}-{slug}.md`. EventStorming 부록 B와 양방향 갱신.**
