# blueprints

**기획·설계 문서 스킬 묶음.** 구현에 실제로 도움이 되는 문서(PRD, ERD, 도메인 모델, 정책)를 ID 기반으로 생성·관리합니다. 이름 그대로 **구현 전 단계의 도면들**.

## 철학

- **살아 있는 문서.** 스킬 이름에 `make-` 접두사를 쓰지 않는 건 의도적입니다 — 이 문서들은 한 번 만들고 끝나는 것이 아니라 프로젝트 수명 동안 계속 수정·확장됩니다.
- **ID 추적성.** 각 문서에 ID(`POL-0001`, `UC-001` 등)를 붙여 구현·테스트·PR과 교차 참조가 가능하게 만듭니다.
- **경로는 `AGENTS.md`에.** 프로젝트별 저장 경로는 별도 config 파일이 아니라 `AGENTS.md` / `CLAUDE.md` 섹션에 기록합니다 — 에이전트가 자동으로 읽는 규약을 재사용합니다.
- **도메인이 기준.** 도메인 경계를 기준으로 문서를 그루핑하고, 경계를 가로지르는 정책은 별도 법전에 둡니다.

## 포함된 스킬

| 스킬 | 역할 | ID 체계 |
|---|---|---|
| [`lean-prd`](skills/lean-prd/SKILL.md) | 비전·범위를 담은 한 페이지 PRD (7섹션) | 없음 (단일 문서) |
| [`erd`](skills/erd/SKILL.md) | Mermaid ERD 생성 (개념·논리·물리 3수준) | 없음 (파일명 기반) |
| [`domain-model`](skills/domain-model/SKILL.md) | 도메인 경계·용어·불변 규칙 | 폴더명 기반 |
| [`policy-book`](skills/policy-book/SKILL.md) | 비즈니스 정책 법전 (ADR 스타일) | `POL-XXXX` |

각 스킬 상세는 링크된 `SKILL.md` 참조.

## 스킬 간 관계

```
lean-prd         ← 비전·범위 (한 장)
    │
    ▼
domain-model     ← 도메인 경계·용어·불변 규칙 (도메인당 한 장)
    │       ─────┐
    ▼            ▼
  erd        policy-book    ← ADR 스타일, 경계 가로지름
(데이터 모델)  (비즈니스 정책)
```

**추적 관계**: `lean-prd` → `domain-model` → `policy-book`으로 상위→하위 참조. `erd`는 `domain-model`과 나란히 데이터 구조를 묘사.

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

이 플러그인의 스킬들은 **프로젝트별 저장 경로를 별도 config 파일이 아니라 `AGENTS.md` / `CLAUDE.md` 섹션**에 기록합니다. 스킬이 최초 실행될 때 한 번 인터뷰로 경로를 정하고, 해당 섹션을 자동으로 생성합니다. 이후에는 스킬이 이 섹션을 읽어 재질문하지 않습니다.

생성되는 섹션 예시:

```markdown
## Blueprints Paths

- PRD: `docs/lean-prd.md`
- Domains folder: `docs/domains/`
- Policies folder: `docs/policies/`
- ERDs folder: `docs/design/`
```

폴더명과 위치는 모두 인터뷰 중 사용자가 원하는 대로 바꿀 수 있습니다 (예: `domains` → `contexts`, `policies` → `rules`).

## 주의

- **개인 트랙입니다.** `agent-cowork`와 달리 품질 보증이나 인터페이스 일관성을 보장하지 않습니다. 변경이 잦을 수 있으니 필요하면 버전을 고정 사용하세요.
- **스킬 간 결합도는 낮습니다.** 상위 참조(링크) 외에는 서로 의존하지 않으며 각각 독립적으로 사용 가능합니다.

## 라이선스

[MIT](../LICENSE).
