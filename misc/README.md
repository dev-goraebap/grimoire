# misc

**개인 잡동사니 스킬 모음** (개인 트랙).

`agents-md-ops` 같이 주제가 명확한 플러그인으로 묶기 애매한 유틸리티들이 여기 모입니다. 공개 트랙과 달리 품질 보증이나 인터페이스 일관성은 보장하지 않으며, 개인 필요에 따라 변경·제거될 수 있습니다.

## 설치

### Claude Code (플러그인)

```
/plugin marketplace add dev-goraebap/grimoire
/plugin install misc@grimoire
```

### 그 외 에이전트 (`skills.sh`)

```bash
npx skills add dev-goraebap/grimoire --skill pdf-parser --skill claude-hook-notify-setup
```

## 포함된 스킬

### `pdf-parser` (v1.0)

PDF 파일에서 텍스트를 추출해 `.txt`로 저장합니다. Node.js + `pdf-parse` 라이브러리 기반. 첫 실행 시 의존성을 자동 설치합니다.

**사용 예:**

```
PDF 읽어줘 → ./some-document.pdf
이 PDF의 텍스트를 추출해서 notes.txt로 저장해줘
```

**한계:**
- 암호화된 PDF는 비밀번호 해제 후 재시도 필요
- 스캔본(이미지 PDF)은 OCR 불가 — Adobe Acrobat, tesseract 등 별도 도구 필요

**요구:** Node.js 18+

자세한 절차는 [SKILL.md](skills/pdf-parser/SKILL.md) 참조.

---

### `claude-hook-notify-setup` (v1.2)

Claude Code hook에 **OS 네이티브 토스트 알림**을 연결하는 **세팅 스킬**. `node-notifier` 기반으로 Windows(SnoreToast), macOS(알림 센터), Linux(libnotify)를 모두 지원합니다.

**알림이 뜨는 3가지 상황:**

| Hook | 발화 시점 | 토스트 내용 |
|---|---|---|
| `Stop` | Claude 턴 종료 | 프로젝트명 + 마지막 응답 요약(300자) |
| `PermissionRequest` | 도구 권한 요청 시 | Bash 명령어 또는 AskUserQuestion 질문 |
| `Notification` | 시스템 알림 | 알림 메시지 |

**사용 예:**

```
claude 알림 받고 싶어
작업 완료 알림 설정해줘
```

스킬 실행 시 `~/.claude/skills/claude-hook-notify-setup/`에 스크립트를 배포하고 `~/.claude/settings.json`의 `hooks` 섹션에 명령을 등록합니다.

**요구:** Node.js 18+, Claude Code

**호환성:** Claude Code 전용 (다른 에이전트는 hook 구조가 달라 적용 불가)

자세한 설치·등록 절차는 [SKILL.md](skills/claude-hook-notify-setup/SKILL.md) 참조.

## 주의

- **개인 트랙이라 변경이 잦을 수 있습니다.** 버전을 따라 자동 업데이트하면 동작이 달라질 수 있으니 필요한 버전을 고정 사용하는 걸 권장합니다.
- **스킬 간 결합도 없음.** 각 스킬은 독립적으로 동작하며 서로 의존하지 않습니다.

## 라이선스

[MIT](../LICENSE).
