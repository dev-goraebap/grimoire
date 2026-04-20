---
section: infrastructure-layer
---

# infrastructure 레이어

## 역할

`domain`이 정의한 인터페이스를 **실제 기술 스택으로 구현**하거나, 외부 시스템과의 접점을 캡슐화한다.

| 구성 요소 | 예시 |
|-----------|------|
| Repository 구현체 | domain 인터페이스의 ORM 구현 |
| Query Service | 읽기 전용. 화면 DTO 직접 반환. domain 우회. |
| 외부 API 어댑터 | Payment·Email·OAuth·SMS·검색 엔진 등 |
| 파일 스토리지 어댑터 | S3·GCS·Azure Blob 등 |
| 캐시 어댑터 | Redis·Memcached 등 |

---

## DIP — import 방향

`infrastructure`가 `domain` 인터페이스를 구현하므로:

- 코드 import: `infrastructure → domain`
- 런타임 호출 흐름: `domain(interface) → [DI] → infrastructure(구현체)`

```ts
// infrastructure/workforce/employee.typeorm.repository.ts
import { EmployeeRepository } from '@domain/workforce'; // domain 인터페이스

export class EmployeeTypeOrmRepository implements EmployeeRepository {
  async findById(id: string): Promise<Employee> { ... }
  async save(employee: Employee): Promise<void> { ... }
}
```

---

## 파일명 관례

**도메인 이름 + 기술 이름** 조합이 정상이다. shared와의 차이가 여기서 드러난다.

```
infrastructure/
├── workforce/
│   ├── employee.typeorm.repository.ts   ← 도메인 + 기술
│   └── queries/
│       └── employee-dashboard.query-service.ts
├── payment/
│   └── stripe.gateway.ts
├── storage/
│   └── s3-storage.adapter.ts
└── messaging/
    └── kafka-publisher.ts
```

---

## shared/db vs infrastructure 구분

둘 다 DB·기술과 관련되지만 **담는 내용이 다르다**.

| | `shared/db/` | `infrastructure/` |
|---|---|---|
| 역할 | 기술 인프라 일반 | 도메인 × 기술 결합 |
| 담는 것 | DB 연결·트랜잭션·스키마·마이그레이션·베이스 리포지토리 | Repository 구현체·Query Service·외부 API 어댑터 |
| 도메인 이름이 파일명에? | ❌ (예외: 스키마 테이블명) | ✅ 정상 |

`infrastructure`는 `shared/db`를 참조해 DB 연결·베이스 클래스를 사용한다.

---

## ORM별 배치 요약

### TypeORM — Rich Entity

엔티티 클래스 = 도메인 모델. ORM 데코레이터가 도메인 파일에 위치.

```
domain/employee/
└── employee.entity.ts    ← @Entity() 데코레이터 포함. 도메인 모델 겸 ORM 엔티티.

infrastructure/workforce/
└── employee.typeorm.repository.ts
```

### Drizzle / Prisma — 스키마 분리

도메인 모델(POJO)과 DB 스키마를 분리. Repository가 둘 사이를 매핑.

```
shared/db/schema/
└── employees.schema.ts   ← Drizzle 스키마 or Prisma 생성 타입

domain/employee/
└── employee.entity.ts    ← 순수 POJO. ORM 의존 없음.

infrastructure/workforce/
└── employee.drizzle.repository.ts   ← 스키마 ↔ 도메인 모델 매핑
```

---

## BC 경계와 ORM 관계

**BC 경계를 넘는 ORM 관계는 금지**. ID 타입 컬럼만 사용.

```ts
// ❌ BC 경계 침범
@ManyToOne(() => Employee)
employee: Employee;   // 다른 BC의 ORM 엔티티를 직접 참조

// ✅ ID 타입만
@Column('uuid')
employeeId: string;
```

- TypeORM: `@ManyToOne` 대신 `@Column('uuid')`
- Drizzle: `relations()` BC 넘어 선언 금지
- Prisma: `@relation` BC 넘어 금지

BC를 넘는 조인이 필요한 화면 조회 → `infrastructure/queries/` Query Service에서 SQL로 처리.
