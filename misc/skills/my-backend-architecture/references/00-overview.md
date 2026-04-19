---
section: overview
---

# Overview

## 왜 존재하나

매 프로젝트마다 "app/domain/shared로 나눠", "같은 레이어 참조 금지", "TypeORM이면 엔티티에 규칙 넣고, Drizzle이면 분리"를 반복 설명하지 않기 위해 만든 **개인 선호 아카이브**. 에이전트에게도 사람에게도 동일 원칙을 재사용할 수 있게 성문화했다.

## Scope

포함:

- 백엔드 일반론 (REST API 서비스, GraphQL, CLI 도구, 스케줄러 포함)
- NestJS 중심 예시. Spring Boot·.NET 같은 설정 응집형 DI는 비교 대상으로만 등장 (`09-framework-notes.md`)
- ORM은 TypeORM / Drizzle / Prisma 세 가지 (`06-orm-strategies.md`)
- 중·소 규모 서비스. 1~10명 규모 팀

제외:

- 엔터프라이즈급 DDD 풀스펙 (이 스킬의 수준 그 이상을 요구하면 DDD·헥사고날 관련 도서·블로그 참조)
- 마이크로서비스 간 경계·통신 패턴 (도메인 경계를 이미 서비스 단위로 쪼갠 조직은 더 정교한 설계 필요)
- 프론트엔드 구조 — 그쪽은 `misc:fsd-docs`

## Not Clean Architecture

완벽한 클린 아키텍처(Uncle Bob 기준)가 아니다. 다음 지점에서 **의식적으로 타협**한다.

| 지점 | Clean 원칙 | 이 스킬 |
|---|---|---|
| 도메인의 외부 의존 | 0 | `shared` 참조 허용 |
| 도메인 모델 vs ORM 엔티티 | 항상 분리 | 전략별 선택 (`06-orm-strategies.md`) |
| Port/Adapter | 모든 외부 경계에 | DIP가 실제 필요할 때만 (`07-dip-patterns.md`) |

### 왜 타협하나

- **단위 테스트 용이성만 지켜지면** 순수성의 추가 이득은 한계체감이 빠르다.
- 도메인 정책을 순수 함수/메서드로 쓸 수 있으면 `shared` 유틸을 참조해도 테스트가 흐려지지 않는다.
- 레이어 수가 늘수록 머릿속 모델도 비례해 무거워짐. 과한 순수성은 **생산성 세금**.

대신 지키는 것:

- 레이어 의존의 **단방향성**
- 슬라이스 경계 (`02-slices.md`)
- 도메인 정책의 **단위 테스트 가능성**

## When to Apply

적합:

- 신규 서비스 초기 구조 잡기
- 레거시의 "services/ 안에 수백 개 서비스" 평탄 구조 재편
- 팀 2~10명, NestJS·Spring Boot 등 DI 프레임워크 사용
- 도메인이 3~15개 범위 (너무 적으면 과설계, 너무 많으면 DDD 풀스펙 쪽으로)

부적합:

- 한 파일짜리 스크립트, FaaS 단일 람다
- 이미 마이크로서비스로 잘게 쪼개진 조직 (서비스 내부는 오히려 얇아도 됨)
- 조직이 공식적으로 헥사고날·Clean을 규정한 곳

## Related Skills

- **`blueprints:domain-model`** — 각 도메인의 **의미·용어·불변 규칙**을 `DOMAIN.md`로 문서화하는 스킬. 이 스킬은 그 문서에서 확정된 개념을 **코드 어디에 둘지**만 다룬다. 용어·규칙 **내용**은 domain-model이 정규 출처 — 이 스킬은 **위치·구조**만 책임진다.
- **`misc:fsd-docs`** — 프론트엔드 Feature-Sliced Design v2.1 공식 문서 지식팩. 이 스킬은 그 영감을 받았지만 백엔드 관점으로 재해석한 것.
- **`engineering:testing-strategy`** — 일반적 테스트 전략. `08-testing.md`는 그 위에 "도메인 정책 우선, 통합은 선택" 관점을 얹는다.

## 다음에 읽을 파일

- 레이어 정의 → `01-layers.md`
- 슬라이스 참조 규칙 → `02-slices.md`
- 특정 레이어 파고들기 → `03`~`05`
- ORM에 따른 도메인 모델 배치 → `06-orm-strategies.md`
- 같은 레이어 의존 해결 → `07-dip-patterns.md`
- 테스트 철학 → `08-testing.md`
- NestJS에서 경계 강제 → `09-framework-notes.md`
