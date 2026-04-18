# agents-md-ops

**AGENTS.md 작성·큐레이션·유지보수**를 위한 도구 모음. 도구 중립 표준인 [AGENTS.md](https://agents.md)를 중심으로, 네이티브 지원이 없는 Claude Code/Gemini CLI용 브릿지도 함께 다룹니다.

## 이 플러그인의 설계 원칙

- **Earn its place.** 모든 섹션은 에이전트가 놓치거나 잘못 추측할 내용만 담는다. 빈 placeholder, 상투어, `package.json`/README/`git log`에서 읽을 수 있는 내용은 쓰지 않는다.
- **Curate, don't enumerate.** `## External Tools`는 설치된 모든 도구의 덤프가 아니다. 이 프로젝트에 실제로 필요한 것만 담는다.
- **Draft-first.** 분석 → 완성 초안 → 사용자 비판. 순차 인터뷰보다 한 번의 리뷰 루프가 낫다.
- **최소로 시작.** 필수 섹션은 2개뿐. 나머지는 실제 내용이 있을 때만 등장한다.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install agents-md-ops@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill draft-agents-md --skill refine-boundaries --skill audit-agents-md
```

## 포함된 스킬

AGENTS.md의 **생성 → 성장 → 유지보수** 라이프사이클을 세 스킬이 커버합니다.

| 스킬 | 역할 |
|---|---|
| [`draft-agents-md`](skills/draft-agents-md/SKILL.md) | **생성** — 프로젝트 분석 + 인벤토리 큐레이션으로 AGENTS.md 초안 작성 |
| [`refine-boundaries`](skills/refine-boundaries/SKILL.md) | **성장** — 에이전트 실수 1건마다 `## Boundaries`에 규칙 누적 |
| [`audit-agents-md`](skills/audit-agents-md/SKILL.md) | **유지보수** — 품질 진단 후 사용자 동의 기반 개선 |

### `draft-agents-md` (v0.1.0)

현재 프로젝트를 분석해 **AGENTS.md 초안**을 생성하고, 네이티브로 읽지 못하는 에이전트(Claude Code, Gemini CLI)용 브릿지 파일을 함께 만듭니다. 이름 그대로 **초안**이며, 이후 후속 스킬로 계속 다듬어나가는 것을 전제로 설계됐습니다.

**주요 동작:**

- **프로젝트 자동 분석** — `package.json` / `pyproject.toml` / `README.md` / `git log` / `.cursorrules` 등에서 신호 수집
- **스킬·MCP 인벤토리 스캔** — 전역·프로젝트 레벨에서 사용자가 접근 가능한 도구를 수집. Claude Code(skills.sh + 플러그인), Cursor, Windsurf, Gemini CLI, Codex CLI의 MCP 설정 경로를 모두 고려
- **큐레이션** — 인벤토리 중 프로젝트에 실제로 필요한 것만 `## External Tools`에 포함. 전역 도구는 분석 관련성이 확인될 때만 사전 선택
- **Draft-first 리뷰 루프** — 완성 초안을 제시하고 사용자 비판("여기를 이렇게 고쳐")에 따라 재작성. 인터뷰를 최소화
- **모드 A/B 자동 분기** — 신호가 충분하면 바로 초안, 빈약하면 "뭘 만들려고 하세요?" 한 질문만
- **브릿지 자동 생성** — Claude Code용 `CLAUDE.md` 또는 `.claude/CLAUDE.md`(위치는 사용자 선택) + Gemini CLI용 설정 가이드 출력
- **최소 2개 섹션** — `# Project Name` + overview, 빈 `## Boundaries` 3-tier 스켈레톤. 나머지(`External Tools`, `Git Workflow`, `References`, `Project Structure`, `Code Style`, `Testing`)는 실제 내용이 있을 때만 조건부 생성

**트리거 예시:**

```
AGENTS.md 만들어줘
이 프로젝트용 에이전트 규칙 생성해줘
/draft-agents-md
```

자세한 설계와 워크플로우는 [SKILL.md](skills/draft-agents-md/SKILL.md) 참조.

### `refine-boundaries` (v0.1.0)

AGENTS.md의 `## Boundaries` 섹션을 **프로젝트 수명 동안 지속적으로 성장**시키는 스킬. 사용자가 에이전트 실수를 지적하거나 규칙을 선언할 때 **자동 발화**하거나, `/refine-boundaries`로 명시 호출합니다.

**주요 동작:**

- **Auto-trigger** — "다시는 X 하지마", "never do Y", "always Z first" 같은 교정 발화 감지 시 자동 발화
- **3-tier 분류** — 되돌릴 수 없는 피해(Never) / 외부에 보이는 행동(Ask) / 기본 행동(Always)의 결정 트리 기반
- **인라인 vs 크로스커팅** — 토픽 특정적("코드 작성 시 ~") → 해당 섹션(Code Style, Testing, Git Workflow) 인라인, 모든 행동에 적용("시크릿 커밋 금지") → `## Boundaries`
- **Additive only** — 기존 규칙을 수정/제거하지 않음
- **1 호출 = 1 규칙** — 분류의 신중성을 위해

**트리거 예시:**

```
방금 실수했는데, .env 파일 커밋하면 안 되게 규칙으로 남겨줘
항상 커밋 전에 pnpm test 실행하는 걸로 해
/refine-boundaries
```

자세한 결정 트리는 [SKILL.md](skills/refine-boundaries/SKILL.md) 참조.

### `audit-agents-md` (v0.1.0)

AGENTS.md와 브릿지 파일을 모범 사례에 대조해 **진단·보고·동의 기반 개선**을 수행합니다. 진단 → 보고 → 동의 질문 → 승인된 것만 적용의 흐름.

**검사하는 이슈:**

- **Anti-pattern** — 자명한 조언(A1), Linter 중복(A2), 코드에서 읽을 수 있는 내용(A3), 오래된 경로(A4), 크로스툴 중복(A5), 잘못된 Boundaries(A6), 개인 설정 유출(A7)
- **Token efficiency** — 전체 길이(T1), 섹션 균형(T2), 브릿지 효율(T3)
- **Structure** — Boundaries 누락(S1), 브릿지 파일 누락(S2)
- **References** — 죽은 경로(R1)

**트리거 예시:**

```
AGENTS.md 검토해줘
규칙 점검 좀
/audit-agents-md
```

자세한 진단 항목과 워크플로우는 [SKILL.md](skills/audit-agents-md/SKILL.md) 참조.

## 로드맵

앞으로 추가 예정:

- **Stop hook 연동 실험** — 턴 종료 시 에이전트가 자체적으로 "실수했나?" 점검해 `refine-boundaries`를 자동 호출
- **스킬/MCP 정리 스킬** — `## External Tools`를 source of truth로 삼아 전역에 남아있는 미사용 도구 식별
- **섹션별 관리 스킬** — `/manage-refs`, `/manage-tools`, `/git-workflow` 등 각 섹션의 점진적 업데이트

## 라이선스

[MIT](../LICENSE).
