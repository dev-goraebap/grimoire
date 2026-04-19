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

시나리오 2(다중 Context)에서 여러 Context를 엮는 경우 — 예: `onboardEmployee` 유스케이스가 `domain/organization` + `domain/payroll`을 모두 참조 — app 서비스가 커지면 `use-cases/onboard-employee`로 승격 ([`07-dip-patterns.md`](07-dip-patterns.md) A안).

## 응답 에러 매핑

- 도메인 레이어는 도메인 에러를 throw (`UserNotFoundError` 등).
- app 레이어에 **예외 필터**(NestJS `ExceptionFilter`)를 두어 도메인 에러를 HTTP 상태 코드로 변환.
- 필터 자체는 `shared/filters/`에, 전역 등록은 app의 모듈에서.

## 체크리스트

- [ ] 컨트롤러가 10줄을 넘는가? 대부분의 로직을 서비스로 옮겼는지 확인.
- [ ] 서비스가 도메인 리포지토리 인터페이스가 아닌 ORM 구체 타입을 쓰고 있나? → 인터페이스로 추상화.
- [ ] 같은 app 슬라이스끼리 import하고 있나? → DIP로 해결.
- [ ] DTO가 도메인 엔티티와 같은 타입을 쓰고 있나? → 분리.
