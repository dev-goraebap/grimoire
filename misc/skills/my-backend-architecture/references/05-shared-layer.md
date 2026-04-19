---
section: shared-layer
---

# shared Layer

도메인 의미 없는 **기술 인프라**가 모이는 자리. 어떤 레이어든 `shared`를 참조할 수 있다.

## 전형적 세그먼트

| 세그먼트 | 담는 것 |
|---|---|
| `logger` | 로거 인터페이스 + 구현 (Winston·Pino 어댑터) |
| `config` | `@nestjs/config` 기반 환경변수 파싱, zod schema 검증 |
| `db` | DB 연결 팩토리, 트랜잭션 헬퍼, 공통 베이스 리포지토리 |
| `util` | date(dayjs), string, number, crypto 헬퍼 |
| `middleware` | HTTP 미들웨어 (request-id, access-log 등) |
| `filters` | 예외 필터 (NestJS `HttpExceptionFilter`) |
| `guards` | **기술적** 가드 (rate-limit 등). 도메인 권한 가드는 `app` 쪽 |
| `errors` | 도메인 무관 기반 에러 (`NotFoundError`, `UnauthorizedError`) |
| `types` | 횡단 TypeScript 타입 (`Result<T, E>`, `Paginated<T>`) |

## 슬라이스 간 상호 참조 허용

`shared`는 [`02-slices.md`](02-slices.md) 규칙의 예외. 순환만 피하면 자유롭게 참조.

```
shared/logger   ──▶ shared/config    (OK, logger가 로그 레벨 읽음)
shared/db       ──▶ shared/logger    (OK, DB 쿼리 로그)
shared/config   ──▶ shared/logger    (OK)

shared/a ──▶ shared/b ──▶ shared/a   (순환 금지)
```

순환이 나타나면 **더 작은 세그먼트로 쪼개거나 한쪽을 흡수**. 순환 자체는 대부분 설계 결함.

## 여기 들어가면 안 되는 것

### 도메인 의미가 묻은 코드

`shared/user-helpers.ts` 같은 건 위험 신호. "User" 개념이 등장하면 `domain/users`로 이동.

### 도메인 규칙

할인율 계산·주문 상태 전이 같은 **비즈니스 규칙**은 어떤 경우에도 shared에 오면 안 된다.

### 상위 레이어 전용 코드

`app` 전용 DTO validator, `use-cases` 전용 interceptor는 shared가 아니라 해당 레이어 내부에.

## shared에서 도메인 개념이 필요해 보일 때

예: `shared/audit-logger`가 로그에 `userId`를 포함해야 하고 사용자 정보까지 조회하고 싶다 → **`domain/users` 참조 필요처럼 보이는 상황**.

이럴 때 `shared → domain` 역참조를 하지 말고 **DIP로 해결**한다.

- `shared/audit-logger`가 `interface UserContextProvider { getUserId(): string; getUserName(): string; }` 같은 **계약만 정의**.
- 상위 레이어(`app` 또는 `domain`)가 이 계약을 구현한 객체를 런타임에 주입.

패턴 상세: [`07-dip-patterns.md`](07-dip-patterns.md)의 "shared → domain 역참조 회피" 섹션.

## shared의 크기 조절

`shared`는 프로젝트 수명 중 가장 빨리 비대해지는 레이어다. 정기적으로 감사.

- [ ] 1~2회만 쓰이는 유틸이 있나? → 슬라이스 내부로 내리거나 삭제.
- [ ] 도메인 냄새 나는 파일이 끼었나? → domain으로 올린다.
- [ ] 순환 있나? → 리팩터.
- [ ] 세그먼트가 10개 이상인가? → 재분류 검토.

## 슬라이스 내부 구조 예

```
shared/
├── logger/
│   ├── logger.interface.ts
│   ├── pino-logger.ts
│   └── logger.module.ts
├── config/
│   ├── config.schema.ts         (zod)
│   ├── config.service.ts
│   └── config.module.ts
├── db/
│   ├── typeorm.module.ts
│   ├── base-typeorm.repository.ts
│   └── transaction-manager.ts
├── util/
│   ├── date.ts
│   └── result.ts
└── errors/
    └── base-error.ts
```

각 세그먼트는 자체 NestJS 모듈로 export. 상위 레이어는 모듈을 import해 쓴다.

## shared vs infrastructure

프로젝트에 따라 `infrastructure/` 레이어를 따로 두는 경우가 있다.

| | shared | infrastructure (선택) |
|---|---|---|
| 담는 것 | 기술 인프라 **일반** (logger, util) | 도메인 리포지토리 **구현체**, 외부 API 어댑터 |
| 도메인 인터페이스 구현? | 경우에 따라 | 주요 역할 |
| 필수성 | 항상 필요 | 선택 (없으면 shared/db·shared/external-api로 대체) |

소·중 규모는 shared로 통합, 대규모는 infrastructure로 분리하는 경향.

## 체크리스트

- [ ] shared 어떤 파일에 도메인 용어가 등장하는가? → domain으로 이동.
- [ ] shared 간 순환 있는가? → 리팩터 필수.
- [ ] 공통 유틸이 실제로는 한 슬라이스만 쓰는가? → 슬라이스 내부로 이동.
- [ ] shared → domain import 있는가? → **절대 금지**. DIP로 해결.
