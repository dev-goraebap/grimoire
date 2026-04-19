---
name: domain-models
description: >
  각 Bounded Context를 `DOMAIN.md` 한 장으로 생성·관리하는 스킬. Context의 Role,
  Ubiquitous Language(용어 사전), 내부 Aggregate 구조, Aggregate별 불변 규칙,
  도메인 이벤트, 외부 Context 협력, 관련 정책·기능 링크를 담아 신규 합류자가
  해당 Context를 5분 안에 파악할 수 있는 밀도를 목표로 한다. 여러 Bounded
  Context가 있는 시스템은 각 Context마다 DOMAIN.md를 하나씩 둔다. 폴더 위치는
  `AGENTS.md`/`CLAUDE.md`의 `## References` 섹션에 한 줄로 기록한다.
  "도메인 모델 만들어줘", "도메인 스펙 정리", "bounded context 정의",
  "DOMAIN.md 만들어줘", "Ubiquitous Language 정리", "Aggregate 정리",
  "주문 도메인 문서화", "조직 도메인 문서화" 같은 요청에 트리거한다.
---

# domain-models 스킬

각 Bounded Context가 **"뭐 하는 곳이고, 어떤 용어로 말하며, 어떤 규칙·구조를 가지는가"**를 한 장의 `DOMAIN.md`로 기록한다. 구현 상세(흐름·AC)는 다른 문서에 맡기고, 여기서는 **변하지 않는 뼈대**만 담는다. 여러 Context가 있는 시스템은 각 Context마다 DOMAIN.md를 하나씩 둔다.

## 레퍼런스

`references/`에 완성 예제 3종이 있다. 생성 시 해당 예제의 밀도·톤을 따른다.

| 예제 | 파일 | 특징 |
|------|------|------|
| 주문 Context (단순 단일 Aggregate) | `references/example-order.md` | 1 Aggregate + 외부 BC 참조 |
| 사용자·인증 Context (2 Aggregate) | `references/example-identity.md` | User / Session 분리된 Aggregate |
| 조직관리 Context (복합 3 Aggregate) | `references/example-organization.md` | Organization · Position · Employee 협력 |

---

## 1. 언제 트리거하는가

- "도메인 모델 만들어줘", "도메인 스펙 정리", "bounded context 정의해줘"
- "주문 도메인 문서화해줘", "결제 도메인 DOMAIN.md 작성"
- "Ubiquitous Language 정리", "이 도메인의 용어 사전"
- "Aggregate 정리", "이 BC의 Aggregate 구조 만들어줘"
- "/domain-models", "DOMAIN.md 만들어줘"

기존 DOMAIN.md를 주며 "Aggregate 추가해줘" / "이벤트 빠졌어"처럼 증분 수정을 요청해도 이 스킬이 처리한다.

---

## 2. 저장 경로 규약

이 스킬은 경로를 **별도 config 파일에도, 전용 섹션에도 저장하지 않는다**. 루트 `AGENTS.md`(우선) 또는 `CLAUDE.md`의 **기존 `## References` 섹션**에 한 줄로 얹는다.

### 2-1. 최초 실행 절차

1. 프로젝트 루트에서 source 파일을 선택한다 — `AGENTS.md` → `CLAUDE.md` 순.
2. source 파일의 `## References`(또는 등가) 섹션에서 **도메인 폴더 경로를 찾는다** — "Domain models:", "도메인 모델:", "domains:" 같은 한 줄.
3. 찾으면 그 경로 사용.
4. 못 찾으면 인터뷰:

    ```
    도메인 문서를 어디에 저장할까요?
      기본값: docs/domains/
      (폴더명을 바꾸려면 예: 'contexts', 'bounded-contexts')
    ```

5. 인터뷰 결과를 `## References` 섹션에 한 줄 추가 (섹션이 없으면 문서 끝에 신설):

    ```markdown
    ## References
    ...
    - Domain models: `docs/domains/`
    ```

6. 이후 호출부터는 재질문하지 않는다.

### 2-2. 경로 변경 요청

`## References`의 해당 줄을 갱신. **기존 도메인 폴더는 자동으로 이동하지 않는다** — `git mv`는 사용자가 수동으로 (Ask first 성격).

---

## 3. 핵심 개념 — Bounded Context와 Aggregate

DOMAIN.md를 잘 쓰려면 두 개념을 정확히 이해해야 한다. 혼동이 가장 잦은 지점.

### 3-1. Bounded Context (BC)

Bounded Context는 **용어·규칙이 일관성 있게 해석되는 경계**다. 세 가지를 꼭 기억한다:

- **BC는 시스템/서비스 전체가 아니다.** HR 서비스 하나에 조직관리 BC, 근태 BC, 급여 BC가 공존할 수 있다. "hr" 하나를 통째로 BC로 묶는 건 잘못된 추상화.
- **같은 단어가 BC마다 다른 모델**이 될 수 있다. "직원"이 조직관리에선 `상관·직책` 중심, 급여에선 `급여계정·세금` 중심.
- **한 DOMAIN.md = 한 Bounded Context**. 시스템에 BC가 3개면 DOMAIN.md도 3개.

#### BC 식별 신호

언제 BC를 나눠야 할지:

- 같은 단어가 맥락에 따라 다른 의미로 쓰이는가?
- 업무 이벤트 흐름이 독립적인가?
- 다른 팀·전문가가 맡는가?
- 모델 간 참조가 약한가?

작은 시스템은 **단일 BC**로 충분할 수 있다. 그 경우도 BC 이름은 서비스 이름이 아니라 **실제 다루는 영역 이름**으로 짓는다 (예: `hr-service`가 아니라 `workforce`).

### 3-2. Aggregate — BC 내부의 트랜잭션 단위

Bounded Context 안에는 **여러 Aggregate**가 있는 것이 기본이다.

- **트랜잭션·불변 조건 경계** — 한 Aggregate 안의 변경은 한 트랜잭션으로 완결.
- **Root Entity**가 외부 창구 — 외부는 Root만 안다. 내부 VO는 몰라도 됨.
- **Aggregate 간 참조는 ID로** — 객체 그래프 대신 ID를 소유 (`order.buyerId: string`).
- **VO는 자유 소유** — 값 자체가 의미라 Aggregate 경계 밖에도 자연스러움.

#### Aggregate 식별 기준

1. **독립된 라이프사이클**? — 따로 생성·삭제될 수 있으면 Aggregate Root 후보.
2. **자체 불변 조건**? — "주문 총금액 = 항목 금액 합" 같은 자체 규칙이 있으면 Root.
3. **다른 Aggregate가 ID로 참조하는 대상**? — 별도 Aggregate.
4. **값 자체가 의미**? — `Rank`, `Money`, `Email` 같이 식별자 없이 의미 성립 → VO.

HR "조직" Context 예: Organization·Position·Employee는 각자 Aggregate Root, Rank·EmployeeStatus는 VO.

### 3-3. 계층 요약

```
Project / Service
  └─ Bounded Context (= DOMAIN.md 하나)
       └─ Aggregate (Root Entity + 내부 Entity·VO)
            └─ Entity / VO
```

| 층 | 경계 기준 | 이 스킬의 단위 |
|---|---|---|
| Project / Service | 배포 단위 | 여러 DOMAIN.md의 상위 컨테이너 |
| **Bounded Context** | 용어·규칙 일관성 | **DOMAIN.md 하나** |
| **Aggregate** | 트랜잭션·불변 조건 | DOMAIN.md 안의 Aggregates 섹션 |
| Entity / VO | 식별자 유무 | Aggregate 내부 구성원 |

---

## 4. DOMAIN.md 섹션 구조

각 Bounded Context당 한 장을 `{domains_folder}/<context-slug>/DOMAIN.md`에 둔다.

### 4-1. 필수 섹션 (4개)

| # | 섹션 | 용도 | 분량 |
|---|------|------|------|
| 1 | **Role** | 이 BC가 책임지는 일과 책임지지 않는 일 | 2~4문장 |
| 2 | **Ubiquitous Language** | 용어 → 의미 표 | 표, 5~15행 |
| 3 | **Aggregates** | 이 BC의 Aggregate 목록 + Root·내부 구성원 | Aggregate 수만큼 서브섹션 |
| 4 | **Invariants** | Aggregate별 불변 규칙 | Aggregate별 그룹화 |

### 4-2. 선택 섹션

| 섹션 | 언제 추가 |
|------|-----------|
| **Domain Events** | Pub/Sub·이벤트 드리븐 BC일 때 |
| **External Dependencies** | 다른 BC와 협력할 때 (대부분 해당) |
| **Related Policies** | 비즈니스 정책(POL-XXXX) 링크 |
| **Related Sequences** | 기능 흐름 문서 (향후 스킬 추가 시) |
| **Open Questions** | 미결정 사안 |

### 4-3. Aggregates 섹션 포맷

Aggregate가 하나뿐이어도 **이 섹션은 반드시 둔다** — "이 BC에 어떤 Aggregate가 있는가"가 독자에게 가장 중요한 정보.

```markdown
## Aggregates

### Order (Aggregate Root)
- **내부 구성**: `Order` Entity(Root), `OrderItem` Entity(내부)
- **VOs**: `OrderStatus`, `Money`

### 외부 참조 (다른 BC)
- `buyerId: UserId` — Identity BC의 User를 ID로만 참조 (객체 그래프 X)
```

### 4-4. Invariants 섹션 — Aggregate별 그룹화

규칙이 어느 Aggregate 소관인지 드러나도록 **Aggregate별로 그룹**한다.

```markdown
## Invariants

### Order
- 주문은 최소 1개 이상의 OrderItem을 가진다
- 총금액 = OrderItem 금액의 합
- 상태 전이: PENDING → PAID/FAILED, PAID → CANCELED

### OrderItem
- 수량은 양의 정수
- 단가는 생성 후 변경 불가
```

### 4-5. 불변 규칙 vs 정책 구분

`Invariants`에는 **도메인이 망가지지 않기 위해 반드시 지켜야 할** 규칙만. 다음은 `Invariants`가 아니라 **정책(POL-XXXX)** 쪽:

| 항목 | 예시 | 어디로? |
|------|------|---------|
| 도메인 본질 규칙 | "주문은 최소 1개 항목" | Invariants |
| 도메인 본질 규칙 | "총금액 = 항목금액 합" | Invariants |
| 비즈니스 의사결정 | "주문 후 7일 내 무료 반품" | `policy-book` (POL) |
| 비즈니스 의사결정 | "3만 원 이상 배송비 무료" | `policy-book` (POL) |

판단 질문: **"이걸 바꾸면 도메인이 망가지나?"** → Yes면 Invariant, No면 Policy.

---

## 5. 인터뷰 절차

### 5-1. BC 식별 (1단계)

```
어떤 Bounded Context를 만들까요?
  (예: 주문, 결제, 재고, 사용자·인증, 조직관리, 급여)

BC 이름:
slug(폴더명):    # 자동 제안, 사용자 확인
```

이 이름은 **서비스 이름이 아님**. 실제 영역 이름. "hr-service"가 아니라 "workforce" / "payroll" / "attendance" 등.

### 5-2. Role 작성 (2단계)

```
이 BC가 책임지는 일과 책임지지 않는 일을 한두 문장으로 정의해주세요.

예: "주문의 생성·상태 전이를 관리한다. 결제 승인과 재고 확보는 각각
     Payment / Inventory BC에 위임한다."
```

Role은 **경계 선언**이라 짧고 단호해야 한다. 사용자 답이 모호하면 "X는 이 BC 소관인가요?"로 재질문.

### 5-3. Ubiquitous Language 수집 (3단계)

```
이 BC에서 중요한 용어 5~10개를 알려주세요. 정의는 같이.

  주문(Order): ...
  주문항목(OrderItem): ...
  주문상태: PENDING → PAID / FAILED / CANCELED
```

상태 값(enum)은 전이도 함께 적어 Invariants와 중복 줄인다.

### 5-4. Aggregate 식별 (4단계)

```
이 BC 안에 Aggregate가 몇 개인가요?
  각 Aggregate의 Root Entity 이름 + 내부 구성원(Entity·VO)을 알려주세요.

  예:
    1. Order (Root) + OrderItem (내부 Entity)
       VO: OrderStatus, Money
    2. 외부 BC 참조: buyerId (Identity BC의 User를 ID로)
```

§3-2 식별 기준으로 분류. 다른 BC 것을 참조하면 **ID만 소유**임을 명시.

### 5-5. Invariants 수집 (5단계)

Aggregate별로. **판단 질문**("이걸 어기면 도메인이 망가지나요?")으로 필터링. No이고 비즈니스 결정이면 정책으로 분리 안내.

### 5-6. 선택 섹션 여부 (6단계)

```
추가로 담을 섹션을 선택해주세요:
  [ ] Domain Events (이 BC가 발행/구독하는 이벤트)
  [ ] External Dependencies (다른 BC 협력)
  [ ] Related Policies (POL 링크)
  [ ] Open Questions (미결정 사안)
```

### 5-7. 최종 확인 (7단계)

전체 초안을 보여주고 "이대로 저장?" 확인.

---

## 6. 작성 규칙

### 6-1. 용어 일관성

- **Ubiquitous Language에 등록된 용어는 본문 전체에서 동일하게** 사용. "주문"과 "오더"를 섞지 않는다.
- 영문 표기가 중요한 용어는 "주문(Order)"처럼 괄호로 병기.

### 6-2. Aggregate 간 참조 원칙

- **같은 BC 안의 Aggregate 간 참조는 ID로** — Aggregate Root끼리 객체 소유 X.
- **다른 BC 참조는 ID + 스냅샷 VO 또는 계약 인터페이스** — External Dependencies 항목으로 기재.
- **VO는 자유 소유** — 값이라 경계 밖에도 자연스러움.

### 6-3. External Dependencies 표기

표로, **동사로** 협력 방식과 **기법**까지 명시:

```markdown
## External Dependencies

| BC | 상호작용 | 협력 기법 |
|----|---------|-----------|
| Payment | 결제 승인 요청 | 동기 (계약 인터페이스) |
| Inventory | 재고 확인·차감 | 동기 (계약 인터페이스) |
| Notification | 주문 상태 이벤트 구독 | 비동기 (이벤트) |
```

협력 기법의 선택(ID 참조 / 스냅샷 VO / 계약 인터페이스 / 도메인 이벤트)은 코드 레이어에서 결정되지만 DOMAIN.md에 한 줄 힌트로 남기면 설계 의도가 드러난다.

### 6-4. 이벤트 명명

`Domain Events`는 **과거형 동사**로. `OrderCreated` (O) / `CreateOrder` (X — 이건 커맨드).

### 6-5. Related Policies 링크 포맷

```markdown
## Related Policies
- [POL-0001 환불 정책](../../policies/POL-0001-refund.md)
```

경로는 source 파일의 `## References`의 `Policies folder` 값을 읽어 상대경로로 계산. `policy-book` 스킬이 아직 쓰이지 않아 값이 없으면 플레이스홀더 주석으로 남긴다:

```markdown
## Related Policies
<!-- policy-book 스킬로 정책 추가 시 자동으로 링크됩니다 -->
```

---

## 7. 증분 수정 워크플로우

기존 DOMAIN.md 수정 요청:

| 요청 | 처리 |
|------|------|
| "Aggregate 추가" | Aggregates 섹션에 서브섹션 추가 + Invariants 서브섹션도 추가 |
| "엔티티 X 추가" | 어느 Aggregate에 속하는지 확인 후 해당 Aggregate 서브섹션에 반영 |
| "이벤트 Y 추가" | Domain Events 섹션(없으면 생성)에 추가 |
| "Payment 의존성 제거" | External Dependencies에서 해당 행 제거 + Role 재검토 제안 |
| "용어 재정의" | Ubiquitous Language 수정 + 본문 전역 변경은 `grep` 기반 안내 (자동 치환 X, Ask first 성격) |

**규칙 변경은 다른 도메인·정책·기능에 영향**을 줄 수 있으므로, 삭제·수정 시 "이 변경이 영향을 주는 다른 문서를 함께 확인하시겠어요?" 제안한다.

---

## 8. 출력 스펙

### 8-1. 파일 배치

```
{domains_folder}/
├── README.md              ← 인덱스 (자동 생성, 선택)
├── order/
│   └── DOMAIN.md
├── identity/
│   └── DOMAIN.md
└── workforce/             ← HR의 조직관리 BC
    └── DOMAIN.md
```

폴더 이름은 **BC slug**. 서비스 이름이 아니다.

`README.md`(인덱스)는 스킬이 필요할 때만 생성. 2개 이하면 보류, 3개 이상이면 생성 제안.

### 8-2. DOMAIN.md frontmatter

```yaml
---
context: workforce                               # BC slug (폴더명과 동일)
status: active                                   # draft | active | deprecated
aggregates: [organization, position, employee]   # 선택 — 빠른 훑기·인덱스 생성용
owner: backend-team                              # 선택
related_prd: ../../lean-prd.md                   # 선택
---
```

`context`가 이전 `domain` 필드를 대체 — 개념과 이름 일치시킴. `aggregates`는 있으면 인덱스·검색에 활용.

---

## 9. 생성 → 리뷰 → 개선 워크플로우

1. **초안 생성** — 인터뷰 후 필수 4섹션 + 선택된 섹션을 채운 `DOMAIN.md` 저장.
2. **리뷰 반영** — 사용자가 용어 수정, 규칙 추가·삭제 요청 시 해당 섹션만 수정.
3. **아카이브** — BC가 폐기되면 `status: deprecated`로 표시 (파일 삭제 X).
4. **분할** — BC가 너무 커져 용어·규칙이 갈라지기 시작하면 **BC 분할**을 제안. 새 BC slug로 새 DOMAIN.md를 만들고 기존 것은 범위 축소 — 이 스킬이 분할을 자동화하지는 않고 사용자 수동 + 스킬이 새 DOMAIN.md 생성 지원.
