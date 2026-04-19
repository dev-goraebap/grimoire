---
section: slices
---

# Slices

레이어 내 **단위 폴더**를 슬라이스라 부른다 (FSD 용어 차용).

## 슬라이스의 단위는 레이어마다 다르다 (중요)

같은 "슬라이스"라는 용어를 쓰지만 레이어마다 무엇을 한 단위로 묶는지 다르다.

| 레이어 | 슬라이스 단위 | 예 |
|---|---|---|
| `app` | **API 리소스** (세분) | `app/employees`, `app/organizations`, `app/payroll` |
| `use-cases` / `features` | **유스케이스** 또는 공통 관심사 | `use-cases/onboard-employee` |
| `domain` | **Bounded Context** (다중 Context) 또는 **없음** (단일 Context) | 상황에 따라 — 아래 상세 |
| `shared` | **기술 세그먼트** | `shared/logger`, `shared/db`, `shared/util` |

## domain 레이어의 두 가지 방식

`domain`은 시스템 규모에 따라 구조가 달라진다 — 이 스킬이 FSD와 가장 크게 다른 지점이며 의도적 유연성이다.

두 방식을 **Slice 방식**과 **Sliceless 방식**으로 부른다. 용어는 FSD 공식 정의를 따른다 — FSD는 `app`·`shared` 같은 레이어를 "sliceless layer"라 부르는데, 이 스킬은 `domain`도 작은 시스템에선 sliceless가 될 수 있다고 허용한다.

> 팀 내부에서 이 두 방식을 각각 "슬라이스 방식 / 세그먼트 방식"으로 불러도 문제없다. 다만 FSD 엄밀 용어상 "segment"는 슬라이스 내부의 기술 분류(ui/model/api 같은 세로 썰기)를 가리켜 의미가 다르므로, 외부와 소통할 때는 slice / sliceless가 정확하다.

### Sliceless 방식 (단일 Bounded Context)

도메인 개념이 **하나의 용어 체계**로 충분한 경우. 같은 단어가 문맥별로 다른 의미로 쓰이지 않는다.

가장 단순한 형태는 평평 구조:

```
domain/
├── employee.entity.ts
├── organization.entity.ts
├── rank.vo.ts
├── employee.repository.ts       (interface)
├── organization.repository.ts
└── policies/
    └── employee-placement.policy.ts
```

파일이 늘어나면 **의미적 그룹화**를 위해 개념별로 폴더를 묶어도 된다:

```
domain/
├── employee/
│   ├── employee.entity.ts
│   ├── employee.repository.ts
│   └── employee-status.vo.ts
├── organization/
│   ├── organization.entity.ts
│   └── organization.repository.ts
└── rank/
    └── rank.vo.ts
```

중요: **이 폴더는 슬라이스가 아니다**. 같은 Context에 속하므로 `domain/employee/`가 `domain/organization/`을 자유롭게 참조할 수 있다. 슬라이스 경계를 나눈 게 아니라 단순히 응집도를 높이기 위한 **그룹화 폴더**다. "같은 레이어 슬라이스 참조 금지" 규칙은 **적용 대상이 없다** — 슬라이스 자체가 없기 때문.

### Slice 방식 (다중 Bounded Context)

같은 단어가 문맥별로 다른 모델이 될 때 (예: "직원"이 조직관리에선 `상관/직책` 중심, 급여에선 `급여계정/세금` 중심).

```
domain/
├── organization/                ← 조직관리 Context (슬라이스)
│   ├── employee.entity.ts
│   ├── organization.entity.ts
│   ├── position.entity.ts
│   ├── employee.repository.ts
│   └── index.ts                 ← public API
├── attendance/                  ← 근태 Context (슬라이스)
│   ├── attendance.entity.ts
│   ├── shift.entity.ts
│   ├── employee-snapshot.vo.ts  (근태 맥락의 직원 — ID + 부서명 정도만)
│   └── index.ts
└── payroll/                     ← 급여 Context (슬라이스)
    ├── payroll.entity.ts
    ├── salary.vo.ts
    ├── payable-employee.vo.ts   (급여 계산에 필요한 정보만)
    └── index.ts
```

각 Context 내부에서는 엔티티 자유 참조, Context 간은 금지. **슬라이스 참조 규칙이 엄격히 적용**된다.

Sliceless 방식의 `domain/employee/`와 Slice 방식의 `domain/organization/`은 **겉모양이 비슷해 혼동하기 쉽지만 성격이 다르다**:

- Sliceless 그룹화 폴더 → 서로 자유 참조 (한 Context 내부의 편의 그룹화)
- Slice 방식의 Context 폴더 → 서로 참조 금지 (Bounded Context 경계)

이 차이는 프로젝트 시작 시 **명시적으로 결정하고 팀이 공유**해야 한다. 문서(README 또는 AGENTS.md)에 "이 프로젝트 domain은 Sliceless 방식 / Slice 방식" 한 줄을 적어두면 새 합류자·에이전트 모두 같은 전제를 쓴다.

### FSD와의 차이

FSD(프론트엔드)는 `entities` 레이어에 **항상 엔티티별 슬라이스**를 강제한다. 이 스킬의 `domain`은 다르다:

- **Sliceless 방식**이 기본 선택지로 허용된다 — 과설계 방지.
- **Slice 방식으로 커지면** Bounded Context 단위로 슬라이스를 도입.

이 유연성 덕에 작은 프로젝트는 보일러플레이트 없이 시작하고, 커지면 Context별로 분화해 대응한다. 단, **경계를 나눈 순간부터는 슬라이스 참조 규칙을 엄격히 적용**한다. Sliceless에서 Slice로 진화할 때 가장 큰 리팩터링은 "자유롭게 섞여 있던 참조를 Context 경계에 맞춰 정리하는 일".

### 기술 유형별 분류는 안티패턴 (Sliceless와 다른 얘기)

Sliceless 방식의 **의미적 그룹화**와 **기술 유형별 분류**는 다르다. 후자는 어느 방식에서든 안티패턴.

```
# 지양 (기술 유형별 분류)
domain/
├── models/
├── value-objects/
├── repositories/
└── services/
```

이런 분류는 Employee 개념을 이해하려 네 폴더를 오가게 만든다. 응집도 파괴.

허용되는 그룹화는 **의미 단위**(employee, organization 같은 도메인 개념)이고, 금지되는 것은 **기술 유형**(models, repositories, services). Sliceless 방식의 `domain/employee/`는 전자라 OK.

## 같은 레이어 슬라이스 간 참조: 금지

슬라이스 개념이 있는 레이어(app / use-cases / Slice 방식 domain)에서 적용.

```
app/employees    ─X─▶ app/organizations   (금지, API 리소스끼리)
domain/organization ─X─▶ domain/payroll   (금지, Bounded Context끼리)
use-cases/a      ─X─▶ use-cases/b          (금지)
```

### 왜 금지인가

- 같은 레이어 슬라이스끼리 의존이 생기면 **의존 그래프가 평면 네트워크**가 되어, 어떤 슬라이스를 수정할 때 영향 범위 예측이 어려워진다.
- 테스트·이해·리팩터링 단위가 "슬라이스 하나"로 유지되어야 레이어 구조의 가치가 살아난다. 네트워크로 엮이기 시작하면 레이어가 시각적 폴더에 불과해진다.
- 이 규칙이 깨지기 시작하면 다른 규칙(레이어 단방향 등)도 **연쇄적으로 뚫린다**. 첫 위반이 가장 비싸다.

### 어떻게 피하나

같은 레이어 슬라이스끼리 기능이 엮이면 **DIP로 푼다**. 두 방향:

- **A안**: 공통 기능을 상위 레이어(`use-cases` / `features`)로 승격.
- **B안**: 계약 인터페이스를 만들고 원래 자리는 구현체로. 다른 슬라이스는 계약만 참조.

도메인 Context 간 참조가 필요할 때도 같은 기법 + ID만 소유·이벤트 구독이 표준. 선택 기준은 [`07-dip-patterns.md`](07-dip-patterns.md).

### 단순 중복은 허용

코드 중복이 약간 있다고 해서 매번 A/B 기법을 꺼낼 필요는 없다. "중복 제거 vs 슬라이스 독립성" **트레이드오프**. 재사용 빈도가 낮고 기능이 단순하면 복사가 저렴하다. DIP는 재사용 횟수가 정말 늘어난 뒤 적용 — **3번째 재사용**이 보일 때가 경험적 기준.

## shared 예외

`shared`는 위 규칙의 예외. **슬라이스 간 상호 참조 허용**. 단, 양방향 순환은 피한다.

```
shared/logger  ──▶ shared/config    (OK, logger가 로그 레벨 읽음)
shared/db      ──▶ shared/logger    (OK, DB 쿼리 로그)
shared/config  ──▶ shared/logger    (OK)

shared/a ──▶ shared/b ──▶ shared/a  (순환 금지)
```

### 왜 예외인가

`shared`의 세그먼트는 **도메인 요구사항과 무관한 기술 인프라**다. `logger`가 `config`를 참조하고 `db`가 `logger`를 참조하는 것은 자연스럽다. 이를 막으면 "shared의 shared" 같은 무한 승격이 발생해 구조가 오히려 복잡해진다.

순환(`a → b → a`)만 피하면 된다. 순환이 나타났다는 건 한쪽을 더 작게 쪼개거나 한쪽을 다른 쪽으로 흡수해야 한다는 신호.

## Public API 참조 규칙 (barrel export)

슬라이스 **내부는 자유로이 구성**하되, **외부에서 참조할 수 있는 것은 명시적으로 공개된 것**만이다. TypeScript 환경에서는 **barrel file(`index.ts`)**로 구현한다.

```ts
// domain/organization/index.ts  (public API)
export { Employee } from './employee.entity';
export { Organization } from './organization.entity';
export type { EmployeeRepository } from './employee.repository';
export { EMPLOYEE_REPOSITORY } from './tokens';
// 정책 내부 함수, 보조 VO, 구현 세부는 export 안 함
```

```ts
// 외부 슬라이스·레이어에서
import { Employee, EmployeeRepository } from '@domain/organization';   // OK

// 금지 — 내부 세부 직접 접근
import { Employee } from '@domain/organization/employee.entity';       // ❌
import { calculatePayGrade } from '@domain/organization/policies/pay-grade.policy';   // ❌
```

### 왜 필요한가

- **슬라이스 내부 리팩터링 자유 확보** — 파일 이동·이름 변경이 외부에 영향 없음.
- **"무엇이 공식 계약인지" 명확화** — barrel에 없으면 private.
- **슬라이스 경계가 "의도적 API"로 표현**됨 — 우연히 공개된 것과 의도적 공개가 구분.

### 내부 참조는 자유

같은 슬라이스 **내부 파일끼리 import**는 barrel을 거치지 않는다 — 내부 자유 구성 원칙. barrel 필수는 **슬라이스 외부에서 들어올 때만**.

```ts
// 같은 슬라이스 내부 — OK
// domain/organization/organization.entity.ts
import { Employee } from './employee.entity';   // 내부 참조는 직접 OK
```

### 정적 강제

barrel 규약은 관례만으론 깨지기 쉽다. [`09-framework-notes.md`](09-framework-notes.md)의 경계 강제 수단들이 이 규약도 함께 지켜준다:

- `eslint-plugin-boundaries` — "외부 슬라이스는 `index.ts`만 import" 규칙.
- `dependency-cruiser` — 경로 패턴 위반 감지 (`allowOnlyDefinedIn`).
- TypeScript `paths` alias — `@domain/organization/*` 대신 `@domain/organization`만 허용.

## 정적 감지 수단 요약

규칙을 개발자 규율에만 맡기면 결국 깨진다. 정적으로 강제하는 도구들:

- **`eslint-plugin-boundaries`** — 파일 단위 role 선언 + 허용 관계, IDE·PR 즉시 피드백.
- **`dependency-cruiser`** — 독립 CLI, 의존 그래프 시각화 + 위반 리포트, CI 감사.
- **Nx monorepo `enforce-module-boundaries`** — 태그 기반, Nx 전제.
- **TypeScript path alias (`tsconfig paths`)** — import 경로 정돈, 보조 방어선.

구체 설정·선택 기준은 [`09-framework-notes.md`](09-framework-notes.md).

## 슬라이스 내부 구조

슬라이스 안은 **자유롭게 구성**한다. 다만 외부 공개는 `index.ts` barrel을 거친다.

### app 슬라이스 예 (NestJS)

```
app/employees/
├── index.ts                  ← public: EmployeesModule만
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
├── dto/
│   ├── create-employee.dto.ts
│   └── update-employee.dto.ts
└── guards/
    └── owner.guard.ts        ← 슬라이스 전용
```

### domain 슬라이스 예 (Slice 방식, Bounded Context 단위)

```
domain/organization/
├── index.ts                  ← public: Employee, Organization, repository interfaces, tokens
├── employee.entity.ts
├── organization.entity.ts
├── position.entity.ts
├── rank.vo.ts
├── employee.repository.ts    (interface)
├── tokens.ts                 (EMPLOYEE_REPOSITORY 등 DI 토큰)
├── policies/
│   ├── employee-placement.policy.ts
│   └── promotion.policy.ts
└── events/
    ├── employee-hired.event.ts
    └── position-assigned.event.ts
```

원칙:

- **슬라이스 내부에서만 쓰이는** guards/pipes/helpers는 슬라이스 안에 유지 + barrel에서 export 안 함.
- **공통 guards/pipes**는 `shared`로 승격.
- 내부 파일 개수가 많아져 거슬리기 시작하면 **슬라이스 쪼개기** 신호 (`domain/organization` → `domain/organization` + `domain/role-management`).

## 체크리스트

- [ ] 같은 레이어 슬라이스간 import 있는가? → DIP로 해결.
- [ ] 슬라이스마다 `index.ts` barrel이 있는가?
- [ ] 외부 슬라이스를 내부 파일 경로로 직접 import하고 있진 않은가? → barrel 경유로 교정.
- [ ] domain이 Sliceless 방식(단일 Context)인데 Context별 슬라이스로 쪼갰나? → 과설계, 평탄화.
- [ ] domain이 Slice 방식(다중 Context)인데 엔티티들이 한 폴더에 섞여 있나? → 경계 정리.
- [ ] Sliceless 방식의 그룹화 폴더(`domain/employee/`)를 슬라이스로 오인해 참조를 막고 있진 않나? → 같은 Context 내부는 자유 참조.
- [ ] 레이어 역방향 import 없는가? (`domain` → `app` 등)
- [ ] `domain/models/`, `domain/repositories/` 같은 기술 유형별 분류로 빠졌나? → Context별 재구성.
