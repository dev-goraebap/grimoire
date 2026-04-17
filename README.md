# skills

개인용 **AI 에이전트 맞춤 환경**. 프로젝트마다 원하는 방식으로 에이전트(Claude Code, Cursor, Copilot, Codex, Windsurf, Gemini CLI 등)를 제어하기 위한 스킬을 모아두는 작업 공간입니다. 오픈소스 하네스를 필요에 따라 가져다 쓰면서 확장하고, 개인적으로 사용하는 유틸리티도 함께 보관합니다.

## 철학

- **도구 중립이 기본.** 특정 에이전트에 묶이지 않는 [AGENTS.md 표준](https://agents.md)을 중심으로, 네이티브 지원이 없는 에이전트(Claude Code, Gemini CLI 등)에는 얇은 브릿지만 덧붙인다.
- **Curate, don't enumerate.** 각 프로젝트에는 실제로 필요한 도구만 선언한다. 전역에 설치된 모든 스킬/MCP를 쏟아붓지 않는다.
- **Draft-first.** 한 번에 완벽한 결과물을 만들지 않는다. 초안을 만들고 이터레이션으로 다듬는 흐름을 선호한다.
- **이중 배포, 자체 updater 없음.** Claude 사용자는 마켓플레이스 플러그인으로, 그 외 에이전트는 `skills.sh`(`npx skills`)로 설치한다. 업데이트는 각 배포 채널의 메커니즘에 위임 — 자체 updater 스킬은 만들지 않는다.

## 플러그인

이 저장소는 마켓플레이스 **`devgoraebap-skills`** 역할을 하며, 다음 플러그인을 포함합니다:

| 플러그인 | 설명 | 문서 |
|---|---|---|
| `agents-md-ops` | AGENTS.md 작성·큐레이션·유지보수 도구 모음 (공개 트랙) | [README](agents-md-ops/README.md) |
| `misc` | 개인 잡동사니 스킬 모음 (개인 트랙) | [README](misc/README.md) |

Claude Code 마켓플레이스 등록과 `skills.sh` 설치 두 방식을 모두 지원합니다. 설치 방법과 포함 스킬은 각 트랙의 README를 참고하세요.

## 라이선스

[MIT](LICENSE).
