# ddd-workshop

막연한 아이디어·PRD·러프한 프롬프트에서 시작해서 **Aggregate 설계 + 폴더 구조 블루프린트**까지 끌어주는 DDD 파이프라인 스킬 7종. 도메인 전문가 없이 혼자나 소규모 팀이 체계적으로 도메인을 뽑아낼 때 씁니다.

무슨 대단한 "DDD 정통 보존회" 같은 건 아니고, 실무에서 **설계 대화가 자꾸 어긋나는 지점을 스킬이 대신 잡아주는 것**이 목표예요. 정론은 존중하되 현실과 충돌하면 현실을 우선합니다.

---

## 파이프라인 한눈에 보기

```
[0] 막연한 아이디어 / PRD / 기획서
     │
━━━━━ Pre-DDD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
[1]  requirements-refiner          맥락·Why·MUST/SHOULD·자가진단·UL 언어
     │
━━━━━ 전략적 설계 (Strategic) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
[2]  event-storming-explorer       Big Picture ES → 서브도메인 후보 식별
     ↓
[3]  subdomain-classifier          Core/Supporting/Generic + Slice-first
     ↓
[4]  context-designer              BC 설계 + Context Map + per-BC Canvas(UL 내장)
     ↓
[4-opt] screen-inventory           (UI 있는 BC만) 화면 목록 + Query 이름
     │
━━━━━ 전술적 설계 (Tactical) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
[5]  aggregate-designer            Design-Level ES + Aggregate + Invariant/Policy
                                   + Exposed Queries
     │
━━━━━ 구현 (Implementation) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     │
[6]  implementation-blueprint      폴더 구조 · 레이어 · BC 통신 방식 인터뷰
                                   (모놀리식 백엔드 전용)
```

각 스킬은 **독립 실행** 가능하고 **부분 진입**도 됩니다. 앞 단계 출력이 있으면 뒤 스킬의 질문이 날카로워지지만, 없어도 돌아갑니다.

---

## 분류별로 보기

### Pre-DDD (요구사항 정제)

| 스킬 | 한 줄 | 산출물 |
|---|---|---|
| [`requirements-refiner`](skills/requirements-refiner/SKILL.md) | 막연한 입력을 정제된 요구사항 + 도메인 브리프로 | `docs/shared/requirements.md` |

엄밀히 말하면 DDD가 아닙니다 — 일반적인 요구사항 공학. 하지만 뒤 스킬들의 품질이 여기 산출물에 크게 좌우돼서 파이프라인에 포함했어요. **UL 기본 언어**도 여기서 한 번에 결정합니다 (이후 스킬들이 이 설정을 따라감).

### 전략적 설계 (Strategic Design)

**"어디에 선을 긋고, 어디에 힘을 쏟을 것인가"** — 큰 그림. 비즈니스 측과도 대화 가능한 층.

| 스킬 | 한 줄 | 산출물 |
|---|---|---|
| [`event-storming-explorer`](skills/event-storming-explorer/SKILL.md) | 과거형 이벤트 타임라인 + 서브도메인 후보 식별 | `docs/shared/event-flow.md`, `docs/shared/subdomain-map.md` (분류 전) |
| [`subdomain-classifier`](skills/subdomain-classifier/SKILL.md) | Core/Supporting/Generic 분류 + Slice-first 대상 선정 | `subdomain-map.md` 분류 컬럼 채움 |
| [`context-designer`](skills/context-designer/SKILL.md) | BC 설계 + Context Map + 각 BC Canvas(UL 내장) | `context-map.md`, `contexts/<bc>/_canvas.md` × N |
| [`screen-inventory`](skills/screen-inventory/SKILL.md) *(선택)* | 한 BC의 화면 목록 + Query 이름 (read-path 노출용) | `contexts/<bc>/_screens.md` |

**왜 subdomain 식별(2)과 분류(3)를 쪼갰나**: 식별은 도메인 전문가와 하는 현상적·구조적 사고, 분류는 비즈니스 결정자와 하는 전략적 투자 판단이에요. 섞으면 "Core가 될 만한 것"만 찾는 편향이 식별을 왜곡합니다.

**왜 UL을 context-designer 안에 넣었나**: Evans/Vernon 정통에서 UL은 "BC 안에서만 일관된다"가 원칙. 전역 ubiquitous-language.md 한 장으로 몰면 이 원칙이 흐려져서, BC Canvas 안에 per-BC UL 섹션으로 박았어요. cross-BC 진짜 공용 용어만 `published-language.md`에 선택적으로 분리.

### 전술적 설계 (Tactical Design)

**"한 BC 내부를 어떤 빌딩블록으로 구현할 것인가"** — 개발자 층.

| 스킬 | 한 줄 | 산출물 |
|---|---|---|
| [`aggregate-designer`](skills/aggregate-designer/SKILL.md) | Design-Level ES + Aggregate + Invariant/Policy + **Exposed Queries** | `contexts/<bc>/<aggregate>.md` (BC당 N개) |

Aggregate 1개당 1회 호출. 한 세션에서 연속으로 여러 개 진행 가능. Core BC는 1문 1답 엄격, Supporting/Generic은 Bulk draft 모드도 허용.

**Exposed Queries가 왜 여기 있나**: read-path를 1급 산출물로 올렸습니다. Aggregate는 쓰기 권위이고 읽기는 별도 Query Service가 하는 게 원칙인데, 이걸 문서에 박아 두지 않으면 `Repository.findX().toDTO()` 패턴으로 슬금슬금 새버리거든요. Screen Inventory와 Query 이름 매칭으로 자동 크로스체크.

### 구현 (Implementation)

**"설계 결과를 어떤 폴더 구조로 옮길 것인가"** — 문서 → 코드 다리.

| 스킬 | 한 줄 | 산출물 |
|---|---|---|
| [`implementation-blueprint`](skills/implementation-blueprint/SKILL.md) | 런타임·팀규모·통신 방식 10문항 인터뷰 후 폴더·레이어 블루프린트 생성 | `docs/implementation-blueprint.md` |

**범위**: 폴더 구조·폴더명·레이어 경계·BC 통신 방식만. 파일명·클래스명·함수명은 건드리지 않음. **모놀리식 백엔드 1개 프로젝트 전용** — MSA·서버리스는 범위 밖.

**왜 필요한가**: 같은 DDD 산출물로도 사람마다 폴더 구조를 다르게 해석합니다. Presentation을 BC 안에 둘지 밖에 둘지, Cross-BC JOIN을 허용할지, BC 간 통신을 직접 호출로 할지 이벤트로 할지 — 이런 결정들을 한 문서에 명시해두면 팀 안에서 드리프트가 줄어요.

---

## 산출물 레이아웃

```
docs/
├── implementation-blueprint.md  [6] 폴더·레이어·통신 블루프린트
└── shared/
    ├── requirements.md          [1]
    ├── event-flow.md            [2]
    ├── subdomain-map.md         [2]→[3]
    ├── context-map.md           [4]
    ├── published-language.md    [4] 선택: cross-BC 공용 용어만
    └── contexts/                [4]에서 생성, [5]가 채움
        └── <bc>/
            ├── _canvas.md       [4] BC 1페이지 요약 (UL 포함)
            ├── _screens.md      [4-opt] Screen Inventory
            └── <aggregate>.md   [5] Aggregate 명세 × N
```

`_` 접두사 파일은 **BC 메타문서**, 나머지는 Aggregate 명세. 정렬 시 메타문서가 위로 올라오는 효과도 덤.

**YAML frontmatter 없습니다.** 산출물은 모두 본문만. 최신성·작성자는 git이 더 정확해서요. 예외로 Aggregate 명세는 본문 최상단에 `> **Status**: draft | active | deprecated` 뱃지 1줄 정도 허용.

---

## 공통 설계 원칙

모든 스킬이 자기 SKILL.md에 같은 규약을 내장합니다. `npx skills add`로 하나만 뽑아도 동일한 동작 보장.

### 1. 대화 UX 규약
- **숫자 메뉴**로 선택지 제시 (자유 입력 ❌)
- **1문 1답** 기본 — Yes/No 2~3개 묶기만 예외 허용
- **진행 표시** `[Q 3/12 · 근거: ...]`
- **"나중에" / "모름" / "스킵" 항상 허용** → 산출물에 `⚠️ 미정`
- **자가 진단은 ✅/⚠️/❌** 3단계 (숫자 점수 금지)

사람을 괴롭히지 않는 선에서 설계가 나오게 하는 장치들. 정답을 맞추는 게 아니라 **올바른 질문을 만드는 것**이 핵심.

### 2. 이중 표기 UL (용어 / Code Identifier / 의미)

```
| 용어 | Code Identifier | 의미 |
|---|---|---|
| 연차 | AnnualLeave | 사원의 유급휴가 잔고 |
| 원장 | LeaveLedger | 잔고 변동 회계 기록 (append-only) |
```

기획자·도메인 전문가는 한국어(또는 사용자 언어)를 보고, 개발자는 Code Identifier를 코드에 그대로 쓸 수 있게.

### 3. `--update` 모드
기존 산출물이 있으면 전면 재작성 대신 delta만:
1. upstream 변경 감지 (git)
2. "무엇이 바뀌었나요?" 숫자 메뉴
3. 영향 부위만 재질문
4. 전면 재작성은 사용자 명시 요청 + 확인 후

요구사항이 수시로 바뀌는 초기 단계를 이게 버팁니다.

### 4. Slice-first 권장
[3]에서 Core 서브도메인 1개 선택 → [4]~[5]를 그 슬라이스로 완주 → 학습을 다음 슬라이스로 확장.

5개를 병행 설계하지 마세요. 요구사항이 바뀌면 재작업 비용이 다섯 배 됩니다.

### 5. Read-path는 1급 시민
- Screen Inventory에서 Query 이름 부여
- Aggregate의 Exposed Queries에서 같은 이름 매칭
- Aggregate 재조립 조회 패턴 (`Repository.findX().toDTO()`) **명시 금지**

---

## 범위 — 무엇을 하고 무엇을 안 하나

**포함**: 요구사항 정제 → 도메인 리서치 → Event Storming → 서브도메인 식별·분류 → BC·Canvas·Context Map → Aggregate·Invariant·Policy·Exposed Queries.

**제외**: ERD / DB 스키마 / API 설계 / 인프라 / 코드 생성.

도메인 모델과 ERD는 층위가 다르고, 저장 전략(일반 ORM / 이벤트 소싱 / CQRS)은 도메인 설계 이후의 별도 결정이에요. 섞으면 "CRUD 마인드셋"으로 도메인 사고가 오염되기 쉬워서 일부러 뺐습니다.

---

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install ddd-workshop@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire \
  --skill requirements-refiner \
  --skill event-storming-explorer \
  --skill subdomain-classifier \
  --skill context-designer \
  --skill screen-inventory \
  --skill aggregate-designer \
  --skill implementation-blueprint
```

---

## 사용 예시

### 케이스 A: 새 아이디어 → Core Aggregate (Slice-first 풀코스)

```
/ddd-workshop:requirements-refiner          → 요구사항 + UL 언어 + 자가진단
/ddd-workshop:event-storming-explorer       → 이벤트 흐름 + 서브도메인 후보
/ddd-workshop:subdomain-classifier          → Core/Supporting/Generic + Slice 대상
/ddd-workshop:context-designer              → 선택된 슬라이스의 BC + Canvas
/ddd-workshop:screen-inventory <bc>         → (UI 있으면) 화면 목록
/ddd-workshop:aggregate-designer            → Core BC의 Aggregate부터 1개씩
/ddd-workshop:implementation-blueprint      → 폴더 구조·레이어·통신 방식 결정
```

완주 후 다른 서브도메인으로 확장은 `[4]→[5]`만 반복. 블루프린트는 팀·기술 스택이 바뀔 때만 재호출.

### 케이스 B: 요구사항 변동 → 부분 업데이트

```
/ddd-workshop:requirements-refiner --update
  → 변경된 항목만 수정
  → downstream 스킬에 stale 경고가 뜨면 순차적으로 --update
```

"무엇이 바뀌었나요?" 숫자 메뉴로 영향 범위를 좁혀줍니다.

### 케이스 C: 이미 코드는 있고, 문서만 역방향으로 정리

`requirements-refiner`와 `context-designer`를 건너뛰고 `aggregate-designer`부터 호출해도 돌아갑니다. 코드를 읽어 Aggregate 구조를 뽑고, 필요하면 위로 거슬러 `context-designer --update`로 BC Canvas 보강.

---

## 주의

- **0.x 단계**라 인터페이스·산출물 포맷은 1.0 전까지 바뀔 수 있어요.
- `requirements-refiner`는 옵션 웹 리서치용으로 `WebSearch` / `WebFetch` 권한을 요구합니다.
- 의료·법률·세무·금융 도메인에서 리서치 결과는 **전문가 자문을 대체하지 않습니다**. `requirements-refiner`의 자가 진단이 경고 마커로 명시합니다.
- **DDD 정론을 맹신하지 마세요.** 이 파이프라인도 여러분 팀의 현실에 맞춰 변형하면 됩니다. 스킬이 방해가 되면 건너뛰어도 돼요 — 부분 진입이 허용되는 이유입니다.

---

## 라이선스

[MIT](../LICENSE).
