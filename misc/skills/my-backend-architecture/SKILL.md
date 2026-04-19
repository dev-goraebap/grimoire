---
name: my-backend-architecture
description: >-
  사용자 개인의 백엔드 아키텍처 선호(3-레이어 기본: app / domain / shared, 선택적 상위 레이어
  use-cases 또는 features)를 성문화한 Progressive Disclosure 지식 스킬. FSD에서 영감을 받았지만
  백엔드용으로 조정. 단방향 레이어 의존, 슬라이스 간 참조 금지(shared 예외), API 경로-폴더 대응
  (api/users ↔ app/users), ORM별 도메인 모델 전략(TypeORM rich entity vs Drizzle/Prisma 분리형),
  DIP로 푸는 같은 레이어 의존(상위 레이어 승격 vs 계약 인터페이스 분리), 도메인 정책 단위 테스트
  우선 철학을 다룬다. NestJS 중심 예시와 Spring Boot(설정 응집형) 대비, 모듈 경계를 정적으로
  강제하는 수단(eslint-plugin-boundaries, dependency-cruiser, Nx enforce-module-boundaries,
  @nestjs/cqrs EventBus, 동적 모듈 forRoot bootstrapping, TypeScript path alias)을 담는다.
  사용자가 "백엔드 폴더 구조", "레이어드 아키텍처", "도메인 레이어 어디 둬", "NestJS 모듈 경계",
  "같은 레이어 참조 금지", "도메인 모델을 엔티티에 둘까", "Drizzle에서 도메인 모델", "DIP",
  "use-cases 레이어", "app 레이어 vs domain", "shared 역참조", "NestJS 슬라이스 경계" 같은
  질문을 할 때 references/에서 관련 섹션만 로드해 답한다.
  Triggers — "my-backend-architecture", "백엔드 아키텍처", "레이어드 아키텍처", "백엔드 폴더
  구조", "NestJS 모듈 경계", "도메인 레이어 구조", "DIP 해결", "같은 레이어 참조", "use-cases
  레이어", "Drizzle 도메인 모델", "TypeORM rich entity", "dependency-cruiser".
license: MIT
---

# my-backend-architecture

사용자 개인의 **백엔드 코드 구조 선호**를 정리한 지식 스킬. SKILL.md는 라우팅 테이블 역할만 하고, 실제 내용은 10개 references에 Progressive Disclosure로 분할되어 있다. 사용자 질문 유형에 따라 필요한 파일만 로드해 답한다.

## 핵심 원칙 (요약 5줄)

1. 기본 레이어 3개: `app` → `domain` → `shared`. 필요하면 `app`과 `domain` 사이에 **사용자 정의 상위 레이어**(`use-cases` 또는 `features`) 하나 추가.
2. 의존은 **단방향**. 위 레이어는 아래 레이어를 참조할 수 있지만 역방향 금지.
3. 같은 레이어 내 슬라이스끼리는 서로 참조하지 않는다. `shared`만 예외 — 도메인 무관한 세그먼트라 순환만 피하면 OK.
4. `app`은 API 리소스 경로와 폴더가 1:1 대응(`api/users` ↔ `app/users`). `domain`은 외부 의존을 최소화해 단위 테스트를 쉽게 쓸 수 있는 상태로 유지.
5. 같은 레이어 슬라이스끼리 기능이 엮이면 **DIP**로 푼다 — 상위 레이어로 승격(A) 또는 계약 인터페이스로 분리(B).

## 의존 다이어그램

```
app ──▶ (use-cases | features)? ──▶ domain ──▶ shared
                                                   ▲
                                   shared 내부: 양방향 순환만 피하면 상호 참조 허용

역방향 금지.  같은 레이어 슬라이스 간 참조 금지 (shared 예외).
```

## 라우팅 테이블

사용자 질문 → 로드할 references.

| 사용자가 묻는 것 | 파일 |
|---|---|
| "이 스킬 뭐야", "왜 존재", 스코프, 클린 아키텍처와의 차이 | [`references/00-overview.md`](references/00-overview.md) |
| "어떤 레이어가 있지", "레이어 책임" | [`references/01-layers.md`](references/01-layers.md) |
| "슬라이스", "같은 레이어 참조해도 돼?" | [`references/02-slices.md`](references/02-slices.md) |
| "컨트롤러 어디에", "app 레이어 구조", "오케스트레이션" | [`references/03-app-layer.md`](references/03-app-layer.md) |
| "도메인 레이어에 뭘", "도메인 모델 어디", "외부 의존성 얼마나" | [`references/04-domain-layer.md`](references/04-domain-layer.md) |
| "shared에 뭐가 들어가", "공통 유틸 어디" | [`references/05-shared-layer.md`](references/05-shared-layer.md) |
| "TypeORM 도메인 모델", "Drizzle 스키마", "Prisma 리포지토리" | [`references/06-orm-strategies.md`](references/06-orm-strategies.md) |
| "같은 레이어 기능 재사용", "DIP", "A안 vs B안", "shared에서 도메인 필요" | [`references/07-dip-patterns.md`](references/07-dip-patterns.md) |
| "뭘 테스트해야", "도메인 테스트 범위", "통합 테스트 필요?" | [`references/08-testing.md`](references/08-testing.md) |
| "NestJS 모듈 경계 강제", "eslint-plugin-boundaries", "Spring Boot와 차이", "forRoot bootstrapping" | [`references/09-framework-notes.md`](references/09-framework-notes.md) |

## 자주 묻는 조합

| 상황 | 조합 |
|---|---|
| "NestJS에서 백엔드 폴더 나누는 이유?" | `00` + `01` |
| "같은 레이어 참조가 필요해" | `02` + `07` |
| "Drizzle 쓰는데 도메인 모델 어디" | `06` + `04` |
| "NestJS 모듈이 경계 뚫음" | `09` + `02` |
| "도메인 레이어 테스트 범위" | `08` + `04` |
| "shared에서 도메인 개념 필요" | `05` + `07` |

## 관련 스킬

- **`blueprints:domain-model`** — 이 스킬이 **코드 구조**라면, domain-model은 **도메인 문서**(Role / Ubiquitous Language / Invariants). 용어·불변 규칙의 정규 출처. 이 스킬의 `04-domain-layer`·`07-dip-patterns`에서 cross-ref.
- **`misc:fsd-docs`** — 프론트엔드 Feature-Sliced Design v2.1 공식 문서. 이 스킬은 그 영감을 받은 **백엔드 대응물**.
- **`engineering:testing-strategy`** — 일반적 테스트 전략. `08-testing.md`는 그 위에 "도메인 정책 우선, 통합은 선택" 관점을 얹는다.

## 원칙

- **완벽한 클린 아키텍처 지향 아님**. 도메인이 `shared`를 참조하는 건 허용. 이유는 `00-overview.md`의 "Not Clean Architecture".
- **프레임워크 강제 없음**. NestJS가 주 예시지만 원리는 일반적. Spring Boot 등 설정 응집형 DI 환경과의 차이는 `09-framework-notes.md`.
- **테스트 1순위는 도메인 정책·비즈니스 규칙**. 나머지는 선택.
