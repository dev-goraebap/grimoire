---
section: layers
---

# Layers

기본 3개 레이어 + 선택적 상위 레이어 하나.

## 계층 구조

```
app
 ↓
(use-cases | features)   ← 선택적 상위 레이어
 ↓
domain
 ↓
shared
```

**위에서 아래로만 참조**. 역방향 금지. 위 레이어는 아래의 타입·인터페이스·함수·클래스를 import할 수 있지만 그 반대는 허용하지 않는다.

## app

### 책임

- 외부 세계와의 **경계**. HTTP 라우팅, GraphQL 리졸버, CLI 커맨드, 스케줄 잡 엔트리 등 "바깥에서 시스템으로 들어오는 문".
- 여러 도메인을 **오케스트레이션**해서 한 유스케이스를 완성.
- 입출력 경계 처리: 인증·validation·serialization·에러 매핑.

세부: [`03-app-layer.md`](03-app-layer.md).

### 구성

- 컨트롤러 / 리졸버 / CLI 핸들러
- 서비스 (오케스트레이터 역할 — 여러 도메인 조합)
- DTO (요청·응답 모양)
- Guards, Pipes, Interceptors (NestJS 기준)
- 슬라이스 모듈 (`users.module.ts` 등)

### API 경로 대응

REST라면 리소스 경로와 폴더를 1:1 대응한다.

```
GET  /users         → app/users/users.controller.ts
POST /posts         → app/posts/posts.controller.ts
DELETE /posts/:id   → app/posts/posts.controller.ts
```

GraphQL이면 타입 이름 단위, CLI면 커맨드 단위로 같은 원리. 경로와 폴더가 **예측 가능한 대응**을 가지는 것이 이 규칙의 핵심 — 기능을 찾을 때 `grep` 이전에 경로만으로 위치를 안다.

## use-cases / features (선택)

### 언제 추가하나

다음 중 하나가 분명할 때:

- **여러 슬라이스에서 재사용**될 복잡한 오케스트레이션이 있다 (`07-dip-patterns.md`의 A안)
- **계약 인터페이스**만 모아두는 중립 자리가 필요하다 (B안에서 `domain/ports`나 이 레이어를 활용)
- 여러 도메인이 엮이는 흐름이 `app` 서비스에 담기에는 너무 크고 재사용성이 있다

필요 없으면 추가하지 않는다. **빈 레이어는 세금**.

### 이름 선택

- **`use-cases`** — 클린 아키텍처/DDD 전통. "여러 도메인 오케스트레이션"이라는 의도가 이름에 담김. "이 유스케이스를 실행한다"는 자연스러운 언어.
- **`features`** — FSD 영향. 프론트 FSD와의 통일성.

둘 중 **프로젝트 당 하나만** 고정해서 쓴다. 한 저장소에 `use-cases`와 `features`가 섞여 있으면 혼란.

### 구성

- 유스케이스 서비스 (여러 도메인 조합 로직)
- 선택: 계약 인터페이스 + DTO (B안 사용 시)

### app과의 경계

`app`의 서비스가 2~3개 도메인만 조합하고 한 곳에서만 쓰이면 `app` 슬라이스 내부 서비스로 충분. 같은 조합이 **두 곳 이상에서 필요해지는 순간**이 이 레이어로 올릴 타이밍.

## domain

### 책임

- **비즈니스 규칙·불변 조건·도메인 엔티티·도메인 이벤트** 정의.
- 외부 인프라(DB 드라이버, HTTP 클라이언트)를 **모르는 것이 이상** — 다만 이 스킬은 `shared` 참조는 허용(순수주의 타협, `00-overview.md` 참조).
- **단위 테스트 용이성**이 최상 원칙.

세부: [`04-domain-layer.md`](04-domain-layer.md).

### ORM 전략에 따른 형태

- **TypeORM (Rich Entity)**: 엔티티 클래스에 비즈니스 규칙 메서드 탑재. 엔티티 자체를 테스트 대상.
- **Drizzle / Prisma**: 스키마는 별도. 도메인 모델은 POJO/POCO. 리포지토리가 ORM 호출을 감싼다.

자세한 선택 기준: [`06-orm-strategies.md`](06-orm-strategies.md).

### 포함 요소

- 엔티티 / VO (Value Object)
- 도메인 서비스 (규칙이 한 엔티티에 속하지 않을 때)
- 리포지토리 **인터페이스** (구현체는 `infrastructure/` 레이어)
- 도메인 이벤트 정의

## shared

### 책임

- 도메인 의미 없는 **기술 세그먼트**. 어떤 레이어든 참조 가능한 기반.

세부: [`05-shared-layer.md`](05-shared-layer.md).

### 전형적 세그먼트

- `logger` — 로깅 인터페이스·구현
- `config` — 환경변수·설정 파싱
- `db` — DB 연결 팩토리·트랜잭션 헬퍼
- `util` — date/string/number 헬퍼
- `middleware` — 공통 HTTP 미들웨어
- `filters` — 예외 필터 (NestJS)
- `errors` — 도메인 무관 기반 에러 (NotFound, Unauthorized 등)

### 여기 들어가면 안 되는 것

- 도메인 의미가 묻은 코드 (`user` 개념이 등장하는 것은 `domain/users`로).
- 역참조가 필요해 보이면 `07-dip-patterns.md`의 DIP 기법으로 해결.

## 사용자 정의 레이어 추가

4개(app / use-cases|features / domain / shared) 외 추가 레이어.

### `infrastructure` (권장)

도메인별 ORM 구현체·외부 API 어댑터가 쌓이면 `shared`에 두기 어려워진다 (`shared`는 도메인 무관 원칙 위반). 이 스킬은 **`infrastructure/` 레이어를 사실상 기본**으로 권장한다.

```
infrastructure/
├── organization/
│   ├── employee.typeorm.repository.ts    (domain/organization의 인터페이스 구현)
│   └── organization.typeorm.repository.ts
├── payroll/
│   └── payroll.drizzle.repository.ts
└── external/
    └── payment-gateway.http.client.ts    (외부 결제 API 어댑터)
```

- 위치: `domain`과 `shared` 사이 (의존 방향상 `app → use-cases → domain → infrastructure → shared`).
- `app`이 infrastructure를 직접 참조하지 않는다 — domain의 인터페이스 토큰을 통해 DI로 연결.
- 외부 어댑터(HTTP 클라이언트, 메시지 브로커 등)도 여기 집결.

작은 프로젝트에서도 infrastructure를 가볍게 둘 것을 권장 — `shared`에 도메인 이름이 섞이는 것보다 깨끗.

### 그 외 원칙

- **의존 방향 규칙은 그대로** — 추가 레이어도 단방향.
- **레이어 수가 늘수록 이해·유지보수 비용**이 비례. 5개 이상이면 정말 필요한지 재고.

## 확장 예시 (디렉토리 트리)

### 시나리오 1 — 단일 Context (작은 시스템)

HR CRUD 수준. domain이 평평하게.

```
src/
├── app/
│   ├── employees/
│   │   ├── index.ts                     (public API)
│   │   ├── employees.module.ts
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   └── dto/
│   └── organizations/
│       └── ...
├── domain/                              ← 슬라이스 없음, 평평
│   ├── index.ts
│   ├── employee.entity.ts
│   ├── organization.entity.ts
│   ├── rank.vo.ts
│   ├── employee.repository.ts           (interface)
│   └── tokens.ts
├── infrastructure/
│   └── db/
│       ├── employee.typeorm.repository.ts
│       └── organization.typeorm.repository.ts
└── shared/
    ├── logger/
    ├── config/
    ├── db/
    │   ├── base-typeorm.repository.ts   (도메인 무관 베이스)
    │   └── transaction-manager.ts
    └── util/
```

### 시나리오 2 — 다중 Bounded Context (중·대 시스템)

HR이 조직관리·근태·급여로 분화한 단계. domain이 Context별 슬라이스로.

```
src/
├── app/
│   ├── employees/
│   ├── organizations/
│   ├── attendance/
│   └── payroll/
├── use-cases/                              ← 선택
│   └── onboard-employee/
│       └── onboard-employee.use-case.ts    (조직+근태+급여 오케스트레이션)
├── domain/
│   ├── organization/                       ← Context 1
│   │   ├── index.ts                        (public API)
│   │   ├── employee.entity.ts
│   │   ├── organization.entity.ts
│   │   ├── position.entity.ts
│   │   ├── rank.vo.ts
│   │   ├── employee.repository.ts
│   │   └── events/
│   ├── attendance/                         ← Context 2
│   │   ├── index.ts
│   │   ├── attendance.entity.ts
│   │   ├── employee-snapshot.vo.ts         (근태가 참조하는 직원 정보만)
│   │   └── ...
│   └── payroll/                            ← Context 3
│       ├── index.ts
│       ├── payroll.entity.ts
│       ├── salary.vo.ts
│       ├── payable-employee.vo.ts          (급여 Context의 직원)
│       └── employee-lookup.contract.ts     (organization 조회 계약)
├── infrastructure/
│   ├── organization/
│   │   └── employee.typeorm.repository.ts  (domain/organization 구현)
│   ├── attendance/
│   │   └── attendance.drizzle.repository.ts
│   └── payroll/
│       ├── payroll.repository.ts
│       └── employee-lookup.adapter.ts      (organization를 참조해 contract 구현)
└── shared/
    ├── logger/
    ├── config/
    ├── db/
    │   ├── base-typeorm.repository.ts
    │   └── transaction-manager.ts
    └── util/
```

자세한 Context 협력 패턴(ID 참조·스냅샷·계약·이벤트)은 [`04-domain-layer.md`](04-domain-layer.md). 슬라이스 경계·public API(barrel) 규칙은 [`02-slices.md`](02-slices.md).
