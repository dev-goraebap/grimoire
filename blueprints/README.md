# blueprints

구현을 돕는 기획·설계 문서 스킬 4종. 각 스킬이 만드는 문서는 생성 후에도 프로젝트와 함께 수정·확장되는 것을 전제로 설계되어 있습니다 (그래서 스킬 이름에 `make-` 접두사가 없습니다).

## 어떤 스킬을 언제 쓰나

| 스킬 | 쓰는 때 | 산출물 |
|---|---|---|
| [`lean-prd`](skills/lean-prd/SKILL.md) | 프로젝트 시작 시점, 비전·범위 정리 | 한 장짜리 PRD (`docs/lean-prd.md`) |
| [`erd`](skills/erd/SKILL.md) | **관계형 DB 설계**가 필요할 때 | Mermaid `.mmd` (개념·논리·물리 3수준) |
| [`domain-model`](skills/domain-model/SKILL.md) | Bounded Context의 경계·용어·불변 규칙 고정 | 도메인별 `DOMAIN.md` (폴더로 그루핑) |
| [`policy-book`](skills/policy-book/SKILL.md) | 비즈니스 정책을 이력·버전과 함께 관리 | `POL-XXXX.md` 묶음 + 인덱스 |

각 스킬 상세는 링크된 `SKILL.md` 참조.

## ID 채번

이 플러그인에서 **전역 ID**를 쓰는 건 `policy-book` 하나입니다.

- **`POL-XXXX`** — 정책 파일마다 4자리 ID가 자동 채번되며, 대체·폐지·변경 이력 추적의 축이 됩니다.
- 다른 스킬들은 ID 대신 **파일명·폴더명**으로 식별합니다:
  - `lean-prd` — 파일 한 장 (`{project}-lean-prd.md`)
  - `erd` — 파일명 패턴 (`{project}-{level}-erd.mmd`)
  - `domain-model` — 도메인 폴더 슬러그 (`order/`, `payment/`)

채번 부담을 지는 건 정책뿐입니다.

## 제한·주의

- **`erd`는 관계형 DB 전제입니다.** Entity-Relationship 모델 자체가 RDBMS 설계 언어라 MongoDB·DynamoDB·Firestore 같은 문서·KV·그래프 DB에는 적용 범위가 제한적입니다. 비관계형 저장소의 구조는 `domain-model`의 엔티티 섹션이나 별도 스키마 다이어그램으로 표현하는 게 맞습니다.
- **도메인 불변 규칙(`domain-model`의 Invariants)과 정책(`policy-book`)을 혼동하지 마세요.** 전자는 "바꾸면 도메인이 망가지는" 규칙, 후자는 "비즈니스 결정으로 바뀔 수 있는" 규칙입니다. 판별 질문은 각 SKILL.md 참조.

## 스킬 간 관계

```
lean-prd         ← 비전·범위 (한 장)
    │
    ▼
domain-model     ← 도메인 경계·용어·불변 규칙 (도메인당 한 장)
    │       ─────┐
    ▼            ▼
  erd        policy-book    ← 정책, 경계 가로지름
(RDBMS 모델)  (POL-XXXX)
```

`lean-prd` → `domain-model` → `policy-book`으로 상위→하위 참조. `erd`는 `domain-model`과 나란히 데이터 구조를 묘사합니다.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install blueprints@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill lean-prd --skill erd --skill domain-model --skill policy-book
```

## 공통 규약 — 경로 저장

이 플러그인의 스킬들은 **프로젝트별 저장 경로를 별도 config 파일에도, 전용 섹션에도 두지 않습니다**. 루트 `AGENTS.md` / `CLAUDE.md`의 **기존 `## References` 섹션**(또는 "참고 문서" 등가 섹션)에 한 줄로 얹습니다.

첫 실행 때 스킬이 경로를 인터뷰하고, 이후에는 같은 줄을 읽어 재질문 없이 사용합니다.

예시 (스킬들이 기록한 결과):

```markdown
## References

- Agent Skills 스펙: https://agentskills.io
- ...
- PRD: `docs/lean-prd.md`
- Domain models: `docs/domains/`
- Policy book: `docs/policies/`
- ERDs: `docs/design/`
```

폴더명과 위치는 모두 인터뷰 중 원하는 대로 바꿀 수 있습니다 (예: `domains` → `contexts`, `policies` → `rules`).

## 주의

- **공개 트랙입니다.** 인터페이스 일관성을 유지하고, 변경 시 호환성을 고려합니다. 다만 플러그인이 아직 0.x 단계라 1.0 안정화 이전까지는 주요 변경이 있을 수 있습니다.
- **스킬 간 결합도는 낮습니다.** 상위 참조(링크) 외에는 서로 의존하지 않으며 각각 독립적으로 사용 가능합니다.

## 라이선스

[MIT](../LICENSE).
