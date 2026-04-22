---
name: context-designer
description: >
  ddd-workshop 파이프라인의 4단계. 분류된 서브도메인에서 Bounded Context를
  설계하고, BC 간 관계(Customer-Supplier, Conformist, ACL, Shared Kernel,
  Published Language, Open Host Service, Partnership, Separate Ways)를 포함한
  Context Map을 그린다. Slice-first 권장: 선택된 Core 서브도메인의 BC를 먼저
  설계하고, 그 BC와 경계하는 최소 이웃만 함께 그린다. "BC 설계",
  "bounded context", "context map", "컨텍스트 맵", "context designer",
  "ddd-workshop 4단계" 같은 요청에 트리거한다.
metadata:
  author: dev-goraebap
  version: "0.2.0"
---

# context-designer 스킬

**서브도메인(문제 공간)** 에서 **Bounded Context(해결 공간)** 를 설계한다. 서브도메인 ↔ BC 매핑은 1:1이 기본이지만, 1:N(큰 서브도메인을 쪼갬)이나 N:1(작은 서브도메인 묶음)도 가능하다.

동시에 **Context Map** — BC 간 관계와 통합 패턴을 그린다. 이 관계 선택이 구현 시 ACL 구조, 이벤트 버스, DB 스키마 경계에 직접 영향.

**Slice-first 권장**: `subdomain-classifier`가 선택한 Core 서브도메인의 BC부터 설계하고, **그 BC와 직접 경계하는 이웃 BC만** 함께 그린다. 전체 BC 맵은 시간이 흐르며 완성.

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

- `/ddd-workshop:context-designer`
- `subdomain-classifier` 출력 직후
- "BC 설계", "context map", "컨텍스트 맵 그려줘"
- 기존 `context-map.md` 업데이트 → `--update`

---

## 2. 입력

- `docs/subdomain-classification.md` — **주 입력**
  - `slice_first_target` 필드에 선택된 Core 서브도메인
- `docs/ubiquitous-language.md` — 용어·동음이의어
- `docs/requirements.md` — 조직·외부 시스템 맥락

---

## 3. Step 0 — Upstream 일관성 스캔

자동 점검:

1. 3개 upstream `updated_at` 확인 → stale 경고.
2. `slice_first_target`이 Core로 유지되는지 재확인.
3. `ubiquitous-language.md`의 동음이의어 → BC 경계의 1순위 증거로 로드.
4. 요구사항의 **외부 시스템 목록**(SAP, Keycloak, PG 등) 로드 → ACL/Conformist 후보.

결과 공개:

```
📋 Upstream 스캔
- Slice-first 대상: [거래] (Core)
- 동음이의어 3종 로드 (상품, 사용자, 거래)
- 외부 시스템: 결제 게이트웨이, 알림 서비스
- ⚠️ 미정: 분쟁 조정 외부 위탁 여부 (requirements.md)

진행할까요? (1) 진행 2) 미정 해소 후 진행 3) [3]으로 복귀)
```

---

## 4. 진행 단계

### Step 1 — Slice-first 확인

```
이번 세션에서 BC 설계 범위를 확정합니다.

Slice-first 대상 서브도메인: [거래]
포함할 이웃 BC:
  - [상품 노출] (상품 정보 공급)
  - [결제] (Generic, 외부)
  - [알림] (Generic, 외부)

이 범위로 진행할까요?

1) 그대로 진행
2) 이웃 BC 조정 (추가/제거)
3) 전체 BC 맵 설계 (slice 중단, 모든 서브도메인 일괄)
```

옵션 3은 **요구사항 변동 위험** 경고 후 사용자 재확인.

### Step 2 — 서브도메인 → BC 매핑 (1문 1답)

각 서브도메인에 대해:

```
[Q 1/N · 서브도메인: 거래]

이 서브도메인의 BC 구성을 결정합니다. 가장 가까운 옵션은?

1) 1:1 — 서브도메인 전체를 하나의 BC로 ([거래] BC)
2) 1:N — 두 개 이상의 BC로 쪼갬 (예: 매칭 / 평가 / 거래 프로세스)
3) N:1 — 인접 서브도메인과 묶음 (드문 경우)
4) 모름 / 나중에

현재 언어 증거: [거래] 용어가 "매칭"과 "결제" 맥락에서 다르게 쓰임 → 1:N 가능성
```

### Step 3 — 각 BC 상세 정의 (1문 1답)

BC마다:

```
[Q · BC: 거래]

포함 개념: 주문, 결제, 장바구니 (ubiquitous-language 근거)
핵심 책임: 구매 프로세스 조율
주요 이벤트: 주문됨, 결제완료됨, 주문취소됨

이 정의에 추가·수정이 필요한가요?
1) 그대로 OK
2) 포함 개념 추가
3) 포함 개념 제거
4) 책임 수정
```

### Step 4 — BC 간 관계 설계 (Context Map)

BC 쌍마다 관계 패턴을 결정. 선택지는 숫자 메뉴:

```
[Q · 관계: [거래] → [상품 노출]]

이 두 BC는 어떻게 연결되나요?

1) Customer-Supplier (게시-구독: 상품 노출이 상품 이벤트 발행, 거래가 구독)
2) Conformist (거래가 상품 노출 모델을 그대로 따름 — 상류가 협상 불가)
3) ACL (거래가 자체 인터페이스를 선언, 상품 노출 모델을 번역해 격리)
4) Shared Kernel (공유 모델, 매우 드물게)
5) Open Host Service + Published Language (상품 노출이 공용 프로토콜 공개)
6) Partnership (두 팀 공동 소유)
7) Separate Ways (통합 안 함)
8) 모름

권장: ACL — 상품의 정가/판매가 개념이 거래에서 오염되면 안 됨
```

**외부 시스템과의 관계**는 대부분 **ACL** 또는 **Conformist**. Partnership/Shared Kernel은 예외적.

### Step 5 — Context Map 그리기

텍스트 다이어그램으로 관계 시각화:

```
┌──────────────┐        게시-구독       ┌──────────────┐
│   상품 노출  │──(상품정보 이벤트)──▶│    거래      │
└──────────────┘                        └──────┬───────┘
                                               │ ACL
                                               ▼
                                        ┌──────────────┐
                                        │ 결제 (Generic)│
                                        └──────────────┘
                                               ▲
                                               │ Conformist
                                        ┌──────────────┐
                                        │ 포트원 (외부)│
                                        └──────────────┘
```

### Step 6 — 미정 항목과 리스크 정리

다음을 명시:

- 아직 확정 못 한 관계 (⚠️ 미정)
- 고위험 관계 (Shared Kernel, Partnership) → 추후 재검토 제안
- 외부 시스템 실제 인터페이스 미확인 → 확인 필요 표시

---

## 5. 산출물

기본 경로 `docs/context-map.md`.

```markdown
---
skill: context-designer
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
  - path: docs/subdomain-classification.md
    skill: subdomain-classifier
    version: 0.2.0
    updated_at: YYYY-MM-DD
next_suggested: aggregate-designer
slice_first_bc: <BC명>
updated_at: YYYY-MM-DD
---

# Context Map

## Slice 범위
- 대상 Core BC: [거래]
- 포함 이웃 BC: [상품 노출], [결제], [알림]
- 제외 (이번 Slice 밖): [분쟁 조정], [사용자 프로필]

## 서브도메인 → BC 매핑

| 서브도메인 | 분류 | BC | 비고 |
|---|---|---|---|
| 거래 | Core | [거래] | 1:1 |
| 상품 노출 | Supporting | [상품 노출] | 1:1 |
| 결제 | Generic | [결제] | 1:1, 외부 PG ACL |
| 알림 | Generic | [알림] | 1:1, 외부 솔루션 |

---

## Bounded Context 상세

### [거래] Context (Core) ⭐
- **포함 개념**: 주문, 주문상품, 장바구니, 결제결과스냅샷
- **핵심 책임**: 구매 프로세스 조율
- **주요 이벤트**: 주문됨, 결제완료됨, 주문취소됨
- **외부 경계**: 상품 노출(구독), 결제(호출), 알림(발행)

### [상품 노출] Context (Supporting)
- **포함 개념**: 상품(전시정보), 카테고리, 검색
- **핵심 책임**: 상품 노출·탐색
- **주요 이벤트**: 상품등록됨, 상품수정됨

### [결제] Context (Generic)
- **포함 개념**: 결제요청, 결제결과
- **구현**: 외부 PG(포트원) + ACL
- **권고**: 자체 도메인 최소화, ACL로 격리

### [알림] Context (Generic)
- **포함 개념**: 발신요청
- **구현**: 외부(NHN Cloud) + 이벤트 기반

---

## Context Map (관계)

```
┌──────────────┐        게시-구독       ┌──────────────┐
│   상품 노출  │──(상품정보 이벤트)──▶│    거래      │
└──────────────┘                        └──────┬───────┘
                                               │ ACL
                                               ▼
                                        ┌──────────────┐
                                        │    결제      │
                                        └──────────────┘
                                               ▲
                                               │ Conformist
                                        ┌──────────────┐
                                        │ 포트원(외부) │
                                        └──────────────┘

[거래] ──(도메인 이벤트 발행)──▶ [알림]
```

| From | To | 관계 | 근거 |
|---|---|---|---|
| 상품 노출 | 거래 | Customer-Supplier (게시-구독) | 상품 변경 이벤트 전파, 거래가 구독 |
| 거래 | 결제 | ACL | 결제 응답 모델을 거래 언어로 번역 |
| 결제 | 포트원 | Conformist | 외부 PG 스펙 그대로 수용 |
| 거래 | 알림 | 이벤트 발행 | 느슨한 결합 |

---

## ⚠️ 경계 판단 애매 지점

### 재고
- 상품 노출과 거래 중 어느 쪽 BC?
- 권고: 별도 [재고] BC (Supporting)로 분리, 양쪽에서 조회
- 결정 미정 → [5] aggregate-designer 진입 전 확정 필요

---

## ⚠️ 고위험 관계
(현재 슬라이스에는 없음. Partnership/Shared Kernel이 생기면 여기 기록)

---

## ⚠️ 미확인 사항
- 포트원 webhook 스펙 확인 필요 (Conformist 세부 매핑)

---

## 다음 단계
→ `aggregate-designer`로 [거래] BC의 Aggregate 설계 시작.
  1 Aggregate당 1회 호출. 주문 Aggregate부터 권장.
```

---

## 6. 업데이트 모드 (`--update`)

1. 3개 upstream `updated_at` 비교 → stale 경고.
2. 사용자에게 "무엇을 업데이트?" 숫자 메뉴:
   ```
   1) Slice 범위 변경 (다른 Core로 전환 / 이웃 BC 추가)
   2) 서브도메인 → BC 매핑 수정
   3) BC 간 관계 재설계
   4) 새 외부 시스템 추가
   ```
3. 해당 부분만 delta 질문.

---

## 7. 강제 체크리스트

```
□ Step 0 upstream 스캔 완료
□ Slice 범위 명시됨 (대상 BC + 이웃 BC)
□ 서브도메인 → BC 매핑 표 완성
□ 각 BC에 포함 개념·책임·주요 이벤트 명시
□ BC 쌍마다 관계 패턴 결정 (미정은 ⚠️)
□ 외부 시스템은 ACL 또는 Conformist로 설정 (Partnership 희귀)
□ Context Map 다이어그램 포함
□ 경계 애매 지점 있으면 명시 ("없음"도 가능)
□ slice_first_bc 메타 기록됨
```

---

## 8. 맥락별 조정

| 맥락 | BC 수 | Slice 강도 | 관계 주의 |
|---|---|---|---|
| 학습 | 1~2 | 매우 강함 | 단순 |
| 개인 | 2~3 | 강함 | 과분리 금지 |
| 사내 | 3~6 | 강함 | 조직 경계 존중 |
| B2B | 3~6 | 강함 | 멀티테넌시 경계 별도 |
| B2C | 3~7 | 중간 | 외부 연동 많음, ACL 중심 |

---

## 9. 절대 하지 말 것

- Core/Supporting/Generic을 BC 분류로 다시 쓰기 (서브도메인 분류). BC는 각 서브도메인을 **해결 공간으로 설계한 결과**.
- 동음이의어 증거를 무시하고 기술 레이어(UI/Service/DB)로 BC 자르기.
- 모든 BC를 한 번에 설계 (Slice-first 무시).
- 외부 시스템과 Partnership/Shared Kernel로 쉽게 잡기 (대부분 ACL/Conformist).
- 관계 결정을 한 메시지에 전부 몰아 제시 (BC 쌍당 1문 1답).
- Context Map 다이어그램 생략.
- 사용자가 "모름"이라 답한 관계를 임의 확정.
