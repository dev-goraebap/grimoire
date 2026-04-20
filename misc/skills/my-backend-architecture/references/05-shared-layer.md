---
section: shared-layer
---

# shared 레이어

## 역할

도메인 의미 없는 **기술 인프라**. **모든 레이어가 참조 가능**한 공통 기반.

핵심 특징:
- 파일명에 도메인 이름이 등장하지 않는다
- 어느 프로젝트에 가져다 놓아도 그 자체로 동작하는 기술 유틸리티
- 비즈니스 규칙 없음

---

## 전형 세그먼트

| 세그먼트 | 담는 것 |
|----------|---------|
| `logger` | 로거 인터페이스 + 구현체 |
| `config` | 환경변수 파싱·검증 (zod 등) |
| `db` | DB 연결·트랜잭션·스키마·마이그레이션·베이스 리포지토리 |
| `util` | date·string·number·crypto 범용 헬퍼 |
| `middleware` | 공통 HTTP 미들웨어 (요청 로깅 등) |
| `filters` | 공통 예외 핸들러 (HTTP 에러 변환 등) |
| `errors` | 기술 예외 기반 클래스 (도메인 에러와 다름) |
| `types` | 범용 타입·인터페이스 |

---

## shared/db 구성

DB 관련 기술 자산은 모두 여기에.

```
shared/db/
├── connection.ts              ← DB 연결 팩토리 (DataSource / Drizzle db 등)
├── transaction-manager.ts     ← 트랜잭션 헬퍼
├── base-repository.ts         ← 도메인 무관 베이스 리포지토리 (선택)
├── schema/                    ← Drizzle·Prisma 스키마 파일
│   ├── employees.schema.ts
│   └── organizations.schema.ts
└── migrations/                ← DB 마이그레이션 파일
```

**왜 스키마를 shared에?**  
스키마는 "테이블 정의"라는 기술 자산이지 도메인 모델이 아니다.  
`infrastructure`는 이 스키마를 **참조해** 도메인 어댑터(Repository·Query Service)를 작성한다.

---

## 들어가면 안 되는 것

| 잘못된 예 | 올바른 위치 |
|-----------|------------|
| `shared/user-helpers.ts` — 도메인 용어 포함 | `domain/user/` |
| `shared/discount-calculator.ts` — 비즈니스 규칙 | `domain/pricing/` |
| `shared/employee-validator.ts` — app 전용 | `app/employees/` |

**판단 기준**: "이 파일이 다른 프로젝트에서도 그대로 쓰일 수 있는가?" → Yes면 shared. No면 해당 레이어.

---

## shared가 도메인 개념 필요할 때

`shared`가 도메인 개념에 의존해야 하는 상황이 생기면 **DIP로 해결**한다.

```ts
// shared/notifications/notification.interface.ts
// shared가 정의하는 인터페이스 (구현 없음)
export interface NotificationSender {
  send(userId: string, message: string): Promise<void>;
}
```

구현체는 `infrastructure/`에, 바인딩은 `app/` 또는 bootstrapping 레이어에서.  
`shared`는 인터페이스만 알고, 구현을 모른다.

---

## 세그먼트 간 상호 참조

순환만 피하면 자유롭게 참조 가능.

```
shared/logger   ──▶ shared/config    ✅
shared/db       ──▶ shared/logger    ✅

shared/a ──▶ shared/b ──▶ shared/a   ❌ 순환 금지
```

순환이 생기면 한쪽을 더 작게 쪼개거나 흡수한다.

---

## shared vs infrastructure 요약

| | shared | infrastructure |
|---|---|---|
| 도메인 이름이 파일명에? | ❌ | ✅ |
| 비즈니스 로직? | ❌ | Repository 경계 안에서만 |
| 예시 | `logger`, `config`, `db/connection` | `employee.typeorm.repository`, `stripe.gateway` |
