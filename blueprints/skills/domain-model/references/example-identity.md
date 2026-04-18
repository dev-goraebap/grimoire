---
domain: identity
status: active
owner: platform-team
---

# 사용자·인증 도메인 (Identity)

## Role
사용자 계정의 생성·인증·권한 관리를 책임진다. 다른 도메인에 `UserId`와 권한 정보를 제공하지만, 사용자의 활동 기록(주문 내역, 작성 글 등)은 각 도메인의 책임이다.

## Ubiquitous Language
| 용어 | 의미 |
|------|------|
| 사용자 (User) | 플랫폼에 계정을 가진 주체 |
| 계정 (Account) | 사용자의 로그인 가능한 형태 (이메일+비밀번호 또는 OAuth) |
| 세션 (Session) | 인증된 사용자의 유효 기간 |
| 역할 (Role) | 권한 묶음 (`admin`, `user`, `guest`) |
| 사용자상태 (UserStatus) | `ACTIVE` → `SUSPENDED` / `DELETED` |

## Invariants
- 한 사용자는 여러 계정(OAuth 공급자별)을 가질 수 있지만, 하나의 기본 이메일이 있다.
- 세션은 유효기간이 지나면 자동 만료된다 (클라이언트 상태 무관).
- `DELETED` 사용자의 세션은 즉시 무효화된다.
- 비밀번호는 저장소에 평문으로 남지 않는다 (단방향 해싱 필수).
- 역할 변경은 기존 세션에 즉시 반영된다 (세션 재발급 없이).

## Domain Events
- `UserRegistered` — 사용자 신규 가입
- `UserLoggedIn` — 로그인 성공
- `UserLoggedOut` — 로그아웃(수동 또는 세션 만료)
- `UserSuspended` — 관리자가 사용자 상태를 `SUSPENDED`로 전환
- `UserDeleted` — 사용자 계정 삭제 (개인정보보호법 준수 시 호출)

## External Dependencies
| 도메인/시스템 | 상호작용 |
|--------------|----------|
| Notification | `UserRegistered` 시 환영 메일 발송 이벤트 발행 |
| OAuth 공급자 (Google/Kakao 등) | 외부 인증 위임 |

## Related Policies
<!-- policy-book 스킬로 정책 추가 시 자동으로 링크됩니다 -->

## Open Questions
- 탈퇴 후 개인정보 보관 기간 정책 정립 필요
- 동시 세션 최대 개수 제한 여부 미정
- OAuth 공급자별 이메일 미제공 케이스 처리 방안
