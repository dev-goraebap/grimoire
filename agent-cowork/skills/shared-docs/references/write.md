# write

공유 문서를 작성·수정하고 원격에 반영한다. **GitHub Flow 기본**.

## GitHub Flow 한 줄 요약

`main`은 항상 배포 가능 상태로 유지. 변경은 short-lived 브랜치에서 만든 뒤 PR로 main에 머지. 작은 수정은 main 직접 push 허용.

## 큰 수정 vs 작은 수정 판단

| 분류 | 기준 | 흐름 |
|---|---|---|
| **작은 수정** | 변경 줄 수 ≤ `small_edit_threshold` (기본 20) AND 단일 파일 AND 의미 변경 없음(오타/포맷/문구 다듬기) | main 직접 push |
| **큰 수정** | 그 외 — 새 페이지, 구조 변경, 정책 변경, 다파일 동시 수정 | feature 브랜치 + PR |

판단이 애매하면 **항상 큰 수정으로 분류**(PR 강제). 문서는 한번 머지되면 팀 전체의 source-of-truth가 되니 보수적으로.

자동 판단 후에도 사용자에게 한 번 확인:

```
변경 분석: 12줄 수정, 1파일 (onboarding.md). "작은 수정"으로 판정.
→ main 직접 push로 진행할까요? (y / 브랜치+PR로 전환)
```

## 작은 수정 흐름 (main 직접)

```bash
# submodule로 진입
cd <path>

# main 최신화 (sync 직후 detached HEAD일 수 있음)
git checkout main
git pull origin main

# 파일 수정 (사용자가 직접 또는 에이전트가 편집)

# 커밋 + push (Conventional Commits 권장)
git add <files>
git commit -m "docs: fix typo in onboarding.md"
git push origin main

# 부모 레포로 복귀하여 새 sha bump
cd -
git add <path>
git commit -m "chore: bump shared-docs to <short-sha>"
```

main push가 거부되면(보호 브랜치) 자동으로 큰 수정 흐름으로 전환 제안:

```
main push가 거부됐습니다 (보호 브랜치). 
브랜치+PR 흐름으로 전환할까요? (y / 취소)
```

## 큰 수정 흐름 (브랜치 + PR/MR)

> **용어**: GitHub은 **PR (Pull Request)**, GitLab은 **MR (Merge Request)**. 본 문서에서는 명시 필요할 때만 구분하고, 일반 서술은 "PR"로 통칭한다.

### 공통 단계

```bash
# submodule로 진입 + main 최신화
cd <path>
git checkout main
git pull origin main

# feature 브랜치 생성
git checkout -b docs/<topic>

# 파일 수정 (한 PR = 한 주제. 가능하면 작은 atomic commit으로 쪼개기)
git add <files>
git commit -m "docs: <설명>"

# push
git push -u origin docs/<topic>
```

브랜치 이름 권장: `docs/<짧은-주제>` (예: `docs/api-versioning-policy`, `docs/onboarding-q2`).

### 호스트 감지 + PR 생성

push 후 `config.pr_tool`에 따라 분기:

- `pr_tool: "gh"` → GitHub, `gh` CLI 사용
- `pr_tool: "glab"` → GitLab(.com 또는 self-hosted), `glab` CLI 사용
- `pr_tool: "auto"` (기본) → `remote_url` 호스트로 추론
  - `github.com` → `gh`
  - `gitlab.com` 또는 `gitlab.*` 호스트 → `glab`
  - 그 외 → 사용자에게 한 번 묻기

CLI 미설치 시: push 응답에 호스트가 자동으로 띄워주는 PR/MR 생성 URL을 사용자에게 안내하고 거기서 직접 만들도록 위임.

#### GitHub (`gh`)

```bash
gh pr create \
  --base main \
  --head docs/<topic> \
  --title "docs: <설명>" \
  --body "<PR 본문>"

# draft로 시작하려면:
gh pr create --base main --draft --title "..." --body "..."
```

옵션 메모:
- `--head`는 생략 가능 (현재 브랜치 자동 인식)
- `--body-file <path>` — 본문이 길면 파일로
- `--reviewer <user>` — 리뷰어 지정 (선택)

#### GitLab (`glab`)

```bash
glab mr create \
  --target-branch main \
  --source-branch docs/<topic> \
  --title "docs: <설명>" \
  --description "<MR 본문>"

# draft (= WIP):
glab mr create --target-branch main --draft --title "..." --description "..."
```

옵션 메모:
- 옵션 이름이 GitHub과 다름:
  - `--base` → `--target-branch`
  - `--head` → `--source-branch` (생략 가능, 현재 브랜치)
  - `--body` → `--description`
  - `--body-file` → `--description-file`
- `--assignee <user>` — 담당자 (GitLab은 reviewer와 별개)
- `--label <label>` — 라벨

self-hosted GitLab은 `config.host_url`을 `glab`에 알려줘야 한다 — 다음 중 하나:

```bash
# (1) 환경 변수 (이번 호출에만)
GITLAB_URI="https://gitlab.example.com" glab mr create ...

# (2) glab 전역 설정 (한 번만)
glab config set -g gitlab_uri https://gitlab.example.com
```

이 스킬은 `config.host_url`이 있으면 (1) 환경 변수 방식을 명령에 자동으로 prefix해 호출 — 사용자의 전역 glab 설정을 건드리지 않는다.

PR/MR이 머지된 후 부모 레포 bump (아래 "부모 레포 bump" 섹션).

## PR 메시지 템플릿

```markdown
## 변경 내용
- 무엇을 바꿨는지 1-3줄

## 왜
- 어떤 결정/배경. 외부 링크(이슈, 회의록, ADR)가 있으면 함께

## 영향 범위
- 어떤 팀/레포에 영향이 가는지 (선택)
```

trailer(예: "Generated with Claude Code")는 사용자가 명시 요청할 때만 추가.

## 머지 (사용자 명시 동의 후)

머지 버튼은 **항상 사용자 손에** 있다. 이 스킬은 머지 명령을 자동 실행하지 않는다 — 사용자가 명시적으로 "머지해줘"라고 했을 때만 호스트별 명령으로 진행.

#### GitHub

```bash
# squash 머지 + 머지 후 브랜치 삭제 (가장 흔한 문서 레포 옵션)
gh pr merge <PR-번호-또는-현재-브랜치> --squash --delete-branch

# merge commit 유지가 필요하면:
gh pr merge --merge --delete-branch
```

#### GitLab

```bash
glab mr merge <MR-번호-또는-현재-브랜치> --squash --remove-source-branch

# merge commit 유지:
glab mr merge --remove-source-branch
```

옵션 차이:
- 브랜치 삭제: gh `--delete-branch` ↔ glab `--remove-source-branch`
- squash: 두 CLI 모두 `--squash`로 동일

**`--auto` (CI 통과 시 자동 머지)는 사용자가 명시 요청할 때만 사용**. 의존하면 의도하지 않은 시점에 머지가 들어가 부모 레포 bump 타이밍이 어긋남.

머지 직후 "부모 레포 bump" 단계를 자동으로 이어받음 (아래 섹션).

## 충돌 / 푸시 거부

| 상황 | 처리 |
|---|---|
| main 직접 push 거부 (보호 브랜치) | 큰 수정 흐름으로 전환 제안 |
| pull 시 conflict | submodule 안에서 수동 해결 (sync.md "충돌 시" 절차와 동일) |
| feature 브랜치 push 거부 (다른 사람이 같은 브랜치명 사용) | 다른 브랜치명 제안 (`docs/<topic>-2`) |
| **main force-push** | 절대 금지. 가드레일에서 차단 |

## 부모 레포 bump

PR이 머지되면 submodule의 main이 새 sha로 진행되지만, 부모 레포는 아직 옛 sha를 가리켜 "stale" 상태가 된다. 이를 자동으로 정리:

write 흐름의 마지막 단계로:

```bash
cd <path>
git checkout main
git pull origin main          # 머지된 새 commit 받기
cd -
git add <path>
git commit -m "chore: bump shared-docs to <short-sha>"
```

이후 부모 레포도 push 안내. 이 단계를 빠뜨리면 다음 sync 호출 시 doctor가 D5(stale)로 잡아준다.
