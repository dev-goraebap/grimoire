---
section: app-layer
---

# app Layer

외부 세계와 내부 도메인 사이의 **경계 레이어**. REST/GraphQL/CLI/스케줄러 엔트리 포인트가 여기 모이고, 여러 도메인을 오케스트레이션해 유스케이스를 완성한다.

## 책임 경계

### 여기서 하는 것

- HTTP/GraphQL/CLI 라우팅, 엔드포인트 선언
- 요청 인증·인가 (프레임워크 guards)
- 요청 validation (DTO 검증)
- 여러 도메인 호출 **오케스트레이션**
- 응답 직렬화·에러 매핑

### 여기서 하지 않는 것

- **비즈니스 규칙** — `domain`으로.
- DB 쿼리 구체 — 도메인 리포지토리 인터페이스 호출만.
- 기술 인프라 로직 (로깅, 설정) — `shared`.

## API 경로 ↔ 폴더 대응

REST라면 리소스 경로와 `app/` 하위 폴더를 **1:1**로 유지한다.

| HTTP | 경로 | 파일 |
|---|---|---|
| GET | `/employees` | `app/employees/employees.controller.ts` |
| POST | `/employees` | 같은 파일 |
| GET | `/employees/:id` | 같은 파일 |
| GET | `/organizations/:id/members` | 리소스 설계에 따라 `app/organizations/` 또는 `app/employees/` |
| POST | `/payroll/calculate` | `app/payroll/payroll.controller.ts` |

**중요**: app 슬라이스는 API 리소스 단위로 **세분**되지만, 도메인 슬라이스는 Bounded Context 단위로 **통합**된다 (시나리오 2). 즉 `app/employees` · `app/organizations` · `app/payroll`이 각자 존재하면서 모두 `domain/organization`(또는 적절한 Context 슬라이스)을 참조할 수 있다. 이 비대칭은 정상이며, 외부 API 세분화가 내부 도메인 경계와 1:1로 맞아야 할 필요는 없다. 자세한 원리는 [`02-slices.md`](02-slices.md)의 "슬라이스 단위는 레이어마다 다르다".

### 자원 설계 가이드

- **URL 리소스명 = 슬라이스 이름**을 기본으로 한다.
- 중첩 리소스(`/posts/:id/comments`)는 보통 **자체 슬라이스**(`app/comments`)로 분리. 경로 hierarchy를 폴더 hierarchy에 강제 일치시키지 않는다 (일치시키면 폴더가 깊어짐).

GraphQL이면 `type` 이름 단위, CLI면 커맨드 단위로 같은 원리.

## 컨트롤러 vs 서비스

### 컨트롤러

- 라우팅 어노테이션 + HTTP 레이어 변환.
- 하는 일이 거의 없어야 한다 — 요청 → DTO → 서비스 호출 → 응답 매핑.
- 비즈니스 로직이 보이면 서비스로 옮긴다.

### 서비스 (이 레이어의 서비스)

- **여러 도메인을 조합해 유스케이스를 완성**.
- 예: "회원가입"은 `domain/users`의 User 생성 + `domain/emails`의 인증 이메일 발송 + 트랜잭션 — 이 조합을 `app/users/users.service.ts`가 담당.
- **한 도메인만 쓰는** 단순 CRUD라도 app 서비스를 두는 걸 권장 — 컨트롤러에서 직접 도메인을 호출하면 나중에 오케스트레이션이 생길 때 리팩터 비용이 생긴다.

### 한 도메인만 쓰는 경우

```
[Controller] → [App Service] → [Domain Repository / Entity method]
```

App 서비스가 얇아 보여도 유지. 일관성 > 간결성.

### 여러 도메인 오케스트레이션

```
[Controller] → [App Service]
                   ├─▶ domain/users
                   ├─▶ domain/emails
                   └─▶ shared/db.transaction
```

이 서비스가 **여러 슬라이스에서 재사용**되기 시작하면 `use-cases` 레이어로 승격 후보 — [`07-dip-patterns.md`](07-dip-patterns.md)의 A안.

## DTO / Validation

- DTO는 슬라이스 내부 `dto/` 폴더에.
- NestJS면 `class-validator` 데코레이터로 validation.
- **DTO는 app 레이어 전용**. domain 엔티티와 혼용하지 말 것 — DTO가 API 응답 모양이 되면 도메인이 API 변경에 묶인다.
- 응답 변환: 간단한 정적 함수 `userToDto(user)` 또는 NestJS `ClassSerializerInterceptor` 활용. MapStruct/AutoMapper 같은 외부 라이브러리까지는 보통 불필요.

## 슬라이스 내부 구조 (NestJS 예)

```
app/users/
├── users.module.ts          ← 이 슬라이스의 public API (exports)
├── users.controller.ts
├── users.service.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-response.dto.ts
└── guards/
    └── owner.guard.ts       ← 이 슬라이스 전용
```

공통 guard/pipe/filter는 `shared`로 승격.

## 같은 레이어 슬라이스 의존

`app/users`가 `app/posts`의 기능을 필요로 하면 **금지**. 해결책:

- [`02-slices.md`](02-slices.md) — 왜 금지인가
- [`07-dip-patterns.md`](07-dip-patterns.md) — A안(use-cases 승격) / B안(계약 분리)
- [`09-framework-notes.md`](09-framework-notes.md) — NestJS 모듈 시스템에서 정적 강제 방법

## 전형적 흐름 (NestJS 기준, HR 예)

`POST /employees` 엔드포인트 개요:

- **Controller** (`app/employees/employees.controller.ts`): `@Body() CreateEmployeeDto`를 받아 `employeesService.create(dto)` 호출 → 결과를 `EmployeeResponseDto`로 변환.
- **Service** (`app/employees/employees.service.ts`): domain의 리포지토리 인터페이스(`EmployeeRepository`)와 도메인 서비스를 주입받아 오케스트레이션. 트랜잭션 블록에서 `employee = await employeeRepository.create(...)` → 도메인 이벤트 발행 → 환영 이메일(Notification) 발송.
- **도메인 호출은 전부 리포지토리 인터페이스 / 도메인 엔티티 메서드**만 사용. ORM 구체 타입(`TypeOrmRepository<Employee>`)은 app 서비스에 등장하지 않음 — infrastructure가 감싼다.

Slice 방식 domain(다중 Context)에서 여러 Context를 엮는 경우 — 예: `onboardEmployee`가 `domain/organization` + `domain/payroll`을 모두 참조 — app 서비스가 커지면 `use-cases/onboard-employee`로 승격 ([`07-dip-patterns.md`](07-dip-patterns.md) A안).

## 읽기와 쓰기의 다른 경로 (CQRS 경량 적용)

앱 요청은 크게 **쓰기**(데이터 변경)와 **읽기**(화면 조회)로 나뉜다. 이 스킬은 두 경로를 **다른 레이어 조합**으로 처리한다. CQRS(Command Query Responsibility Segregation)의 가벼운 적용 — 쓰기/읽기 DB 분리나 이벤트 소싱까지 가지 않고 **코드 조직만 분리**한다.

### 쓰기 경로 (Command)

불변 규칙·상태 전이 검증이 필요하므로 반드시 domain을 경유한다.

```
Controller → App Service → Domain Service / Entity method
            → Repository interface (domain)
            → (DI 런타임) → Repository 구현체 (infrastructure)
```

#### 쓰기 경로에서도 조회는 필요하다

"쓰기"라고 저장만 한다는 뜻이 아니다. 상태 변경 전 **현재 상태 로드**가 필수.

- `update()` 하려면 `findById()`로 먼저 읽어야 함
- 이메일 중복 검사 → `findByEmail()`
- 상태 전이 정책 대상 집합 로드 → `findByStatus('pending')`

이 조회는 **리포지토리가 담당**한다. Query Service가 아니라.

#### 리포지토리 조회의 범위 (조인 제한)

리포지토리가 제공할 조회는 **자기 Aggregate 경계 안**으로 제한한다.

| 조인 유형 | 리포지토리에서 허용? | 해법 |
|---|---|---|
| 같은 Aggregate 내부 연관 | ✅ (예: Order ↔ OrderItem) | 리포지토리 메서드 |
| 같은 Context의 다른 Aggregate | ⚠ 가급적 피함 | 각 리포지토리 호출 후 메모리 조합. 성능 이슈 있을 때만 조인 |
| **다른 Context의 데이터 조인** | ❌ | Query Service로 뺀다 (아래 참조) |

이 범위를 지키는 이유: 리포지토리가 "화면용 만능 조회 메서드"로 비대해지면 Aggregate 경계가 희미해지고 트랜잭션 경계도 흐려진다.

### 읽기 경로 (Query)

화면 조회는 비즈니스 규칙 적용이 필요 없다. DB에서 화면 모양으로 뽑아오면 끝. **domain을 우회**한다.

#### 1. 단일 Context 화면 조회

가장 흔한 경우 — 한 Context의 데이터만 필요.

```
Controller → Query Service (infrastructure) → DB
```

- App 서비스는 **생략 가능**. 컨트롤러가 infrastructure의 query service를 직접 주입·호출.
- Query service는 domain 모델이 아니라 **화면용 DTO**를 바로 반환.
- 필요하면 app 서비스에 얇은 래퍼를 두되 (응답 변환·인증 필터 집중) query service 호출에 위임.

#### 2. 다중 Context 조합 조회

화면이 여러 Context의 데이터를 함께 보여주는 경우 (예: 직원 대시보드 = 조직 정보 + 급여 요약 + 근태 현황). 두 옵션이 있고 상황에 따라 선택.

##### 옵션 A — 단일 통합 Query Service

한 query service가 여러 Context 테이블을 **DB 조인 한 번**에 뽑는다.

```
infrastructure/queries/
└── employee-dashboard.query-service.ts
    └─ employees + payrolls + attendances 테이블을
       한 SELECT로 조인해 DashboardDto 반환
```

Controller가 직접 이 query service를 호출 (use-case 생략).

**적합**: 단일 DB / 성능 중요 / 실시간 최신 데이터 / Context 경계를 읽기에선 완화해도 되는 상황.

이 방식은 CQRS의 전형 관점 — **Read side는 Context 경계를 덜 엄격히** 적용한다. 쓰기에서 경계가 지켜지므로 읽기는 효율 우선.

##### 옵션 B — Use-Case에서 여러 Query Service 조합

각 Context에 자기 query service를 두고 use-case가 여러 개를 주입받아 메모리에서 조립.

```
infrastructure/organization/queries/employee.query-service.ts
infrastructure/payroll/queries/payroll-summary.query-service.ts
infrastructure/attendance/queries/attendance.query-service.ts

use-cases/employee-dashboard/
└── employee-dashboard.use-case.ts
     ├─ employeeQuery.findDetail(id)
     ├─ payrollQuery.findRecent(id)
     └─ attendanceQuery.findThisMonth(id)
    → 메모리에서 조립해 DashboardDto 반환
```

**적합**: Context별로 DB가 다를 가능성 / 읽기도 Context 경계를 유지하고 싶을 때 / 각 query가 다른 화면에서도 재사용될 때.

**단점**: DB 조인보다 느릴 수 있음, N+1 위험.

##### 선택 기준 요약

| 조건 | 선택 |
|---|---|
| 단일 DB + 성능 우선 + 화면 전용 조회 | **A (통합 QS)** |
| Context별 DB 가능성 / 읽기도 경계 유지 / QS 재사용성 | **B (use-case 조합)** |

단일 DB가 기본이므로 **A를 기본값**으로 시작하고, Context 경계를 엄격히 지키고 싶을 때 B로 전환하는 식이 실용적.

### Query Service ↔ 도메인 스냅샷 VO 혼동 주의

다른 Context 정보가 필요한 두 상황이 있는데 **해결 방식이 층위에 따라 다르다**:

| | 도메인 스냅샷 VO / 계약 (04 참조) | Query Service (지금 섹션) |
|---|---|---|
| 어디서 쓰나 | domain 레이어 내부 (쓰기 로직) | infrastructure (읽기 응답) |
| 왜 필요 | 도메인 규칙의 순수성·무결성 | 화면 DTO 효율 제공 |
| 언제 | 급여 계산·정책 적용 등 **쓰기 사이클** 중 외부 Context 정보 필요 | 대시보드·목록·리포트 등 **화면 조회** |
| 반환 | VO (도메인 개념) | DTO (API 응답 모양) |

정보가 **도메인 규칙 실행**에 필요하면 스냅샷 VO + 계약([`04-domain-layer.md`](04-domain-layer.md)), **화면 표시**에만 필요하면 Query Service (지금 섹션).

### 레이어 건너뛰기 허용

app이 use-cases·domain을 거치지 않고 infrastructure의 query service를 직접 참조하는 건 **레이어 단방향 의존을 깨지 않는다** — 위→아래 방향이니까. 이 스킬은 "바로 다음 레이어만 참조해야 한다"는 규칙을 두지 않는다. 중간 건너뛰기 OK.

### 구현 구조 예

```
infrastructure/
├── organization/
│   ├── employee.typeorm.repository.ts         ← 쓰기 (domain 인터페이스 구현)
│   ├── organization.typeorm.repository.ts
│   └── queries/
│       ├── employee.query-service.ts          ← 단일 Context 조회
│       └── organization-tree.query-service.ts
├── payroll/
│   ├── payroll.typeorm.repository.ts
│   └── queries/
│       └── payroll-summary.query-service.ts
└── queries/                                   ← 통합 조회 (옵션 A)
    └── employee-dashboard.query-service.ts    ← 여러 Context 테이블 조인
```

작은 프로젝트라면 `infrastructure/queries/` 하나에 모두 모아도 된다.

### Query Service 인터페이스 여부

Query Service는 쓰기 리포지토리와 달리 **도메인 인터페이스 없이 직접 참조**하는 경우가 흔하다 — 화면 DTO가 API 응답 모양과 거의 같아 타입 분리 이득이 적고, 테스트도 가짜 구현체보다 **testcontainers + real DB**가 현실적.

원하면 인터페이스를 씌울 수 있지만 **의무는 아니다**. 쓰기는 엄격히 DIP, 읽기는 실용적으로 — 이 비대칭도 CQRS의 특징.

### 체크리스트

- [ ] 리포지토리에 다른 Context 테이블과 조인하는 메서드가 있나? → Query Service로 분리.
- [ ] 리포지토리에 화면 DTO 반환 메서드가 쌓이고 있나? → Query Service로 분리.
- [ ] 읽기 엔드포인트가 domain을 불필요하게 경유하나? → Query Service 직접.
- [ ] 다중 Context 조회를 옵션 A/B 중 어느 것으로 할지 결정했나?
- [ ] 도메인 로직에서 필요한 외부 Context 정보를 Query Service로 가져와 쓰고 있지 않나? → 스냅샷 VO + 계약(04)으로 교체.

## 응답 에러 매핑

- 도메인 레이어는 도메인 에러를 throw (`UserNotFoundError` 등).
- app 레이어에 **예외 필터**(NestJS `ExceptionFilter`)를 두어 도메인 에러를 HTTP 상태 코드로 변환.
- 필터 자체는 `shared/filters/`에, 전역 등록은 app의 모듈에서.

## 체크리스트

- [ ] 컨트롤러가 10줄을 넘는가? 대부분의 로직을 서비스로 옮겼는지 확인.
- [ ] 서비스가 도메인 리포지토리 인터페이스가 아닌 ORM 구체 타입을 쓰고 있나? → 인터페이스로 추상화.
- [ ] 같은 app 슬라이스끼리 import하고 있나? → DIP로 해결.
- [ ] DTO가 도메인 엔티티와 같은 타입을 쓰고 있나? → 분리.
