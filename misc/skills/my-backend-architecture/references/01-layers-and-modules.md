---
section: layers-and-modules
---

# 레이어와 모듈 개념

## 기본 구조

**기본 4개 레이어** + 필요 시 사용자 정의 중간 레이어 삽입.

```
app (resource)
  ↓
(사용자 정의 중간 레이어)?     선택. 이름은 팀이 결정.
  ↓
domain (module)
  ↓              ▲
shared           │ DIP: infrastructure가 domain 인터페이스를 구현
  ↑              │
  └── infrastructure (module)
```

- **위에서 아래로만** 참조. 역방향 전면 금지.
- **infrastructure → domain**: import 방향만 역전(DIP). 런타임 호출 흐름은 반대.
- **모든 레이어가 shared 참조 가능**.

---

## 폴더 단위 명명

| 레이어 | 폴더 단위 이름 |
|--------|---------------|
| `app` | **resource** (API 리소스, 페이지, CLI 커맨드 등) |
| `domain` / `infrastructure` / 중간 레이어 | **module** |
| `shared` | **module** (segment라고도 부름) |

"module"은 이 스킬의 **폴더 단위 코드 경계** 용어다. NestJS `@Module()` 데코레이터와 다른 개념이다.

---

## 레이어 간 참조 방향

### 참조 가능 매트릭스

| 레이어 | 참조 가능 | 참조 불가 |
|--------|-----------|-----------|
| `app` | 중간 레이어·`domain`·`infrastructure`·`shared` | (최상위, 없음) |
| 중간 레이어 | `domain`·`shared` (또는 더 아래 중간 레이어) | `app` |
| `domain` | `shared` | `app`·중간 레이어·`infrastructure` |
| `infrastructure` | `domain`·`shared` | `app`·중간 레이어 |
| `shared` | `shared` (순환 금지) | 모든 상위 레이어 |

### 레이어 건너뛰기

중간 레이어가 **도입되지 않은 경우**에만 건너뛰기 허용.

```
# 중간 레이어 없음 → app이 domain 직접 참조  ✅
app → domain

# 중간 레이어 있음 → 건너뛰기 금지  ❌
app → domain   (use-cases가 존재하는데 우회)

# 올바른 흐름
app → use-cases → domain  ✅
```

**원칙**: "도입한 레이어는 반드시 거친다."

---

## 같은 레이어 module 간 참조 규칙

| 레이어 | module 간 참조 | 이유 |
|--------|---------------|------|
| `app` | ❌ 금지 | resource끼리 의존하면 경계 붕괴 |
| 중간 레이어 | ❌ 금지 | 동일 이유 |
| `infrastructure` | ❌ 금지 | adapter 간 결합 방지 |
| `domain` | ⚠️ 허용하되 BC 간 검토 | 단일 BC면 자유, 다중 BC면 ID 타입 외 강한 의존 지양 |
| `shared` | ✅ 허용 | 기술 세그먼트라 의존이 자연스러움. 순환만 금지. |

같은 레이어 module 간 참조가 필요해지면 **사용자 정의 중간 레이어**로 해결한다. → `06-custom-layers.md`

---

## Public API (module 경계 표현)

각 module은 **외부에 공개할 대상만 명시**한다. 내부 구조는 자유.

### TypeScript — barrel (`index.ts`)

```ts
// domain/workforce/index.ts  (Public API)
export { Employee } from './employee/employee.entity';
export type { EmployeeRepository } from './employee/employee.repository';
export { EMPLOYEE_REPOSITORY } from './tokens';
// 내부 헬퍼, 보조 VO 등은 export 안 함
```

외부는 반드시 barrel을 거친다:

```ts
// ✅ OK
import { Employee } from '@domain/workforce';

// ❌ 금지 — 내부 파일 직접 접근
import { Employee } from '@domain/workforce/employee/employee.entity';
```

**같은 module 내부**에서는 barrel 없이 상대 경로 import OK.

### 다른 언어·프레임워크

barrel이 관용이 아닌 환경에선 해당 환경의 방식으로 "공개 대상 명시" 원칙을 따른다.

- Java: `package-private` / `module-info.java`
- Python: `__init__.py` re-export 또는 `__all__`
- Go: 대문자/소문자 네이밍으로 export 경계

---

## 폴더 구조 예시

### 기본 4레이어만 (소규모)

```
src/
├── app/
│   ├── employees/        ← resource
│   └── organizations/    ← resource
├── domain/
│   ├── employee/         ← module (Aggregate 단위)
│   ├── organization/
│   └── policies/
├── infrastructure/
│   ├── employee.typeorm.repository.ts
│   └── organization.typeorm.repository.ts
└── shared/
    ├── logger/
    ├── config/
    └── db/
```

### 중간 레이어 포함 (중규모)

```
src/
├── app/
│   ├── employees/
│   ├── attendance/
│   └── payroll/
├── use-cases/            ← 사용자 정의 중간 레이어 (A안)
│   └── onboard-employee/
├── domain/
│   ├── workforce/        ← module (BC 단위)
│   ├── attendance/
│   └── payroll/
├── infrastructure/
└── shared/
```
