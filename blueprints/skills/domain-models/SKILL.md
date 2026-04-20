---
name: domain-models
description: >
  Aggregate 하나를 `{aggregate}.md` 한 장으로 생성·관리하는 스킬.
  Aggregate의 Role, Ubiquitous Language(용어 사전), 내부 구조(Entity·VO),
  불변 규칙(Invariants), 교체 가능한 비즈니스 정책(Policies), 외부 의존을 담아
  해당 Aggregate를 빠르게 파악할 수 있는 밀도를 목표로 한다.
  기본은 `domain/` 하위에 평탄(flat) 파일로 두고,
  Bounded Context가 명확해지면 `domain/{bc}/` 폴더로 묶는다.
  "도메인 모델 만들어줘", "도메인 스펙 정리", "Aggregate 정의",
  "DOMAIN.md 만들어줘", "Ubiquitous Language 정리", "Aggregate 정리",
  "주문 도메인 문서화", "조직 도메인 문서화" 같은 요청에 트리거한다.
---

# domain-models 스킬

Aggregate 하나가 **"뭐 하는 곳이고, 어떤 용어로 말하며, 어떤 규칙·구조를 가지는가"**를 `{aggregate}.md` 한 장으로 기록한다. 구현 상세(흐름·AC)는 다른 문서에 맡기고, 여기서는 **변하지 않는 뼈대**만 담는다.

## 레퍼런스

`references/`에 완성 예제 3종이 있다. 생성 시 해당 예제의 밀도·톤을 따른다.

| 예제 | 파일 | 특징 |
|------|------|------|
| Order | `references/example-order.md` | 단일 Aggregate, flat 구조 |
| User · Session | `references/example-identity.md` | 2개 Aggregate, BC 폴더 구조 |
| Organization · Position · Employee | `references/example-organization.md` | 3개 Aggregate, BC 폴더 구조 |

---

## 1. 언제 트리거하는가

- "도메인 모델 만들어줘", "도메인 스펙 정리", "Aggregate 정의해줘"
- "주문 도메인 문서화해줘", "결제 Aggregate 문서 작성"
- "Ubiquitous Language 정리", "이 도메인의 용어 사전"
- "Aggregate 정리", "이 BC의 Aggregate 구조 만들어줘"
- "/domain-models", "DOMAIN.md 만들어줘"

기존 파일을 주며 "Invariant 추가해줘" / "VO 빠졌어"처럼 증분 수정을 요청해도 이 스킬이 처리한다.

---

## 2. 저장 경로 규약

이 스킬은 경로를 **별도 config 파일에도, 전용 섹션에도 저장하지 않는다**. 루트 `AGENTS.md`(우선) 또는 `CLAUDE.md`의 **기존 `## References` 섹션**에 한 줄로 얹는다.

### 2-1. 파일 배치 원칙

**기본 — Aggregate 단위 flat 구조**

Bounded Context가 불명확하거나 단일 BC인 경우 도메인 폴더 바로 아래에 Aggregate명으로 파일을 둔다.

```
docs/domains/
├── employee.md
├── organization.md
└── rank.md
```

**BC 명확 시 — 폴더로 묶기**

설계 초기부터 BC가 명확하거나, 개발 중 BC 경계가 드러나면 해당 BC 폴더를 만들고 그 안에 Aggregate 파일들을 둔다.

```
docs/domains/
├── workforce/
│   ├── employee.md
│   ├── organization.md
│   └── rank.md
├── payroll/
│   └── payroll.md
└── attendance/
    └── attendance.md
```

BC 폴더 이름은 **서비스 이름이 아닌 실제 영역 이름**. (`hr-service` X → `workforce` O)

### 2-2. 최초 실행 절차

1. 프로젝트 루트에서 source 파일 선택 — `AGENTS.md` → `CLAUDE.md` 순.
2. `## References`(또는 등가) 섹션에서 **도메인 폴더 경로를 찾는다** — "Domain models:", "도메인 모델:", "domains:" 같은 한 줄.
3. 찾으면 그 경로 사용.
4. 못 찾으면 인터뷰:

    ```
    도메인 문서를 어디에 저장할까요?
      기본값: docs/domains/
    ```

5. 결과를 `## References` 섹션에 한 줄 추가:

    ```markdown
    ## References
    - Domain models: `docs/domains/`
    ```

6. 이후 호출부터는 재질문하지 않는다.

---

## 3. 핵심 개념 — Aggregate와 Bounded Context

### 3-1. Aggregate — 이 스킬의 기본 단위

파일 하나 = Aggregate 하나.

- **트랜잭션·불변 조건 경계** — 한 Aggregate 안의 변경은 한 트랜잭션으로 완결.
- **Root Entity**가 외부 창구 — 외부는 Root만 안다. 내부 VO는 몰라도 됨.
- **Aggregate 간 참조는 ID로** — 객체 그래프 대신 ID를 소유 (`order.buyerId: string`).
- **VO는 자유 소유** — 값 자체가 의미라 Aggregate 경계 밖에도 자연스러움.

#### Aggregate 식별 기준

1. **독립된 라이프사이클**? — 따로 생성·삭제될 수 있으면 Aggregate Root 후보.
2. **자체 불변 조건**? — "주문 총금액 = 항목 금액 합" 같은 자체 규칙이 있으면 Root.
3. **다른 Aggregate가 ID로 참조하는 대상**? — 별도 Aggregate.
4. **값 자체가 의미**? — `Rank`, `Money`, `Email` 같이 식별자 없이 의미 성립 → VO.

### 3-2. Bounded Context (BC) — 파일 묶음 기준

BC는 **용어·규칙이 일관성 있게 해석되는 경계**다. 이 스킬에서는 BC = 폴더 묶음 기준.

- BC가 불명확하면 flat 구조로 시작.
- 같은 단어가 맥락에 따라 다른 의미로 쓰이기 시작하면 BC 분리 신호.
- 다른 팀이 맡는 영역이 생기면 BC 분리 신호.

#### 계층 요약

```
Project / Service
  └─ Bounded Context (= 폴더)          ← 명확할 때만
       └─ Aggregate (= 파일 하나)
            └─ Root Entity + Entity·VO
```

---

## 4. 파일 섹션 구조

각 Aggregate당 한 장을 `{aggregate-slug}.md`에 둔다.

### 4-1. 필수 섹션 (3개)

| # | 섹션 | 용도 | 분량 |
|---|------|------|------|
| 1 | **Role** | 이 Aggregate가 책임지는 일과 책임지지 않는 일 | 2~4문장 |
| 2 | **Ubiquitous Language** | 용어 → 의미 표 | 표, 3~10행 |
| 3 | **Invariants** | 불변 규칙 | 항목 목록 |

### 4-2. 선택 섹션

| 섹션 | 언제 추가 |
|------|-----------|
| **Structure** | 내부 Entity·VO가 여럿이라 명시 필요할 때 |
| **Policies** | "어기면 도메인이 망가지진 않지만" 교체 가능한 비즈니스 규칙이 있을 때 |
| **External Dependencies** | 다른 Aggregate/BC를 참조할 때 |
| **Open Questions** | 미결정 사안 |

### 4-3. Structure 섹션 포맷

내부 구성이 복잡할 때만 추가. 단순하면 생략.

```markdown
## Structure

- **Root**: Employee
- **내부 Entity**: (없음)
- **VO**: EmployeeStatus, Rank
```

### 4-4. Invariants 포맷

**"이걸 어기면 도메인이 망가지나?"** → Yes면 여기. No면 `Policies` 섹션.

```markdown
## Invariants

- 직원은 반드시 소속 조직이 있다
- 직급 변경은 12개월 이상 근속 후 가능
- 상태 전이: ACTIVE → INACTIVE → DELETED (역방향 불가)
```

| 항목 | 예시 | 어디로? |
|------|------|---------|
| 도메인 본질 규칙 | "주문은 최소 1개 항목" | Invariants |
| 도메인 본질 규칙 | "총금액 = 항목금액 합" | Invariants |
| 비즈니스 의사결정 | "주문 후 7일 내 무료 반품" | Policies |
| 비즈니스 의사결정 | "3만 원 이상 배송비 무료" | Policies |

### 4-5. Policies 섹션 포맷

"어기면 도메인이 망가지진 않지만" **비즈니스 결정으로 바뀔 수 있는 규칙**을 기록한다.
구현 시 Strategy·Specification·Domain Service 패턴 후보가 된다.

```markdown
## Policies

| 정책명 | 설명 | 구현 힌트 |
|--------|------|-----------|
| ShippingFeePolicy | 3만 원 이상 주문 시 무료배송 | Strategy |
| DiscountPolicy | VIP 등급 10% 할인 적용 | Specification + Strategy |
```

정책이 없으면 섹션을 추가하지 않는다.

### 4-6. External Dependencies 포맷

```markdown
## External Dependencies

| Aggregate / BC | 참조 방식 | 비고 |
|----------------|-----------|------|
| Organization | `organizationId: OrganizationId` | ID 참조 |
| Payment BC | `paymentId: string` | ID 참조, 결제 승인은 Payment BC 소관 |
```

---

## 5. 인터뷰 절차

### 5-1. Aggregate 식별 (1단계)

```
어떤 Aggregate를 만들까요?
  Root Entity 이름:          # 예: Employee, Order, Organization
  파일명(slug):               # 자동 제안, 사용자 확인 (예: employee)
```

여러 Aggregate를 한 번에 요청하면 하나씩 순서대로 진행하거나, 인터뷰를 공통으로 진행 후 파일을 나눠 저장한다.

### 5-2. BC 그룹화 여부 (2단계)

```
이 Aggregate가 속하는 Bounded Context(폴더)가 있나요?
  - 없음(기본): docs/domains/employee.md
  - 있음: 폴더명 → 예) workforce → docs/domains/workforce/employee.md
```

BC 폴더가 이미 존재하면 그 안에 바로 배치. 없으면 신설.

### 5-3. Role 작성 (3단계)

```
이 Aggregate가 책임지는 일과 책임지지 않는 일을 한두 문장으로 정의해주세요.

예: "직원의 생성·상태 전이·직급 관리를 담당한다.
     급여 계산과 근태 집계는 각각 Payroll / Attendance 소관이다."
```

### 5-4. Ubiquitous Language 수집 (4단계)

```
이 Aggregate에서 중요한 용어 3~8개를 알려주세요.

  직원(Employee): ...
  직원상태(EmployeeStatus): ACTIVE / INACTIVE / DELETED
  직급(Rank): 직원이 가지는 값 객체 (VO)
```

### 5-5. Structure 확인 (5단계)

```
내부 구성을 알려주세요.
  Root Entity:
  내부 Entity (있으면):
  VO (있으면):
  외부 참조 (다른 Aggregate ID):
```

단순하면 생략 가능. 섹션을 추가할지 물어본다.

### 5-6. Invariants & Policies 수집 (6단계)

규칙 후보를 하나씩 판단 질문으로 분류한다.

```
"이걸 어기면 도메인이 망가지나요?"
  Yes → Invariants
  No  → "비즈니스 결정으로 바뀔 수 있는 규칙인가요?"
           Yes → Policies (정책명·구현 힌트 함께 수집)
           No  → 불필요 — 기록 대상 아님
```

### 5-7. 선택 섹션 여부 (7단계)

```
추가로 담을 섹션을 선택해주세요:
  [ ] Policies (교체 가능한 비즈니스 정책)
  [ ] External Dependencies (다른 Aggregate/BC 참조)
  [ ] Open Questions (미결정 사안)
```

### 5-8. 최종 확인 (8단계)

전체 초안을 보여주고 "이대로 저장?" 확인.

---

## 6. 작성 규칙

### 6-1. 용어 일관성

- **Ubiquitous Language에 등록된 용어는 본문 전체에서 동일하게** 사용. "직원"과 "사원"을 섞지 않는다.
- 영문 표기가 중요한 용어는 "직원(Employee)"처럼 괄호로 병기.

### 6-2. Aggregate 간 참조 원칙

- **같은 BC 안이든 다른 BC든 Aggregate 간 참조는 ID로** — 객체 그래프 X.
- **VO는 자유 소유** — 값이라 경계 밖에도 자연스러움.

### 6-3. Policies 작성 원칙

- **정책명은 구현 클래스·인터페이스명과 일치**시키는 것을 권장. (`ShippingFeePolicy`)
- **구현 힌트**는 아키텍처 방향 제시용. `Strategy` / `Specification` / `Domain Service` 중 하나 이상.
- 정책이 여러 Aggregate에 걸치면 → Domain Service 힌트. 단일 Aggregate 안이면 → Strategy.
- **Invariants와 혼동 금지**: "이걸 바꿔도 `Aggregate`의 트랜잭션 일관성이 유지되는가?" → Yes면 Policy.

---

## 7. 증분 수정 워크플로우

기존 파일 수정 요청:

| 요청 | 처리 |
|------|------|
| "VO 추가" | Structure 섹션 + Ubiquitous Language에 반영 |
| "Invariant 추가" | 판단 질문 후 Invariants 또는 Policies에 반영 |
| "정책 추가" | Policies 섹션에 정책명·설명·구현 힌트 추가 |
| "외부 의존 제거" | External Dependencies 해당 행 제거 + Role 재검토 제안 |
| "용어 재정의" | Ubiquitous Language 수정 + 본문 전역 변경은 `grep` 기반 안내 |
| "BC 폴더로 묶어줘" | flat 파일을 `{bc}/` 폴더로 이동 제안 (`git mv`는 사용자 수동) |

---

## 8. 출력 스펙

### 8-1. 파일 배치

```
docs/domains/               ← flat (BC 불명확)
├── employee.md
├── organization.md
└── order.md

docs/domains/               ← BC 폴더 (BC 명확)
├── workforce/
│   ├── employee.md
│   └── organization.md
└── commerce/
    └── order.md
```

### 8-2. frontmatter

```yaml
---
aggregate: Employee                        # Aggregate Root 이름
context: workforce                         # 선택 — BC 폴더 사용 시
status: active                             # draft | active | deprecated
related_aggregates: [Organization, Rank]   # 선택 — 같은 BC 내 관련 Aggregate
---
```

`context`는 BC 폴더 사용 시에만 기재.

### 8-3. 완성 파일 예시

```markdown
---
aggregate: Employee
context: workforce
status: active
related_aggregates: [Organization, Rank]
---

# Employee

## Role

직원의 생성·상태 전이·직급 관리를 담당한다.
급여 계산과 근태 집계는 각각 Payroll / Attendance 소관이다.

## Ubiquitous Language

| 용어 | 정의 |
|------|------|
| 직원(Employee) | 조직에 소속된 구성원. 상태와 직급을 가진다. |
| 직원상태(EmployeeStatus) | ACTIVE / INACTIVE / DELETED |
| 직급(Rank) | 직원이 보유하는 값 객체. 변경 시 이력 없음. |

## Structure

- **Root**: Employee
- **VO**: EmployeeStatus, Rank
- **외부 참조**: `organizationId: OrganizationId`

## Invariants

- 직원은 반드시 소속 조직이 있다
- 상태 전이: ACTIVE → INACTIVE → DELETED (역방향 불가)

## Policies

| 정책명 | 설명 | 구현 힌트 |
|--------|------|-----------|
| RankPromotionPolicy | 직급 변경은 12개월 이상 근속 후 가능 | Strategy |

## External Dependencies

| Aggregate | 참조 방식 | 비고 |
|-----------|-----------|------|
| Organization | `organizationId: OrganizationId` | ID 참조. 조직 상세는 Organization 소관. |
```

---

## 9. 생성 → 리뷰 → 개선 워크플로우

1. **초안 생성** — 인터뷰 후 필수 3섹션 + 선택 섹션을 채운 파일 저장.
2. **리뷰 반영** — 용어 수정, 규칙 추가·삭제 요청 시 해당 섹션만 수정.
3. **BC 그룹화** — Aggregate가 늘어 BC 경계가 드러나면 폴더로 묶기 제안. `git mv`는 사용자 수동.
4. **아카이브** — Aggregate가 폐기되면 `status: deprecated`로 표시 (파일 삭제 X).
