---
section: testing
---

# Testing Philosophy

"모두 테스트하자"가 아니라 **"도메인 정책·비즈니스 규칙은 반드시, 나머지는 선택"**.

## 철학

### Unit-First

Google Test Sizes 관점에서 **Small test**(단위)를 중심으로. Medium(통합)·Large(E2E)는 **선택적 보강**.

이유:

- 단위 테스트는 빠르고 유지보수 비용이 낮다.
- **비즈니스 규칙**을 단위 테스트로 커버하면 리팩터링 안전망이 된다.
- 통합·E2E는 느리고 CI 부담이 크며, 실패가 잦고 원인 파악 비용이 높다.

### 레이어별 테스트 우선순위

| 레이어 | 우선순위 | 테스트 대상 |
|---|---|---|
| `domain` | **필수** | 엔티티 메서드, 도메인 서비스, 정책 함수 |
| `app` | 선택 | 오케스트레이션 로직 (복잡할 때만) |
| `use-cases` | 선택 | 유스케이스 서비스 (여러 도메인 조합 복잡도에 비례) |
| `shared` | 대부분 불필요 | 순수 유틸은 선택, 설정·로거는 스킵 가능 |

## 무엇을 테스트하나

### 도메인 정책·비즈니스 규칙 (필수)

- 엔티티 메서드의 **규칙 분기** 모두 커버 (`user.suspend()`가 DELETED 상태에선 throw 등).
- 도메인 서비스의 **유스케이스별 경로** 커버.
- Value Object의 불변 규칙 (`Email.create()`의 형식 검증 등).

### 오케스트레이션 (선택)

- 단순 위임(한 도메인 호출)은 **테스트 생략**. ROI 낮음.
- 여러 도메인 + 트랜잭션 + 이벤트 발행 조합은 테스트할 가치. 단, **모든 경로** 대신 **핵심 성공·실패 경로 2~3개**.

### 컨트롤러·DTO (거의 불필요)

- 입출력 매핑과 프레임워크 바인딩만 남는다. 단위 테스트 ROI 매우 낮음.
- validation 로직은 `class-validator` 데코레이터 자체를 신뢰. 별도 테스트 불필요.

### 리포지토리 구현체 (선택)

- SQL 매핑 정확성 확인 필요하면 **testcontainers + real DB**로 통합 테스트.
- 인터페이스에 대한 **가짜 구현체는 도메인 테스트용**으로만 쓰고, 실제 구현체는 별도 소수 integration test로.

## 어떻게 테스트하나

### 도메인은 모킹 없이

도메인 테스트는 **모킹 도구 없이 순수 입력·출력**으로 끝나는 게 이상.

```ts
// Good: 모킹 없이
describe('User.suspend', () => {
  it('SUSPENDED로 전환한다', () => {
    const user = new User('u1', 'a@b.com', UserStatus.ACTIVE);
    user.suspend('abuse');
    expect(user.status).toBe(UserStatus.SUSPENDED);
  });

  it('DELETED 사용자는 suspend 불가', () => {
    const user = new User('u1', 'a@b.com', UserStatus.DELETED);
    expect(() => user.suspend('abuse')).toThrow();
  });
});
```

### 리포지토리 의존은 가짜 구현체로

도메인 서비스가 리포지토리를 필요로 하면 **in-memory 가짜 구현체** 작성.

- 가짜 구현체는 테스트 코드 옆(`__fixtures__/fake-user.repository.ts`)에 둔다.
- NestJS `Test.createTestingModule`로 DI를 바꾸거나, 서비스 인스턴스 직접 생성해 주입.

### app 오케스트레이션 테스트

테스트한다면 NestJS `Test.createTestingModule`로 모듈 구성 + 가짜 리포지토리. **실제 DB까지 붙이지 않고** 로직만 검증.

## 무엇을 테스트하지 않나

- **프레임워크 자체 기능**: `@IsEmail()`이 이메일 검증하는지, NestJS가 라우팅하는지.
- **단순 getter/setter**.
- **설정 파일 파싱** (zod schema가 해준다).
- **shared 유틸** 중 자명한 것 (UUID 생성, `dayjs` 래퍼 등).

## 프레임워크별 도구 차이

이 스킬은 도구를 **강제하지 않는다**. 프레임워크마다 관용 도구가 다름.

- **NestJS**: Jest + `@nestjs/testing` — `Test.createTestingModule`로 DI 바인딩.
- **Spring Boot**: JUnit + Mockito / Spring Test.
- **Express + Vitest**: 더 가벼운 선택.

원칙: **프레임워크 의존을 최소화**할 수 있으면 최소화. 도메인 테스트는 프레임워크 없이 POJO 수준에서 돌아가는 게 이상.

## E2E는 언제

- 인수 조건(Acceptance Criteria)을 검증하는 "중요한 흐름 수십 개" 수준으로 **소수 유지**.
- 작성 도구: Playwright, supertest (NestJS HTTP 레벨).
- 완전 자동화된 seed + cleanup 전제. 공유 상태 최소화.

## 체크리스트

- [ ] 도메인 엔티티 메서드마다 테스트 있는가?
- [ ] 도메인 서비스의 예외 분기 모두 커버하는가?
- [ ] 모킹 도구 없이 작성했는가? (없으면 in-memory 가짜로 충분한가?)
- [ ] 오케스트레이션 테스트가 프레임워크·DB까지 끌고 들어가는가? → 과함. 가짜 리포지토리로.
- [ ] shared 유틸 중 테스트가 진짜 필요한 건?
- [ ] E2E 테스트 수가 10개 미만인가? (소수 유지 원칙)

## 관련 스킬

- **`engineering:testing-strategy`** — 일반 테스트 전략(피라미드, 테스트 규모, 프레임워크 선택). 이 파일은 그 위에 "도메인 정책 우선, 통합·E2E는 선택" 관점을 얹는다.
- **`blueprints:domain-model`** — 테스트할 규칙의 **정규 출처**. 규칙 식별자(예: `INV-ORDER-003`)를 테스트 이름에 인용하면 문서↔테스트 추적 가능.
