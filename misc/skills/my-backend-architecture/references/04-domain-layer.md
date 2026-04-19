---
section: domain-layer
---

# domain Layer

비즈니스 규칙·불변 조건이 모이는 **시스템의 심장**. 외부 의존성 최소화 + 단위 테스트 용이성이 최고 원칙.

## 책임

- 도메인 엔티티 / VO (Value Object) 정의
- 비즈니스 규칙·불변 조건 구현
- 도메인 이벤트 선언
- 리포지토리 **인터페이스** 선언 (구현은 shared 또는 infrastructure)
- 도메인 서비스 (규칙이 한 엔티티에 속하지 않을 때)

## 외부 의존성: 최소화하되 0은 아님

Clean/Hexagonal은 "도메인은 외부 의존 0"을 이상으로 삼지만 이 스킬은 **`shared` 참조까지 허용**한다 ([`00-overview.md`](00-overview.md)의 "Not Clean Architecture").

허용:

- `shared/logger` **인터페이스** (구체 구현 아닌 추상)
- `shared/errors` 기반 에러 (`NotFoundError` 등)
- `shared/util` 순수 유틸 (date/string/math)
- `shared/types` 횡단 타입 (`Result`, `Paginated`)

허용하지 않음:

- `app` / `use-cases` — 역방향
- 다른 `domain` 슬라이스 — 같은 레이어 참조
- DB 드라이버 직접 — 리포지토리 인터페이스로 감싼다
- HTTP 클라이언트 직접 — 외부 API 어댑터를 `shared`나 infrastructure에 두고 인터페이스로

### 왜 shared는 허용하나

도메인 코드가 `dayjs(user.createdAt).isAfter(...)` 하나 쓴다고 테스트가 어려워지지 않는다. 반면 모든 유틸을 "도메인 서비스"로 감싸면 보일러플레이트 폭증. 실용 타협.

## 비즈니스 규칙의 위치

**ORM 전략에 종속적**이다. 자세히는 [`06-orm-strategies.md`](06-orm-strategies.md), 요약하면:

- **TypeORM (Rich Entity)**: 엔티티 클래스 = ORM 엔티티 = 도메인 모델. 비즈니스 규칙 메서드를 엔티티에 탑재. 엔티티 자체를 단위 테스트.
- **Drizzle / Prisma**: 스키마는 별도, 도메인 모델은 POJO/POCO 클래스. 비즈니스 규칙은 도메인 모델 또는 도메인 서비스에. 리포지토리가 스키마 ↔ 도메인 모델 매핑 책임.

어느 쪽이든 **규칙은 데이터와 가까이** 둔다. 서비스 계층에 규칙이 흘러가면 **Anemic Domain Model 안티패턴** — 피한다.

## Domain Services vs Entities

엔티티 메서드로 쓰기 애매한 경우:

- 규칙이 **여러 엔티티**에 걸친다 (`Order`와 `Coupon`을 모두 봐야 함)
- 외부 조회가 필요하다 (예: 재고 확인을 위해 `InventoryRepository` 호출)

→ **도메인 서비스**로 분리. 같은 슬라이스 폴더 안에 두거나 별도 `*-service.ts` 파일로.

원칙:

- 도메인 서비스는 **하나의 동사**에 집중한다. 너무 커지면 슬라이스 쪼개기 신호.
- 도메인 서비스 이름은 **도메인 용어**를 따른다 (`PaymentAuthorizer`, `InventoryReserver`).

## 리포지토리

### 인터페이스는 도메인 레이어에

```
domain/users/user.repository.ts    ← 인터페이스
shared/db/users.typeorm.repository.ts    ← 구현체 (또는 infrastructure/)
```

도메인은 인터페이스만 참조. 구현체 바인딩은 NestJS provider 토큰으로 ([`09-framework-notes.md`](09-framework-notes.md)).

### ORM별 리포지토리 전략

- **TypeORM**: 내장 `Repository<Entity>`를 도메인 리포지토리가 얇게 감싸거나, 아예 TypeORM Repository 자체를 도메인 쪽에서 활용 (Rich Entity와 궁합).
- **Drizzle**: `db.insert(users).values(...)` 같은 쿼리를 **직접 감싸서** 메서드로 노출. 데이터 매퍼 패턴 미지원이라 매핑 코드 필수.
- **Prisma**: `PrismaClient`를 리포지토리에서 감싸고, 생성된 타입 ↔ 도메인 모델 매핑 추가.

## 도메인 이벤트

- 도메인 슬라이스 내부 `events/` 폴더.
- **과거형** 이름: `UserRegistered`, `OrderPaid`, `PostRemoved` (미래형은 커맨드로 혼동하기 쉬움).
- 발행/구독 구현:
  - 작은 프로젝트: 서비스에서 직접 콜백 호출 또는 간단한 EventEmitter.
  - 커지면 `@nestjs/cqrs` EventBus 또는 메시지 브로커(Redis Pub/Sub, Kafka).
- CQRS 관점은 [`09-framework-notes.md`](09-framework-notes.md)의 CQRS 섹션.

## DOMAIN.md와의 관계

**용어·불변 규칙의 정규 출처는 코드가 아니라 `blueprints:domain-model` 스킬이 관리하는 `DOMAIN.md`**다. 이 레이어의 코드는 그 문서의 **실행 가능한 반영체**.

실무 가이드:

- 새 도메인 개념이 등장하면 먼저 `DOMAIN.md`의 Ubiquitous Language에 추가 → 코드 네이밍이 그 용어를 따른다.
- 불변 규칙 변경 시 `DOMAIN.md`를 먼저 수정하고 → 코드 업데이트 → 테스트 보강.
- 코드 주석에서 규칙 식별자(예: `INV-ORDER-003`)를 달면 문서↔코드 양방향 추적 가능.

두 스킬의 역할 분리를 명확히 한다: **`blueprints:domain-model` = 문서, `my-backend-architecture` = 코드 위치**. 중복 정의 금지 — 규칙 **내용**은 DOMAIN.md만이 정규 출처.

## 테스트 우선순위

도메인 레이어는 이 스킬의 **테스트 1순위 영역**. 자세히: [`08-testing.md`](08-testing.md).

핵심:

- 도메인 엔티티 메서드, 도메인 서비스의 비즈니스 규칙을 **단위 테스트**로.
- 외부 의존은 **모킹 없이** 테스트할 수 있는 형태를 선호 (순수 함수 + 명시적 입력).
- 리포지토리는 **가짜(in-memory) 구현체**로 대체해 도메인 서비스 테스트.
- `shared` 참조가 테스트 저해하면 그 참조를 재고 (순환이 아닌데 테스트가 어려워진다면 설계 문제).

## 슬라이스 내부 구조 예

```
domain/users/
├── user.entity.ts             (TypeORM 엔티티 + 도메인 메서드 / 또는 POJO)
├── user-status.vo.ts          (Value Object)
├── user.repository.ts         (interface)
├── user.policies.ts           (순수 정책 함수 — 테스트 용이)
├── events/
│   ├── user-registered.event.ts
│   └── user-suspended.event.ts
└── user.service.ts            (도메인 서비스 — 필요한 경우만)
```

## 체크리스트

- [ ] 도메인 코드에서 `import typeorm` / `import { PrismaClient }` 가 나타나는가? → 리포지토리로 감싸라.
- [ ] 비즈니스 규칙이 app 서비스에 흘렀는가? → Anemic Model, 도메인으로 올려라.
- [ ] 도메인 서비스가 5개 이상 메서드를 가지는가? → 슬라이스 쪼개기 검토.
- [ ] 같은 domain 슬라이스끼리 import 있는가? → DIP로 해결.
- [ ] 테스트 작성 시 모킹이 필요한가? → 모킹 없이 되게 설계 가능한지 재고.
