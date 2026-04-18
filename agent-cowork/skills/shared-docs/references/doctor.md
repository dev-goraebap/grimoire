# doctor

shared-docs submodule의 흔한 함정을 검사하고 보고한다. 자동 수정은 안전한 항목만, 나머지는 사용자 동의 후 적용. audit-public-rules와 같은 "진단 → 보고 → 동의 → 적용" 패턴을 따른다.

## 검사 항목

| ID | 이름 | Sev | 자동 수정 | 기준 |
|---|---|---|---|---|
| D1 | submodule 디렉토리 비어있음 | 🔴 High | ✅ | `path`는 `.gitmodules`에 등록됐지만 실제 디렉토리가 비어있음. `git submodule update --init <path>` |
| D2 | `.gitmodules` ↔ `.git/config` 불일치 | 🔴 High | ✅ | URL 또는 branch가 다름 (`.gitmodules`는 갱신했지만 `git submodule sync`를 안 함). `git submodule sync <path>` |
| D3 | submodule 추적 브랜치 누락 | 🟡 Medium | ❌ | `.gitmodules`에 `branch =` 라인 없음. config의 branch로 설정 안내 (수동 편집 또는 `git config -f .gitmodules submodule.<path>.branch <branch>`) |
| D4 | submodule이 detached HEAD에 unpushed commit | 🟡 Medium | ❌ | submodule 안에서 commit을 만들었지만 어떤 브랜치에도 안 속함. write 흐름의 큰 수정 모드로 회수 안내 |
| D5 | 부모 레포 stale (원격 main이 더 진행됨) | 🟢 Low | ❌ | 부모가 가리키는 sha < 원격 main의 최신. sync 권장 |
| D6 | submodule URL이 절대 경로/잘못된 형식 | 🔴 High | ❌ | local path(`/home/...`, `C:\...`)나 깨진 URL. config 수정 안내 |
| D7 | 인증 실패 (fetch 안됨) | 🔴 High | ❌ | `git -C <path> fetch` 실패. [init.md 인증 섹션](init.md#인증) 안내 |
| D8 | config 누락 또는 검증 실패 | 🔴 High | ❌ | shared-docs config 파일 없음 또는 필수 키 누락. [config.md](config.md) 안내 |

## 보고 포맷

```
🩺 shared-docs doctor 보고

submodule: docs/shared
remote:    git@gitlab.example.com:hoho/hr-docs.git
branch:    main

발견된 이슈 (2개)

🔴 [D1] submodule 디렉토리 비어있음
   path: docs/shared
   → 자동 수정 가능: git submodule update --init docs/shared

🟢 [D5] 부모 레포 stale (원격 main이 3 commits 앞섬)
   현재 sha:  a1b2c3d
   원격 sha:  d4e5f6g
   → 권장: /agent-cowork:shared-docs sync

통과한 항목 (5개)
✅ .gitmodules ↔ .git/config 일치
✅ 추적 브랜치 명시됨 (main)
✅ submodule URL 형식 정상
✅ 인증 통과
✅ config 검증 통과
```

이슈 0개면 `✅ 모두 통과 (8개 항목 확인)`만 보고하고 종료.

## 자동 수정 동의

자동 수정 가능 항목(✅)이 1개 이상이면 사용자 동의를 받아 적용:

```
자동 수정 가능 항목이 N개 있습니다. 어떻게 할까요?

  1. 전부 적용
  2. 항목 선택 (번호 입력, 예: "1,3")
  3. 보고만 남기고 종료
```

사용자가 명시적으로 선택해야만 적용. 기본값을 "전부 적용"으로 두지 않는다.

수정 적용 후 결과:

```
✅ 2개 항목 적용됨
   D1: git submodule update --init docs/shared → 완료
   D2: git submodule sync docs/shared → 완료

다음 단계: doctor를 한 번 더 돌려 통과 확인
```

## 다른 동작과 연계

| 발견 | 추천 |
|---|---|
| D1 (빈 submodule) | `init` 동작 (단, `--create` 없이 — 이미 `.gitmodules`가 있음). 또는 자동 수정 |
| D5 (stale) | `sync` 동작 |
| D4 (detached HEAD에 unpushed commit) | `write`의 큰 수정 흐름으로 회수 (브랜치 만들어 commit 옮기기) |
| D8 (config 누락) | [config.md](config.md) 안내 후 사용자가 config 파일 생성 |

## 호출

명시 호출만 받음 — auto-trigger 없음. 진단은 사용자가 의식적으로 돌려야 의미 있다.

```
/agent-cowork:shared-docs doctor
```
