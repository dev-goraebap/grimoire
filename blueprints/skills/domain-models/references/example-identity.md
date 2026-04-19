---
context: identity
status: active
aggregates: [user, session]
owner: platform-team
---

# 사용자·인증 Bounded Context (Identity)

## Role
사용자 계정의 생성·인증·권한 관리와 세션 수명을 책임진다. 다른 BC에는 `UserId`와 권한 정보를 제공하지만, 사용자의 활동 기록(주문 내역, 작성 글 등)은 각 BC의 책임이다.

## Ubiquitous Language
| 용어 | 의미 |
|------|------|
| 사용자 (User) | 플랫폼에 계정을 가진 주체 |
| 계정 (Account) | 사용자의 로그인 가능한 형태 (이메일+비밀번호 또는 OAuth 공급자별) |
| 세션 (Session) | 인증된 사용자의 유효 기간 인증 토큰 |
| 역할 (Role) | 권한 묶음 (`admin`, `user`, `guest`) — VO |
| 사용자상태 (UserStatus) | `ACTIVE` → `SUSPENDED` / `DELETED` — VO |

## Aggregates

### User (Aggregate Root)
- **내부 구성**: `User` Entity(Root), `Account` Entity(내부 — OAuth 공급자별)
- **VOs**: `UserStatus`, `Email`, `Role`

### Session (Aggregate Root)
- **내부 구성**: `Session` Entity(Root)
- **VOs**: `SessionId`, `ExpiresAt`, `Device`
- **같은 BC 참조**: `userId: UserId` — User Aggregate를 ID로만 참조 (같은 BC라도 Aggregate 간은 ID)

### 외부 참조 (다른 BC)
없음. Identity는 기반 BC라 외부를 참조하지 않는다.

## Invariants

### User
- 한 User는 여러 Account(OAuth 공급자별)를 가질 수 있지만, 하나의 기본 이메일을 가진다
- 비밀번호는 저장소에 평문으로 남지 않는다 (단방향 해싱 필수)
- 역할(Role) 변경은 기존 세션에 즉시 반영된다 (세션 재발급 없이)
- `DELETED` 상태 User는 `SUSPENDED`로 돌아갈 수 없다

### Session
- 유효기간(`ExpiresAt`)이 지나면 자동 만료된다 (클라이언트 상태 무관)
- `DELETED` User의 Session은 즉시 무효화된다
- 한 User는 여러 Session을 동시 보유 가능 (기기별)

## Domain Events
- `UserRegistered` — 사용자 신규 가입
- `UserSuspended` — 관리자가 사용자 상태를 `SUSPENDED`로 전환
- `UserDeleted` — 사용자 계정 삭제 (개인정보보호법 준수 시 호출)
- `SessionIssued` — 로그인 성공으로 세션 발급
- `SessionRevoked` — 로그아웃·강제 무효화

## External Dependencies
| BC | 상호작용 | 협력 기법 |
|----|---------|-----------|
| Notification | `UserRegistered` 시 환영 메일 발송 이벤트 발행 | 비동기 (이벤트) |
| OAuth 공급자 (Google/Kakao 등) | 외부 인증 위임 | 동기 (외부 HTTP) |

## Related Policies
<!-- policy-book 스킬로 정책 추가 시 자동으로 링크됩니다 -->

## Open Questions
- 탈퇴 후 개인정보 보관 기간 정책 정립 필요
- 동시 세션 최대 개수 제한 여부 미정 (현재 무제한)
- OAuth 공급자별 이메일 미제공 케이스 처리 방안
