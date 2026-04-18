# config

shared-docs 스킬의 모든 동작은 다음 값을 **외부에서 주입**받는다. 본문이나 references에 절대 하드코딩하지 않는다 — 팀마다 경로 컨벤션이 다르고, 기본값을 박으면 그 기본값이 사실상 강제가 된다.

## Schema

| 키 | 필수 | 타입 | 기본 | 설명 |
|---|---|---|---|---|
| `path` | ✅ | string | — | submodule 마운트 경로. 예: `"docs/shared"`, `"docs-shared"`, `"ref/"`. 상대 경로만 허용 |
| `remote_url` | ✅ | string | — | 공유 문서 레포 URL. SSH(`git@host:org/repo.git`) / HTTPS 모두 허용 |
| `branch` | — | string | `"main"` | 추적할 브랜치. submodule이 따라갈 long-lived 브랜치 |
| `default_workflow` | — | enum | `"github-flow"` | 현재는 `github-flow`만 지원 (확장 여지) |
| `small_edit_threshold` | — | number | `20` | "작은 수정" 판정 기준. 변경 줄 수가 이 값 이하 + 단일 파일이면 main 직접 push 허용 |
| `pr_tool` | — | enum | `"auto"` | `"gh"` / `"glab"` / `"auto"`. auto는 `remote_url` 호스트로 추론 (github.com → gh, gitlab.\* / 사내 GitLab → glab) |
| `host_url` | — | string | — | self-hosted GitLab의 base URL. 예: `"https://gitlab.example.com"`. `pr_tool=glab`일 때 GitLab.com이 아니면 필수 (glab CLI에 전달) |

## 주입 우선순위 (위가 강함)

1. **CLI 인자** — 슬래시 호출 시 명시 (예: `/agent-cowork:shared-docs sync --branch=develop`). 1회성 오버라이드용
2. **프로젝트 config 파일** — `.claude/shared-docs.json` (1순위) → `package.json`의 `"shared-docs"` 필드 (2순위, 있으면)
3. **환경 변수** — `SHARED_DOCS_PATH`, `SHARED_DOCS_REMOTE_URL`, `SHARED_DOCS_BRANCH` (CI 환경 등)
4. **사용자에게 물음** — 마지막 fallback. 누락된 키만 한 번에 한 질문씩

## config 파일 위치

**기본 권장**: `.claude/shared-docs.json` — Claude 전용 디렉토리에 박는 게 깔끔하고 다른 도구와 충돌하지 않는다. `.gitignore`에 `.claude/`가 있다면 이 파일은 예외 처리(`.claude/shared-docs.json`만 추적) 안내.

**대안**: `package.json`의 `"shared-docs"` 필드 — 프론트엔드/Node 프로젝트에서 이미 `package.json`을 source-of-truth로 쓰면 자연스러움. 단, Java/Python 프로젝트는 `.claude/` 권장.

`pyproject.toml`이나 `Cargo.toml`에 박는 건 1차 지원 안 함. 필요하면 사용자가 `.claude/shared-docs.json`로 일원화.

## 검증

동작 시작 전 다음을 순서대로 검사. 실패 시 친절한 에러 + 빠진 키 + 예시 함께 표시.

1. **필수 키 존재** — `path`, `remote_url`이 비어있지 않은지
2. **path 형식** — 상대 경로 (`/`나 `C:\`로 시작 X), 빈 문자열 X, `..` 포함 X
3. **path 충돌** — 해당 디렉토리가 이미 git에 추적되고 있는데 submodule이 아니면 거부 (init 시점에만)
4. **remote_url 형식** — SSH(`user@host:path/repo.git`) 또는 HTTPS(`https://...`) 패턴
5. **branch 존재** — init/sync 시점에 `git ls-remote --heads <url> <branch>`로 검증

누락 fallback 메시지 예:

```
shared-docs config 누락: `remote_url`

다음 중 한 곳에 추가하세요:
  - .claude/shared-docs.json: { "remote_url": "git@gitlab.example.com:team/hr-docs.git" }
  - 환경 변수: export SHARED_DOCS_REMOTE_URL=...
  - CLI 인자: --remote-url=...
```

## 예시

`.claude/shared-docs.json`:

GitLab on-premise:

```json
{
  "path": "docs/shared",
  "remote_url": "git@gitlab.example.com:hoho/hr-docs.git",
  "branch": "main",
  "small_edit_threshold": 20,
  "pr_tool": "glab",
  "host_url": "https://gitlab.example.com"
}
```

GitHub:

```json
{
  "path": "docs/shared",
  "remote_url": "git@github.com:hoho/hr-docs.git",
  "branch": "main",
  "small_edit_threshold": 20,
  "pr_tool": "gh"
}
```

`package.json`에 박는 경우:

```json
{
  "name": "hoho-hr-web",
  "shared-docs": {
    "path": "docs/shared",
    "remote_url": "git@gitlab.example.com:hoho/hr-docs.git"
  }
}
```
