---
name: subdomain-classifier
description: >
  ddd-workshop 파이프라인의 3단계. domain-language-extractor가 뽑은
  서브도메인 후보를 Core / Supporting / Generic으로 분류한다. Core는 Why와
  경쟁 차별점에 근거. 서브도메인은 문제 공간의 분류이며, 이후 context-designer가
  각 서브도메인에서 BC를 설계한다. 완료 후 "어느 Core 서브도메인부터
  [4]→[5]로 slice-first 진행할지"를 사용자와 결정한다. "core supporting
  generic", "서브도메인 분류", "subdomain classifier", "어디에 집중할까",
  "외부 솔루션 쓸지", "ddd-workshop 3단계" 같은 요청에 트리거한다.
metadata:
  author: dev-goraebap
  version: "0.2.0"
---

# subdomain-classifier 스킬

**서브도메인(문제 공간)** 을 Core / Supporting / Generic으로 분류하고, 그에 따른 투자·구현 권고를 제안한다. 이 분류는 DDD 전략적 설계의 핵심으로, **어디에 최고의 개발자와 시간을 투입할지**를 정한다.

이 스킬이 끝나면 **Slice-first 결정**(어느 Core 서브도메인을 먼저 [4]→[5]로 끝까지 밀어볼지)을 함께 묻는다.

> **주의 ⚠️**: Core/Supporting/Generic은 **서브도메인**의 분류이지 BC의 분류가 아니다. BC는 [4] context-designer에서 분류된 서브도메인으로부터 설계된다.

---

## 대화 UX 규약 (필수)

- **카테고리 선택은 숫자 메뉴**. 자유 입력 금지.
- **1문 1답 기본**. 단순 Yes/No만 2~3개까지 번호 달아 묶기 허용.
- **진행 표시**: `[Q 3/12 · 근거: ...]`
- **"나중에" / "모름" / "스킵" 항상 허용** → `⚠️ 미정`으로 산출물에 기록.
- **자가 진단·평가는 ✅/⚠️/❌ 3단계**. 숫자 점수 금지.
- **정답보다 올바른 질문 생성**이 스킬의 핵심 가치.

---

## 1. 언제 트리거하는가

- `/ddd-workshop:subdomain-classifier`
- `domain-language-extractor` 출력 직후
- "Core 뭐야?", "어디에 집중?", "외부 솔루션 써도 될지"
- 기존 `subdomain-classification.md` 업데이트 → `--update` 모드

---

## 2. 입력

- `docs/ubiquitous-language.md`의 "서브도메인 후보" 섹션 — **주 입력**
- `docs/requirements.md`의 Why·핵심 가치 — **Core 판정 1순위 근거**
- `docs/requirements.md`의 도메인 브리프 "경쟁 차별점" — **Core 판정 2순위 근거**

---

## 3. Step 0 — Upstream 일관성 스캔

자동 점검:

1. `ubiquitous-language.md`의 `updated_at`이 자기 `sources` 기록보다 새로우면 stale 경고.
2. 서브도메인 후보가 "BC 후보"로 잘못 표기되어 있으면 경고 (상위 스킬의 버그 지표).
3. Why가 `requirements.md`에 ⚠️ 미정이면 "Core 판정 정확도 낮아짐" 알림 + 먼저 [1]로 돌아갈지 선택.

---

## 4. 분류 기준

### Core 서브도메인
- **정의**: 이 프로젝트의 경쟁력 원천. Why와 직결.
- **판정 질문**:
  - `requirements.md`의 Why가 이 서브도메인에 집약되는가? ✅/⚠️/❌
  - 경쟁 차별점이 여기 모이는가? ✅/⚠️/❌
  - 이 서브도메인이 없으면 프로젝트 본질이 바뀌는가? ✅/⚠️/❌
- **권고**: 최고 역량 투입, DDD 전술 패턴 꼼꼼히, 외주·외부 솔루션 금지.

### Supporting 서브도메인
- **정의**: 필요하지만 차별점은 아님. 도메인 지식이 있어 범용 솔루션 대체는 어려움.
- **권고**: 표준 CRUD·패턴, 사내 개발, 코드 리뷰는 Core보다 느슨.

### Generic 서브도메인
- **정의**: 어디나 있는 범용 기능. 외부 솔루션 대체 합리적.
- **권고**: **외부 솔루션 우선 검토** (결제→PG, 인증→Auth0, 이메일→SendGrid, 검색→Algolia 등). 자체 구현은 규제·비용상 필요할 때만.

---

## 5. 진행 단계

### Step 1 — 근거 수집 (내부)

각 서브도메인 후보에 대해:

| 근거 | 출처 |
|---|---|
| Why와 직결 여부 | requirements.md |
| 경쟁 차별점 | requirements.md § 도메인 브리프 |
| 업계 관행 (Generic 판단) | requirements.md § 업계 플레이어 |
| 규제·보안 (Generic이어도 자체개발 필요) | requirements.md § 규제 |

### Step 2 — 1차 분류 제안 (사용자에게 한꺼번에 X, 서브도메인당 하나씩)

**1문 1답**으로, 서브도메인 하나씩 확정.

```
[Q 1/4 · 서브도메인 A · 상품 노출]

에이전트 제안: Supporting
근거:
  ✅ Why와 직결: ❌ (Why는 "지역 기반 신뢰")
  ✅ 경쟁 차별점: ⚠️ (경쟁사도 모두 가짐)
  ✅ 없으면 본질 바뀜: ❌

이 분류에 동의하시나요?

1) 동의 (Supporting)
2) Core로 올림 (근거 추가 필요)
3) Generic으로 내림 (근거 추가 필요)
4) 모름 / 나중에
```

### Step 3 — Core 검증 (중요)

Core는 보통 **1~2개**. 3개 이상이면 재검토. 재검토 질문:

```
현재 Core로 분류된 서브도메인이 N개입니다. DDD 정론에서 Core는 보통 1~2개입니다.

1) 유지 (각각 진짜 차별점이라 확신)
2) 우선순위 매김 (Core지만 1순위/2순위 구분)
3) 재검토 (일부를 Supporting으로 내림)
```

### Step 4 — Generic 검증

Generic 분류된 각 서브도메인에 **대체 외부 솔루션 후보 1개 이상** 제시. requirements.md 도메인 브리프의 "주요 플레이어"에서 꺼내 씀.

규제·보안·비용 때문에 외부 솔루션 불가한 경우 이유 명시.

### Step 5 — Slice-first 결정 ⭐

```
✅ 서브도메인 분류 완료.

DDD에서 권장되는 slice-first 접근을 안내드립니다:
→ Core 서브도메인 **1개**를 [4]→[5]로 끝까지 먼저 설계해보기.
→ 그 학습을 바탕으로 나머지 서브도메인을 넓혀가기.

이유: 5개 모두를 [4]→[5] 대규모 병행 설계하면 요구사항 변동 시 재작업 비용이 큽니다.

어떻게 진행할까요?

1) Slice-first (Core 1개 선택 후 [4] context-designer로)
2) 전체 BC 설계 먼저 ([4]에서 모든 서브도메인 병행)
3) 일단 여기서 중단, 나중에 재개
```

선택 결과를 산출물에 기록.

---

## 6. 산출물

기본 경로 `docs/subdomain-classification.md`.

```markdown
---
skill: subdomain-classifier
version: 0.2.0
context: {학습|개인|사내|B2B|B2C}
confidence: {high|medium|low}
sources:
  - path: docs/requirements.md
    skill: requirements-refiner
    version: 0.2.0
    updated_at: YYYY-MM-DD
  - path: docs/ubiquitous-language.md
    skill: domain-language-extractor
    version: 0.2.0
    updated_at: YYYY-MM-DD
next_suggested: context-designer
slice_first_target: <서브도메인명>   # 선택된 Core
updated_at: YYYY-MM-DD
---

# 서브도메인 분류

## 분류 요약

| 서브도메인 | 분류 | 핵심 근거 | 구현 권고 |
|---|---|---|---|
| 거래(매칭·평가) | **Core** | Why "지역 기반 신뢰" 집약 + 경쟁 차별화 | 최고 역량, DDD 전술 패턴 |
| 상품 노출 | Supporting | 차별화 아니지만 도메인 특수성 | 표준 CRUD |
| 분쟁 조정 | Supporting | 사용자 신뢰 영향 | 상태머신 주의 |
| 결제·에스크로 | Generic | 업계 PG 표준 | 외부(포트원/토스페이먼츠) |
| 인증 | Generic | 범용 | 외부(Auth0/Keycloak) |

---

## Core 서브도메인

### 거래
- **Why 근거**: requirements § Why — "지역 기반 신뢰"
- **경쟁 차별점**: 당근마켓 매너 온도 대비 "구체적 거래 이력 신뢰지표"
- **Core 판정 평가**:
  - Why 직결: ✅
  - 경쟁 차별점: ✅
  - 없으면 본질 바뀜: ✅
- **권고**:
  - 최고 역량 개발자
  - Aggregate·Invariant·Policy 철저 분리
  - 코드 리뷰 엄격
  - 외주·외부 솔루션 금지
  - 변경 이력 ADR

---

## Supporting 서브도메인

### 상품 노출
- 왜 Core 아닌가: Why와 직결되지 않음
- 권고: 표준 CRUD, 검색은 성장 시 Elasticsearch 검토

### 분쟁 조정
- 왜 Core 아닌가: 사용자 신뢰 영향 크지만 차별점은 "거래"가 담당
- 권고: 상태머신 설계 정교하게, 어드민 UX 투자

---

## Generic 서브도메인

### 결제·에스크로
- 외부 솔루션 후보: 토스페이먼츠, 포트원, KG이니시스
- 자체 필요 케이스: 에스크로 특수 규제 대응 시
- 권고: ACL로 외부 모델 격리

### 인증
- 외부 솔루션 후보: Auth0, Keycloak, NextAuth + 소셜
- 규제: 위치 정보·개인정보는 최소 수집 원칙 자체 구현

---

## ⚠️ 경계 사례

### 재고
- 논쟁: Supporting vs Core
- 근거 A (Supporting): 업계 일반 기능
- 근거 B (Core 가능성): 지역 직거래 특성상 "재고 1개 = 물리적 1개" 동시성 관리가 차별화 근거
- 권고: 현재 Supporting, 사기 이슈 부상 시 재분류

---

## Slice-first 결정

- **1순위 진행 대상**: 거래 (Core)
- **이유**: Why 집약 + 경쟁 차별점
- **[4] context-designer에서 이 서브도메인부터 BC 설계 시작 예정**
- 나머지는 [4]→[5] 1 슬라이스 완료 후 넓힘

---

## 미정
- ⚠️ ...

## 다음 단계
→ `context-designer`로 **"거래" 서브도메인부터** BC 설계.
  1 슬라이스 완료 후 나머지 서브도메인으로 확장.
```

---

## 7. 업데이트 모드 (`--update`)

1. upstream (`requirements.md`, `ubiquitous-language.md`) `updated_at` 비교 → stale 경고.
2. 사용자에게 "무엇이 바뀌었나요?" 숫자 메뉴:
   ```
   1) Why / 경쟁 차별점 변경 → Core 재판정
   2) 새 서브도메인 후보 추가
   3) 기존 서브도메인 분류 변경
   4) Slice-first 대상 변경
   ```
3. 해당 부분만 재질문.

---

## 8. 강제 체크리스트

```
□ Step 0 upstream 스캔 완료
□ 각 서브도메인에 ✅/⚠️/❌ 3문 평가 기록
□ Core 근거에 requirements.md Why 인용 있음
□ Core 수 1~2개 (3+이면 재검토 기록)
□ 각 Generic에 외부 솔루션 후보 1개 이상
□ 경계 사례 있으면 명시 ("경계 없음"도 가능하지만 대부분 1개는 있음)
□ Slice-first 결정 기록됨 (1/2/3 중 선택)
□ 산출물이 "서브도메인"을 분류함 (BC 분류 아님)
```

---

## 9. 맥락별 조정

| 맥락 | Core 수 | Generic 외부 솔루션 | Slice-first 강도 |
|---|---|---|---|
| 학습 | 전부 Core OK | 자체 구현 (학습 목적) | 강함 (하나씩 배움) |
| 개인 | 1개 | 적극 외부 | 강함 |
| 사내 | 1~2개 | 사내 정책 따름 | 중간 |
| B2B | 1~2개 | 보안 요구 시 자체 | 강함 (고객 파일럿 슬라이스) |
| B2C | 1~2개 | 적극 외부 | 강함 |

---

## 10. 절대 하지 말 것

- BC를 Core/Supporting/Generic으로 분류하기 (**서브도메인**이 분류 단위).
- 모든 서브도메인을 Core로 분류 (전략적 집중 실패).
- Why·경쟁 근거 없이 감으로 Core 판정.
- Generic에 외부 솔루션 후보 없이 "알아서" 마치기.
- 분류를 한 메시지에 전부 쏟아 사용자에게 제시 (서브도메인당 1문 1답).
- Slice-first 결정 생략 ([4] 진입 전 필수).
- 사용자가 "모름"이라 답했는데 임의 분류 확정.
