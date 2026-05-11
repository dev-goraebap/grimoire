# BC + Subdomain Discovery 사이클 (references)

> 부모: [`../SKILL.md`](../SKILL.md). 이 파일은 BC + Subdomain Discovery 모드 진입 시 추가 로드.

## 1. BC + Subdomain Discovery 사이클 정체

빅픽처·Process Modeling이 충분히 누적된 후 **닫는 활동**. 모든 워크플로를 종합해 BC + Subdomain *후보*를 식별·합의하고 `index.md` 부록 B를 ✅ Accepted로 승격.

**책임 경계 (중요)**:
- ✅ BC + Subdomain 후보 식별 + `index.md` 부록 B 갱신
- ❌ **ADR 박제는 X** — `software-design` 스킬 영역
- ❌ Context Map 정식 다이어그램·9 패턴 라벨링 X — `software-design` 영역
- ❌ 코드 모듈 매핑 X — `tactical-design` (phase 2) 영역

여기는 *후보 발견·합의*까지. ADR 작성이 별도 스킬인 이유: 그 단계가 *결정 박제* 활동이라 다른 가치 (트레이드오프 토론·옵션 비교 등) 필요.

## 2. 전제 조건 점검

**발동 조건 안내** (호출 시 점검):
- `docs/eventstorming/*/` 폴더에 워크플로 .md 충분히 누적되었나? (페이즈 1개로는 부족 — 횡단 신호가 안 보임)
- 부족하면 사용자에게 "현재 워크플로 N개. 더 누적 후 진행 권장" 안내. 그래도 강제 의사면 진행.

## 3. Step 1 — 모든 워크플로 수집

`Glob docs/eventstorming/*/*.md` (단 `bigpicture.md`·`_shared/` 제외).

발견 워크플로 목록을 사용자에게 보여주고 confirm.

## 4. Step 2 — 6 신호 추출

각 신호를 워크플로 .md에서 추출하여 *후보 그룹*을 형성:

| # | 신호 | 추출 위치 | 강도 |
|---|------|----------|------|
| 1 | **Aggregate 클러스터링** — 항상 같이 변하는 것 | "Aggregate Candidates" 섹션 | 강 |
| 2 | **Linguistic boundary** — 같은 단어 다른 의미 | Code Identifier 비교 | 강 |
| 3 | **Policy direction** — cross-workflow listen | "Policies" 섹션 | 중 |
| 4 | **External system 결합** — 외부 시스템 owner | "Workflow" 표 행위자 | 중 |
| 5 | **Read Model 결합** — 여러 워크플로 이벤트 합성 | "Read Models" 섹션 | 중 |
| 6 | **Transactional consistency** — 한 트랜잭션 묶임 요구 | Aggregate invariant | 강 |

신호 강도 = BC 분할 확신도. 강 신호가 2개 이상 일치하면 BC 경계로 자신감 있음.

## 5. Step 3 — Subdomain 분류 (후보 수준)

**Khononov heuristic 수준만**. 정통 Strategic Design 깊이는 software-design 영역.

| 분류 | 후보 판별 기준 |
|---|---|
| **Core** | 비즈니스 차별화 가치 + 도메인 통찰 살아있음 (호호컴퍼니의 "결재 메커니즘", "연차 회계" 같은 것) |
| **Supporting** | 비즈니스 고유하나 차별화 약함 (조직·발령 같은 일반 패턴) |
| **Generic** | 외부 솔루션 대체 가능 (알림·메일 fan-out 같은 것) |

판별 질문 (각 BC 후보에 대해):
1. 이 영역이 사업의 *차별화*에 기여하나?
2. 이 영역의 *도메인 통찰*이 있나? (단순 CRUD vs 깊은 규칙)
3. 외부 솔루션·OSS로 대체 가능한가?

→ 사용자와 한 줄씩 토론. 분류 근거 함께 박제.

## 6. Step 4 — BC + Subdomain 후보 표 작성

사용자에게 제시:

```markdown
6 신호 분석 결과 BC 후보 N개 제안합니다:

| BC 후보 | 책임 | 포함 Aggregate (후보) | 등장 워크플로 | 신호 근거 | Subdomain 분류 |
|---|---|---|---|---|---|
| identity | 사원 활성화·인증 | Employee (status) | activation.md | 신호 1·2 | Core (호호컴퍼니 차별화) |
| approval-mechanism | 결재 메커니즘 (공통) | ApprovalRequest | leave.md, overtime.md, absence.md | 신호 1·3 | Core (호호컴퍼니 결재 통합) |
| leave-accounting | 연차 회계 | LeaveBalance, LeaveHolder | grant.md, consume.md, expire.md | 신호 1·6 | Core (append-only ledger 통찰) |
| organization | 부서·발령·RBAC | Department, Assignment | departments.md | 신호 4 | Supporting |
| notification | 알림 fan-out | NotificationPolicy | (횡단) | 신호 3·4 | Generic (외부 SMTP·Push) |

토론 포인트:
- 🔥 BC A·B를 묶을지 가를지
- 🔥 횡단 Policy의 owner BC
- 🔥 같은 Aggregate가 두 BC에 등장 — 같은 객체인가?
```

## 7. Step 5 — 사용자 토론

위 후보를 합의하거나 갈라거나 묶거나. 모호한 결정은 *살아있는 의문*으로 박제.

**Owner 모호 시 분해 권유**:
```
사용자: "approval-mechanism 안 휴가/연장근무/휴직을 갈라야 할 것 같아"
스킬: "이건 BC 분할이 아니라 *카테고리 확장*으로 보입니다. 
       1 BC + 3 카테고리 vs 3 BC, 둘 다 가능.
       제 추천: 1 BC. 메커니즘 코드 중복 회피.
       사용자 선호는?"
```

## 8. Step 6 — index.md 부록 B 갱신

기존 부록 B의 *추측 후보*를 ✅ Accepted로 승격하고, 새로 발견된 BC 후보 추가.

```markdown
## (부록 B) Subdomain 후보 — BC Discovery 사이클 결과

> 최종 BC 합의 + Subdomain 분류. **ADR 박제는 `/software-design`에서.**

| BC | 책임 | 포함 Aggregate (후보) | 등장 워크플로 | Subdomain |
|---|---|---|---|---|
| ✅ identity | 사원 활성화·인증 | Employee | activation.md | Core |
| ✅ approval-mechanism | 결재 메커니즘 | ApprovalRequest | leave.md·overtime.md·absence.md | Core |
| ✅ leave-accounting | 연차 회계 | LeaveBalance·LeaveHolder | grant.md·consume.md·expire.md | Core |
| ✅ organization | 부서·발령·RBAC | Department·Assignment | departments.md | Supporting |
| ✅ notification | 알림 fan-out | NotificationPolicy | (횡단) | Generic |

### 살아있는 의문
- 🔥 (예: 연차 사용 촉진을 leave-accounting BC 안에 둘지 별도 BC로 분리할지)
```

## 9. Step 7 — 다음 단계 안내

사이클 종료 시 사용자에게:

> "BC 후보 5개·Subdomain 분류 끝. `index.md` 부록 B 갱신 완료.
>
> 다음 단계:
> - **`/software-design`**으로 ADR 박제 (folder 구조·BC 통합 패턴·CQRS 깊이 등 결정)
> - **`/tactical-design`** (phase 2)으로 한 워크플로의 구현 plan
>
> 이 사이클은 *후보 발견까지* 책임. ADR·구현은 별도 스킬."

## 10. Anti-patterns (BC Discovery 한정)

- **ADR 직접 작성** — software-design 위임
- **Context Map 9 패턴 라벨링 시도** — software-design 영역
- **워크플로 1~2개로 BC 확정** — 횡단 신호가 안 보임. 더 누적
- **Core/Supporting/Generic 분류를 강제 1:1** — heuristic은 후보 수준. 정통 분류는 software-design
- **BC = Subdomain 1:1 가정** — Subdomain은 *문제 공간*, BC는 *해결 공간*. 1:N·N:1 가능
- **빅픽처 부록 B 덮어쓰기** — 기존 후보는 ✅ 또는 ❌로 마킹만, 삭제 금지
- **모호한 owner에 강제 결정** — 살아있는 의문으로 박제

## 11. 종료 신호

- [ ] 모든 워크플로가 BC 후보에 배치됨
- [ ] 각 BC가 Subdomain 분류 받음 (Core/Supporting/Generic)
- [ ] 모호한 결정은 *살아있는 의문*으로 박제
- [ ] `index.md` 부록 B 갱신 완료
- [ ] 사용자에게 software-design 다음 단계 안내됨
