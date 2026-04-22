# Aggregate 문서 템플릿

`docs/domains/{bc}/{aggregate}.md` 로 복제해 채운다.

---

```markdown
---
aggregate: <RootName>
bc: <BoundedContextName>
classification: {Core|Supporting|Generic}
status: {draft|active|deprecated}
version: 0.2.0
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
  - path: docs/context-map.md
    skill: context-designer
    version: 0.2.0
    updated_at: YYYY-MM-DD
last_reviewed: YYYY-MM-DD
---

# <RootName>

## Role

이 Aggregate가 **책임지는 것** 을 2~4줄로 서술.
**책임지지 않는 것** 을 반드시 함께 명시.
(예: "환불·배송·정산은 이 Aggregate의 책임이 아니다.")

## Ubiquitous Language

| 용어 | 의미 |
|---|---|
| <개념1> | ... |

## Event Storming (Design-Level)

### 관련 플로우

```
[액터] →(커맨드)→ [이벤트됨]
  ↓ 정책: ...
  (다음커맨드) → [다음이벤트됨]
```

### 해소된 핫스팟
- <핫스팟>: <결정>

### 미해소 핫스팟
- ⚠️ <핫스팟>

## Structure

- **Root**: <RootName>
- **내부 Entity**: <Entity1>, <Entity2> — Root 없이 존재 불가
- **VO**: <VO1>, <VO2> — 값으로만 의미
- **외부 참조 (ID only)**: `<otherAggId>: <type>`

## Invariants

"항상 참"인 규칙만.

- <규칙1>
- <규칙2>
- 상태 전이: `<S1> → <S2>`, `<S2> → <S3>` 만 허용

## Policies

### <PolicyName>
- **위치**: {Specification | Strategy | Domain Service | Event Handler}
- **이유**: 왜 이 위치인가
- **설명**: 규칙 요약
- **교체 시나리오**: 어떤 상황에서 변할 수 있는가

## External Dependencies

| Aggregate/BC/외부 | 참조 방식 | 비고 |
|---|---|---|
| <Other Aggregate> | ID 참조 | ... |
| <Other BC> | 이벤트 구독 | `<이벤트명>` |
| <외부 시스템> | ACL + 계약 인터페이스 | ... |

## Domain Events (발행)

- `<이벤트1>` — 발행 시점, payload 요점

## Domain Events (구독)

- `<이벤트1>` — 반응: ...

## Open Questions

- ⚠️ <질문1>
- (비어 있으면 "없음" 명시)
```
