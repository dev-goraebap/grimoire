---
section: orm-strategies
---

# ORM Strategies

ORM 선택은 **도메인 모델 배치**에 직접 영향을 준다. 이 스킬은 TypeORM / Drizzle / Prisma 세 가지를 다룬다.

## 핵심 차이 한 눈에

| ORM | 엔티티 형태 | 도메인 모델과의 관계 |
|---|---|---|
| **TypeORM** | 클래스 + 데코레이터 | 엔티티 = 도메인 모델 (Rich Entity 권장) |
| **Drizzle** | 스키마 객체 (`pgTable` 등) | 별도 도메인 모델 권장 |
| **Prisma** | 스키마 DSL → 타입 생성 | 별도 도메인 모델 권장 |

## TypeORM: Rich Entity

### 특징

- 엔티티가 **클래스**이므로 메서드를 붙일 수 있다.
- 클래스에 비즈니스 규칙 메서드를 탑재 → **엔티티 자체를 도메인 모델**로 사용.

### 예시 개요

```
// domain/users/user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() email!: string;
  @Column({ type: 'enum', enum: UserStatus }) status!: UserStatus;

  // 비즈니스 규칙 메서드 — 단위 테스트 대상
  suspend(reason: string): void {
    if (this.status === UserStatus.DELETED) {
      throw new CannotSuspendDeletedUserError();
    }
    this.status = UserStatus.SUSPENDED;
  }

  canLogin(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
```

### 장점

- 보일러플레이트 최소. 엔티티 하나로 ORM + 도메인 커버.
- 메서드 단위 테스트 용이 (메서드는 순수하므로 DB 연결 없이).
- NestJS + TypeORM 조합이 커뮤니티 표준이라 자료·튜토리얼 풍부.

### 단점

- TypeORM 데코레이터 의존이 도메인에 새어 들어온다 (**완벽한 클린 아키텍처와 어긋남** — 이 스킬이 수용하는 타협).
- 스키마 변경이 도메인 모델 변경과 연동. 큰 리팩터 시 영향 범위 커질 수 있음.
- TypeORM 자체의 느린 릴리스 주기와 알려진 버그.

### 적합한 경우

- 중·소 규모 프로젝트.
- ORM 교체 계획 없음.
- 이 스킬의 "Not Clean Architecture" 원칙에 동의.
- 빠른 스타트업 프로토타이핑.

## Drizzle: Schema + Domain Model 분리

### 특징

- 스키마는 **별도 객체** (`pgTable('users', { ... })`).
- ORM은 `db.insert(users).values(...)` 같은 쿼리 빌더 제공 (SQL에 가까움).
- **데이터 매퍼 패턴을 기본 지원하지 않음** → 도메인 모델을 만들면 **매핑을 직접** 작성해야 함.

### 구성

- **스키마**는 `shared/db/schema/` 또는 `infrastructure/db/schema/`에.
- **도메인 모델**(POJO 또는 클래스)은 `domain/users/user.ts`.
- **리포지토리**가 스키마 ↔ 도메인 모델 매핑 책임.

### 예시 개요

```
// shared/db/schema/users.ts
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  status: text('status', { enum: ['ACTIVE', 'SUSPENDED', 'DELETED'] }).notNull(),
});

// domain/users/user.ts  ← POJO + 메서드
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public status: UserStatus,
  ) {}

  suspend(reason: string): void { /* 비즈니스 규칙 */ }
  canLogin(): boolean { return this.status === 'ACTIVE'; }
}

// shared/db/users.drizzle.repository.ts
export class DrizzleUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (rows.length === 0) return null;
    return new User(rows[0].id, rows[0].email, rows[0].status as UserStatus);
  }

  async save(user: User): Promise<void> {
    await db.insert(usersTable).values({
      id: user.id, email: user.email, status: user.status,
    }).onConflictDoUpdate({
      target: usersTable.id,
      set: { email: user.email, status: user.status },
    });
  }
}
```

### 장점

- 도메인이 ORM 의존에서 해방 (POJO).
- 스키마 변경과 도메인 변경을 분리해 관리 가능.
- 런타임 성능·쿼리 유연성 평이 좋음 (SQL 가까움).
- 타입 추론이 정교.

### 단점

- 매핑 코드 작성 부담 (리포지토리마다 `rowToDomain` 필요).
- lazy loading 같은 전통 ORM 기능 포기.
- 생태계가 TypeORM/Prisma보다 작음 (성숙 중).

### 적합한 경우

- 장기적으로 ORM 교체 가능성 고려.
- 도메인 모델의 순수성을 중시.
- SQL 수준 제어·성능 중시.

## Prisma: Drizzle과 유사

### 특징

- `schema.prisma` DSL에서 타입 **자동 생성**.
- 생성된 타입은 **단순 interface** — 메서드 탑재 불가.
- Drizzle과 같은 이유로 도메인 모델 분리 권장.

### 구성

- Drizzle과 동일한 3층 (스키마 DSL / 도메인 모델 / 리포지토리).
- `PrismaClient`가 ORM 역할. 리포지토리에서 감싼다.

### Drizzle과의 차이

| 관점 | Drizzle | Prisma |
|---|---|---|
| 스키마 선언 | TypeScript 객체 | `.prisma` DSL |
| 타입 생성 | 추론 | 코드 생성 |
| 마이그레이션 | `drizzle-kit` | `prisma migrate` (성숙도 우위) |
| 쿼리 유연성 | 높음 (SQL 가까움) | 중간 (타입 안전 우선) |
| 생태계 | 성장 중 | 큼, 대중적 |

## 트레이드오프 표

| 관점 | TypeORM | Drizzle | Prisma |
|---|---|---|---|
| 보일러플레이트 | 낮음 | 높음 | 중간 |
| 도메인 순수성 | 낮음 | 높음 | 높음 |
| 단위 테스트 용이성 | 좋음 (엔티티 단위) | 매우 좋음 (POJO) | 매우 좋음 |
| 스키마 유연성 | 중간 | 높음 | 중간 |
| 학습 곡선 | 낮음 | 중간 | 낮음 |
| 마이그레이션 편의 | 좋음 | 좋음 | 매우 좋음 |
| 타입 안전성 | 중간 | 매우 좋음 | 좋음 |

## 리포지토리 패턴 (공통)

세 ORM 모두 **리포지토리 인터페이스는 도메인 레이어**에 둔다.

```
// domain/users/user.repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}
```

### 구현체 위치

- **간단한 프로젝트**: `shared/db/`에 구현체 + DI 바인딩.
- **큰 프로젝트**: 별도 `infrastructure/users/user.typeorm.repository.ts`로 분리.

### 왜 인터페이스 분리?

- 도메인 테스트에서 **in-memory 가짜 구현체**로 대체 용이 ([`08-testing.md`](08-testing.md)).
- ORM 교체 시 도메인 코드 무영향 (원칙적으로).
- `app`·`use-cases` 레이어가 ORM 세부를 모른 채 계약만 쓰게.

### NestJS에서 주입

- 도메인이 인터페이스 토큰을 export (`USER_REPOSITORY`).
- DB 모듈(`shared/db` 또는 infrastructure)이 `{ provide: USER_REPOSITORY, useClass: DrizzleUserRepository }`로 바인딩.
- 상위 서비스는 `@Inject(USER_REPOSITORY)`로 주입받아 사용.

## 언제 어떤 ORM을 쓸까

- **TypeORM**: NestJS 전통 조합, 빠른 시작, Rich Entity 수용, 중·소 프로젝트.
- **Drizzle**: SQL 제어·타입 안전·런타임 성능, 도메인 순수성 우선.
- **Prisma**: 스키마 DSL 선호, 마이그레이션 자동화, 대중 생태계.

**선택 기준 요약**:

1. 도메인 순수성 중요? → Drizzle / Prisma
2. 빠르게 MVP? → TypeORM
3. SQL 가까운 제어? → Drizzle
4. 스키마 DSL + 자동 마이그레이션 편의? → Prisma

## 관련

- 도메인 모델 테스트 방법 → [`08-testing.md`](08-testing.md)
- NestJS 통합 (TypeOrmModule vs DrizzleModule) → [`09-framework-notes.md`](09-framework-notes.md)
- 리포지토리 인터페이스 위치 → [`04-domain-layer.md`](04-domain-layer.md)
