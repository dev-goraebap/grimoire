# agent-cowork

**팀 공개 지침(public rules) 작성·큐레이션·유지보수**를 위한 도구 모음. 두 트랙 1차 지원:

- **트랙 A (Multi-agent)** — 도구 중립 표준 [AGENTS.md](https://agents.md)를 source-of-truth로 두고, Claude Code/Gemini CLI는 한 줄짜리 브릿지로 연결
- **트랙 B (Claude-only)** — 루트 `CLAUDE.md` 자체가 공개 지침. 브릿지 불필요

## 이 플러그인의 설계 원칙

- **Earn its place.** 모든 섹션은 에이전트가 놓치거나 잘못 추측할 내용만 담는다. 빈 placeholder, 상투어, `package.json`/README/`git log`에서 읽을 수 있는 내용은 쓰지 않는다.
- **Curate, don't enumerate.** `## External Tools`는 설치된 모든 도구의 덤프가 아니다. 이 프로젝트에 실제로 필요한 것만 담는다.
- **Draft-first.** 분석 → 완성 초안 → 사용자 비판. 순차 인터뷰보다 한 번의 리뷰 루프가 낫다.
- **최소로 시작.** 필수 섹션은 2개뿐. 나머지는 실제 내용이 있을 때만 등장한다.
- **트랙은 사용자 선택.** 두 트랙은 우열이 아니라 팀 구성에 따른 선택. 자동 추측 금지.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install agent-cowork@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill draft-public-rules --skill refine-boundaries --skill audit-public-rules
```

## 포함된 스킬

공개 지침의 **생성 → 성장 → 유지보수** 라이프사이클을 세 스킬이 커버합니다.

| 스킬 | 역할 |
|---|---|
| [`draft-public-rules`](skills/draft-public-rules/SKILL.md) | **생성** — 프로젝트 분석 + 인벤토리 큐레이션으로 공개 지침 초안 작성 |
| [`refine-boundaries`](skills/refine-boundaries/SKILL.md) | **성장** — 에이전트 실수 1건마다 `## Boundaries`에 규칙 누적 |
| [`audit-public-rules`](skills/audit-public-rules/SKILL.md) | **유지보수** — 품질 진단 후 사용자 동의 기반 개선 |

### `draft-public-rules` (v0.2.0)

현재 프로젝트를 분석해 **공개 지침 초안**을 생성합니다. 트랙 A에서는 루트 `AGENTS.md` + Claude/Gemini 브릿지를, 트랙 B에서는 루트 `CLAUDE.md` 자체를 공개 지침으로 작성. 이름 그대로 **초안**이며, 후속 스킬로 계속 다듬어나가는 것을 전제로 설계됐습니다.

**주요 동작:**

- **Step 0: 트랙 결정** — 사용자에게 한 가지 질문(다양한 에이전트 → 트랙 A / Claude Code만 → 트랙 B). 자동 추측 금지
- **프로젝트 자동 분석** — `package.json` / `pyproject.toml` / `README.md` / `git log` / `.cursorrules` 등에서 신호 수집
- **스킬·MCP 인벤토리 스캔** — 전역·프로젝트 레벨에서 사용자가 접근 가능한 도구를 수집. Claude Code(skills.sh + 플러그인), Cursor, Windsurf, Gemini CLI, Codex CLI의 MCP 설정 경로를 모두 고려
- **큐레이션** — 인벤토리 중 프로젝트에 실제로 필요한 것만 `## External Tools`에 포함. **트랙 무관 동일 규칙**
- **Draft-first 리뷰 루프** — 완성 초안을 제시하고 사용자 비판("여기를 이렇게 고쳐")에 따라 재작성
- **모드 A/B 자동 분기** — 신호가 충분하면 바로 초안, 빈약하면 "뭘 만들려고 하세요?" 한 질문만 (트랙과는 별개의 결정)
- **트랙 A 한정**: Claude Code 브릿지(`CLAUDE.md` 또는 `.claude/CLAUDE.md`) 자동 생성 + Gemini CLI 설정 가이드 출력
- **트랙 B의 기존 CLAUDE.md 안전장치** — import-only / 메모성 / 본격 규칙으로 분류한 뒤 덮어쓰기 / 백업 후 진행 / 병합·취소만 제시 중 자동 분기

**트리거 예시:**

```
AGENTS.md 만들어줘
CLAUDE.md 만들어줘
공개 지침 초안 만들어줘
/agent-cowork:draft-public-rules
```

자세한 설계와 워크플로우는 [SKILL.md](skills/draft-public-rules/SKILL.md) 참조.

### `refine-boundaries` (v0.2.0)

공개 지침 파일(트랙 A: `AGENTS.md` / 트랙 B: `CLAUDE.md`)의 `## Boundaries` 섹션을 **프로젝트 수명 동안 지속적으로 성장**시키는 스킬. source 파일은 자동 감지(우선순위: AGENTS.md > CLAUDE.md). 사용자가 에이전트 실수를 지적하거나 규칙을 선언할 때 **자동 발화**하거나, `/refine-boundaries`로 명시 호출합니다.

**주요 동작:**

- **Auto-trigger** — "다시는 X 하지마", "never do Y", "always Z first" 같은 교정 발화 감지 시 자동 발화
- **3-tier 분류** — 되돌릴 수 없는 피해(Never) / 외부에 보이는 행동(Ask) / 기본 행동(Always)의 결정 트리 기반
- **인라인 vs 크로스커팅** — 토픽 특정적("코드 작성 시 ~") → 해당 섹션(Code Style, Testing, Git Workflow) 인라인, 모든 행동에 적용("시크릿 커밋 금지") → `## Boundaries`
- **트랙 자동 감지** — AGENTS.md 우선, 없으면 CLAUDE.md. import-only CLAUDE.md는 AGENTS.md를 source로 사용
- **Additive only** — 기존 규칙을 수정/제거하지 않음
- **1 호출 = 1 규칙** — 분류의 신중성을 위해

**트리거 예시:**

```
방금 실수했는데, .env 파일 커밋하면 안 되게 규칙으로 남겨줘
항상 커밋 전에 pnpm test 실행하는 걸로 해
/refine-boundaries
```

자세한 결정 트리는 [SKILL.md](skills/refine-boundaries/SKILL.md) 참조.

### `audit-public-rules` (v0.2.0)

공개 지침 파일을 모범 사례에 대조해 **진단·보고·동의 기반 개선**을 수행합니다. 트랙은 루트 파일 존재로 자동 감지하며, 보고 헤더에 `Detected track: X` 형태로 명시(사용자가 1초에 반박 가능). 진단 → 보고 → 동의 질문 → 승인된 것만 적용의 흐름.

**검사하는 이슈:**

- **Anti-pattern** — 자명한 조언(A1), Linter 중복(A2), 코드에서 읽을 수 있는 내용(A3), 오래된 경로(A4), 크로스툴 중복(A5, **트랙 A 한정**), 잘못된 Boundaries(A6), 개인 설정 유출(A7)
- **Token efficiency** — 전체 길이(T1), 섹션 균형(T2), 브릿지 효율(T3, **트랙 A 한정**)
- **Structure** — Boundaries 누락(S1), 브릿지 파일 누락(S2, **트랙 A 한정**)
- **References** — 죽은 경로(R1)
- **트랙 마이그레이션** — AGENTS.md/CLAUDE.md가 둘 다 본격 규칙으로 존재하면 통합 옵션 제시

**트리거 예시:**

```
AGENTS.md 검토해줘
CLAUDE.md 검토해줘
규칙 점검 좀
/agent-cowork:audit-public-rules
```

자세한 진단 항목과 워크플로우는 [SKILL.md](skills/audit-public-rules/SKILL.md) 참조.

## 로드맵

앞으로 추가 예정:

- **Stop hook 연동 실험** — 턴 종료 시 에이전트가 자체적으로 "실수했나?" 점검해 `refine-boundaries`를 자동 호출
- **스킬/MCP 정리 스킬** — `## External Tools`를 source of truth로 삼아 전역에 남아있는 미사용 도구 식별
- **섹션별 관리 스킬** — `/manage-refs`, `/manage-tools`, `/git-workflow` 등 각 섹션의 점진적 업데이트

## 라이선스

[MIT](../LICENSE).
