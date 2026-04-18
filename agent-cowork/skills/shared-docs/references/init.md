# init

새 공유 문서 레포를 만들고(선택) 현재 레포에 submodule로 연결한다. 인증·경로·원격 URL은 모두 [config](config.md)에서 받는다.

## 두 가지 모드

| 모드 | 상황 | 동작 |
|---|---|---|
| `init --create` | 공유 문서 레포가 아직 없음 | 신규 레포 스캐폴딩 + 첫 커밋 + 원격 push + 현재 레포에 submodule 추가 |
| `init` (기본) | 공유 문서 레포가 이미 존재 | 현재 레포에 submodule 추가만 |

호출 예: `/agent-cowork:shared-docs init` 또는 `init --create`.

## 사전 체크

| # | 확인 | 실패 시 |
|---|---|---|
| 1 | config 검증 통과 ([config.md](config.md)의 검증 절차) | 에러 메시지 + 누락 키 안내, 중단 |
| 2 | 현재 디렉토리가 git 저장소 (`git rev-parse --git-dir`) | "현재 디렉토리는 git 저장소가 아닙니다. `git init` 후 다시 시도하세요." |
| 3 | config의 `path` 위치가 비어있거나 미존재 | 디렉토리가 이미 있고 비어있지 않으면 사용자 확인: 덮어쓰기 / 다른 path / 취소 |
| 4 | `.gitignore`에 `path`가 무시 대상이 아닌지 | 무시 중이면 경고 + 사용자 확인 (submodule은 추적 대상이어야 함) |
| 5 | 원격 인증 ping (SSH는 `ssh -T <host>`, HTTPS는 `git ls-remote <url>`) | 인증 가이드(아래 "인증" 섹션) 안내 후 중단 |

## --create 모드: 새 공유 문서 레포 스캐폴딩

원격 호스트(GitLab/GitHub)에서 빈 레포는 사용자가 직접 만들고 URL을 config에 넣어야 한다 — 이 스킬은 호스트 API를 호출하지 않는다 (인증·권한 복잡도 회피).

워크플로우:

1. 사용자에게 빈 원격 레포 생성 안내:
   ```
   빈 공유 문서 레포가 필요합니다. 다음을 수행하세요:
     1. <호스트>에서 빈 레포 생성 (README/.gitignore/license 없이)
     2. URL을 .claude/shared-docs.json의 remote_url에 입력
     3. 준비됐으면 'ok' 입력
   ```
2. `ok` 받으면 임시 디렉토리에 `git init -b main`
3. 최소 스캐폴딩 파일 생성:
   - `README.md`: `# <레포명>\n\n이 레포는 <부모 프로젝트들>이 공유하는 문서를 담습니다.\n` (1-2줄)
   - `.gitignore`: 비워두거나 OS 메타(`.DS_Store`, `Thumbs.db`)만
4. `git add . && git commit -m "chore: initialize shared-docs repo"`
5. `git remote add origin <remote_url>`
6. `git push -u origin main`
7. 임시 디렉토리 제거 후 아래 "submodule 추가" 단계로 이어짐

## submodule 추가

```bash
git submodule add -b <branch> <remote_url> <path>
git commit -m "feat: add shared-docs submodule at <path>"
```

주의:

- `<path>`는 config의 `path` 그대로 사용 (변환·정규화 금지 — 팀이 정한 경로를 존중)
- `-b <branch>`는 추적 브랜치 명시 (없으면 detached HEAD로 시작해 sync가 꼬임)
- 명령 실행 후 `.gitmodules`가 자동 생성되며 부모 레포 루트에 위치 — 커밋에 포함되는지 확인
- 부모 레포의 staging에 `.gitmodules` + `<path>` 두 개가 함께 add되어야 함

완료 후 사용자에게 다음 안내:

```
✅ shared-docs submodule 추가 완료
  path:   <path>
  branch: <branch>
  remote: <remote_url>

다음에 할 수 있는 것:
  - 다른 협업자: git clone --recurse-submodules <부모 레포 URL>
  - 이미 clone한 협업자: git submodule update --init
  - 갱신: /agent-cowork:shared-docs sync
```

## 인증

두 가지 인증을 분리해서 본다 — **git 인증** (clone/push에 필요)과 **PR 도구 인증** (`gh`/`glab` CLI에 필요). 둘은 별개라 하나가 통과해도 다른 게 막힐 수 있다.

### git 인증 (필수)

submodule add는 fetch를 동반하므로 git 인증이 우선 필요.

| 방식 | 가이드 |
|---|---|
| **SSH (권장)** | `~/.ssh/config`에 호스트 매핑, `ssh-add -l`로 키가 ssh-agent에 등록됐는지 확인. GitLab on-premise는 사내 호스트명을 정확히 매핑 |
| **HTTPS** | git credential helper 설정 (`git config --global credential.helper manager-core` (Windows) / `osxkeychain` (macOS) / `store` (Linux 임시)). GitHub/GitLab 모두 personal access token 사용 |
| **GitLab on-premise** | SSH 권장. 브라우저 OAuth 흐름 없이 무인 동작 가능. CI 자동화에도 유리 |

git 인증 실패 시 메시지:

```
원격 fetch 실패: <url>

가능한 원인:
  - SSH 키가 ssh-agent에 없음 → ssh-add ~/.ssh/id_ed25519
  - 호스트가 known_hosts에 없음 → ssh -T <host>로 한 번 접속
  - HTTPS 자격증명 누락 → personal access token 발급 후 git credential 등록
```

### PR 도구 인증 (write 동작에 필요)

`init` 자체는 PR을 만들지 않으므로 옵션이지만, write 동작을 미리 동작 가능하게 하려면 함께 셋업 권장.

#### GitHub: `gh`

```bash
gh auth status                              # 현재 인증 상태 확인
gh auth login                               # 인증 (HTTPS/SSH/web 선택)
gh auth login --hostname github.com --web   # 명시적
```

#### GitLab: `glab`

GitLab.com:

```bash
glab auth status
glab auth login --hostname gitlab.com
```

self-hosted GitLab:

```bash
# config.host_url이 있으면 그 값을 그대로 전달
glab auth login --hostname gitlab.example.com

# 토큰 인증 (CI/무인 환경)
GITLAB_TOKEN="<personal-access-token>" glab auth login \
  --hostname gitlab.example.com --token
```

CLI 미설치 환경:

| 호스트 | 설치 |
|---|---|
| `gh` | https://cli.github.com (Windows: `winget install GitHub.cli`) |
| `glab` | https://gitlab.com/gitlab-org/cli (Windows: `winget install glab`) |

CLI가 없으면 push 응답에 호스트가 띄워주는 PR/MR 생성 URL을 사용자에게 안내해 직접 만들도록 위임 — write 동작이 자동으로 fallback.

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `fatal: '<path>' already exists in the index` | 경로가 이미 git에 추적됨. `git rm -r --cached <path>` 후 다시 시도 (단, 추적 중인 실제 파일이 있으면 백업 먼저) |
| SSH 인증 실패 | `ssh -T <host>` 결과 확인. permission denied (publickey)면 키 등록, host key verification failed면 known_hosts 갱신 |
| 빈 원격 레포에 push 실패 | 호스트가 default branch를 다르게 잡았을 수 있음 (`master` vs `main`). `git push -u origin main`으로 명시 |
| `.gitmodules`와 실제 디렉토리 불일치 | doctor 실행으로 진단 (D2: `git submodule sync`로 자동 수정 가능) |
| Windows에서 경로 슬래시 | `.gitmodules`는 항상 forward slash. Git Bash가 자동 처리하지만 직접 편집 시 주의 |
