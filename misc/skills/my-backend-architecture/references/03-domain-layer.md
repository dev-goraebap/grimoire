---
section: domain-layer
---

# domain 레이어

## 역할

비즈니스 규칙과 불변 조건의 **유일한 소유자**.

- Entity·VO·Aggregate·정책·이벤트 정의
- 비즈니스 규칙·상태 전이 구현
- Repository **인터페이스** 선언 (구현은 infrastructure)
- **프레임워크 의존 없음** — 순수 클래스·함수·인터페이스만. DI 프레임워크의 Module/Component 어노테이션 없음.

**외부 의존 규칙**:
- 허용: `shared`만 (logger 인터페이스, util, 범용 타입)
- 금지: `app`·중간 레이어·`infrastructure`, DB 드라이버, HTTP 클라이언트

---

## module 구성 — 기본값과 점진적 발전

### 기본값 — Aggregate 단위

Aggregate마다 module 하나. 대부분의 경우 여기서 시작한다.

```
domain/
├── employee/
│   ├── index.ts
│   ├── employee.entity.ts
│   ├── employee.repository.ts   (interface)
│   └── employee-status.vo.ts
├── organization/
│   └── ...
└── rank/
    └── ...
```

단순하고 경계가 명확하다. "여기서 시작해서 필요할 때 BC 단위로 묶는다."

### 점진적 발전 — BC 단위로 묶는 시점

다음 신호가 나타나면 관련 Aggregate들을 BC로 묶는 것을 검토한다.

**신호 1 — Application Service에 private 헬퍼가 쌓인다**

특정 Aggregate 그룹을 다루는 private 함수들이 App Service 안에 누적된다면,
그 Aggregate들 사이에 명시되지 않은 응집력이 있다는 냄새다.

```ts
// 이런 private 함수들이 쌓이기 시작하면 신호
class EmployeeService {
  async onboard(dto) { ... }

  private async validateOrganizationCapacity(orgId) { ... }  // employee + organization
  private async checkRankAvailability(rankId) { ... }        // employee + rank
  private async resolvePositionConflict(posId) { ... }       // employee + position
}
// → employee / organization / rank / position 이 함께 묶이는 경향 → workforce BC 후보
```

**신호 2 — Domain Service가 여러 Aggregate에 걸친 규칙을 다룬다**

Domain Service는 정의상 "단일 Entity/Aggregate에 자연스럽게 속하지 않는 규칙"이다.
특정 규칙이 엔티티 메서드로는 담기지 않아서 Domain Service로 분리됐는데,
그 규칙이 자연스럽게 동일한 비즈니스 문맥의 Aggregate들을 묶는다면 → BC 후보.

```
// employee.entity.ts 메서드로 담기지 않는 이유: Organization·Rank도 필요하기 때문
PromotionPolicy.apply(employee, organization, newRank) → employee + organization + rank 묶음
// → workforce BC로 묶을 신호
```

> **구분 주의**: 서로 명백히 다른 도메인(HR의 `Employee`와 Finance의 `Invoice`)을 다루는 경우는 BC 묶기 신호가 아니다. 그건 Application Service에서 조율해야 할 문제다. "그 Domain Service의 규칙이 동일한 비즈니스 문맥에서 나오는 Aggregate들을 묶는가?"가 판단 기준.

### BC 단위 구조 예시

```
domain/
├── workforce/         ← BC (employee + organization + rank 묶음)
│   ├── index.ts
│   ├── employee/
│   ├── organization/
│   ├── rank/
│   └── policies/      (workforce 내 Domain Service)
├── attendance/        ← BC (다른 문맥)
└── payroll/           ← BC (다른 문맥)
```

**BC 간 참조 규칙**: ID 타입 외 강한 의존(객체 그래프, ORM 관계) 지양.  
조인이 필요한 화면 조회는 `infrastructure/queries/` Query Service에서 처리.

---

## 파일 종류 카탈로그

| 파일 종류 | 역할 |
|-----------|------|
| Entity | Aggregate Root 또는 내부 Entity. 식별자 보유. |
| Value Object (VO) | 식별자 없이 값 자체로 의미. 불변. |
| Domain Service | 여러 Entity·VO에 걸친 규칙 판정. 상태 없음. |
| Repository Interface | 영속성 계약. 구현은 infrastructure. |
| Policy / Specification | 추상화된 판정 함수. Domain Service의 경량 형태. |
| Factory | 복잡한 Aggregate 생성 로직 캡슐화. |
| Domain Error | 도메인 용어로 이름 지은 예외 (`InsufficientTenureError`). |

---

## Domain Service vs Application Service

| 기준 | Domain Service | Application Service |
|------|---------------|---------------------|
| 위치 | `domain/` | `app/` 또는 중간 레이어 |
| 역할 | 규칙 판정, Entity 상태 변경 | 오케스트레이션, I/O, 트랜잭션 |
| 트랜잭션 관리 | ❌ | ✅ |
| Repository 주입 | ❌ (인자로 전달) | ✅ |
| 외부 API 호출 | ❌ | ✅ |
| 단위 테스트 | 모킹 없이 순수 입출력 | Repository·외부 의존 모킹 |

**핵심 구분**: "규칙을 판정하는가(domain)" vs "흐름을 조립하는가(app)".

```ts
// Domain Service — 규칙만
export class PromotionPolicy {
  apply(employee: Employee, newPosition: Position): void {
    if (employee.tenureMonths < 12) throw new InsufficientTenureError();
    employee.promote(newPosition);
  }
}

// Application Service — 오케스트레이션
export class PromoteEmployeeService {
  constructor(
    private employeeRepo: EmployeeRepository,
    private promotionPolicy: PromotionPolicy,
  ) {}

  async execute(dto: PromoteEmployeeDto) {
    const employee = await this.employeeRepo.findById(dto.employeeId);
    this.promotionPolicy.apply(employee, dto.newPosition); // 규칙 위임
    await this.employeeRepo.save(employee);
  }
}
```

---

## Repository 주입 원칙

- **Application Service에만 주입** (생성자 주입)
- **Domain Service에는 주입 금지** — 필요하면 Application Service가 먼저 조회 후 인자로 전달

```ts
// ✅ Application Service가 조회 후 전달
const employee = await this.employeeRepo.findById(id);
this.promotionPolicy.apply(employee, position); // repo 없이 순수 규칙

// ❌ Domain Service가 repo를 직접 호출
class PromotionPolicy {
  constructor(private repo: EmployeeRepository) {} // 금지
}
```

이 원칙이 지켜지면:
- 도메인 단위 테스트에서 repo 모킹 불필요
- 트랜잭션 경계가 Application Service에서 명확
- 쿼리 횟수 예측 가능

---

## DIP — import 방향

`infrastructure`가 `domain` 인터페이스를 구현하므로, 코드 import 방향은:

```
infrastructure → domain   (컴파일 타임)
domain ← [DI 주입] ← infrastructure   (런타임)
```

`domain`은 `infrastructure`를 import하지 않는다.

---

## Aggregate

- **Root Entity**가 외부 창구. 외부에서 내부 Entity 직접 접근 금지.
- **트랜잭션 단위** — 하나의 트랜잭션에서 하나의 Aggregate만 수정.
- Aggregate 간 참조는 **ID 타입**으로. 객체 그래프 참조 지양.

```ts
// ✅ ID 참조
class Order {
  readonly customerId: string; // Customer 객체 아님
}

// ❌ 객체 그래프 참조
class Order {
  readonly customer: Customer; // 경계 침범
}
```
