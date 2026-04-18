---
name: domain-model
description: >
  도메인 모델 문서(`DOMAIN.md`)를 도메인별로 생성·관리하는 스킬. Bounded Context
  개요, Ubiquitous Language(용어 사전), 핵심 엔티티 + 불변 규칙, 도메인 이벤트,
  외부 의존성, 관련 정책·기능 링크를 담는 **한 장짜리 도메인 스펙**을 만든다.
  신규 합류자가 해당 도메인을 5분 안에 파악할 수 있는 밀도를 목표로 한다.
  도메인은 폴더로 그루핑(기본 `docs/domains/<domain>/DOMAIN.md`)하며, 폴더명과
  위치는 최초 실행 때 인터뷰로 정해 `AGENTS.md`/`CLAUDE.md`의 `## Blueprints Paths`
  섹션에 기록한다. "도메인 모델 만들어줘", "도메인 스펙 정리", "bounded context
  정의", "DOMAIN.md 만들어줘", "Ubiquitous Language 정리", "주문 도메인 문서화"
  같은 요청에 트리거한다.
---

# domain-model 스킬

도메인 모델 문서는 **"이 도메인은 뭐 하는 곳이고, 어떤 용어로 말하며, 어떤 규칙을 지키는가"**를 한 장에 담는다. 구현 상세(흐름·AC)는 다른 문서에 맡기고, 여기서는 **변하지 않는 뼈대**만 기록한다.

## 레퍼런스

`references/`에 완성 예제 2종이 있다. 생성 시 해당 예제의 밀도·톤을 따른다.

| 예제 | 파일 | 특징 |
|------|------|------|
| 주문 도메인 (e-commerce 전형) | `references/example-order.md` | 상태 전이·이벤트·외부 협력 균형 |
| 사용자·인증 도메인 | `references/example-identity.md` | 모든 도메인에 참조되는 기반 도메인 |

---

## 1. 언제 트리거하는가

다음 유형의 요청에 발동.

- "도메인 모델 만들어줘", "도메인 스펙 정리", "bounded context 정의해줘"
- "주문 도메인 문서화해줘", "결제 도메인 DOMAIN.md 작성"
- "Ubiquitous Language 정리", "이 도메인의 용어 사전"
- "/domain-model", "DOMAIN.md 만들어줘"

사용자가 기존 DOMAIN.md를 주며 "엔티티 추가해줘" / "이벤트 빠졌어"처럼 증분 수정을 요청해도 이 스킬이 처리한다.

---

## 2. 저장 경로 규약 (중요)

이 스킬은 경로를 **별도 config 파일에 저장하지 않는다**. 프로젝트 루트의 `AGENTS.md`(우선) 또는 `CLAUDE.md`에 `## Blueprints Paths` 섹션을 만들어 사용한다.

### 2-1. 최초 실행 절차

1. 프로젝트 루트에서 `AGENTS.md` → `CLAUDE.md` 순으로 source 파일을 선택한다 (없으면 `AGENTS.md`를 새로 만들지 않고 사용자에게 물어 결정).
2. source 파일에 `## Blueprints Paths` 섹션이 있고 `Domains folder:` 항목이 있으면 그 경로를 사용한다 → 3-2로.
3. 없으면 인터뷰:

```
도메인 문서를 어디에 저장할까요?
  기본값: docs/domains/
  (폴더명을 바꾸려면 예: 'contexts', 'bounded-contexts')

입력:
```

4. 인터뷰 결과를 `## Blueprints Paths` 섹션에 추가한다. 섹션이 아예 없으면 새로 생성:

```markdown
## Blueprints Paths

<!-- blueprints 플러그인의 스킬들이 프로젝트별 저장 경로를 이 섹션에서 읽고 씁니다. -->

- Domains folder: `docs/domains/`
```

5. 이후 호출부터는 **재질문하지 않는다**.

### 2-2. 경로 변경 요청

사용자가 "도메인 폴더 경로 바꿔줘"라고 요청하면 섹션의 값을 갱신하고, **기존 도메인 폴더는 이동하지 않는다** (사용자가 `git mv` 수동으로 옮기도록 안내). 자동 이동은 외부에 보이는 변경이라 Ask first 대상이다.

---

## 3. DOMAIN.md 섹션 구조

도메인당 한 장의 문서를 `{domains_folder}/<domain-slug>/DOMAIN.md`에 둔다.

### 3-1. 필수 섹션 (3개)

| # | 섹션 | 용도 | 분량 |
|---|------|------|------|
| 1 | **Role** | 이 도메인이 책임지는 일과 책임지지 않는 일 | 2~4문장 |
| 2 | **Ubiquitous Language** | 용어 → 의미 표 | 표, 5~15행 |
| 3 | **Invariants** | 핵심 엔티티 + 불변 규칙 | 불릿 3~10개 |

### 3-2. 선택 섹션

도메인 성격에 따라 필요할 때만.

| 섹션 | 언제 추가 |
|------|-----------|
| **Domain Events** | Pub/Sub·이벤트 드리븐 도메인일 때 |
| **External Dependencies** | 다른 도메인·시스템과 협력하는 도메인일 때 (대부분 해당) |
| **Related Policies** | 비즈니스 정책(POL-XXXX) 링크 모음 |
| **Related Sequences** | 기능 흐름 문서가 있을 때 (향후 `sequence-spec` 스킬 추가 시) |
| **Open Questions** | 미결정 사안이 있을 때 |

인터뷰 중 "이 도메인은 이벤트를 발행하나요?", "외부 시스템과 협력하나요?" 식으로 질문해서 선택 섹션 포함 여부를 결정한다.

### 3-3. 불변 규칙 vs 정책 구분 원칙

`Invariants`에는 **도메인이 망가지지 않기 위해 반드시 지켜야 할** 규칙만 쓴다. 다음은 `Invariants`가 아니라 **정책(POL-XXXX)** 쪽에 들어간다.

| 항목 | 예시 | 어디로? |
|------|------|---------|
| 도메인 본질 규칙 | "주문은 최소 1개 이상의 항목" | Invariants |
| 도메인 본질 규칙 | "총금액 = 항목금액의 합" | Invariants |
| 비즈니스 의사결정 | "주문 후 7일 내 무료 반품" | `policy-book` (POL) |
| 비즈니스 의사결정 | "3만 원 이상 배송비 무료" | `policy-book` (POL) |

판단 질문: **"이걸 바꾸면 도메인이 망가지나?"** → Yes면 Invariant, No면 Policy.

---

## 4. 인터뷰 절차

### 4-1. 도메인 식별 (1단계)

```
어떤 도메인을 만들까요?
  (예: 주문, 결제, 재고, 사용자·인증, 알림)

도메인 이름:
slug(폴더명):      # 자동 제안, 사용자 확인
```

slug는 영문 소문자 + 하이픈(`order`, `user-identity`). 기존에 같은 slug가 있으면 경고하고 수정을 제안.

### 4-2. Role 작성 (2단계)

```
이 도메인이 책임지는 일과 책임지지 않는 일을 한두 문장으로 정의해주세요.

예: "주문의 생성·상태 전이를 관리한다. 결제 승인과 재고 확보는 각각 Payment /
     Inventory 도메인에 위임한다."
```

Role은 **경계 선언**이라 짧고 단호해야 한다. 사용자 답이 모호하면 "X는 이 도메인 소관인가요?"로 재질문.

### 4-3. Ubiquitous Language 수집 (3단계)

```
이 도메인에서 중요한 용어 5~10개를 알려주세요. 정의는 같이.

  주문(Order): ...
  주문항목(OrderItem): ...
  주문상태: PENDING → PAID / FAILED / CANCELED
```

상태 값(enum)은 가능하면 이 섹션에 전이도 함께 적어 Invariants와 중복 줄인다.

### 4-4. Invariants 수집 (4단계)

**판단 질문을 적용**하면서 사용자 답을 걸러낸다:

> "이걸 어기면 도메인이 망가지나요?"

Yes → Invariants. No이고 "비즈니스 결정"이면 "이건 정책 문서(POL-XXXX)에 들어가는 게 맞아요. 지금 정책 문서도 만들까요, 나중에 `policy-book`으로 따로 만들까요?"로 분기.

### 4-5. 선택 섹션 여부 (5단계)

```
추가로 담을 섹션을 선택해주세요:
  [ ] Domain Events (이 도메인이 발행/구독하는 이벤트)
  [ ] External Dependencies (다른 도메인/시스템 협력)
  [ ] Related Policies (POL 링크)
  [ ] Open Questions (미결정 사안)
```

### 4-6. 최종 확인 (6단계)

전체 초안을 보여주고 "이대로 저장?" 확인.

---

## 5. 작성 규칙

### 5-1. 용어 일관성

- **Ubiquitous Language에 등록된 용어는 본문 전체에서 동일하게** 사용한다. "주문"과 "오더"를 섞어 쓰지 않는다.
- 영문 표기가 중요한 용어는 "주문(Order)"처럼 괄호로 병기.

### 5-2. 외부 의존성 표기

`External Dependencies`는 표로, **어떤 방식으로 협력하는지** 동사로 명시한다.

```
| 도메인 | 상호작용 |
|--------|----------|
| Payment | 결제 승인 요청 (synchronous) |
| Inventory | 재고 확인·차감 (synchronous) |
| Notification | 주문 상태 이벤트 구독 (asynchronous) |
```

### 5-3. 이벤트 명명

`Domain Events`는 **과거형 동사**로. `OrderCreated` (O) / `CreateOrder` (X — 이건 커맨드).

### 5-4. Related Policies 링크 포맷

```
## Related Policies
- [POL-0001 환불 정책](../../policies/POL-0001-refund.md)
```

경로는 source 파일의 `## Blueprints Paths`에서 `Policies folder` 값을 읽어 상대경로로 계산. `policy-book` 스킬이 아직 쓰이지 않아 `Policies folder` 항목이 없으면 **링크 플레이스홀더 주석**으로 남겨둔다:

```markdown
## Related Policies
<!-- policy-book 스킬로 정책 추가 시 자동으로 링크됩니다 -->
```

---

## 6. 증분 수정 워크플로우

기존 DOMAIN.md에 항목을 추가할 때:

| 요청 | 처리 |
|------|------|
| "엔티티 X 추가" | Invariants 섹션에 항목 추가 |
| "이벤트 Y 추가" | Domain Events 섹션(없으면 생성)에 추가 |
| "Payment 의존성 제거" | External Dependencies에서 해당 행 제거 + Role 재검토 제안 |
| "용어 재정의" | Ubiquitous Language 수정 + 본문 전역 변경은 `grep` 기반 안내 (자동 치환 X, Ask first 성격) |

**규칙 변경은 다른 도메인·정책·기능에 영향**을 줄 수 있으므로, 삭제·수정 시 "이 변경이 영향을 주는 다른 문서를 함께 확인하시겠어요?" 제안한다 (자동 수정 X).

---

## 7. 출력 스펙

### 7-1. 파일 배치

```
{domains_folder}/
├── README.md              ← 도메인 인덱스 (자동 생성, 선택)
├── order/
│   └── DOMAIN.md
├── payment/
│   └── DOMAIN.md
└── identity/
    └── DOMAIN.md
```

`README.md`(인덱스)는 스킬이 필요할 때만 생성·갱신한다. 도메인 2개 이하면 생성 보류, 3개 이상이면 인덱스 생성을 제안.

### 7-2. DOMAIN.md frontmatter

```yaml
---
domain: order
status: active          # draft | active | deprecated
owner: backend-team     # 선택
related_prd: ../../lean-prd.md   # 선택, PRD가 있으면
---
```

`status`는 수명 관리용 — 이 도메인이 현재 활성인지, 재구성 중인지, 더 이상 쓰지 않는지.

---

## 8. 생성 → 리뷰 → 개선 워크플로우

1. **초안 생성** — 인터뷰 후 필수 3섹션 + 선택된 섹션을 채운 `DOMAIN.md`를 저장.
2. **리뷰 반영** — 사용자가 용어 수정, 규칙 추가·삭제 요청하면 해당 섹션만 수정.
3. **아카이브** — 도메인이 폐기되면 `status: deprecated` 로 표시 (파일 삭제 X).
4. **분할** — 도메인이 너무 커지면 Bounded Context 분할을 제안 (`split-domain` 같은 후속 동작은 범위 밖, 사용자 수동).
