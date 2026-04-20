# 예제: 2개 Aggregate, BC 폴더 구조

BC가 명확할 때 폴더로 묶는 형태. User와 Session은 독립된 Aggregate.  
파일 경로: `docs/domains/identity/`

---

## `identity/user.md`

```markdown
---
aggregate: User
context: identity
status: active
related_aggregates: [Session]
---

# User

## Role

사용자 계정의 생성·인증·권한 관리를 담당한다.
사용자의 활동 기록(주문 내역, 작성 글 등)은 각 BC의 책임이다.
다른 BC에는 UserId와 권한 정보만 제공한다.

## Ubiquitous Language

| 용어 | 의미 |
|------|------|
| 사용자 (User) | 플랫폼에 계정을 가진 주체 |
| 계정 (Account) | 로그인 가능한 형태. 이메일+비밀번호 또는 OAuth 공급자별 |
| 역할 (Role) | 권한 묶음. `admin` / `user` / `guest` (VO) |
| 사용자상태 (UserStatus) | `ACTIVE → SUSPENDED / DELETED` (VO) |

## Structure

- **Root**: User
- **내부 Entity**: Account (OAuth 공급자별, 복수 가능)
- **VO**: UserStatus, Email, Role

## Invariants

- 한 User는 여러 Account(OAuth 공급자별)를 가질 수 있지만 기본 이메일은 하나다
- 비밀번호는 단방향 해싱 필수. 평문 저장 금지.
- `DELETED` 상태는 `SUSPENDED`로 되돌릴 수 없다
```

---

## `identity/session.md`

```markdown
---
aggregate: Session
context: identity
status: active
related_aggregates: [User]
---

# Session

## Role

인증된 사용자의 유효 기간 토큰을 관리한다.
인증 여부 판단은 이 Aggregate 소관이나, 권한 판단은 User 소관이다.

## Ubiquitous Language

| 용어 | 의미 |
|------|------|
| 세션 (Session) | 인증된 사용자의 유효 기간 인증 토큰 |
| 만료일시 (ExpiresAt) | 세션이 유효한 마지막 일시 (VO) |
| 기기 (Device) | 세션이 발급된 기기 정보 (VO) |

## Structure

- **Root**: Session
- **VO**: ExpiresAt, Device
- **외부 참조**: `userId: string` (같은 BC의 User를 ID로 참조)

## Invariants

- ExpiresAt이 지나면 세션은 자동 만료 (클라이언트 상태 무관)
- 한 User는 여러 Session 동시 보유 가능 (기기별)
- DELETED 상태 User의 Session은 즉시 무효화된다

## External Dependencies

| Aggregate | 참조 방식 | 비고 |
|-----------|-----------|------|
| User | `userId: string` | ID 참조. 권한 정보는 User 소관. |
```
