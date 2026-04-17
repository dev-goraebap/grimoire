---
name: draft-agents-md
description: >
  현재 프로젝트를 분석하고, 사용자가 지금 접근 가능한 전역/프로젝트 스킬
  및 MCP 인벤토리를 함께 파악해서 **이 프로젝트에 실제로 필요한 것만**
  큐레이트한 AGENTS.md 초안을 생성한다. Draft-first: 분석 → 완성된 초안
  한 번에 제시 → 사용자 비판으로 iterate. 신호가 빈약하면 "뭘 만들려고
  하세요?" 한 가지만 묻는다. 네이티브로 AGENTS.md를 못 읽는 Claude Code
  /Gemini CLI용 브릿지 파일도 함께 생성. AGENTS.md는 "초안"이라는 이름
  그대로 완성형이 아니며, 후속 스킬(Boundaries 누적, 스킬/MCP 정리 등)
  로 계속 개선하는 것을 전제로 한다.
  Triggers: "create AGENTS.md", "draft AGENTS.md", "generate AGENTS.md",
  "set up project rules", "initialize agent config", "agent onboarding",
  "AGENTS.md 만들어줘", "AGENTS.md 초안", "에이전트 규칙 생성",
  "프로젝트 규칙 설정".
  새 프로젝트를 시작하거나, AI 에이전트를 온보딩하거나, 프로젝트를
  AGENTS.md 표준으로 전환할 때 사용.
metadata:
  author: dev-goraebap
  version: "0.1.0"
---

# draft-agents-md

현재 프로젝트를 분석해 **AGENTS.md 초안**을 생성하고, 네이티브로 읽지 못하는 에이전트용 브릿지 파일을 함께 만든다. 이름 그대로 **초안**이며, 생성 후에도 후속 스킬로 계속 다듬어나가는 것을 전제로 한다.

AGENTS.md는 60,000개 이상의 프로젝트가 채택한 **도구 중립 표준**. 한 번 쓰면 Cursor, GitHub Copilot, Codex CLI, Windsurf 등 30+ 에이전트가 자동으로 읽는다. Claude Code와 Gemini CLI는 한 줄짜리 브릿지 파일만 있으면 된다.

## 철학

- **Earn its place.** 모든 섹션은 에이전트가 놓치거나 잘못 추측할 내용만 담는다. 빈 placeholder, 상투어, `package.json`/README/`git log`에서 읽을 수 있는 내용은 쓰지 않는다.
- **Curate, don't enumerate.** `## External Tools`는 설치된 모든 스킬/MCP의 덤프가 아니다. **이 프로젝트에서 실제로 필요하거나 다른 개발자가 알아야 할 것만** 담는다.
- **Draft-first.** 분석 → 완성 초안 → 사용자 비판. 9단계 순차 인터뷰보다 한 번의 리뷰 루프가 낫다.
- **최소로 시작.** 필수 섹션은 2개뿐. 나머지는 실제 내용이 있을 때만 등장한다.

## 범위

**In scope:**
- 프로젝트 분석 + 설치된 스킬/MCP 인벤토리 수집
- 인벤토리 중 이 프로젝트에 관련된 것만 큐레이트
- AGENTS.md 초안 생성 (필요 시 최소 형태)
- 신호가 빈약하면 한 가지 질문을 던짐
- Claude Code 브릿지(`CLAUDE.md` 또는 `.claude/CLAUDE.md`) 생성
- Gemini CLI 설정 가이드 **출력** (외부 파일은 건드리지 않음)
- 초안에 대한 사용자 비판 기반 iteration

**Out of scope:**
- 개별 섹션의 장기 관리 (Boundaries 정제, References 관리 등 — 별도 스킬)
- 흩어진 기존 config 통합 (별도 migrate 스킬)
- 설치된 스킬/MCP 실제 정리 (AGENTS.md를 source of truth로 쓰는 별도 cleanup 스킬 예정)
- 개인/사적 설정 (`*.local.md` 계열)

## 가드레일

| # | 확인 | 실패 시 |
|---|---|---|
| 1 | CWD가 사용자가 스캐폴딩하려는 디렉토리인가 | 진행 — git 여부 강제 X. 개인 scratch 프로젝트도 유효 |
| 2 | `AGENTS.md`가 이미 존재하는가 | 사용자에게 문의: 덮어쓰기 / 병합 / 취소 |

## 언어 정책

생성되는 `AGENTS.md`에서 **구조적 요소만 영어 고정**, 나머지는 **사용자 언어**를 따른다. 사용자 언어는 현재 세션의 최근 메시지에서 감지.

| 요소 | 언어 |
|---|---|
| 모든 헤딩(`#`, `##`, `###`) | **영어 고정** — 에이전트/툴이 `## Boundaries` 같은 정확한 문자열을 찾을 수 있어야 함 |
| 3-tier 서브헤딩(`### Always do` / `### Ask first` / `### Never do`) | **영어 고정** — 후속 스킬(Boundaries 누적 등)이 파싱하는 구조 |
| `## External Tools`의 `### {name} ({type})` 헤딩 | **영어 고정** — `(MCP)`, `(Skill)` 라벨 포함 |
| overview 본문 | 사용자 언어 |
| 각 섹션의 설명/규칙/예시 문장 | 사용자 언어 |
| HTML 주석(`<!-- ... -->`) | 사용자 언어 |
| 코드 블록 내 명령/식별자 | 원본 그대로 |

브릿지 파일(`CLAUDE.md`)은 `@AGENTS.md` 한 줄이라 언어 무관.

사용자 대면 대화 메시지(질문, diff 표시, 요약)도 모두 사용자 언어로.

## 워크플로우

### Step 1: 프로젝트 분석

병렬로 신호 수집. 원본 분석을 AGENTS.md에 그대로 붙여넣지 말 것 — 출력은 에이전트가 *추론해야 할* 것이지, *발견한 것 전부*가 아니다.

| 소스 | 수집할 신호 |
|---|---|
| `package.json` / `pyproject.toml` / `pom.xml` / `Cargo.toml` / `go.mod` / `Gemfile` | 프로젝트 이름, 프레임워크, 주요 의존성 |
| `README.md` (첫 ~40줄) | 프로젝트 목적 (복사 금지, 패러프레이즈) |
| `.claude/skills/`, `.cursor/rules/` | 프로젝트 레벨 에이전트 스킬 |
| `.mcp.json`, `.cursor/mcp.json` | 프로젝트 레벨 MCP 설정 |
| `git log --oneline -20` (git 저장소) | 커밋 메시지 패턴 |
| `.github/workflows/`, 브랜치 목록 | CI, 머지 정책 힌트 |
| 기존 `.cursorrules`, `copilot-instructions.md`, `CLAUDE.md` 본문 | 이관 가치 있는 기존 규칙 |

### Step 2: 스킬 / MCP 인벤토리 스캔

전역 + 프로젝트 레벨에서 **사용자가 지금 접근 가능한 도구**를 전부 수집한다. 두 가지 배포 경로를 모두 고려:

#### 스킬 스캔 경로

| 경로 | 스코프 | 배포 방식 |
|---|---|---|
| `~/.claude/skills/` | 전역 | skills.sh (`npx skills add -g`) + 수동 설치 |
| `~/.claude/plugins/*/skills/` | 전역 | Claude 마켓플레이스 플러그인 |
| `.claude/skills/` | 프로젝트 | skills.sh + 수동 |
| `.claude/plugins/*/skills/` | 프로젝트 | Claude 플러그인 |
| `~/.cursor/rules/`, `.cursor/rules/` | 전역/프로젝트 | Cursor MDC |
| `~/.windsurf/rules/`, `.windsurf/rules/` | 전역/프로젝트 | Windsurf |

각 `SKILL.md`에서 `name`과 `description`을 뽑아 인벤토리에 담는다.

#### MCP 스캔 경로

| 에이전트 | 전역 | 프로젝트 |
|---|---|---|
| Claude Code | `~/.claude/settings.json`, `~/.claude.json` | `.mcp.json`, `.claude/settings.json`, `.claude/settings.local.json` |
| Cursor | `~/.cursor/mcp.json` | `.cursor/mcp.json` |
| Gemini CLI | `~/.gemini/settings.json` | `.gemini/settings.json` |
| Codex CLI | `~/.codex/config.toml` | (프로젝트 레벨 없음) |
| Windsurf | `~/.windsurf/config.json` | `.windsurf/config.json` |

각 config에서 MCP 서버의 이름 + 용도 힌트(command/args)를 뽑는다. 모든 에이전트를 다 스캔하되, 없는 경로는 조용히 넘어간다.

#### 인벤토리 결과

수집 결과를 다음 형태로 내부에 유지:

```
SKILLS:
  Global (skills.sh):    [skill-a, skill-b, ...]
  Global (plugin):       [plugin-skill-1, ...]
  Project:               [project-skill-1, ...]

MCPs:
  Global (Claude Code):  [pencil, gmail, ...]
  Global (Cursor):       [...]
  Project (.mcp.json):   [...]
```

### Step 3: 모드 결정

Step 1의 프로젝트 분석을 자체 평가: **"사용자가 추측하지 않아도 될 만큼 초안을 쓸 수 있는가?"**

- **Yes → Mode A (detected).** Step 4로.
- **No → Mode B (sparse).** 정확히 한 가지만 질문:

  > 이 프로젝트에서 뭘 만들려고 하세요? 한 줄로 알려주시면 초안을 만들어볼게요.

  답변을 받아 Step 4의 분석 결과 대신 사용.

임계치(파일 수 등)를 하드코딩하지 말 것. 애매하면 **Mode B 선호** — 짧은 질문 한 번이 잘못된 초안보다 싸다.

Step 2의 인벤토리는 Mode A/B 판단에 쓰지 않는다 (프로젝트의 성격과 무관).

### Step 4: 초안 작성 + 사전 큐레이션

인벤토리를 **사전 필터링**해서 초안의 `## External Tools`에 담는다. 규칙:

| 감지 위치 | 기본 선택 |
|---|---|
| 프로젝트 레벨 config | ✅ **선택됨** (팀원이 알아야 할 가능성 높음) |
| 전역이지만 분석에서 관련성 확인 | ✅ **선택됨** (예: Java 프로젝트에 `obsidian-md` 스킬 → 무관, Next.js 프로젝트에 `svelte` MCP → 무관) |
| 전역이고 관련성 불명확 | ❌ **선택 안 됨** (개인 도구일 가능성) |

선택된 것만으로 섹션 규칙에 따라 AGENTS.md 전체를 생성한다. 섹션별로 쪼개지 말고 **완성된 파일**을 제시.

### Step 5: 리뷰 + 큐레이션 확인

초안 + 인벤토리 큐레이션 결과를 함께 보여주고 비판을 받는다:

```
[초안 전체]

## External Tools 큐레이션
자동으로 아래 {N}개를 포함했습니다 (근거: 프로젝트 레벨 또는 분석 관련성):

  ✅ svelte (MCP)              - .mcp.json에 선언됨
  ✅ audit-rules (Skill)       - .claude/skills/에 있음

추가 후보 (선택 안 됨):
  ⏸  pencil (MCP, 전역)         - 디자인 도구. 이 프로젝트에 필요?
  ⏸  gws-gmail (MCP, 전역)      - Gmail. 이 프로젝트에 필요?
  ... (최대 10개까지, 나머지는 "(외 {M}개)")

어떻게 할까요?

  1. 좋음 — 이대로 저장
  2. 고칠 부분 있음 — 어디를 어떻게 (자유 기술)
  3. 도구 선택 변경 — 추가할 이름 / 뺄 이름
  4. 다시 — 이 관점을 강조해서 ({강조점})
  5. 취소
```

### Step 6: Iteration

- `2` → 지정된 부분만 수정, 업데이트된 **전체 파일** 다시 제시, Step 5로.
- `3` → 사용자가 지정한 도구 추가/제거 반영, 전체 파일 다시 제시, Step 5로.
- `4` → 새 강조점으로 재작성, Step 5로.
- `1` → 디스크에 쓰기, Step 7로.
- `5` → 조용히 중단.

**반복 시 Step 1 분석과 Step 2 인벤토리 재실행 금지.** 이미 수집한 데이터로 초안만 재생성한다.

### Step 7: 브릿지

```
Claude Code는 AGENTS.md를 직접 읽지 않습니다. 브릿지를 어디에 둘까요?

  a) .claude/CLAUDE.md   (개인별, .gitignore에 추가)
  b) CLAUDE.md           (저장소 루트, 팀 공유)
```

- `a` → `.claude/CLAUDE.md`에 `@../AGENTS.md` 한 줄. `.gitignore`에 `.claude/` 없으면 추가.
- `b` → `CLAUDE.md` (루트)에 `@AGENTS.md` 한 줄.

Gemini CLI 가이드는 **출력만** 한다 (외부 config 금지):

```
Gemini CLI 사용자는 ~/.gemini/settings.json에 다음을 추가하면 AGENTS.md를 자동으로 읽습니다:
  "context": { "fileName": ["AGENTS.md", "GEMINI.md"] }
```

### Step 8: 요약

```
완료:
  - AGENTS.md ({N}줄) — External Tools에 {K}개 도구 선언됨
  - {브릿지 경로}

다음에 할 수 있는 것:
  - 에이전트가 실수할 때마다 Boundaries에 누적 → 같은 실수 반복 방지
  - AGENTS.md에 선언된 도구를 기준으로 전역 스킬/MCP 정리
    (향후 별도 스킬이 생기면 여기서 안내)
```

## 섹션 규칙

### 항상 포함 (2개)

1. **`# {Project Name}` + 1–3문장 overview.** *무엇이고 누구를 위한 것인지* 서술. *어떻게 빌드하는지*는 쓰지 않는다.
2. **`## Boundaries`** — 빈 3-tier 스켈레톤. 헤딩은 영어 고정, 주석은 사용자 언어. 한국어 예:

   ```markdown
   ## Boundaries

   ### Always do

   ### Ask first

   ### Never do

   <!-- 에이전트가 실수할 때마다 여기에 규칙을 누적하세요.
        Error-driven growth: 에이전트가 선을 넘었을 때 교정 내용을
        기록해두면, 다음 에이전트가 같은 실수를 반복하기 전에
        이 섹션을 읽고 참고합니다. -->
   ```

### 조건부 — 실제 내용이 있을 때만 포함

| 섹션 | 포함 조건 |
|---|---|
| `## External Tools` | **Step 4의 큐레이션 결과가 1개 이상**. 각 항목은 `### {name} ({type})` 헤딩 + 1줄 설명 |
| `## Git Workflow` | `git log`에서 명확한 커밋 패턴(Conventional Commits, 티켓 prefix) 감지 |
| `## References` | 리뷰 루프에서 사용자가 spec/ADR/design doc 명시 |
| `## Project Structure` | 다중 모듈 + 비자명한 컨벤션 (source of truth, 생성 디렉토리, 수정 금지 영역) |
| `## Code Style` | linter/formatter가 강제하지 않는 스타일 규칙이 드러남 |
| `## Testing` | 비자명한 테스트 컨벤션 (mock 정책, fixture 위치, 단일 실행 명령) |

조건부 섹션이 하나도 해당하지 않으면 AGENTS.md는 `# Project Name` + overview + `## Boundaries`만으로 완성. **유효하고 완결된 결과** — 실패가 아니다.

### `## External Tools` 포맷 예시

```markdown
## External Tools

### svelte (MCP)

Svelte 5 문서/진단/자동수정. `list-sections`로 목차 확인 후 `get-documentation`
으로 필요한 섹션을 가져오고, `svelte-autofixer`를 모든 Svelte 코드에 적용한다.

### audit-rules (Skill)

AGENTS.md 품질 진단 및 브릿지 연결성 체크. AGENTS.md나 브릿지 수정 후 실행한다.
```

각 항목은 **도구 이름 + 타입 + 이 프로젝트에서의 사용 맥락** 1–3줄. 일반적인 도구 설명은 쓰지 않는다.

## 작성 원칙 (생성할 AGENTS.md 본문 대상)

- **상투어 금지.** "write clean code", "follow best practices" → 삭제.
- **코드에서 읽을 수 있는 내용 금지.** 기술 스택 나열, 의존성 버전, 디렉토리 트리, 복사된 `package.json` scripts — 에이전트는 원본을 직접 읽는다.
- **목표 150줄 이하, 상한 300줄.** 150을 넘으면 위 두 규칙을 어긴 것.
- **명령형.** "X를 Y보다 먼저 실행한다." "X를 실행하는 것이 권장됩니다" 금지.
- **규칙 하나당 한 문장** 지향.

## 금지 행동

- 5섹션 템플릿을 채우기 위해 빈 placeholder 섹션 생성하기
- `README.md` 내용을 overview에 그대로 복사하기 (1–3문장 패러프레이즈)
- 헤딩을 사용자 언어로 번역하기 (`## 경계` ❌, `## Boundaries` ✅)
- 본문/주석/설명을 영어로 강제하기 (사용자 언어 존중)
- **인벤토리 전체를 `## External Tools`에 덤프하기** (Curate, don't enumerate)
- 분석 관련성 없는 전역 도구를 사용자 확인 없이 기본 선택하기
- Iteration 시 분석(Step 1)이나 인벤토리(Step 2)를 다시 실행하기 — 재작성만 한다
- `~/.gemini/settings.json` 등 외부 에이전트 config 수정하기 (가이드 출력만)
- 설치된 스킬/MCP 파일을 실제로 수정/삭제하기 (이 스킬은 읽기 전용)
