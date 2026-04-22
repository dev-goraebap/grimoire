---
name: aggregate-designer
description: >
  ddd-workshop 파이프라인의 5단계(최종 산출물). 한 BC 내부의 Aggregate를
  1개씩 설계한다. 먼저 Design-Level Event Storming(이벤트·커맨드·액터·정책·
  핫스팟)을 상세화하고, 그 흐름을 근거로 Aggregate 구조(Root/Entity/VO),
  불변식(Invariant), 정책(Policy의 구현 위치)을 결정한다. 산출물은
  docs/domains/{bc}/{aggregate}.md 1개. BC 내 여러 Aggregate는 여러 번 호출.
  "aggregate 설계", "애그리거트", "invariant", "불변식", "domain policy",
  "event storming 상세", "aggregate designer", "ddd-workshop 5단계" 같은
  요청에 트리거한다.
metadata:
  author: dev-goraebap
  version: "0.2.0"
---

# aggregate-designer 스킬

ddd-workshop 파이프라인의 **최종 산출물**. 한 BC에서 Aggregate 1개를 완성된 `.md` 파일로 설계한다.

이 스킬은 **Design-Level Event Storming** (상세한 이벤트·커맨드·정책·핫스팟)을 내부 단계로 수행한 뒤, 그 흐름에서 Aggregate 경계·불변식·정책을 끌어낸다. v1의 `event-flow-mapper`가 하던 일이 이 스킬의 도입부로 통합됨.

## 레퍼런스

| 파일 | 용도 |
|---|---|
| `references/template.md` | Aggregate 문서 템플릿 |
| `references/example-order.md` | 주문 Aggregate (B2C) |
| `references/example-organization.md` | 조직 Aggregate (사내) |

---

## 대화 UX 규약 (필수)

- **카테고리 선택은 숫자 메뉴**. 자유 입력 금지.
- **1문 1답 기본**. 단순 Yes/No만 2~3개까지 번호 달아 묶기 허용.
- **진행 표시**: `[Q 3/12 · 근거: ...]`
- **"나중에" / "모름" / "스킵" 항상 허용** → `⚠️ 미정`으로 산출물에 기록.
- **자가 진단·평가는 ✅/⚠️/❌ 3단계**. 숫자 점수 금지.
- **정답보다 올바른 질문 생성**이 스킬의 핵심 가치.

---

## 1. 언제 트리거하는가

- `/ddd-workshop:aggregate-designer`
- `context-designer` 출력 직후
- "Order Aggregate 설계", "이벤트 스토밍 상세", "Invariant vs Policy 구분"
- BC와 Aggregate를 지정하며 호출 ("[거래] BC의 Order Aggregate")
- 기존 `.md` 업데이트 → `--update`

**호출 단위**: Aggregate 1개 = 1회 호출. 같은 BC라도 여러 Aggregate면 여러 번.

---

## 2. 입력

- `docs/context-map.md` — 대상 BC 정보
- `docs/ubiquitous-language.md` — 개념·용어
- `docs/requirements.md` — 엣지 케이스·제약
- `docs/subdomain-classification.md` — Core/Supporting/Generic (상세도 결정)

---

## 3. Step 0 — Upstream 일관성 스캔

자동 점검:

1. 4개 upstream `updated_at` 비교 → stale 경고.
2. 대상 BC가 `context-map.md`에 실제로 정의되어 있는지 확인.
3. BC의 분류(Core/Supporting/Generic) 확인 → 상세도 자동 조정.
   - Core → 이벤트 스토밍 철저 + Invariant/Policy 엄격 분리
   - Supporting → 표준 CRUD 수준
   - **Generic → 이 스킬 실행을 만류. 외부 솔루션 인터페이스로 가라고 제안.**
4. 주요 용어 동음이의어가 있으면 "이 BC의 맥락에서의 정의"로 고정.

```
📋 Upstream 스캔
- 대상 BC: [거래] (Core)
- 주요 용어 로드: 주문, 주문항목, 결제결과스냅샷
- BC 내 예상 Aggregate 후보 (용어집 기반): Order, Cart
- ⚠️ 재고 BC 경계가 context-map에서 미정 → 외부 참조로 처리하시겠습니까?
```

---

## 4. 핵심 원칙

### Aggregate 설계 규칙
- **작게** 시작. 의심스러우면 분리.
- **Root만 외부 노출**. 내부 Entity·VO는 Root 경유.
- **Aggregate 간 참조는 ID로만**. 직접 객체 참조 금지.
- **한 트랜잭션 = 한 Aggregate**. 여러 Aggregate 걸친 일관성은 이벤트·Saga로.

### 불변식 vs 정책 구분 ⭐

| 구분 | 불변식 (Invariant) | 정책 (Policy) |
|---|---|---|
| 성격 | 항상 참 | 상황·시점에 따라 가변 |
| 위치 | Aggregate 내부 | **외부 분리**, 교체 가능 |
| 변경 주기 | 도메인 본질 바뀔 때만 | 마케팅·운영이 자주 바꿈 |
| 예시 | "잔액 ≥ 0", "주문 최소 1개 항목" | "VIP 10% 할인", "배송비 계산" |

**판정 질문** (헷갈릴 때):
- 이 규칙이 바뀌면 도메인 정의가 바뀌는가? → Yes = 불변식
- 마케팅·운영 변화로 바뀔 수 있는가? → Yes = 정책
- 테스트에서 가짜로 대체하고 싶은가? → Yes = 정책

**애매하면 Policy로 내리는 것이 안전** (올리기 쉽고 내리기 어렵다).

### 정책 구현 위치

| 위치 | 언제 |
|---|---|
| **Specification** | 조건 판별 재사용·조합·부정 |
| **Strategy (Policy 객체)** | 교체 가능한 의사결정 규칙 |
| **Domain Service** | 여러 엔티티 얽혀 단일 Aggregate에 애매 |
| **Event Handler** | 이벤트에 반응하는 비동기 정책 |

---

## 5. 진행 단계

### Step 1 — Aggregate 대상 확정 (1문 1답)

```
[Q 1/15]

이번 회차에 설계할 Aggregate를 정합니다.
BC [거래]의 Aggregate 후보 (용어집 기반):

1) Order (주문) — Core 활동 단위, 권장
2) Cart (장바구니) — 주문 전 상태 관리
3) 기타 (자유 입력)
4) 모름

DDD 권장: Core BC의 Aggregate Root부터 (권장: 1)
```

### Step 2 — Design-Level Event Storming (내부 + 사용자 확인)

#### 2-1. 이벤트 시드 추출 (내부)
대상 Aggregate와 관련된 이벤트를 과거형으로 시간 순 나열.

#### 2-2. 커맨드·액터 연결
각 이벤트 앞에 "누가 무엇을 시켰는가".

```
[회원] →(주문하기)→ [주문됨]
[결제 GW(외부)] →(결제통지)→ [결제완료됨]
```

#### 2-3. 정책(Policy) 추출
이벤트 → 자동 커맨드 연결.

```
[주문됨] ─정책: 재고 확인─→ (재고확인하기)
[결제완료됨] ─정책: 출고 요청─→ (출고요청하기)
```

#### 2-4. 분기·핫스팟
의사결정 모호 지점을 ⚠️로.

```
(결제하기) → [결제완료됨] or [결제실패됨] or [결제타임아웃됨]
⚠️ 결제 실패 시 재고 복원 타이밍?
```

#### 2-5. 사용자에게 이벤트 흐름 제시

```
아래 이벤트 흐름이 맞나요? (1문 1답으로 확인)

[Flow A: 주문·결제]
회원 →(주문하기)→ 주문됨
  ↓ 정책: 재고 확인
  주문하기 → 재고확인완료됨 OR 재고부족됨
  ↓ 정책: 결제 요청
  결제요청됨 → 결제완료됨 OR 결제실패됨
  ...

1) 그대로 OK
2) 누락 이벤트 추가
3) 잘못 그려진 부분 수정
4) 핫스팟 해소부터
```

핫스팟은 **가장 먼저** 사용자와 해소 (그 답에 따라 불변식/정책 판정이 달라짐).

### Step 3 — Role 작성

이 Aggregate가 **책임지는 것 + 책임지지 않는 것** 2~4줄.

### Step 4 — Structure 결정 (1문 1답)

- Root: 1개
- 내부 Entity 후보 (Root 없이 존재 불가)
- VO 후보 (값으로만 의미)
- 외부 참조 (ID만)

### Step 5 — Invariant 도출 (1문 1답)

각 규칙 후보를 **"3번 원칙 판정 질문"** 으로 검증.

```
[Q · 규칙: "주문은 최소 1개 OrderItem"]

판정 질문:
- 이 규칙이 바뀌면 도메인 정의가 바뀌는가? ✅
- 마케팅·운영이 바꿀 수 있는가? ❌
- 테스트에서 가짜 대체 원하는가? ❌

→ Invariant 판정. 동의하시나요? (1) 동의 2) 실은 Policy 3) 모름
```

### Step 6 — Policy 분리 (1문 1답)

각 정책에 구현 위치 제안 + 교체 시나리오.

```
[Q · DiscountPolicy]

제안 위치: Strategy (interface + 다형 구현체)
이유: 마케팅이 자주 바꿈. 프로덕션 무중단 교체 요구.
교체 시나리오: A/B 테스트, 블랙프라이데이 한정

동의하시나요?
1) 동의
2) Specification 더 적합
3) Domain Service 더 적합
4) Event Handler 더 적합 (비동기)
5) 실은 불변식이다
```

### Step 7 — External Dependencies

다른 Aggregate·BC·외부 시스템 참조 방식 명시. context-map과 일치하는지 자동 검증.

### Step 8 — Domain Events 발행/구독

이 Aggregate 상태 변경 시 발행 이벤트 + 반응하는 외부 이벤트.

### Step 9 — Open Questions

아직 확정되지 않은 설계 이슈 기록. 비어 있으면 "없음" 명시.

---

## 6. 산출물

기본 경로 `docs/domains/{bc}/{aggregate}.md`.

`references/template.md` 구조를 따르되 `sources:` 프런트매터 포함.

```markdown
---
aggregate: <RootName>
bc: <BoundedContextName>
classification: {Core|Supporting|Generic}
status: active
version: 0.2.0
sources:
  - path: docs/requirements.md
    skill: requirements-refiner
    version: 0.2.0
    updated_at: YYYY-MM-DD
  - path: docs/ubiquitous-language.md
    skill: domain-language-extractor
    version: 0.2.0
    updated_at: YYYY-MM-DD
  - path: docs/subdomain-classification.md
    skill: subdomain-classifier
    version: 0.2.0
    updated_at: YYYY-MM-DD
  - path: docs/context-map.md
    skill: context-designer
    version: 0.2.0
    updated_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---

# <RootName>

## Role

책임 + 책임 아닌 것.

## Ubiquitous Language
| 용어 | 의미 |

## Event Storming (Design-Level)

### 관련 플로우
(간략 다이어그램)

### 해소된 핫스팟
- 결제 실패 시 재고 복원: 즉시 복원 (사용자 확정)

### 미해소 핫스팟
- ⚠️ ...

## Structure
- Root / 내부 Entity / VO / 외부 참조 (ID only)

## Invariants

## Policies

### <PolicyName>
- 위치 / 이유 / 교체 시나리오

## External Dependencies
| Aggregate/BC/외부 | 참조 방식 | 비고 |

## Domain Events (발행)

## Domain Events (구독)

## Open Questions
- ⚠️ ...
```

---

## 7. 업데이트 모드 (`--update`)

1. 4개 upstream `updated_at` 비교 → stale 경고 (특히 `context-map.md` 변경 시 경계 영향 큼).
2. 사용자에게 "무엇을 업데이트?" 숫자 메뉴:
   ```
   1) 새 Invariant 추가
   2) Policy 추가·위치 변경
   3) 이벤트 스토밍 갱신 (요구사항 변동)
   4) Open Questions 해소
   5) 외부 의존 변경
   ```
3. 해당 부분만 delta 질문.

---

## 8. 강제 체크리스트

```
□ Step 0 upstream 스캔 완료
□ Generic BC면 이 스킬 실행 만류 확인함
□ 이벤트 스토밍에 비정상 경로(실패/취소/타임아웃) 포함
□ 핫스팟 최소 1개 기록 (없으면 "핫스팟 없음" 명시)
□ Role에 "책임 + 책임 아님" 둘 다 서술
□ Root 1개 확정
□ 외부 참조가 ID만 (context-map과 일치)
□ Invariant 최소 2개 + 각각 판정 질문 통과
□ Policy 최소 1개 + 위치 제안 + 교체 시나리오
□ Domain Events 발행·구독 둘 다 나열 (없으면 "없음" 명시)
□ Open Questions 섹션 존재
```

---

## 9. 맥락별 조정

| BC 분류 | 상세도 |
|---|---|
| **Core** | 최대 — Invariant/Policy 엄격 분리, 이벤트 스토밍 철저 |
| **Supporting** | 표준 — CRUD 중심, Policy 분리 최소화 |
| **Generic** | **실행 만류** — 외부 솔루션 인터페이스만 정의 권장 |

---

## 10. 절대 하지 말 것

- Generic BC에 Aggregate 설계를 강행 (외부 솔루션으로 대체 가능성 먼저 확인).
- Aggregate를 **크게** 잡기 (모든 엔티티 한 덩어리).
- 외부 Aggregate를 객체 참조로 가져오기 (ID만).
- 운영·정책 규칙을 Invariant로 박기 (VIP 할인, 배송비 등).
- Policy를 전부 Event Handler로 밀어넣기 (Specification/Strategy도 검토).
- 핫스팟을 "없음"으로 넘기기 (의심할 것 — 대부분 1개는 있음).
- 이벤트 스토밍을 **해피 패스**만 그리기 (실패/취소/타임아웃 필수).
- ORM 모델을 Aggregate와 동일시 (ORM 설계는 이 단계 아님).
- Open Questions 없이 "완벽" 선언.
- 한 메시지에 Invariant/Policy 검증을 전부 몰아 받기 (각각 1문 1답).
