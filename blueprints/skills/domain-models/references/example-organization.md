---
context: workforce
status: active
aggregates: [organization, position, employee]
owner: hr-team
---

# 조직관리 Bounded Context (Workforce)

## Role
조직 구조(부서·팀·직책)와 직원의 소속·인사 이동을 관리한다. 급여 계산은 Payroll BC, 근태 기록은 Attendance BC, 채용 프로세스는 Recruitment BC에 각각 위임한다. 이 BC는 "누가 어느 조직의 어떤 직책에 속해 있는가"에만 집중.

## Ubiquitous Language
| 용어 | 의미 |
|------|------|
| 조직 (Organization) | 회사·사업부·부서·팀으로 계층 구성된 조직 단위 |
| 부서 (Department) | Organization 내부의 계층 노드 |
| 직책 (Position) | 조직 내 역할 (예: "백엔드 팀장", "CTO") |
| 직급 (Rank) | 사원·대리·과장·차장·부장 — 직원의 서열 (VO) |
| 직원 (Employee) | 조직에 소속된 사람 |
| 직원상태 (EmployeeStatus) | `ACTIVE` → `SUSPENDED` / `TERMINATED` — VO |
| 고용계약 (EmploymentContract) | 직원의 계약 조건 (정규직·계약직, 입사일 등) |

## Aggregates

### Organization (Aggregate Root)
- **내부 구성**: `Organization` Entity(Root), `Department` Entity(내부 계층 트리)
- **VOs**: `OrganizationType` (회사/사업부/팀), `HeadCount`
- **설명**: 회사 최상단에서 팀 말단까지의 트리 구조. Department는 Organization Aggregate 내부 Entity라 단독 생성·삭제 없음.

### Position (Aggregate Root)
- **내부 구성**: `Position` Entity(Root)
- **VOs**: `PositionLevel` (C-level·VP·Director·Lead·IC)
- **같은 BC 참조**: `organizationId: OrganizationId` — Organization을 ID로 참조
- **설명**: 구체적 직책 인스턴스. "백엔드개발실장"처럼 특정 Organization 소속의 특정 역할.

### Employee (Aggregate Root)
- **내부 구성**: `Employee` Entity(Root), `EmploymentContract` Entity(내부)
- **VOs**: `EmployeeStatus`, `Rank`, `JoinDate`, `EmployeeNumber`
- **같은 BC 참조**:
  - `organizationId: OrganizationId` — 소속 조직 (ID)
  - `positionIds: PositionId[]` — 맡고 있는 직책들 (ID 배열, 겸직 허용)

### 외부 참조 (다른 BC)
- `userId: UserId` — Identity BC의 User를 ID로 참조 (직원의 로그인 계정)

## Invariants

### Organization
- 루트 조직은 parent가 없다. 나머지 Department는 반드시 parent를 가진다 (트리)
- Department는 순환 참조 금지 (A → B → A 불가)
- 조직 삭제 시 소속 Employee·하위 Department가 없어야 한다
- `HeadCount`는 소속 Employee 수와 일치 (불변 유지)

### Position
- 한 Position은 한 Organization에만 속한다
- 같은 Organization 안에 같은 이름의 Position이 둘 이상 있을 수 없다
- Position 폐지 시 할당된 Employee가 없어야 한다 (사전 재배치 필요)

### Employee
- 최소 하나의 Position을 가진다 (겸직 허용되면 복수)
- `TERMINATED` 상태가 되면 모든 Position 할당이 자동 해제된다
- `EmploymentContract`는 Employee 생성 시 반드시 함께 생성된다
- `JoinDate`는 생성 후 변경 불가

## Domain Events
- `OrganizationCreated`, `DepartmentAdded`, `DepartmentMerged`, `DepartmentRenamed`
- `PositionCreated`, `PositionAbolished`
- `EmployeeHired`, `EmployeePromoted`, `EmployeeTransferred`, `EmployeeTerminated`
- `RankChanged`

## External Dependencies
| BC | 상호작용 | 협력 기법 |
|----|---------|-----------|
| Identity | 직원의 UserId 검증 | 동기 (ID 검증) |
| Payroll | `EmployeeHired`·`EmployeePromoted`·`EmployeeTerminated` 구독 | 비동기 (이벤트) |
| Attendance | `EmployeeHired`·`EmployeeTerminated` 구독 (근태 기록 시작·종료) | 비동기 (이벤트) |
| Recruitment | 채용 완료 시 Employee 생성 요청 | 동기 (계약 인터페이스) |

## Related Policies
<!-- policy-book 스킬로 정책 추가 시 자동으로 링크됩니다 -->

## Open Questions
- Position 폐지 시 할당된 Employee 자동 재배치 로직 vs 수동 재배치 선택
- 부서 간 인사 이동 승인 프로세스 (현재는 HR manager 수동 승인)
- 직급(Rank) 체계 개편 시 기존 Employee 매핑 방안
- 겸직 상한선 (몇 개 Position까지 허용할지) 정책 필요
