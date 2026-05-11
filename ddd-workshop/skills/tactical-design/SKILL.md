---
name: tactical-design
description: >
  ddd-workshop 파이프라인의 **한 워크플로 단위 전술적 설계 plan 생성기**.
  EventStorming의 process-modeling .md + 관련 ADR + bigpicture를 입력으로 받아,
  코드 작성 직전에 필요한 *전술적 산출물*(Aggregate 정의·invariant·메서드 매핑·
  Domain Event 페이로드·Repository 인터페이스·Read Model 위치·Cross-BC 참조 방식)을
  사용자와 협의해 in-conversation plan으로 제시한다. **산출물 .md를 만들지 않음** —
  코드가 진실. 단 핵심 invariant·트랜잭션 경계 같은 *코드로 표현 안 되는 의도*는
  모듈 README에 박제 권장. 한 호출 = 한 워크플로 단위. 사전 점검: 요청된 작업이
  process-modeling 범위 안인지 확인 → 범위 밖이면 "/eventstorming Cycle로 설계 갱신
  먼저"를 권유. DDD 정통 패턴 적용 (Vernon *Effective Aggregate Design* 4 rules ·
  Evans Repository · Domain Event 발행). ADR 결정(folder 구조·CQRS 깊이·cross-BC
  접근 방식 등)을 plan에 반영. 사용자 검토 후 코드 작성으로 자연 연결.
  Triggers — "전술적 설계", "tactical design", "{워크플로명} 코드 plan", "Aggregate
  정의해줘", "invariant 정리", "구현 plan", "코드 시작 전 설계 점검",
  "/tactical-design".
allowed-tools: Read Write Edit Glob Grep
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# tactical-design 스킬

EventStorming + ADR 산출물을 입력으로, **한 워크플로의 전술적 설계 plan**을 생성하는 호출형 도구.

## 1. 정체성

이전 단계(`eventstorming`·`software-design`)가 **무엇을·어떻게 자를지** 결정했다면, 이 스킬은 그 결정을 **코드 진입 직전 전술적 plan**으로 옮긴다. 한 호출 = 한 워크플로.

| | software-design (이전) | tactical-design (이 스킬) |
|---|---|---|
| 단위 | 결정 1개 = ADR 1장 | **워크플로 1개 = plan 1개** |
| 단계 | Strategic→Tactical 다리 | **Tactical 정수** |
| 산출물 | docs/adr/{NNNN}.md (immutable) | **in-conversation plan, 코드가 진실** |
| 영속 | ✅ ADR 파일 | ❌ 산출물 .md 안 만듦 |
| 입력 | BC + Workflow 후보 | **process-modeling .md + ADR + bigpicture** |
| 변경 빈도 | 결정 발생 시 | 매 워크플로 코딩 직전 |

**책임 경계**:
- ✅ Aggregate 정의(root·구성·invariant) — Vernon 4 rules 적용
- ✅ Command → Aggregate 메서드 매핑
- ✅ Domain Event 페이로드·발행 시점
- ✅ Repository 인터페이스 (ADR의 추상화 정책 반영)
- ✅ Read Model 위치 (ADR의 CQRS 깊이 반영)
- ✅ Cross-BC 참조 방식 (ADR의 통합 패턴 반영)
- ✅ 사전 scope 점검 + 범위 외면 eventstorming Cycle 권유
- ❌ 실제 코드 작성 — plan까지. 코드는 사용자 또는 후속 turn에서
- ❌ 새 ADR 작성 — software-design 영역
- ❌ EventStorming 산출물 변경 — eventstorming 영역
- ❌ 모듈 폴더 생성 — 코드 작성 시점

## 2. 다루는 결정 (워크플로 단위)

| 카테고리 | 예시 |
|---|---|
| **Aggregate 정의** | root·구성 Entity·Value Object·invariant·생성자/메서드 시그니처 |
| **invariant 배치** | 생성자 검증 vs 메서드 가드 vs 도메인 서비스 |
| **Command → 메서드** | Process 워크플로 표의 🟦 Command를 Aggregate 메서드로 |
| **Domain Event** | 발행 시점·페이로드 구조·동기/비동기 |
| **Repository** | 인터페이스 메서드·페치 전략·트랜잭션 경계 |
| **Read Model 위치** | 도메인 vs infrastructure Query Service (ADR 따름) |
| **Cross-BC 참조** | Event listen / API call / shared kernel / cross-BC join (ADR 따름) |
| **트랜잭션 경계** | 1 transaction = 1 aggregate vs 위반·보완책 (ADR 따름) |

## 3. 호출 흐름

```
사용자: /tactical-design "P1 사원 활성화 워크플로"

→ Step 1: 입력 수집
→ Step 2: 사전 scope 점검
→ Step 3: Aggregate 정의 plan
→ Step 4: Command-메서드 매핑 + invariant 배치
→ Step 5: Domain Event 페이로드·발행 시점
→ Step 6: Repository·Read Model·Cross-BC 정렬 (ADR 반영)
→ Step 7: 핵심 invariant 모듈 README 박제 권장
→ Step 8: 사용자 검토 → 코드 작성 단계로 자연 연결
```

## 4. Step 1 — 입력 수집

| 읽기 대상 | 추출 |
|---|---|
| `docs/eventstorming/{phase}/{workflow}.md` (필수) | Workflow 표 · Aggregate 후보 · Policy · Read Model · invariant 후보 |
| `docs/eventstorming/{phase}/bigpicture.md` | 페이즈 핫스팟·외부시스템·액터 |
| `docs/eventstorming/index.md` 부록 B | BC + Subdomain 분류 + 통합 패턴 |
| `docs/adr/*.md` | folder 구조·CQRS·cross-BC·Repository 추상화 정책 등 |

사용자가 워크플로 명시 안 했으면 묻기:
> "어느 워크플로? (예: P1/activation, P2/grant)"

## 5. Step 2 — 사전 scope 점검 (필수)

요청된 작업이 process-modeling 범위 안인지 확인:

```
체크 항목:
- [a] 워크플로 .md에 명시된 Command가 다 등장하나?
- [b] 새 Command·Event·Policy가 필요한가? (= 범위 확장)
- [c] Aggregate 후보가 process-modeling .md에 있나?
- [d] 영향받는 ADR이 있나?

범위 밖이면:
  "이 작업은 process-modeling 범위를 벗어납니다.
   먼저 /eventstorming Cycle로 워크플로 갱신을 권장합니다.
   그래도 강행할까요? (y/n)"
```

사용자 의사 확인 후 진행. 강행 시 *plan 내 살아있는 의문*으로 표기.

## 6. Step 3 — Aggregate 정의 plan

Vernon *Effective Aggregate Design* 4 rules:
1. **Model True Invariants in Consistency Boundaries** — 진짜 invariant만 같은 Aggregate
2. **Design Small Aggregates** — 큰 객체 그래프 회피
3. **Reference Other Aggregates by Identity** — 직접 참조 X, ID로
4. **Update Other Aggregates Using Eventual Consistency** — 트랜잭션 가로지르지 말 것

plan 양식:

```markdown
## Aggregate: Employee

**Root**: Employee
**구성**:
- Employee (Entity, root)
  - id: EmployeeId (VO)
  - status: EmployeeStatus (Enum VO: INVITED/ACTIVE/SUSPENDED/ON_ABSENCE/TERMINATED)
  - personalEmail: Email (VO)
  - activatedAt: Date | null
  - ...

**Invariants** (생성자 + 메서드에서 검증):
1. 활성화 1회만: status=INVITED → ACTIVE 단방향
   → activate() 메서드에서 status === 'INVITED' 검증
2. 사전등록 정보 수정은 activatedAt IS NULL 동안만
   → updatePreActivationProfile() 가드
3. personalEmail unique (시스템 차원, Aggregate 외부 검증 필요 — Repository나 Domain Service)

**참조 Aggregate**:
- DepartmentId (assignment 시 ID로만 참조, 직접 객체 X)

**근거 (process-modeling)**:
- Aggregate 후보: docs/eventstorming/01-onboarding/activation.md "Aggregate Candidates" 섹션
- invariant 1: 빅픽처 H1-K 결정
- invariant 2: process .md "Alternative Paths > A. 활성화 거부" 분석
```

## 7. Step 4 — Command → 메서드 매핑

워크플로 표의 🟦 Command를 Aggregate 메서드로:

```markdown
## Command → 메서드

| Command | Aggregate 메서드 | invariant 검증 | Emits |
|---|---|---|---|
| `RequestEmployeeActivation` | `Employee.activate(trigger, actorId, now)` | status===INVITED, activatedAt IS NULL | `EmployeeActivated` |
| `CancelEmployeeActivation` | `Employee.cancelActivation(reason, actorId)` | activatedAt IS NULL OR within 24h window | `EmployeeActivationCanceled` |
| `UpdatePreActivationProfile` | `Employee.updatePreActivationProfile(...)` | activatedAt IS NULL | `PreActivationProfileEdited` |
```

생성·삭제·복잡 워크플로는 **Factory / Domain Service** 사용 권장 시점 표기.

## 8. Step 5 — Domain Event 페이로드·발행

```markdown
## Domain Events

### EmployeeActivated
**발행 시점**: Employee.activate() 메서드 끝
**페이로드**:
- employeeId: EmployeeId
- activatedAt: Date
- trigger: 'CRON' | 'MANUAL'
- actorId: ActorId | null (CRON이면 null)

**발행 방식**: {ADR-0003에 따라 sync emit OR outbox pattern}
**Listener (다른 BC)**:
- notification BC → SendWelcomeNotification (Policy: OnEmployeeActivated → SendWelcome)
- (필요시 추가)
```

## 9. Step 6 — Repository·Read Model·Cross-BC 정렬

ADR 반영 (없으면 추천 + ADR 작성 권유):

```markdown
## Repository

ADR-0004 (Repository 추상화)에 따라 abstract interface + Drizzle impl:

interface EmployeeRepository {
  findById(id: EmployeeId): Promise<Employee | null>
  findByPersonalEmail(email: Email): Promise<Employee | null>
  save(employee: Employee): Promise<void>
}

## Read Model

ADR-0002 (CQRS 깊이 — 얇은 CQRS)에 따라 infrastructure Query Service:

class EmployeeQueryService {
  pendingActivationList(): Promise<PendingActivationRow[]>
  // status=INVITED 사원 조회 (Read Model이지 도메인 모델 X)
}

## Cross-BC 참조

ADR-0003 (Cross-BC 접근 — 쓰기 Event listen, 읽기 Query Service join)에 따라:
- 쓰기: notification BC는 EmployeeActivated 이벤트 listen
- 읽기: Query Service에서 employee + department 테이블 join 명시 허용
```

ADR 없는 결정이면 추천 + "/software-design으로 ADR 작성 권장" 안내.

## 10. Step 7 — 모듈 README 박제 권장

핵심 invariant·트랜잭션 경계 같은 *코드만으로는 의도가 안 보이는 것*은 모듈 README에 박제 권장:

```
"다음 invariant는 코드 주석만으론 의도가 약합니다.
 src/modules/identity/README.md에 박제할까요?
 - 활성화는 1회만 (status 머신 단방향)
 - 사전등록 정보 수정은 activatedAt IS NULL 동안만
 - personalEmail 변경은 별도 워크플로 (5.D)
 (y/n)"
```

승낙 시 README에 *왜 이렇게 잘랐는가* 박제. 코드 변경은 별도 단계.

## 11. Step 8 — 사용자 검토 → 코드 단계로

plan 전체 표시 후:

> "이 plan으로 코드 작성을 시작할까요? 수정할 부분 있으신가요?
>  - 동의 → 코드 작성 단계 (이 스킬은 plan까지. 코드는 후속 turn 또는 사용자)
>  - 수정 → 어떤 부분?
>  - 거부 → process-modeling 갱신 권장"

## 12. Anti-patterns

- **산출물 .md 생성** — 코드가 진실. plan은 ephemeral
- **새 ADR 작성** — software-design 영역
- **EventStorming 산출물 변경** — eventstorming 영역
- **scope 점검 생략** — 범위 밖 작업은 의도 누수
- **ADR 결정 무시** — folder 구조·CQRS·cross-BC는 ADR이 진실
- **여러 워크플로 한 호출에 욱여넣기** — 한 호출 = 한 워크플로
- **Vernon 4 rules 위반 묵인** — 큰 Aggregate·다른 Aggregate 직접 참조 등 발견 시 명시
- **invariant를 application layer에** — Aggregate 안에서 검증해야 의미 있음
- **Anemic Domain Model** — getter/setter만 있는 Aggregate 생성 회피
- **Read Model을 도메인에 둠** — ADR이 얇은 CQRS면 infrastructure Query Service

## 13. 짧은 예시

```
사용자: /tactical-design "P1 사원 활성화"

→ Step 1: 입력 수집
   - docs/eventstorming/01-onboarding/activation.md
   - docs/adr/0001-bc-split.md, 0002-cqrs-depth.md, 0003-cross-bc.md
   - docs/eventstorming/index.md 부록 B

→ Step 2: scope 점검 → OK (모든 Command가 process .md에 있음)

→ Step 3: Aggregate Employee 정의 plan
   - root, 구성, 3 invariants

→ Step 4: Command 4개 → 메서드 매핑

→ Step 5: EmployeeActivated 페이로드·발행

→ Step 6: Repository abstract + Drizzle impl, Query Service 위치, NotificationPolicy listen

→ Step 7: "활성화 1회만 invariant를 src/modules/identity/README.md에 박제할까요?" → y

→ Step 8: 사용자 검토 → 코드 작성 시작
```

## 14. 한 줄로 정리

> **EventStorming + ADR 산출물을 입력으로 한 워크플로의 전술적 plan(Aggregate·invariant·메서드·Event·Repository) 생성. Vernon 4 rules + ADR 결정 적용. 산출물 .md 안 만듦 — 코드가 진실. 핵심 invariant만 모듈 README 권장. scope 밖이면 eventstorming Cycle 권유. 한 호출 = 한 워크플로 = 한 plan.**
