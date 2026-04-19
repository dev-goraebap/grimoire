---
section: domain-layer
---

# domain Layer

비즈니스 규칙·불변 조건이 모이는 **시스템의 심장**. 외부 의존성 최소화 + 단위 테스트 용이성이 최고 원칙.

## 책임

- 도메인 엔티티 / VO (Value Object) 정의
- 비즈니스 규칙·불변 조건 구현
- 도메인 이벤트 선언
- 리포지토리 **인터페이스** 선언 (구현은 `infrastructure/` 레이어에)
- 도메인 서비스 (규칙이 한 엔티티에 속하지 않을 때)

## 외부 의존성: 최소화하되 0은 아님

Clean/Hexagonal은 "도메인은 외부 의존 0"을 이상으로 삼지만 이 스킬은 **`shared` 참조까지 허용**한다 ([`00-overview.md`](00-overview.md)의 "Not Clean Architecture").

허용:

- `shared/logger` **인터페이스** (구체 구현 아닌 추상)
- `shared/errors` 기반 에러 (`NotFoundError` 등)
- `shared/util` 순수 유틸 (date/string/math)
- `shared/types` 횡단 타입 (`Result`, `Paginated`)

허용하지 않음:

- `app` / `use-cases` / `infrastructure` — 역방향
- **다른 Bounded Context 슬라이스** — 같은 레이어 참조 (Slice 방식에서)
- DB 드라이버 직접 — 리포지토리 인터페이스로 감싼다
- HTTP 클라이언트 직접 — 외부 API 어댑터를 `infrastructure`에 두고 인터페이스로

### 왜 shared는 허용하나

도메인 코드가 `dayjs(user.createdAt).isAfter(...)` 하나 쓴다고 테스트가 어려워지지 않는다. 반면 모든 유틸을 "도메인 서비스"로 감싸면 보일러플레이트 폭증. 실용 타협.

## Aggregate — Bounded Context 안의 트랜잭션 단위

Bounded Context 안에서 더 작은 단위로 **Aggregate**가 존재한다. 이 층위를 이해해야 domain 폴더 구조가 잡힌다.

### 정의

- **Bounded Context**: 용어·규칙의 **일관성** 경계 (같은 단어가 한 가지 뜻으로 쓰이는 범위).
- **Aggregate**: **트랜잭션·불변 조건** 경계 (한 트랜잭션 단위로 변경·저장되는 묶음).

Context는 용어 경계, Aggregate는 트랜잭션 경계 — 층위가 다르다.

### 전체 계층

```
Project (또는 Service)
  │
  ├─ Bounded Context 1
  │    ├─ Aggregate A
  │    │    ├─ Entity (Aggregate Root)
  │    │    └─ VO (internal)
  │    ├─ Aggregate B
  │    └─ Aggregate C
  │
  └─ Bounded Context 2
       ├─ Aggregate X
       └─ Aggregate Y
```

| 층 | 경계 기준 | 예 (HR) |
|---|---|---|
| Project / Service | 배포 단위 | "HR 서비스" |
| **Bounded Context** | 용어·규칙 일관성 | 조직관리 / 근태 / 급여 |
| **Aggregate** | 트랜잭션·불변 조건 | Organization, Employee, Payroll |
| Entity / VO | 식별자 유무 | Employee(Entity), Rank(VO) |

한 Context에 **여러 Aggregate가 있는 것이 기본 구성** — 보통 3~10개.

### Aggregate 간 참조는 ID로

Aggregate 간에는 객체 참조 대신 **ID로만** 참조한다 (DDD 원칙).

```ts
class Employee {
  constructor(
    public readonly id: string,
    public readonly positionId: string,      // Position Aggregate를 ID로
    public readonly organizationId: string,  // Organization도 ID로
    public rank: Rank,                       // VO는 직접 소유 OK
    ...
  ) {}
}
```

**왜 ID?**
- Aggregate마다 로드·저장이 독립적이게 유지 (한 트랜잭션에 여러 Aggregate가 묶이지 않도록)
- N+1·비대한 객체 그래프 방지
- 실제 Position 객체가 필요하면 `positionRepository.findById(positionId)`로 로드

**VO는 예외.** VO는 Aggregate 경계가 아니라 값이므로 직접 소유 가능.

### 같은 Context 안의 import는?

코드 `import` 자체는 **자유**. Employee entity가 Position 타입·VO·인터페이스를 import해 쓰는 건 OK. 다만 **객체 참조로 Position 인스턴스를 통째로 들고 있지 말 것** (ID만 소유).

### Aggregate는 어떻게 식별하나

판단 기준:

1. **독립된 라이프사이클인가?** — 따로 생성·삭제될 수 있으면 별도 Aggregate 후보.
2. **자체 불변 조건이 있는가?** — "주문 총금액 = 항목 금액 합" 같은 자체 규칙이 있으면 Root로 가져갈 가치.
3. **ID로 참조될 만한가?** — 다른 Aggregate들이 ID로 가리키면 별도 Aggregate.
4. **값 자체가 의미인가?** — Rank, Money, Email 같이 식별자 없이 값만으로 의미가 성립하면 VO.

HR "조직" Context 예:

| 개념 | 분류 | 이유 |
|---|---|---|
| Organization | Aggregate Root | 부서/팀 계층, 독립 라이프사이클 |
| Position | Aggregate Root | 구체 직책이 생성·소멸, Employee가 ID로 참조 |
| Employee | Aggregate Root | 독립 라이프사이클 |
| Rank | VO | 값 자체(사원·대리·과장) |
| EmployeeStatus | VO | 상태값(ACTIVE·SUSPENDED·DELETED) |

Position이 정말 별도 Aggregate인지, Employee의 VO인지는 **설계 선택지**. 직책이 독립 관리되면 Aggregate, Employee에만 의미 있고 함께 관리되면 VO.

## 도메인 레이어의 두 가지 모양

시스템 규모에 따라 구조가 달라진다. 이 유연성이 FSD(프론트)와 이 스킬의 주요 차이.

### 구조 요약 — 1층 vs 2층

```
Sliceless (단일 Context)            Slice (다중 Context)
─────────────────────              ───────────────────────
domain/                            domain/
├── employee/       ← Aggregate    ├── organization/  ← Context
├── organization/   ← Aggregate    │   ├── employee/      ← Aggregate
└── rank/           ← VO           │   ├── position/      ← Aggregate
                                   │   └── organization/  ← Aggregate
                                   ├── attendance/    ← Context
                                   │   └── attendance/    ← Aggregate
                                   └── payroll/       ← Context
                                       └── payroll/       ← Aggregate

domain → Aggregate                 domain → Context → Aggregate
(1층)                              (2층)
```

**판단 기준**: "같은 단어가 맥락에 따라 다른 모델로 쓰이는가?"

- No → Sliceless (Context 1개)
- Yes → Slice (Context N개)

실무 경험상 Context 수는 규모와 대체로 비례해 "작으면 Sliceless, 크면 Slice"가 프록시로 통하지만, **정확한 기준은 용어 다양성**이다. 단일 Context면 Aggregate가 많아도(10~20개) sliceless로 유지 가능.

### Sliceless 방식 (단일 Bounded Context)

도메인 개념이 한 용어 체계로 충분. 같은 단어가 맥락별로 다른 의미로 쓰이지 않음.

```
domain/
├── index.ts                         (public API — 외부가 참조할 것들만 export)
├── employee.entity.ts
├── organization.entity.ts
├── position.entity.ts
├── rank.vo.ts
├── employee.repository.ts           (interface)
├── organization.repository.ts       (interface)
├── tokens.ts                        (DI 토큰 모음)
├── policies/
│   └── employee-placement.policy.ts
└── events/
    └── employee-hired.event.ts
```

파일 수가 늘어나면 **Aggregate 단위 의미적 그룹화**도 허용:

```
domain/
├── index.ts
├── employee/                       ← Employee Aggregate 그룹
│   ├── employee.entity.ts
│   ├── employee-status.vo.ts
│   └── employee.repository.ts
├── organization/                   ← Organization Aggregate 그룹
│   ├── organization.entity.ts
│   └── organization.repository.ts
├── position/                       ← Position Aggregate 그룹
│   ├── position.entity.ts
│   └── position.repository.ts
├── rank/                           ← Rank (VO)
│   └── rank.vo.ts
├── policies/                       ← 여러 Aggregate 걸친 정책
│   └── employee-placement.policy.ts
└── events/
    └── employee-hired.event.ts
```

이 내부 폴더는 **슬라이스가 아니다**. 같은 Context 안이므로 `domain/employee/`가 `domain/position/`을 자유롭게 참조 가능. 서로 import OK (단, Aggregate 간 **객체 참조는 ID로, VO는 직접** 원칙은 유지 — 위 Aggregate 섹션 참조).

이 모양 자체가 슬라이스 없는 **의미적 그룹화**다 — 파일이 많아 탐색이 불편할 때의 편의 폴더.

**주의:** 경계를 안 나눴으니 참조 규칙도 없다는 뜻 — Slice 방식으로 진화할 때 "자유롭게 섞였던 참조"를 Context 경계에 맞춰 정리하는 리팩터링이 가장 큰 비용이 된다.

### Slice 방식 (다중 Bounded Context)

같은 단어가 맥락별로 다른 모델이 될 때 분화한다. 가장 흔한 신호: "`Employee`가 너무 커져서 읽기 어렵다" 또는 "조직관리 팀과 급여 팀이 Employee에 대해 다른 요구사항을 갖는다".

```
domain/
├── organization/                ← 조직관리 Context
│   ├── index.ts                     (public API)
│   ├── employee.entity.ts           (조직 맥락: 상관·직책·부서)
│   ├── organization.entity.ts
│   ├── position.entity.ts
│   ├── employee.repository.ts       (interface)
│   └── ...
├── attendance/                  ← 근태 Context
│   ├── index.ts
│   ├── attendance.entity.ts
│   ├── shift.entity.ts
│   └── employee-snapshot.vo.ts      (근태 맥락: ID + 부서명만)
└── payroll/                     ← 급여 Context
    ├── index.ts
    ├── payroll.entity.ts
    ├── salary.vo.ts
    └── payable-employee.vo.ts       (급여 맥락: ID + 급여계정 정보)
```

**각 Context 내부는 자유 참조, Context 간은 금지.** 같은 "Employee"라는 이름이 `organization/employee.entity`와 `payroll/payable-employee.vo`처럼 **다른 모델**로 분화한다 — 이것이 Bounded Context의 정수.

Context 안이 커지면 Aggregate 단위 그룹화도 가능 (Sliceless와 같은 패턴을 Context 안에 적용):

```
domain/organization/
├── index.ts
├── employee/                       ← Aggregate 그룹
│   ├── employee.entity.ts
│   └── employee.repository.ts
├── organization/                   ← Aggregate 그룹
│   └── organization.entity.ts
├── position/                       ← Aggregate 그룹
│   └── position.entity.ts
├── rank/
│   └── rank.vo.ts
└── policies/
```

이때 Context 이름(`organization`)과 그 안의 대표 Aggregate 이름이 겹치면 **세 번 중첩되는 경로**(`domain/organization/organization/organization.entity.ts`)가 생길 수 있다. 두 가지 해법:

- **대표 Aggregate는 Context 바로 아래 평평하게**, 나머지만 그룹화:
  ```
  domain/organization/
  ├── organization.entity.ts        (대표 — 평평)
  ├── organization.repository.ts
  ├── employee/
  └── position/
  ```
- **Context 이름을 더 추상적으로** (`organization` → `org-structure` / `workforce`).

### Context 식별 신호

언제 Slice 방식로 넘어가야 할지 실무 기준:

- **같은 단어가 다른 의미로 쓰이는가?** "직원"이 조직관리에선 인사고과 대상, 급여에선 지급 대상 — 같은 `Employee` 타입으로 둘 다 표현하면 타입이 비대해진다.
- **업무 이벤트 흐름이 다른가?** 근태 이벤트와 급여 이벤트가 독립적으로 흐른다면 분리 가능.
- **다른 팀·전문가가 맡는가?** 조직설계자와 급여담당자는 서로 다른 규칙을 둔다.
- **모델 간 참조가 약한가?** 직원의 근태 레코드가 조직 구조에 꼭 엮이지 않아도 되면 분리해도 OK.

### 세그먼트 분류는 안티패턴

```
# 지양
domain/
├── models/
├── value-objects/
├── repositories/
└── services/
```

기술적 유형별 분류는 **Employee 개념을 이해하려 네 폴더를 오가게** 만든다. 응집도 파괴. Sliceless 방식이든 2든 **의미 단위**(Aggregate 또는 Context)로 묶는 게 원칙.

## Context 간 협력 (Slice 방식)

다른 Bounded Context가 필요할 때의 표준 패턴 — 직접 import하지 않는다.

### 1. ID만 소유

가장 흔한 기본 방식. 다른 Context의 엔티티 전체를 참조하지 않고 ID만 보관.

```ts
// domain/attendance/attendance.entity.ts
export class Attendance {
  constructor(
    public readonly id: string,
    public readonly employeeId: string,   // 조직 Context의 Employee ID만
    public checkIn: Date,
    ...
  ) {}
}
```

### 2. 스냅샷 VO (부분 복사)

다른 Context의 정보가 자주 필요하면 **필요한 일부만 VO로 복사**해 자기 Context에 둔다.

```ts
// domain/attendance/employee-snapshot.vo.ts
export class EmployeeSnapshot {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly departmentName: string,
  ) {}
}
```

원 Context(organization)가 업데이트되면 스냅샷도 갱신 — 보통 **도메인 이벤트** 구독으로 구현.

### 3. Anti-corruption 계약 (조회가 필요할 때)

조회가 실시간 필요하면 자기 Context에 **인터페이스**를 정의하고 외부에서 구현체 주입 (DIP).

```ts
// domain/payroll/employee-lookup.contract.ts
export interface EmployeeLookup {
  findPayableEmployee(id: string): Promise<PayableEmployee | null>;
}
```

구현체는 `infrastructure/payroll/`에서 organization Context의 repository를 참조해 매핑. 이렇게 하면 payroll은 organization을 직접 import하지 않는다. 상세 패턴: [`07-dip-patterns.md`](07-dip-patterns.md).

### 4. 도메인 이벤트 구독

느슨한 결합이 필요한 경우 이벤트 기반. `organization.Employee`가 해고되면 `EmployeeTerminated` 발행 → payroll이 구독해 급여 정지.

## 비즈니스 규칙의 위치

**ORM 전략에 종속적**이다. 자세히는 [`06-orm-strategies.md`](06-orm-strategies.md), 요약하면:

- **TypeORM (Rich Entity)**: 엔티티 클래스 = ORM 엔티티 = 도메인 모델. 비즈니스 규칙 메서드를 엔티티에 탑재.
- **Drizzle / Prisma**: 스키마는 별도, 도메인 모델은 POJO/POCO. 비즈니스 규칙은 도메인 모델 또는 도메인 서비스에. 리포지토리가 스키마 ↔ 도메인 모델 매핑.

어느 쪽이든 **규칙은 데이터와 가까이** 둔다. 서비스 계층에 규칙이 흘러가면 **Anemic Domain Model 안티패턴** — 피한다.

## Domain Services vs Entities

엔티티 메서드로 쓰기 애매한 경우 도메인 서비스로 분리:

- 규칙이 **여러 엔티티**에 걸친다 (같은 Context 내).
- **외부 조회**가 필요하다 (예: 재고 확인을 위해 `InventoryRepository` 호출).

원칙:

- 도메인 서비스는 **하나의 동사**에 집중. 너무 커지면 슬라이스 쪼개기 신호.
- 이름은 **도메인 용어**를 따른다 (`PaymentAuthorizer`, `InventoryReserver`).

## 리포지토리

### 인터페이스는 도메인 레이어, 구현은 infrastructure

```
domain/organization/employee.repository.ts            ← 인터페이스
infrastructure/organization/employee.typeorm.repository.ts   ← 구현체
```

도메인은 **인터페이스만 참조**. 구현체 바인딩은 NestJS provider 토큰으로 ([`09-framework-notes.md`](09-framework-notes.md)).

`shared/db/`에는 **도메인 무관 베이스**만 둔다 (`BaseTypeOrmRepository`, `TransactionManager`, DB 연결 팩토리). 도메인 이름(`users`, `employee`)이 파일명에 등장하면 잘못된 위치 — `shared`는 도메인 의미 없음이 원칙.

### 의존 역전 (DIP) — 코드 import 방향은 `infrastructure → domain`

리포지토리 배치는 단순 "코드 나누기"가 아니라 **DIP(Dependency Inversion Principle)의 실천**이다. 이 점이 잘못 이해되면 레이어 의존이 혼란스러워 보일 수 있어 짚고 넘어간다.

#### 일반적 기대 — "상위가 하위를 쓴다"

레이어 의존을 "상위가 하위를 호출한다"는 관점으로만 보면 다음처럼 보인다.

```
app → use-cases → domain → infrastructure → shared
```

이 관점에서 domain은 infrastructure를 "쓰는" 쪽이므로 domain이 infrastructure를 import하리라 예상할 수 있다.

#### 실제 코드 import 방향

리포지토리 **인터페이스가 domain에** 살기 때문에 실제 `import`는 반대로 흐른다.

```
infrastructure/organization/employee.typeorm.repository.ts
   │
   │  implements
   ▼
domain/organization/employee.repository.ts  (interface)
```

**`infrastructure → domain`** — 하위 레이어가 상위 레이어의 인터페이스를 구현한다. 이것이 의존 **역전**이다.

#### 두 관점을 분리해서 본다

| 관점 | 방향 | 의미 |
|---|---|---|
| **컴파일 타임 (코드 `import`)** | `infrastructure → domain` | 구현체가 인터페이스를 참조 |
| **런타임 (호출 흐름)** | `app → ... → domain → repository interface → (DI) → infrastructure 구현체` | 도메인 서비스가 인터페이스를 호출하면 DI 컨테이너가 실제 구현체 실행 |

두 방향이 반대임을 혼동하지 말 것. 코드에서 `import`를 따라가면 infrastructure가 domain을 가리키고, 실행을 따라가면 domain이 infrastructure를 호출한다.

#### 왜 중요한가

- **domain이 ORM·인프라를 모른 채 순수 유지** — 단위 테스트 용이.
- **ORM 교체**(TypeORM → Drizzle) 시 domain 코드 무영향 — 구현만 교체한다.
- **"도메인이 규칙을 정하고 인프라가 그 규칙을 따른다"** 는 의미가 코드 구조에 그대로 드러난다. 하위 레이어가 상위 레이어의 계약에 복종하는 모양.

이 이해가 있어야 "리포지토리 인터페이스를 왜 굳이 domain에 두냐"는 질문에 답할 수 있다. 단순 정리가 아니라 의존 방향을 뒤집어 domain의 순수성을 지키기 위한 장치다.

### ORM별 리포지토리 전략

- **TypeORM**: 내장 `Repository<Entity>`를 도메인 리포지토리가 얇게 감싸거나, TypeORM Repository 자체를 활용 (Rich Entity 궁합).
- **Drizzle**: `db.insert(users).values(...)` 같은 쿼리를 **직접 감싸서** 메서드로 노출. 데이터 매퍼 패턴 미지원이라 매핑 코드 필수.
- **Prisma**: `PrismaClient`를 리포지토리에서 감싸고, 생성된 타입 ↔ 도메인 모델 매핑.

자세한 비교는 [`06-orm-strategies.md`](06-orm-strategies.md).

## 도메인 이벤트

- Context 슬라이스 내부 `events/` 폴더.
- **과거형** 이름: `EmployeeHired`, `OrderPaid`, `PostRemoved` (미래형은 커맨드와 혼동).
- 발행/구독 구현:
  - 작은 프로젝트: 서비스에서 직접 콜백 호출 또는 간단한 EventEmitter.
  - 커지면 `@nestjs/cqrs` EventBus 또는 메시지 브로커(Redis Pub/Sub, Kafka).
- CQRS 관점은 [`09-framework-notes.md`](09-framework-notes.md)의 CQRS 섹션.

## 테스트 우선순위

도메인 레이어는 이 스킬의 **테스트 1순위 영역**. 자세히: [`08-testing.md`](08-testing.md).

핵심:

- 도메인 엔티티 메서드, 도메인 서비스의 비즈니스 규칙을 **단위 테스트**로.
- 외부 의존은 **모킹 없이** 테스트할 수 있는 형태를 선호 (순수 함수 + 명시적 입력).
- 리포지토리는 **가짜(in-memory) 구현체**로 대체해 도메인 서비스 테스트.
- `shared` 참조가 테스트 저해하면 그 참조를 재고 (순환이 아닌데 테스트가 어려워진다면 설계 문제).

## 체크리스트

- [ ] 도메인 코드에서 `import typeorm` / `import { PrismaClient }` 가 나타나는가? → 리포지토리로 감싸라.
- [ ] 비즈니스 규칙이 app 서비스에 흘렀는가? → Anemic Model, 도메인으로 올려라.
- [ ] 도메인 서비스가 5개 이상 메서드를 가지는가? → 슬라이스 쪼개기 검토.
- [ ] 다른 Bounded Context를 직접 import하는가? → ID 참조·스냅샷·계약 중 하나로 교체.
- [ ] Sliceless 방식인데 Context별 슬라이스로 쪼갰나? → 과설계, 평탄화 검토.
- [ ] Slice 방식인데 엔티티들이 한 폴더에 섞여 있나? → Context 경계 식별 + 재구성.
- [ ] 슬라이스마다 `index.ts` barrel이 있고 외부는 barrel만 import하는가?
- [ ] `domain/models/`, `domain/repositories/` 같은 기술 유형별 분류가 있나? → Context별 재구성.
