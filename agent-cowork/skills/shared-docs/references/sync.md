# sync

원격에서 공유 문서의 최신 커밋을 받아와 현재 레포의 submodule 포인터를 갱신한다.

## 명령

```bash
# 1. 추적 브랜치의 최신을 받아옴
git submodule update --remote --merge <path>

# 2. 부모 레포에 새 submodule sha를 커밋
git add <path>
git commit -m "chore: bump shared-docs to <short-sha>"
```

설명:

- `--remote` — config의 추적 브랜치(보통 `main`)의 최신 커밋을 가져옴 (이 옵션 없으면 `.gitmodules`에 박힌 sha만 다시 체크아웃)
- `--merge` — submodule 안에 로컬 변경이 있으면 merge 시도. 충돌 가능. `--rebase`도 옵션이지만 문서 레포는 merge가 단순
- 마지막 커밋이 핵심 — submodule sha bump를 부모 레포에도 기록해야 다른 협업자가 같은 버전을 보게 됨. 이걸 빠뜨리면 "내 로컬에서만 새 버전" 상태

`<path>` 생략 시 모든 submodule이 갱신됨. shared-docs는 단일 submodule 가정이라 `<path>` 명시 권장.

## 받기 전 체크

| # | 확인 | 실패 시 |
|---|---|---|
| 1 | submodule 디렉토리가 dirty(수정됨)? `git -C <path> status --porcelain` | dirty면 sync 거부. write 동작으로 먼저 처리하거나 `git -C <path> stash` 안내 |
| 2 | 부모 레포 working tree clean? | dirty면 경고 — sync는 새 submodule sha 커밋을 만드니, 다른 무관한 변경과 섞이면 history가 지저분해짐 |
| 3 | config 검증 | [config.md](config.md) 검증 절차 |

## detached HEAD 처리

`git submodule update --remote` 후 submodule이 **detached HEAD** 상태가 되는데, **이는 정상이다**. submodule은 본질적으로 "특정 commit을 가리키는 포인터"라 브랜치 위가 아니라 commit 위에 있는 게 자연스러움.

사용자가 헷갈려할 수 있으니 sync 보고 끝에 한 줄 안내:

```
ℹ️ submodule이 detached HEAD입니다 (정상).
   submodule 안에서 직접 작업하려면 먼저:
     cd <path> && git checkout <branch>
   또는 write 동작(/agent-cowork:shared-docs write)을 호출하세요 — 자동으로 정리됩니다.
```

**경고**: detached HEAD 상태에서 commit을 만들면 그 commit은 어떤 브랜치에도 속하지 않아 `git gc`로 사라질 수 있다. 반드시 브랜치를 먼저 체크아웃한 뒤 작업.

## 충돌 시

`--merge` 시 로컬 submodule 변경과 원격이 충돌하면 git이 명령 도중 멈추고 충돌 마커를 남긴다. 자동 해결 금지 — 항상 사용자에게 충돌 내용 보여주고 판단 받기.

복구 절차:

1. `cd <path>` (submodule 안으로)
2. `git status` — 충돌 파일 목록
3. 충돌 해결 (수동 편집)
4. `git add <conflict-file>` + `git commit -m "merge: resolve conflict in <file>"`
5. `cd ..` (부모 레포로)
6. `git add <path> && git commit -m "chore: bump shared-docs to <short-sha>"`

## 빈도 권장

- **작업 시작 전 한 번** — 다른 팀원이 push한 변경을 받기 위해. 가벼운 명령이라 부담 없음
- **CI에서 자동 sync는 비추천** — 의도하지 않은 문서 변경이 빌드 결과를 흔들 수 있음. 명시적 사용자 트리거가 안전
- **PR 머지 직후** — write 동작이 자동으로 sync를 호출해 부모 레포를 bump하므로 별도 조치 불필요
