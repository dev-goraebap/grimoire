# Process Modeling 사이클 (references)

> 부모: [`../SKILL.md`](../SKILL.md). 이 파일은 Process Modeling 모드 진입 시 추가 로드.

## 1. Process Modeling 사이클 정체

빅픽처의 *탐색 합의*를 워크플로의 *명시적 합의*로 변환. 페이즈 1개를 잡아 end-to-end 워크플로(들)로 깊게 펼친다.

| 빅픽처 (이전) | Process Modeling (이 사이클) |
|---|---|
| 모드: 탐색 (divergent) | 모드: 합의 (convergent) |
| 단위: 페이즈 (시간축) | 단위: **워크플로 (end-to-end)** |
| sticky: 🟧 ⭐ 🟨 🟥 🔥 | + 🟦 Command · 🟪 Policy · 🟩 Read Model · 🟫 Aggregate 후보 |

**중요**: 페이즈 ≠ 워크플로. 한 페이즈에 워크플로가 N개 가능.

| 빅픽처 페이즈 | 워크플로 후보 |
|---|---|
| P1 온보딩 | 활성화 (1개) |
| P2 연차 회계 | 발급 / 차감 / 만료 / 사용 촉진 (4개) |
| P6 조직 운영 | 발령 / 부서장 임명 / RBAC (3개) |
| P8 알림 | **횡단** — 자체 워크플로 X (다른 페이즈의 Policy 섹션) |

→ **한 워크숍 = 한 워크플로**.

## 2. 횡단 워크플로 — Owner Phase 규칙

**판별 질문**: *"이 워크플로가 사라지면 어느 페이즈가 가장 망가지나?"*

규칙:
1. 무게중심 페이즈 = owner → 그 페이즈 폴더에 진실 1개
2. 다른 페이즈는 빅픽처 파일에 *참조 링크만*
3. Owner 모호 시 → 워크플로 더 작게 쪼개라 (둘 이상이 엉킨 신호)
4. 분해 후에도 못 정하면 → `docs/eventstorming/_shared/` (escape hatch)

워크플로 .md 첫 줄에 **Scope 표기 의무**:

```markdown
> **Scope**: phase-local. **Owner**: P1.
```

또는:

```markdown
> **Scope**: cross-phase. **Owner**: P2. **Participates**: P2 (회계), P8 (알림)
```

## 3. Step 0 — 마이그레이션 (필요 시)

빅픽처가 평탄 `{NN-phase}.md` 형태면, **작업 대상 페이즈만** in-place 폴더 승격:

```
docs/eventstorming/01-onboarding.md
                ↓ git mv
docs/eventstorming/01-onboarding/bigpicture.md
```

다른 페이즈는 그대로. 점진적 마이그레이션 (git diff 부담 최소화).

사용자 확인:
> "`01-onboarding.md` → `01-onboarding/bigpicture.md` 폴더로 옮기고 진행할까요? (y/n)"

승낙 시 Bash로 `git mv`. 거절 시 작업 중단.

해당 페이즈 .md 안에 `[← index](index.md)` 같은 상대 링크가 있으면 `../index.md`로 일괄 갱신.

## 4. Step 1 — 페이즈 선택 + 워크플로 분해

사용자에게 어느 페이즈를 다룰지 확인. 그 페이즈의 `bigpicture.md` 읽고 **워크플로 후보 식별**:

> "P2 연차는 4 워크플로로 보입니다:
> 1. 발급 (grant) — FY 시작 시
> 2. 차감 (consume) — 휴가 승인 시
> 3. 만료 (expire) — FY 종료 시
> 4. 사용 촉진 (promotion) — §61 트리거
>
> 어느 워크플로부터?"

한 응답 = 한 워크플로.

## 5. Step 2 — 횡단 여부 판별

위 2번 규칙 적용. 사용자에게 한 줄 확인:

```
판별: "사용 촉진"
- P2(연차) 회계 결정 무게중심
- P8(알림)은 채널 역할만
→ Owner: P2, Participates: P2·P8
```

## 6. Step 3 — 워크플로 시간순 펼치기

```markdown
## 2. Workflow (시간순)

| # | Type | 한국어 | Code Identifier | 행위자 | 디테일 |
|---|------|-------|-----------------|--------|--------|
| 1 | 🟦 Command | 사원 활성화 요청 | `RequestEmployeeActivation` | 인사담당자 OR CRON | 입사일 도래 시 |
| 2 | 🟧 Event | 사원 활성화됨 | `EmployeeActivated` | (시스템) | status: INVITED→ACTIVE |
| 3 | 🟪 Policy | 환영 알림 정책 | `OnEmployeeActivated→SendWelcome` | NotificationPolicy | listen |
| 4 | 🟦 Command | 환영 알림 발송 | `SendWelcomeNotification` | 시스템 | |
| 5 | 🟧 Event | 환영 알림 발송됨 | `WelcomeNotificationSent` | (시스템) | |
| 6 | 🟩 Read Model | 활성화 대기 목록 | `PendingActivationList` | 인사담당자 화면 | status=INVITED |
```

규칙:
- Event는 빅픽처에서 가져오되 누락 발견 시 추가
- Command는 *누가 호출하는지* 명시 (사람·CRON·다른 시스템)
- Policy는 *Whenever → Then* 짝 명시
- Read Model은 *어떤 화면·결정에 쓰이는지* 명시

## 7. Step 4 — 대안·실패 경로

```markdown
## 3. Alternative Paths

### A. 활성화 거부 (수동 토글 취소)
- Command: `CancelEmployeeActivation` → Event: `EmployeeActivationCanceled`
- 🔥 H1-? 활성화 취소 시간 윈도우?

### B. CRON 실패 → 재시도
- 🔥 H1-? 재시도 정책 (3회·exponential backoff?)
```

## 8. Step 5 — Policy / Read Model 요약

```markdown
## 4. Policies (요약)
| Policy | Trigger Event | 결과 Command | 모드 | Owner BC |
|--------|---------------|--------------|------|----------|
| 환영 알림 | EmployeeActivated | SendWelcomeNotification | 자동 | notification |

## 5. Read Models
| 이름 | 용도 | 소스 이벤트 | 사용 화면 |
|------|------|-------------|----------|
| PendingActivationList | 활성화 대기 사원 조회 | EmployeePreRegistered, EmployeeActivated | HR Admin |
```

## 9. Step 6 — Aggregate 후보 + Hotspot

```markdown
## 6. Aggregate Candidates (정식 정의는 tactical-design 영역)
- 🟫 **Employee** — RequestEmployeeActivation 받는 후보
  - 후보 invariant: 활성화 1회만 (status=INVITED→ACTIVE 단방향)
  - 후보 invariant: activated_at IS NULL일 때만 사전등록 정보 수정

## 7. 빅픽처 Hotspot 해소
| Hotspot ID | 결정 / 살아있음 |
|------------|----------------|
| H1-K | 사전등록 이메일 오타 — **결정**: 활성화 전까지 수정 허용 |
| H1-D | 장기 미접속 사원 처리 — 살아있음 |

## 8. 새로 발견한 Hotspot
| ID | 내용 | 답할 위치 |
|----|------|----------|
| H1-N | 활성화 취소 시간 윈도우 | 운영 + 시스템 |
```

## 10. Step 7 — 빅픽처 양방향 갱신

Process Modeling 중 **빅픽처 차원의 변경** 발견 시 빅픽처도 함께 갱신:

| 빅픽처 차원 변경 | 갱신 대상 |
|---|---|
| 새 Hotspot | `{phase}/bigpicture.md` Hotspot 표 + `index.md` 누적 핫스팟 |
| Subdomain 후보 변동 | `index.md` 부록 B |
| 새 액터/외부 시스템 | `{phase}/bigpicture.md` + `index.md` 횡단 매트릭스 |
| Hotspot 해소 (✅) | `index.md` 누적 핫스팟 ✅ 마크 |

워크플로 디테일(Command·Policy·Read Model)은 **빅픽처에 절대 추가 X** — 워크플로 .md 전용.

사용자 확인 후 갱신:
> "이 워크플로를 `docs/eventstorming/{phase}/{process}.md`에 갱신하고 빅픽처 변경 N개를 함께 반영할까요?"

## 11. Step 8 — 종료 신호 체크리스트

```markdown
## 9. 다음 단계 신호
- [ ] 모든 Command가 *누가 호출하는지* 명확
- [ ] 모든 Event가 *누가 발행하는지* 명확
- [ ] 모든 Policy가 listen → command 짝 명시
- [ ] 대안/실패 경로 1개 이상
- [ ] Aggregate 후보 1개 이상
- [ ] 빅픽처 Hotspot 중 이 워크플로에 걸린 것 처리
```

전부 ✅면 software-design(ADR) 또는 tactical-design(구현)로 진행 가능.

## 12. 산출물 양식 (워크플로 .md)

```markdown
# {워크플로명} — Process Modeling

> **Scope**: phase-local. **Owner**: P1.
> (또는: **Scope**: cross-phase. **Owner**: P2. **Participates**: P2, P8)
> **빅픽처**: [bigpicture.md](./bigpicture.md)

## 1. Scope
- Trigger event:
- Outcome event:
- 한 줄 핵심:

## 2. Workflow (시간순)
| # | Type | 한국어 | Code Identifier | 행위자 | 디테일 |

## 3. Alternative Paths
## 4. Policies (요약)
## 5. Read Models
## 6. Aggregate Candidates (정의는 tactical-design)
## 7. 빅픽처 Hotspot 해소
## 8. 새로 발견한 Hotspot
## 9. 다음 단계 신호 체크리스트

---

## 변경 이력
- YYYY-MM-DD: Initial.
```

## 13. Anti-patterns (Process Modeling 한정)

- **빅픽처 .md에 Command·Policy·Read Model 추가** — 워크플로 .md 전용
- **한 .md에 워크플로 N개** — 워크플로 1개 = .md 1개
- **Aggregate 정식 정의·invariant 박제·트랜잭션 경계** — tactical-design 영역
- **Saga·Process Manager 코드 설계** — 코드 영역
- **횡단 워크플로 여러 페이즈에 중복** — owner 1곳만
- **Owner 모호한 채 진행** — 더 작게 쪼개거나 `_shared/`
- **Policy에 "어떤 컴포넌트가 처리"** — 코드 영역. 여기는 *Whenever → Then* 규칙만
- **마이그레이션을 모든 페이즈 한꺼번에** — 작업 대상만
- **사용자 확인 없는 빅픽처 갱신** — 항상 한 줄 확인

## 14. 종료 신호 (다음 사이클로)

워크플로 N개 누적 + 모든 페이즈 process 충실 + Aggregate 후보 식별 → **BC + Subdomain Discovery 사이클** 권유 (bc-subdomain-discovery references).
