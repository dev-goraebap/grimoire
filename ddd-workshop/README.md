# ddd-workshop

막연한 아이디어·PRD·러프한 프롬프트에서 시작해 **도메인 설계(Aggregate)** 까지 이어지는 DDD 파이프라인 스킬 5종. 도메인 전문가 없이 혼자 또는 소규모 팀에서 체계적으로 도메인을 추출하고 설계할 때 씁니다.

**v0.2**의 핵심 설계 원칙:
- **서브도메인(문제 공간) → BC(해결 공간) → Aggregate** 순서로 DDD 정론을 따른다.
- 모든 스킬이 공통 **대화 UX 규약**(1문 1답, 숫자 메뉴, "나중에" 허용 등)을 SKILL.md에 내장한다.
- 모든 산출물은 **`sources:` 헤더**로 upstream 문서를 추적해 요구사항 변동 시 stale 감지가 자동 작동한다.
- 각 스킬은 **`--update` 모드**를 지원해 전면 재작성 없이 delta만 갱신한다.
- **Slice-first**: Core 서브도메인 1개를 [1]→[5] 끝까지 먼저 돌리고, 그 학습으로 나머지를 넓힌다.

## 파이프라인 한눈에 보기

```
[0] 막연한 아이디어 / PRD
     │
[1]  requirements-refiner        ← 맥락 + 모호함 + 자가 진단 8문항 + (옵션) 웹 리서치
     ↓
[2]  domain-language-extractor   ← UL + 경량 이벤트 흐름 + 서브도메인 후보
     ↓
[3]  subdomain-classifier        ← 서브도메인 Core/Supporting/Generic + Slice-first 선택
     ↓
[4]  context-designer            ← BC 설계 + Context Map (선택된 슬라이스 범위)
     ↓
[5]  aggregate-designer          ← Event Storming + Aggregate + Invariant/Policy (1개당 1회 호출)
```

각 스킬은 **독립 실행** 가능하며, **부분 진입** 도 허용됩니다. 앞 단계 출력이 있으면 뒤 단계 질문이 날카로워지지만 없어도 돌아갑니다.

### 핵심 개념 순서 (DDD 정론)

- `[2] domain-language-extractor`가 내놓는 것은 **"서브도메인 후보"** 입니다. **"BC 후보"가 아닙니다**.
- Core/Supporting/Generic은 **[3]에서 서브도메인을 분류**합니다. BC를 분류하는 것이 아닙니다.
- BC는 **[4]에서 분류된 서브도메인으로부터 설계** 하는 해결 공간 구성물입니다.

## 어떤 스킬을 언제 쓰나

| # | 스킬 | 쓰는 때 | 산출물 |
|---|---|---|---|
| 1 | [`requirements-refiner`](skills/requirements-refiner/SKILL.md) | 막연한 아이디어·PRD에서 맥락·요구사항·도메인 브리프 정리 | `docs/requirements.md` |
| 2 | [`domain-language-extractor`](skills/domain-language-extractor/SKILL.md) | 용어집·이벤트·서브도메인 후보 추출 | `docs/ubiquitous-language.md` |
| 3 | [`subdomain-classifier`](skills/subdomain-classifier/SKILL.md) | 서브도메인 Core/Supporting/Generic 분류 + Slice 선택 | `docs/subdomain-classification.md` |
| 4 | [`context-designer`](skills/context-designer/SKILL.md) | BC 설계 + Context Map | `docs/context-map.md` |
| 5 | [`aggregate-designer`](skills/aggregate-designer/SKILL.md) | Aggregate·불변식·정책 설계 (BC당 N회 호출) | `docs/domains/{bc}/{aggregate}.md` × N |

## 공통 설계 원칙

모든 스킬이 **각자의 SKILL.md에 같은 섹션을 내장**합니다. `npx skills add`로 받는 사용자도 SKILL.md만으로 동일한 규약을 보장받습니다.

### 1. 대화 UX 규약
- **카테고리 선택은 숫자 메뉴** ("1) ... 2) ..."). 자유 입력 금지.
- **1문 1답 기본**. 단순 Yes/No만 2~3개까지 번호 달아 묶기 허용.
- **진행 표시**: `[Q 3/12 · 근거: ...]`
- **"나중에" / "모름" / "스킵" 항상 허용** → 산출물에 `⚠️ 미정`으로 기록.
- **자가 진단·평가는 ✅/⚠️/❌ 3단계**. 숫자 점수 금지.
- **정답보다 올바른 질문 생성**이 스킬의 핵심 가치.

### 2. `sources:` 헤더로 Stale 감지

모든 스킬 산출물의 frontmatter:

```yaml
sources:
  - path: docs/requirements.md
    skill: requirements-refiner
    version: 0.2.0
    updated_at: 2026-04-22
```

Downstream 스킬의 Step 0에서 upstream 문서의 `updated_at`을 자기 `sources` 기록과 비교해 **stale 경고**를 자동으로 띄웁니다.

### 3. `--update` 모드 (모든 스킬 지원)

기존 산출물이 있고 업데이트 요청이 오면:
1. upstream 변경 감지
2. "무엇이 바뀌었나요?" 숫자 메뉴로 영향 부위 식별
3. **변경된 부분에 대해서만** delta 질문
4. 전면 재작성은 사용자 명시적 요청 + 확인 후에만

요구사항이 수시로 바뀌는 초기 단계를 이 모드가 버팁니다.

### 4. Step 0 Upstream 일관성 스캔 (2~5단계)

각 downstream 스킬은 시작 시:
- upstream 문서 `updated_at` 확인 → stale 경고
- 핵심 용어 로드 → 본 작업 중 다른 형태로 쓰면 경고
- `⚠️ 미정` 항목 있으면 "먼저 돌아갈지" 선택지 제시

### 5. Slice-first 권장

[3]에서 Core 서브도메인 1개를 선택 → [4]→[5]를 그 슬라이스로만 먼저 완주 → 학습을 바탕으로 나머지 확장. "5개 대규모 병행 설계"를 피해 요구사항 변동 비용을 줄입니다.

## 범위 — 무엇을 하고 무엇을 하지 않는가

**포함**: 요구사항 정제 → 도메인 리서치 → 언어·이벤트 → 서브도메인 분류 → BC·Context Map → Aggregate·Invariant·Policy.

**제외**: ERD / DB 스키마 / API 설계 / 인프라 / 코드 생성.

> **ERD 제외 이유**: 도메인 모델과 ERD는 층위가 다릅니다. 저장 전략(일반 ORM / 이벤트 소싱 / CQRS)은 도메인 설계 이후의 별도 결정이며, 파이프라인에 포함하면 "CRUD 마인드셋"으로 도메인 사고가 오염될 위험이 있습니다.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install ddd-workshop@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill requirements-refiner \
  --skill domain-language-extractor --skill subdomain-classifier \
  --skill context-designer --skill aggregate-designer
```

## 사용 예시

### 케이스 A: 새 아이디어 → Core Aggregate까지 (Slice-first)

```
/ddd-workshop:requirements-refiner         → 요구사항 + 자가 진단 + 도메인 브리프
/ddd-workshop:domain-language-extractor    → UL + 서브도메인 후보
/ddd-workshop:subdomain-classifier         → Core/Supporting/Generic + Slice 선택
/ddd-workshop:context-designer             → 선택된 Core 슬라이스의 BC + 이웃만
/ddd-workshop:aggregate-designer           → Core BC의 Root Aggregate부터 1개씩
```

완주 후 다른 서브도메인으로 확장할 때는 `[4]→[5]`를 해당 슬라이스로 반복.

### 케이스 B: 요구사항 변동 → 부분 업데이트

```
/ddd-workshop:requirements-refiner --update    → 변경된 항목만 delta 수정
... stale 경고 뜬 downstream 스킬에 순차적으로 --update
```

각 스킬이 "무엇이 바뀌었나요?" 숫자 메뉴로 영향 범위를 좁혀 물어봅니다.

## 주의

- **0.x 단계**입니다. 인터페이스·메타데이터 포맷은 1.0 이전까지 바뀔 수 있습니다.
- `requirements-refiner`는 `WebSearch` / `WebFetch` 권한을 필요로 합니다 (옵션 웹 리서치).
- 의료·법률·세무·금융 도메인에서 리서치 결과는 **전문가 자문을 대체하지 않습니다**. `requirements-refiner`의 자가 진단이 경고 마커로 명시합니다.

## 라이선스

[MIT](../LICENSE).
