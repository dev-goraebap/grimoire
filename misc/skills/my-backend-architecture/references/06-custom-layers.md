---
section: custom-layers
---

# 사용자 정의 레이어

## 문제 상황

`app` 레이어는 Presentation + Application을 결합한다.  
이 구조에서 **여러 resource가 동일한 오케스트레이션 로직을 공유해야 할 때** 문제가 생긴다.

- 로직이 여러 BC를 걸치면 `domain`에 둘 수 없다
- 같은 레이어(app) module 간 직접 참조는 금지

해결책으로 **app과 domain 사이에 사용자 정의 중간 레이어**를 삽입한다.

---

## 레이어 이름은 사용자 정의

이름·개수를 팀이 자유롭게 정한다. 일반적인 이름 예시:

- `use-cases` (DDD·클린 아키텍처 영향)
- `features` (FSD 영향)
- `workflows`, `commands` 등 팀 도메인 언어

**중요**: 이름보다 **원칙**이 중요하다. 프로젝트당 하나의 이름으로 고정.

**도입 원칙**: 필요할 때만. 빈 레이어는 세금.

---

## 도입 신호

다음 중 하나라도 해당하면 중간 레이어 도입 검토:

- 동일한 오케스트레이션 흐름이 **2개 이상 resource**에서 필요
- 여러 BC를 엮는 로직 (트랜잭션·이벤트·보상 포함)
- 단일 resource의 서비스가 커지며 단일 책임이 흐려질 때

---

## 접근 A — 하위 레이어로 추출

공통 오케스트레이션 로직을 **새 레이어로 내려서** 여러 resource가 참조하게 한다.

```
app/employees ──┐
                ├──▶ use-cases/onboard-employee ──▶ domain
app/attendance ─┘
```

**module 단위**: 비즈니스 유스케이스 단위. 동사+목적어 형식.

```
use-cases/
├── onboard-employee/
│   ├── index.ts
│   └── onboard-employee.use-case.ts
├── offboard-employee/
└── transfer-employee/
```

**규칙**:
- BC별로 묶지 않는다 — 유스케이스 단위로 module 구성
- 이 레이어의 module 간 참조도 금지 (`01-layers-and-modules.md`와 동일)
- 여러 중간 레이어가 있을 때는 상위 → 하위 참조 규칙 동일하게 적용

---

## 접근 B — 인터페이스 분리 (DIP)

`app/a`의 기능을 `app/b`도 사용해야 할 때, 중간 레이어에 **인터페이스 + 필요한 타입**을 두고 DIP로 연결한다.

```
contracts/
└── payroll-stopper/
    ├── payroll-stopper.interface.ts   ← 인터페이스 + DTO
    └── index.ts

app/payroll/                           ← 인터페이스 구현
└── payroll.service.ts (implements PayrollStopper)

app/employees/                         ← 인터페이스만 참조
└── employees.service.ts (uses PayrollStopper — DI 주입)
```

- `app/employees`는 `contracts/payroll-stopper` 인터페이스만 import
- `app/payroll`은 구현체를 export
- DI 컨테이너가 `app/employees`에 `app/payroll`의 구현체를 주입
- **코드 레벨에서 `app/employees → app/payroll` 직접 import가 없음**

인터페이스 이름은 **동사 중심** 권장: `PayrollStopper`, `OrderApprover`, `InventoryChecker`

---

## 두 접근법 비교

| | 접근 A (하위 추출) | 접근 B (인터페이스 분리) |
|---|---|---|
| 해결 방식 | 공통 로직을 아래 레이어로 이동 | 인터페이스를 중립 레이어에, DIP로 연결 |
| 새 레이어 필요 | ✅ use-cases 등 | ✅ contracts 등 |
| 코드 재사용 | 여러 resource가 같은 use-case 호출 | 여러 resource가 같은 인터페이스 사용 |
| 구현 위치 | 중간 레이어 안 | 기존 resource 안 (app/a) |
| 적합한 상황 | 공통 비즈니스 흐름 추출 | 기존 resource 기능을 다른 resource가 DIP로 소비 |

두 방식은 **같은 문제(같은 레이어 module 간 공유)를 다른 방식으로** 해결한다. 조합도 가능.

---

## 단순 중복은 추상화하지 않는다

재사용이 **2번째** 발생하기 전까지는 미리 추상화하지 않는다.  
3번째 재사용 시점에 A/B 중 적합한 방식을 선택한다.

우연한 중복(코드가 비슷하지만 다른 비즈니스 의미)을 섣불리 합치면 나중에 분리 비용이 더 크다.
