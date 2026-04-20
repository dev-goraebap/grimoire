---
section: app-layer
---

# app 레이어

## 역할과 위치

`app`은 **외부 세계와의 경계**이자 **오케스트레이션 진입점**이다.

- HTTP 라우팅·GraphQL 리졸버·CLI 커맨드·스케줄 잡 엔트리
- 인증·인가, validation, 요청 역직렬화 / 응답 직렬화
- 도메인·인프라를 조합한 유스케이스 완성
- 도메인 에러 → HTTP 상태 코드 매핑

**여기서 하지 않는 것**: 비즈니스 규칙 판정(domain), DB 쿼리 구체(infrastructure), 기술 인프라(shared).

---

## Presentation + Application 결합 (의도적 타협)

클린 아키텍처는 Presentation(컨트롤러)과 Application(오케스트레이션 서비스)을 별도 레이어로 분리한다.  
이 스킬은 **둘을 app 레이어 안에서 결합**한다.

**이유**: 컨트롤러와 서비스를 별도 레이어로 나누는 비용(파일 이동 규칙, DI 배선 이중화, 새 레이어 신설)이 오케스트레이션이 복잡해지기 전까지는 이점보다 크다. 복잡해지면 그 때 **사용자 정의 중간 레이어**(`use-cases` 등)를 도입한다.

```
app/employees/
├── employees.controller.ts   ← Presentation
├── employees.service.ts      ← Application (오케스트레이션)
└── dto/
```

---

## resource 단위 폴더 구성

`app` 하위 폴더는 **resource 단위**. REST라면 API 경로와 1:1 대응이 기본.

```
GET  /employees      → app/employees/employees.controller.ts
POST /employees      → 같은 파일
GET  /employees/:id  → 같은 파일
```

resource 하나의 전형 구성 (NestJS 예):

```
app/employees/
├── index.ts                     ← Public API (NestJS Module export)
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
└── dto/
    ├── create-employee.dto.ts
    └── employee-response.dto.ts
```

---

## 컨트롤러와 서비스의 역할 분리

**컨트롤러**: 라우팅 + HTTP 변환만. 비즈니스 로직 없음.

```ts
@Post()
async create(@Body() dto: CreateEmployeeDto) {
  return this.employeesService.create(dto); // 위임만
}
```

**서비스**: 오케스트레이션. 여러 도메인을 조합해 유스케이스를 완성.  
단일 도메인 CRUD라도 서비스를 거치는 것을 권장한다 (나중에 로직 추가 시 자연스러운 확장).

```ts
async create(dto: CreateEmployeeDto) {
  const organization = await this.organizationRepo.findById(dto.organizationId);
  const employee = Employee.create(dto.name, organization); // 도메인 규칙
  await this.employeeRepo.save(employee);
  return toResponseDto(employee);
}
```

---

## DTO

- resource 내부 `dto/` 폴더에 위치
- **domain 엔티티와 혼용 금지** — DTO는 입출력 계약, 엔티티는 도메인 모델
- 응답 DTO: 엔티티를 DTO로 변환하는 매퍼는 서비스 또는 별도 mapper 함수에

---

## 쓰기 경로 (Command)

```
Controller
  → App Service (오케스트레이션, 트랜잭션 관리)
    → Domain Entity / Domain Service (규칙 판정)
    → Repository Interface (저장)
      → Infrastructure 구현체 (실제 DB)
```

- **반드시 domain을 경유**. 비즈니스 규칙·상태 전이는 domain에서 처리.
- 트랜잭션 관리는 App Service가 담당.

---

## 읽기 경로 (CQRS 경량)

조회는 domain을 우회해 **Query Service**가 DB를 직접 조회·화면 DTO를 반환한다.

```
Controller
  → App Service (선택 — 단순 조회라면 생략 가능)
    → Query Service (infrastructure/queries/)
      → DB 직접 조회 (조인 가능)
        → 화면 DTO 반환
```

- Query Service는 `infrastructure/` 안에 위치.
- 여러 BC 데이터가 필요한 화면 조회도 Query Service 한 곳에서 조인으로 처리.
- domain의 Repository와 별개 — 쓰기 Repository는 Aggregate 경계 안만 조회.

---

## 같은 레이어 resource 간 공유

`app/a`의 기능을 `app/b`도 필요로 할 때 — resource 간 직접 import 금지.  
→ 사용자 정의 중간 레이어로 해결. `06-custom-layers.md` 참조.

중간 레이어 도입 신호:
- 동일 오케스트레이션이 여러 resource에서 재사용
- 여러 BC를 엮는 복잡한 흐름 (트랜잭션·이벤트 포함)
- service 파일이 커지며 단일 책임이 흐려질 때
