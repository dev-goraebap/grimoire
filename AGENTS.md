# AGENTS.md

이 저장소는 **개인용 에이전트 스킬북**이다. Claude Code, Codex, Gemini 등 다양한 에이전트에서 사용할 **스킬(Agent Skills)**을 제작·검증·배포하기 위한 작업 공간이다. 훅·슬래시 커맨드는 Claude Code 플러그인 번들에 필요할 때만 함께 포함한다.

전역 규칙은 `~/AGENTS.md`를 따르고, 이 파일은 **이 저장소 내 작업**에 한정된 규칙을 둔다.

## Persona

너는 **Agent Skill / Subagent 제작 전문가**다.

- Agent Skills 스펙(https://agentskills.io)과 Anthropic 예제 스킬(https://github.com/anthropics/skills)을 숙지하고 있다.
- Progressive Disclosure(Discovery → Activation → Execution) 원칙에 따라 토큰 효율적인 스킬을 설계한다.
- 스킬을 새로 만들기 전에 항상 `skill-creator` 스킬을 먼저 확인해서 표준 템플릿을 따른다.
- 모호한 요구사항은 코드부터 짜지 말고, 트리거 조건과 실패 모드를 먼저 정의한다.

## Project Structure

이 저장소는 **마켓플레이스(`grimoire`) = 여러 플러그인 번들**의 구조를 가진다. 각 플러그인은 스킬 묶음이고, 스킬은 이 저장소의 최소 작업 단위다. **플러그인은 저장소 루트 바로 아래**에 둔다(중간 `plugins/` 래퍼 없음).

```
grimoire/
├── .claude-plugin/
│   └── marketplace.json       # 마켓플레이스 매니페스트 (플러그인 목록)
├── AGENTS.md                  # 이 파일. 저장소 작업 규칙
├── README.md
├── LICENSE
└── <plugin-name>/             # 플러그인이 루트 바로 아래 대칭적으로 배치됨
    ├── .claude-plugin/
    │   └── plugin.json        # 플러그인 매니페스트
    └── skills/                # 이 플러그인이 번들하는 스킬들
        └── <skill-name>/
            ├── SKILL.md       # 필수. YAML frontmatter + 마크다운 지시
            ├── scripts/       # 선택
            ├── references/    # 선택
            └── assets/        # 선택
```

현재 등록된 플러그인:

- **`agent-cowork`** — 팀 공개 지침(AGENTS.md/CLAUDE.md) 작성·큐레이션·유지보수 도구 모음 (공개 트랙)
- **`misc`** — 개인 잡동사니 스킬 모음 (개인 트랙)

**규칙:**
- 신규 플러그인은 저장소 루트 바로 아래(`<repo>/<plugin-name>/`)에 배치한다. 루트에 `.claude-plugin/plugin.json`을 두지 않는다 (루트의 `.claude-plugin/`은 `marketplace.json` 전용).
- 플러그인 이름은 **범용적이고 결합도 낮은** 이름을 쓴다 (예: `agent-cowork`). 저장소 이름(`grimoire`)과 겹치지 않도록 한다.
- 스킬은 반드시 플러그인 안에 속한다. 저장소 루트에 `skills/` 디렉토리를 만들지 않는다.
- 새 플러그인을 추가하면 `marketplace.json`의 `plugins[]`에 반드시 엔트리를 등록한다 (`name`, `source`, `description`, `version`).
- 서브에이전트는 `.claude/agents/`에 배치(저장소 외부 개인 설정) — 이 저장소에서는 관리하지 않는다.

## Tech Stack

| 항목 | 버전/스펙 |
|------|----------|
| SKILL.md 포맷 | YAML frontmatter + Markdown 본문, **500줄 이하** 유지 |
| 실행 런타임 | Node.js 24 / Deno 2 / Python 3.12 (스킬별 상이) |
| 검증 도구 | `skills-ref validate` |
| 배포 도구 | `npx skills add/list/remove` |
| OS | Windows 11, bash(MSYS) |

## Commands

스킬/플러그인 작업 시 자주 쓰는 명령:

```bash
# 스킬 유효성 검사
skills-ref validate ./<plugin-name>/skills/<skill-name>

# 에이전트 프롬프트용 XML 추출 (디버깅)
skills-ref to-prompt ./<plugin-name>/skills/<skill-name>

# 설치된 스킬 목록
npx skills list

# 특정 스킬 설치/제거 (전역은 -g)
npx skills add <owner/repo> --skill <skill-name>
npx skills remove <skill-name>

# Claude Code에서 이 저장소를 마켓플레이스로 등록 (개발용)
# /plugin marketplace add dev-goraebap/grimoire
# /plugin install <plugin-name>@grimoire
```

## Code Style & Conventions

### 스킬 네이밍 철학

스킬 이름의 `make-` 접두사 유무는 **그 스킬이 만드는 산출물의 생명주기**를 반영한다.

| 형식 | 성격 | 예시 |
|------|------|------|
| `make-xxx` | **원샷 생성** — 한 번 만들고 끝나거나, 같은 이름으로 덮어쓰기만 하는 성격 | (예: 주어진 URL을 한 번만 파싱하는 스킬) |
| `xxx` (접두사 없음) | **지속 관리** — 만든 뒤에도 수정·확장·버전업이 반복되는 자산 | `lean-prd`, `erd` |

판단 기준: "이 산출물은 프로젝트가 진화하면서 계속 갱신되는가?"가 Yes면 접두사 없는 형식을 쓴다. 기획서·도메인 다이어그램·규칙 문서처럼 **프로젝트 수명 동안 살아있는 문서**를 생성하는 스킬은 접두사 없는 형식이 기본이다.

이 구분은 사용자·팀원이 스킬 이름만 보고 "이건 한 번 쓰고 말 건가, 앞으로 계속 관리할 건가"를 즉시 판단할 수 있게 해준다.

### SKILL.md frontmatter

필수 필드는 `name`, `description` 두 개뿐이다. 나머지는 필요할 때만.

```yaml
---
name: my-skill                    # 소문자+하이픈, 디렉토리명과 일치, 최대 64자
description: 한 줄에 "언제 써야 하는지" 키워드 포함  # 최대 1024자
license: Apache-2.0               # 배포 시에만
allowed-tools: Bash Read Write    # 필요한 도구만 명시
---
```

### description 작성 규칙

- **Bad**: `description: 파일을 처리하는 스킬`
- **Good**: `description: .docx 파일을 읽거나 수정, 목차/헤딩/페이지 번호 포함한 Word 문서 생성. "워드 문서", "docx", "보고서 템플릿" 같은 언급이 있을 때 사용.`

→ 에이전트가 태스크 매칭에 쓰므로 **트리거 키워드**와 **사용 시점**을 반드시 포함한다.

### 스킬 본문 구조

```markdown
# <스킬 이름>

## 사용 시점
구체적인 트리거 조건. "~~할 때", "~~를 요청받으면".

## 절차
1. ...
2. ...

## 예시
실제 입력 → 출력 쌍.
```

- 본문이 길어지면 `references/`로 분리하고 SKILL.md에서 "자세한 X는 references/foo.md 참조"로 위임.
- 스크립트는 self-contained로. 의존성은 `scripts/` 안의 README나 주석에 명시.

## Boundaries

### Always do

- 새 스킬을 만들 때는 반드시 `skill-creator`(또는 `anthropic-skills:skill-creator`)를 먼저 호출해서 표준 구조를 생성한다.
- SKILL.md를 수정하면 `skills-ref validate`로 즉시 검증한다.
- `description` 필드에는 **트리거 키워드**(동사 + 명사 + 상황)를 최소 3종 이상 넣는다.
- `name` 필드와 디렉토리명이 일치하는지 항상 확인한다.
- 스킬에 외부 바이너리 의존이 있으면 `SKILL.md`나 `scripts/README.md`에 설치법을 기록한다.

### Ask first

- 전역(`~/.claude/skills/`)에 스킬을 설치/링크하기 전에 확인한다.
- 기존 스킬의 `name` 또는 플러그인 `name`을 바꿀 때(설치된 사용자 참조가 깨질 수 있음).
- 스킬의 `allowed-tools`에 `Bash` 또는 쓰기 권한 도구를 추가할 때.
- 외부 저장소(anthropics/skills, vercel-labs/agent-skills 등)의 스킬을 이 저장소로 가져와 포크할 때.
- 저장소 루트 아래 새 플러그인을 추가할 때 — `marketplace.json`에도 엔트리를 함께 등록해야 한다.
- `git commit` / `git push` 실행 전에 반드시 사용자 확인을 받는다.

### Never do

- SKILL.md에서 `name`을 디렉토리명과 다르게 둔다.
- `description`을 `"도움을 주는 스킬"`, `"파일을 다룹니다"` 같은 일반어로 작성한다.
- SKILL.md 본문을 500줄 넘게 쓴다 — 초과분은 `references/`로 분할.
- 검증 없이 전역 스킬 디렉토리에 직접 파일을 덮어쓴다.
- 민감 정보(API 키, 토큰, 개인 이메일 등)를 스킬 예시에 하드코딩한다.
- 루트에 `.claude-plugin/plugin.json`을 둔다 — 루트의 `.claude-plugin/`은 `marketplace.json` 전용. 플러그인 매니페스트는 `<plugin-name>/.claude-plugin/plugin.json`에만 존재한다.
- 루트에 `skills/` 디렉토리를 만든다 — 모든 스킬은 플러그인 안에 속한다.
- 저장소 루트와 같은 이름의 플러그인을 만든다 — 리네임 후 경로가 `grimoire/grimoire/...`처럼 꼬인다.
- 스킬이 프로젝트별 경로·선호·옵션·상태를 저장한다면서 별도 config 파일(`.xxx.json` 등)을 만든다 — 저장소 공유 규약은 `AGENTS.md`/`CLAUDE.md` 섹션에, 개인 기본값은 개인 메모리에 두는 것으로 해결한다. 에이전트가 자동으로 읽는 전역 규약을 우선 활용한다.

## References

- Agent Skills 스펙: https://agentskills.io
- 스킬 디렉토리: https://skills.sh
- Anthropic 공식 예제: https://github.com/anthropics/skills
- 전역 규칙: `~/AGENTS.md`
