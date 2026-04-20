---
section: testing
---

# 테스트 전략

## 원칙

> **도메인 정책·비즈니스 규칙은 필수. 핵심 요구사항의 오케스트레이션 흐름은 선택적으로. 나머지는 생략.**

"모두 테스트하자"가 목표가 아니다. 비용 대비 이득이 가장 큰 곳에 집중한다.

| 대상 | 우선순위 | 비고 |
|------|---------|------|
| `domain` — Entity·Domain Service·Policy | ✅ **필수** | 비즈니스 규칙의 유일한 소유자 |
| use-case / app service — 핵심 요구사항 흐름 | ⚠️ 선택 | 복잡도 있는 흐름만. 아래 기준 참조. |
| 컨트롤러·DTO | ❌ 생략 | 프레임워크 신뢰. E2E에서 검증. |
| `infrastructure` Repository 구현체 | ⚠️ 통합 테스트 | 실제 DB 대상. 별도 섹션 참조. |
| `shared` 유틸 | ⚠️ 선택 | 순수 계산 함수만. 설정·로거는 생략. |

---

## domain 테스트

프레임워크 의존이 없으므로 DI Testing Module을 띄우지 않는다. 순수 입출력만.

```ts
describe('Employee.promote()', () => {
  it('12개월 미만 근속이면 InsufficientTenureError', () => {
    const employee = Employee.create({ tenureMonths: 6 });
    expect(() => employee.promote(seniorPosition)).toThrow(InsufficientTenureError);
  });
  it('12개월 이상이면 직급 변경', () => {
    const employee = Employee.create({ tenureMonths: 13 });
    employee.promote(seniorPosition);
    expect(employee.position).toBe(seniorPosition);
  });
});
```

**Repository는 domain 테스트의 대상이 아니다.**  
Repository는 인터페이스다. domain 테스트는 인터페이스 구현체의 동작이 아닌 **도메인 규칙**을 검증한다.  
Domain Service 등이 Repository를 필요로 하면 in-memory 가짜 구현체를 직접 주입한다.

```ts
class InMemoryEmployeeRepository implements EmployeeRepository {
  private store = new Map<string, Employee>();
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(e: Employee) { this.store.set(e.id, e); }
}
```

---

## 오케스트레이션 테스트 (use-case / app service)

### 언제 작성하나

단순 위임(repo 호출 → 결과 반환)은 생략. 다음 중 하나면 작성한다:

- 프로젝트의 **핵심 요구사항**이고 오케스트레이션 흐름이 복잡할 때
- 여러 도메인 + 트랜잭션이 엮일 때

### Repository — in-memory fake

인터페이스가 있으므로 domain 테스트와 동일하게 in-memory fake를 주입한다.

### TransactionManager — Fake로 콜백만 실행

트랜잭션 헬퍼(`shared/db/`)도 인터페이스이므로 Fake를 만든다.  
실제 DB 없이 콜백만 실행시키면 된다. **트랜잭션 롤백 동작 자체는 여기서 검증하지 않는다** — 그건 infrastructure 통합 테스트에서.

```ts
// shared/db/transaction-manager.ts (인터페이스)
export interface TransactionManager {
  run<T>(work: () => Promise<T>): Promise<T>;
}

// 테스트용 Fake
class FakeTransactionManager implements TransactionManager {
  async run<T>(work: () => Promise<T>): Promise<T> {
    return work(); // 실제 트랜잭션 없이 그냥 실행
  }
}
```

### 외부 서비스 — 인터페이스 Stub

외부 서비스가 인터페이스로 정의되어 있으면 Stub을 구현한다.  
호출 여부·인자를 기록해두면 어설션에 활용할 수 있다.

```ts
class FakeNotificationService implements NotificationService {
  readonly sent: Array<{ userId: string; type: string }> = [];

  async sendWelcomeEmail(userId: string) {
    this.sent.push({ userId, type: 'welcome' });
  }
}
```

### 전체 조립 예시

DI 프레임워크 Testing Module 없이 `new`로 직접 조립한다.

```ts
it('온보딩 성공 시 웰컴 메일 전송', async () => {
  const employeeRepo  = new InMemoryEmployeeRepository();
  const orgRepo       = new InMemoryOrganizationRepository();
  const txManager     = new FakeTransactionManager();
  const notification  = new FakeNotificationService();

  const useCase = new OnboardEmployeeUseCase(
    employeeRepo, orgRepo, txManager, notification,
  );

  await useCase.execute({ name: '홍길동', organizationId: 'org-1' });

  expect(notification.sent).toContainEqual(
    expect.objectContaining({ type: 'welcome' }),
  );
});
```

---

## infrastructure 통합 테스트

**Repository 구현체**를 실제 DB 대상으로 테스트한다. 여기서만.

- testcontainers 또는 in-process DB로 격리 환경 구성
- 검증 대상: 핵심 쿼리 정확성, 트랜잭션 롤백, N+1 발생 여부
- 도메인 규칙은 검증하지 않는다 — 이미 domain 테스트에서 완료

---

## E2E 테스트

핵심 비즈니스 흐름만 소수 유지. 라우팅·직렬화·인증은 여기서 검증.  
많아질수록 CI 속도 저하 + 유지보수 부담. 경계를 의식적으로 제한한다.
