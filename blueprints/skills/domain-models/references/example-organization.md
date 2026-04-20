# 예제: 3개 Aggregate, BC 폴더 구조

Aggregate가 많고 BC가 명확한 경우. 각 Aggregate는 독립 파일.  
파일 경로: `docs/domains/workforce/`

---

## `workforce/organization.md`

```markdown
---
aggregate: Organization
context: workforce
status: active
related_aggregates: [Position, Employee]
---

# Organization

## Role

회사·부서·팀의 계층 구조를 관리한다.
직원의 소속과 직책 배치는 Employee · Position 소관이다.

## Ubiquitous Language

| 용어 | 의미 |
|------|------|
| 조직 (Organization) | 회사·사업부·부서·팀으로 계층 구성된 조직 단위 |
| 부서 (Department) | Organization 내부의 계층 노드. 단독 생성 불가. |
| 조직유형 (OrganizationType) | `COMPANY / DIVISION / DEPARTMENT / TEAM` (VO) |

## Structure

- **Root**: Organization
- **내부 Entity**: Department (계층 트리. Organization 없이 단독 존재 불가.)
- **VO**: OrganizationType, HeadCount

## Invariants

- 루트 조직은 parent가 없다. 나머지 Department는 반드시 parent를 가진다.
- Department 순환 참조 금지 (A → B → A 불가)
- 조직 삭제 시 소속 Employee · 하위 Department가 없어야 한다
- HeadCount는 소속 Employee 수와 일치를 유지한다

## Open Questions

- 조직 간 이동 시 HeadCount 동기화 시점 (즉시 vs 배치)
```

---

## `workforce/position.md`

```markdown
---
aggregate: Position
context: workforce
status: active
related_aggregates: [Organization, Employee]
---

# Position

## Role

조직 내 구체적 직책 인스턴스를 관리한다.
직원 배치 자체는 Employee 소관이다.

## Ubiquitous Language

| 용어 | 의미 |
|------|------|
| 직책 (Position) | 조직 내 역할 인스턴스. 예: "백엔드 팀장" |
| 직책레벨 (PositionLevel) | `C_LEVEL / VP / DIRECTOR / LEAD / IC` (VO) |

## Structure

- **Root**: Position
- **VO**: PositionLevel
- **외부 참조**: `organizationId: string`

## Invariants

- 한 Position은 한 Organization에만 속한다
- 같은 Organization 안에 같은 이름의 Position 중복 불가
- Position 폐지 시 배정된 Employee가 없어야 한다
```

---

## `workforce/employee.md`

```markdown
---
aggregate: Employee
context: workforce
status: active
related_aggregates: [Organization, Position]
---

# Employee

## Role

직원의 소속·직책·직급·상태를 관리한다.
급여 계산은 Payroll, 근태 기록은 Attendance 소관이다.

## Ubiquitous Language

| 용어 | 의미 |
|------|------|
| 직원 (Employee) | 조직에 소속된 사람 |
| 직급 (Rank) | 사원·대리·과장·차장·부장 (VO) |
| 직원상태 (EmployeeStatus) | `ACTIVE → SUSPENDED / TERMINATED` (VO) |
| 고용계약 (EmploymentContract) | 계약 조건 (정규직·계약직·입사일 등). 내부 Entity. |

## Structure

- **Root**: Employee
- **내부 Entity**: EmploymentContract
- **VO**: EmployeeStatus, Rank, JoinDate
- **외부 참조**: `organizationId: string`, `positionIds: string[]`

## Invariants

- 최소 하나의 Position을 가진다 (겸직 허용 시 복수)
- `TERMINATED` 상태가 되면 모든 Position 배정이 해제된다
- EmploymentContract는 생성 시 반드시 함께 생성된다
- JoinDate는 생성 후 변경 불가

## External Dependencies

| Aggregate / BC | 참조 방식 | 비고 |
|----------------|-----------|------|
| Organization | `organizationId: string` | ID 참조. 조직 구조는 Organization 소관. |
| Position | `positionIds: string[]` | ID 참조. 겸직 허용으로 배열. |
| Identity (User) | `userId: string` | ID 참조. 로그인 계정은 Identity 소관. |

## Open Questions

- 겸직 상한선 정책 필요 (현재 무제한)
- 직급 체계 개편 시 기존 Employee 매핑 방안
```
