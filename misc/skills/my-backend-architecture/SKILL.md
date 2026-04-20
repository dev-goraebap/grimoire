---
name: my-backend-architecture
description: >-
  사용자 개인의 백엔드 아키텍처 선호(기본 4레이어: app / domain / infrastructure / shared,
  선택적 사용자 정의 중간 레이어)를 Progressive Disclosure로 정리한 지식 스킬.
  FSD의 레이어 참조 규칙을 백엔드용으로 재구성. app은 resource(API 리소스) 단위,
  나머지는 module 단위. app은 Presentation+Application 결합형(의도적 타협).
  같은 레이어 module 간 참조 금지, domain은 허용(BC 간 ID 타입 외 강한 의존 지양),
  shared는 순환만 피하면 자유. infrastructure→domain DIP(import 방향 역전),
  domain은 프레임워크 의존 없는 순수 코드. 읽기는 Query Service(domain 우회),
  도메인 단위 테스트 우선, ORM별 도메인 모델 배치 전략을 다룬다.
  Triggers — "백엔드 아키텍처", "레이어드 아키텍처", "도메인 레이어 구조",
  "Domain Service", "Application Service", "Repository 주입",
  "Drizzle 스키마 위치", "사용자 정의 레이어", "Aggregate", "BC 간 참조",
  "읽기 경로", "DIP", "의존 역전", "레이어 참조 규칙".
license: MIT
---

# my-backend-architecture

사용자 개인의 **백엔드 코드 구조 선호**를 정리한 지식 스킬. SKILL.md는 라우팅 테이블 역할만 하고, 실제 내용은 references에 Progressive Disclosure로 분할되어 있다. 사용자 질문 유형에 따라 필요한 파일만 로드해 답한다.

## 핵심 원칙

1. **기본 레이어 4개**: `app` / `domain` / `infrastructure` / `shared`. 그 사이에 **사용자 정의 중간 레이어**를 필요할 때만 삽입한다. 이름·개수는 팀이 결정. 빈 레이어는 세금.
2. 의존은 **단방향**. 상위 레이어의 module(resource)은 하위 레이어의 module만 참조 가능. 역방향 import 전면 금지. 단 `infrastructure`는 `domain` 인터페이스를 구현하므로 **import 방향이 역전**(DIP).
3. **`app`은 resource 단위**, 나머지는 **module 단위**. `domain`은 프레임워크 의존 없는 순수 코드.
4. **같은 레이어 module 간 참조 금지** (`domain`·`shared` 제외). 해결책: 공통 로직을 하위 레이어로 추출하거나, 중간 레이어에 인터페이스를 두고 DIP 적용.
5. 규칙 판정은 `domain`에, 오케스트레이션·I/O·트랜잭션은 `app` / 중간 레이어에. Repository는 Application Service에만 주입, Domain Service에는 인자 전달.

## 의존 다이어그램

```
app (resource)
  ↓
(사용자 정의 중간 레이어)?   module. 이름 자유. 선택.
  ↓
domain  ◄───────── infrastructure   ← DIP: infrastructure가 domain 인터페이스 구현
(module)           (module)
  ↓                    ↓
shared              ← 모든 레이어가 shared 참조 가능
```

## 라우팅 테이블

| 사용자가 묻는 것 | 파일 |
|---|---|
| 레이어 구조, 참조 방향 규칙, module/resource 명명, Public API(barrel) | [`references/01-layers-and-modules.md`](references/01-layers-and-modules.md) |
| app 레이어 책임, Presentation+Application 결합, 컨트롤러/서비스 구분, 읽기/쓰기 경로 | [`references/02-app-layer.md`](references/02-app-layer.md) |
| 도메인 모델, Aggregate, Domain Service vs Application Service, Repository 주입 원칙, BC 간 참조 | [`references/03-domain-layer.md`](references/03-domain-layer.md) |
| infrastructure 책임, DIP import 방향, ORM별 배치, shared/db vs infrastructure, BC 경계 ORM 관계 | [`references/04-infrastructure-layer.md`](references/04-infrastructure-layer.md) |
| shared 구성, segment 구분, shared vs infrastructure, DB 스키마 위치 | [`references/05-shared-layer.md`](references/05-shared-layer.md) |
| 중간 레이어 도입 시점, 하위 추출 vs 인터페이스 분리, use-cases·features·contracts | [`references/06-custom-layers.md`](references/06-custom-layers.md) |
| 테스트 전략, 도메인 단위 테스트, 오케스트레이션 테스트, TransactionManager·외부 서비스 Fake, 통합 테스트 | [`references/07-testing.md`](references/07-testing.md) |
| ORM 비교(TypeORM·Drizzle·Prisma), 적용 범위, 의식적 타협 | [`references/08-misc.md`](references/08-misc.md) |

## 원칙

- **완벽한 클린 아키텍처 지향 아님**. `domain`이 `shared`를 참조하는 건 허용. 상세: `08-misc.md`.
- **NestJS가 주 예시**지만 원리는 DI 프레임워크가 있는 환경 전반에 적용 가능.
- **테스트 1순위는 도메인 정책·비즈니스 규칙**. 나머지는 선택.
- 이 스킬의 **"module"은 폴더 단위 코드 경계**. DI 프레임워크의 Module/Component 어노테이션과 다른 개념.
