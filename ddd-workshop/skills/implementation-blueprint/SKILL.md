---
name: implementation-blueprint
description: >
  ddd-workshop 파이프라인의 6단계 (Implementation). aggregate-designer 이후,
  DDD 산출물(context-map, _canvas, aggregate 명세)을 바탕으로 **백엔드 모놀리식
  프로젝트의 폴더 구조·레이어·BC 간 통신 방식**을 인터뷰로 결정하고 블루프린트
  문서를 생성한다. 같은 DDD 문서로도 팀마다 폴더 구조를 다르게 해석하는
  문제를 줄이기 위한 스킬. 런타임·ORM·팀 규모·DB 전략·Presentation 위치·Query
  Service 사용·Cross-BC JOIN 정책·BC 간 통신 방식·Repository 인터페이스
  여부를 물어 산출물에 결정 + 근거 + 대안 + 안티패턴 체크리스트를 기록한다.
  파일명·클래스명·함수명·코드 컨벤션은 **범위 밖**. 폴더 구조·폴더명·레이어
  경계·의존 방향만 다룸. "폴더 구조", "폴더 설계", "레이어 구조",
  "implementation blueprint", "백엔드 구조 설계", "모노리스 레이아웃",
  "BC 통신 방식", "ddd-workshop 6단계" 같은 요청에 트리거한다.
metadata:
  author: dev-goraebap
  version: "0.4.0"
---

# implementation-blueprint 스킬

DDD 산출물에서 **실제 코드 폴더 구조**로 넘어가는 다리. 같은 Context Map과 Aggregate 문서를 받아도 사람마다 폴더를 다르게 해석하는 문제를, **인터뷰로 결정을 명시화**해서 팀 안에서 일관되게 유지하도록 돕는다.

**이 스킬의 범위:**
- ✅ 폴더 구조, 폴더명, 레이어 경계, 의존 방향
- ✅ BC 간 통신 방식, 경계 강제 수단 (언어·프레임워크별)
- ❌ 파일명, 클래스명, 함수명
- ❌ 코드 스타일·린트 룰 세부
- ❌ 구체 프레임워크 코드 생성 (스캐폴드 X)

**전제**: 백엔드 **모놀리식 1개 프로젝트**. MSA·서버리스는 범위 밖.

---

## 대화 UX 규약 (필수)

- **카테고리 선택은 숫자 메뉴**. 자유 입력 금지 (예외: 폴더 이름 같이 자유 입력이 자연스러운 경우).
- **1문 1답 기본**.
- **진행 표시**: `[Q 3/10 · 근거: ...]`
- **"나중에" / "모름" / "기본값으로" 항상 허용** → 산출물에 `⚠️ 미정` 또는 기본값 표기.
- **친절한 설명 블록**: 사용자가 개념을 잘 모를 수 있는 질문(특히 BC 통신 방식)은 선택지 설명을 짧게 제공하고 추가 질문 여지를 명시.

---

## 1. 언제 트리거하는가

- `/ddd-workshop:implementation-blueprint`
- `aggregate-designer` 완료 후
- "폴더 구조 짜줘", "레이아웃 추천", "백엔드 구조 설계"
- 기존 블루프린트 수정 → 그냥 재호출해서 "뭐 바꾸고 싶어" 라고 말하면 됨

---

## 2. 입력

- `docs/shared/context-map.md` — BC 목록·관계
- `docs/shared/contexts/<bc>/_canvas.md` — 각 BC의 통신 계약 (Inbound/Outbound)
- `docs/shared/contexts/<bc>/<aggregate>.md` — Aggregate별 Exposed Queries

DDD 산출물이 없어도 돌아가지만, **있으면 질문이 훨씬 구체적**이 됨 (BC 개수, cross-BC 관계 패턴을 읽어서 기본값 제시).

---

## 3. Step 0 — Upstream 스캔

1. DDD 산출물 존재 확인. 없으면 "산출물 없이 일반 원칙만으로 진행할까요?" 확인.
2. BC 개수·관계 패턴 파악 → 질문 기본값 튜닝.
3. 이미 `docs/implementation-blueprint.md` 있으면 업데이트 모드로 전환 제안.

---

## 4. 진행 단계 — 10개 질문

### Q1. 런타임
```
1) NestJS (TypeScript)
2) Spring Boot (Java / Kotlin)
3) Django / FastAPI (Python)
4) Go (net/http, Fiber 등)
5) 기타 (직접 입력)
```

### Q2. ORM / DB 라이브러리
(런타임별 자동 기본값 — NestJS면 Drizzle/TypeORM/Prisma, Spring이면 JPA/MyBatis 등)

### Q3. 팀 규모
```
1) 1인
2) 2-3인
3) 4-10인
4) 10+ (모놀리식 한계 지점 — MSA 검토 안내)
```

### Q4. DB 전략
```
1) 단일 DB · 공용 스키마 · 테이블 소유만 BC별로 엄격 (권장 기본값)
2) 단일 DB · 스키마 분리 (BC별 schema)
3) DB 분리 (일반적으로 과투자)
```

### Q5. Presentation 위치
```
1) BC 외부 단일화 — src/presentation/ (또는 api/) (권장 기본값)
   장점: 리소스 중심 URL, 글로벌 미들웨어 일원화, BFF 자연스러움
   단점: BC 단독 추출 시 presentation 조각 발라내야 함
2) BC 내부 포함 — 각 BC 안에 presentation/
   장점: BC 단독 추출 최강, 팀 분할 친화
   단점: 글로벌 미들웨어 중복, Presentation 일관성 유지 수고
```

### Q6. Query Service 사용 여부
```
1) 사용 — 읽기·쓰기 경로 분리 (얕은 CQRS, 권장 기본값)
   - Repository는 CUD + 간단 조회만
   - 화면 조회는 infrastructure/queries/
2) 사용 안 함 — Repository가 모든 조회 커버
   - 단순하지만 Repository 비대화 주의
   - 프로젝트 중간에 도입하게 되는 케이스 많음
```

### Q7. Cross-BC JOIN 정책
```
1) 엄격 — 자기 BC 테이블만. 다른 BC는 Service/API 호출로
2) 읽기만 허용 — 조회 쿼리에선 cross-BC JOIN OK, 쓰기 경로는 엄격
   (팀에 SQL 중심 문화가 있거나 대시보드·리포트가 많은 경우)
```

### Q8. BC 간 통신 방식 ⭐ (설명 블록 후 질문)

이 질문은 사용자가 개념을 잘 모를 수 있으므로 **친절한 설명 먼저**.

```
BC 간 통신은 세 가지 방식이 있고, 복잡도와 결합도가 다릅니다.

【방식 A — public.ts 직접 호출】  (낮은 복잡도)
  한 BC의 공개 표면(public.ts)만 import해서 직접 호출.
  상황: 1인·소규모, 간단한 모놀리식
  장점: 가장 단순
  단점: 컴파일 시점 결합

【방식 B — Port + Adapter (Hexagonal)】  (중간 복잡도)
  호출하는 BC가 자기 domain에 Port 인터페이스 정의,
  infrastructure에서 다른 BC를 호출하는 Adapter 구현.
  상황: 팀 분리 개발, Core BC 보호(ACL 관계), 테스트 엄격
  장점: DIP 순수, 교체 용이
  단점: 코드량 ↑

【방식 C — Domain Event 기반】  (비동기 통지)
  BC가 이벤트 발행, 누가 구독할지는 신경 안 씀.
  상황: 알림·로깅·분석 같이 "누군가 반응만 하면 되는" 경우
  장점: 느슨한 결합
  단점: 흐름 추적 어려움, 디버깅 비용

  * 방식 A/B가 "커맨드" 용 / 방식 C는 "통지" 용. 보통 혼합.

기본 권장: 팀규모·BC수에 따라 다름
  - 1인 + 3 BC 이하: 방식 A (커맨드) + C (통지)
  - 2-3인 + Core BC 있음: ACL 관계는 방식 B, 나머지 A + C
  - 4인+: 전체 방식 B + C

1) 방식 A 중심 + 알림만 C
2) ACL 관계만 B + 나머지 A + 알림 C
3) 전체 B + C
4) 이 중 골라쓰기 (각 BC 관계별 선택)
5) 잘 모르겠어서 더 설명 필요
```

5 선택 시 추가 질문·예시로 개념 확실히 한 뒤 다시 선택.

### Q9. Repository 인터페이스

**언어·프레임워크에 따라 기본값 다름.**

```
Spring Boot 선택 시:
  인터페이스 강제 (JPA 관례, 실질적 의무)
  질문 스킵 → 기본값 "인터페이스 사용"

NestJS / Node.js 선택 시:
1) 인터페이스 사용 (domain에 정의, infrastructure에 구현)
   장점: DIP 순수, 테스트 모킹 간편
   단점: 파일·코드량 ↑
2) 구현만 사용 (인터페이스 없이 구현 클래스 직접 주입)
   장점: 단순
   단점: DIP 비순수, Jest/Vitest mock 으로 테스트는 가능

Query Service는 항상 "구현만" 기본값 (단일 구현, 교체 드묾)
External Port (Email, PG 등)는 항상 "인터페이스" 기본값 (Mock 교체 흔함)
```

### Q10. 최상위 폴더 이름
```
BC들을 담는 최상위 폴더 이름을 정하세요.

1) app/ (기본값)
2) contexts/ (문서의 contexts/ 폴더와 대칭)
3) modules/
4) domain/ (주의: 안쪽 domain 레이어와 이름 겹침)
5) 직접 입력
```

---

## 5. 산출물

기본 경로: **`docs/implementation-blueprint.md`**

프로젝트 관례 다르면 사용자에게 경로 확인.

**YAML frontmatter 없음.** 본문만.

### 문서 구조

```markdown
# Implementation Blueprint

## Decisions

| # | 항목 | 결정 | 근거 |
|---|---|---|---|
| 1 | 런타임 | NestJS + TypeScript | 팀 경험 |
| 2 | ORM | Drizzle | ... |
| 3 | 팀 규모 | 1인 | ... |
| 4 | DB 전략 | 단일 DB, 테이블 소유 엄격 | ... |
| 5 | Presentation 위치 | BC 외부 (src/presentation/) | UI가 BC와 1:1 아님 |
| 6 | Query Service | 사용 | 조회 경로 분리 |
| 7 | Cross-BC JOIN | 읽기만 허용 | 팀 SQL 문화 고려 |
| 8 | BC 통신 | A(public) + C(이벤트) | 1인 규모 |
| 9 | Repository 인터페이스 | 구현만 | 단일 구현, Jest 모킹 |
| 10 | 최상위 폴더 | app/ | 사용자 선호 |

## 폴더 트리 (권장)

(실제 트리 예시 — 결정에 맞춰 자동 생성)

## 레이어 규칙

- presentation → application(use-cases) → domain ← infrastructure
- presentation → infrastructure(queries) → (domain optional) [읽기 경로]
- infrastructure는 domain 방향으로만 의존 (DIP)
- use-cases는 infrastructure를 직접 import 금지 (DI로만)

## BC 간 참조 규칙

- 같은 BC 내부 import 자유
- 다른 BC 접근: public.ts 만 허용
- 다른 BC의 domain / infrastructure 직접 import 금지
- BC domain 에서 다른 BC import 금지 (ID 타입·이벤트 타입·공용 enum 예외)

## Cross-BC 통신 매트릭스

(각 BC 쌍에 대해 A/B/C 중 무엇을 쓸지 — context-map 의 관계 패턴에서 유도)

| From | To | 관계 | 구현 방식 |
|---|---|---|---|
| Leave Request | Leave Balance | ACL | B (Port+Adapter) |
| Leave Balance | Notification | Customer-Supplier | C (Event) |

## Presentation 레이아웃

(Q5 결과에 따라 — BC 외부면 src/presentation/api|pages|cli 구조 상세)

## 공용 영역 배치

- src/{최상위}/shared/ — 도메인 관련 cross-BC 공용
- src/shared/ — 비즈니스 무관 기술 공용
- 의존 방향: shared/ 는 leaf, app/shared/ 는 shared/ 만 import, BC 는 양쪽 다 OK

## 경계 강제 수단 (언어·프레임워크별)

(Q1 결과에 따라 — Spring이면 Spring Modulith 권장, NestJS면 ESLint boundaries 권장 등)

## 안티패턴 체크리스트

- ❌ Aggregate 재조립 조회 (Repository.findX().toDTO())
- ❌ Cross-BC Repository JOIN (Q7 엄격이면)
- ❌ 글로벌 공용 mapper/SQL 폴더
- ❌ BC domain 이 다른 BC import
- ❌ use-cases 가 다른 use-cases 호출
- ❌ Controller 에 도메인 로직

## 남은 결정 / 미정 (⚠️)

(사용자가 "나중에" 답한 항목들)

## 다음 단계

- 블루프린트 기준으로 초기 스캐폴드 만들기 (직접 또는 스캐폴더 도구)
- 경계 강제 수단 설정
- 요구사항 변동 시 이 문서 --update (그냥 재호출해서 변경 지점 이야기)
```

---

## 6. 업데이트 모드

**숫자 메뉴 없음.** 기존 `docs/implementation-blueprint.md` 있을 때 재호출하면:

```
블루프린트가 이미 있네요. 어떤 부분을 바꾸고 싶으세요?
자유롭게 말씀해주세요 (예: "BC 통신 방식을 B로 바꾸고 싶어", "Presentation을 BC 안으로 넣자").
```

사용자 발화를 받아 해당 섹션만 delta 수정. 영향 받는 다른 섹션이 있으면 "이것도 같이 바꿔야 할 것 같아요" 제안.

---

## 7. 강제 체크리스트

```
□ Step 0 upstream 스캔 완료
□ 10개 질문 모두 답변됨 (스킵은 기본값으로 처리)
□ Decisions 표 완성
□ 폴더 트리 예시 포함
□ 레이어 규칙 명시 (의존 방향 포함)
□ BC 간 참조 규칙 명시
□ Cross-BC 통신 매트릭스 (BC 2개 이상일 때)
□ 경계 강제 수단 추천 (언어·프레임워크별)
□ 안티패턴 체크리스트 포함
□ 산출물 경로: docs/implementation-blueprint.md (또는 사용자 지정)
□ Frontmatter 없음
□ 파일명·클래스명·함수명에 대한 결정 없음 (범위 밖)
```

---

## 8. 맥락별 조정

| 팀 규모 | 기본 추천 |
|---|---|
| 1인 | Presentation 외부, Query Service, 읽기 JOIN 허용, A+C 통신, 구현만(Node) |
| 2-3인 | + 코드 리뷰 규약, B 통신 (ACL 관계만) |
| 4-10인 | + 린트 강제 (Spring Modulith / ESLint boundaries), 전체 B+C 통신 |
| 10+ | MSA 검토 안내 + 현 구조로도 가능한 Modular Monolith 강화 |

---

## 9. 절대 하지 말 것

- 파일명·클래스명·함수명·네이밍 컨벤션 결정 (범위 밖)
- 구체 코드 스캐폴드 생성 (스킬 범위 밖, 별도 도구 영역)
- ERD·DB 스키마 설계 (ddd-workshop 전체 범위 밖)
- API 스펙 설계 (블루프린트는 폴더·레이어까지)
- MSA·서버리스 구조 설계 (이 스킬은 모놀리식 전용)
- 린트 설정 파일 자동 생성 (추천만)
- 사용자가 "기본값으로" 답했는데 임의로 다른 값 선택
- 블루프린트를 강제 규약처럼 쓰기 (팀 합의 도구일 뿐)
- Frontmatter 추가
