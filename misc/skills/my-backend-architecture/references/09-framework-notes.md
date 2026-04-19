---
section: framework-notes
---

# Framework Notes

DI 프레임워크의 **설정 스타일 차이**가 레이어 경계 유지의 난이도를 결정한다. 이 스킬은 NestJS를 주 예시로 쓰되, Spring Boot·.NET Core 같은 다른 DI 환경과 대비해 **같은 레이어 참조를 실제로 막는 수단**을 정리한다.

## 두 축: DI 구성 스타일

### 설정 응집형 (Configuration-Cohesive)

예: Spring Boot `@Configuration` + 컴포넌트 스캔, .NET `Startup.cs`/`Program.cs`의 `builder.Services.AddScoped(...)`.

특징:

- DI 바인딩이 **중앙 설정 파일**에 모인다.
- 각 레이어 파일은 의존을 **생성자 타입**으로만 표현 (`UserRepository` 인터페이스 타입 파라미터).
- 구체 클래스 import가 중앙 설정 파일에만 등장 → 레이어 경계 안에서는 **import가 인터페이스로 한정**.

경계 분석이 쉽다: 파일 단위 import 그래프만 보면 경계 위반이 즉시 보인다.

### 개발자 명시형 (Developer-Explicit)

예: **NestJS** 각 모듈 파일의 `imports: [...]`, `providers: [...]`, `exports: [...]`. Angular도 유사.

특징:

- DI 바인딩이 **각 슬라이스의 모듈 파일**에 분산된다.
- 서비스 소비자 모듈은 **제공자 모듈을 import**해야 함 (`imports: [PostsModule]`).
- `useClass: ConcretePostsService` 같이 **구체 클래스 참조**가 모듈 파일에 남는다.

이 방식의 함정: 서비스 코드(`UsersService`) 자체가 계약만 의존하더라도 **모듈 파일(`UsersModule`)에는 `PostsService`의 구체 import**가 남는다 → "같은 레이어 슬라이스 참조"가 시각적으로 발생한다. 계약 분리([`07-dip-patterns.md`](07-dip-patterns.md) B안)만으로는 부족한 이유.

## NestJS에서 경계를 실제로 지키는 수단 (6가지)

성격별로 분류. 프로젝트 규모·요구에 맞춰 **조합**해 쓴다.

### 1. `eslint-plugin-boundaries` (정적, ESLint)

- 파일 단위 **role**(레이어·슬라이스)을 선언하고 허용 관계를 규칙으로 설정.
- 위반 시 IDE와 PR 모두에서 즉시 붉은 줄.
- 규칙 예: "`role: app-slice` 파일은 다른 `role: app-slice`를 import할 수 없다."

장점: 즉시 피드백, 팀 공유 쉬움, 커뮤니티 예제 많음.
단점: 매처 설정 초기 비용, 구체 tsconfig path와 정합 맞추기 필요.
적합: 팀 2명 이상, PR 리뷰 자동화 원함.

### 2. `dependency-cruiser` (정적, 독립 CLI)

- 프로젝트 의존 그래프를 분석해 **위반 리포트** + **다이어그램 출력**.
- CI에서 주기적으로 돌려 **아키텍처 감사 리포트** 생성.
- 규칙 `.dependency-cruiser.js`에 선언.

장점: 시각화, 프레임워크 독립, 큰 codebase에 강함.
단점: 개발자 실시간 피드백은 ESLint 대비 약함 (IDE 통합 한정적).
적합: 정기 감사, 문서화된 규칙 관리, 대규모.

### 3. Nx monorepo `enforce-module-boundaries` (정적, 태그)

- Nx 기반 monorepo에서 라이브러리에 태그(`tags: ["scope:users", "type:app"]`)를 붙이고 허용 관계 선언.
- 매우 강력. Nx 생태계에 이미 속해 있다면 최상급 도구.

장점: 강제력 최고, monorepo 전체 일관성.
단점: Nx 도입 전제, 러닝 커브.
적합: Nx monorepo 이미 쓰는 팀 또는 도입 의향.

### 4. `@nestjs/cqrs` CommandBus / EventBus (런타임 수신자 은닉)

- `app/users`가 `app/posts`의 삭제를 직접 호출하지 않고 **CommandBus에 `RemovePostsOfUserCommand` 발행**.
- `app/posts`가 해당 커맨드의 핸들러 등록 → 발신자는 수신자 존재를 **전혀 모름**.
- 모듈 import도 사라진다 (CommandBus 모듈만 공유).

장점: 경계 완전 격리(import 자체 소멸), 실제 DIP 실현, 도메인 이벤트 지향 아키텍처와 궁합.
단점: 단순 CRUD엔 오버엔지니어링, 디버깅·추적성 복잡, 동기 요청-응답 흐름에 CommandBus 강제가 불편.
적합: 실제 느슨한 결합이 필요한 도메인 간 협력 (특히 도메인 이벤트 기반).

### 5. 동적 모듈 + Bootstrapping 레이어 (관례 패턴)

- 슬라이스 모듈이 **`forRoot({ impls })`** 같은 팩토리로 구성되어 구체 구현체를 **외부에서 주입**받음.
- 최상위 `AppModule`(또는 별도 `src/bootstrap/` 폴더)에서만 모든 바인딩을 수행.
- 결과: 슬라이스 내부 모듈 파일에는 **다른 슬라이스 import가 없어진다**. 최상위 bootstrapping 파일 한 곳에만 구체 import 집중 → **설정 응집형에 근접**.

장점: 도구 추가 없이 관례만으로 개선, 기존 NestJS 코드베이스에 점진 적용 가능.
단점: 관례 의존 — 정적 강제 없음 (ESLint 규칙과 병행 권장), 모든 팀원이 이해·준수해야 함.
적합: 작은·중간 프로젝트 초기 가드레일, 도구 도입 전 단계.

구조 예:

```
src/
├── bootstrap/
│   └── app.module.ts         ← 모든 구체 provider 바인딩 집중
├── app/
│   ├── users/
│   │   └── users.module.ts   ← forRoot({ postRemover }) 식으로 외부 주입
│   └── posts/
│       └── posts.module.ts
└── domain/ ...
```

### 6. TypeScript path alias 제한 (보조)

- `tsconfig.json`의 `paths`로 `@app/users/*`, `@domain/users/*` 같은 alias 제공.
- 슬라이스 간 상대 경로 import(`../../posts/...`)를 ESLint 규칙으로 금지해 alias만 허용.
- 우회가 쉬움(상대 경로로 뚫을 수 있음) — **얕은 방어선**.

장점: 설정 간단, import 구문이 깔끔해지는 부수 효과, IDE 자동 완성 개선.
단점: 완전한 강제 불가, 다른 수단 없이 단독 사용은 방어력 약함.
적합: 다른 수단의 보조.

## `forwardRef`는 경계 준수가 아니다

NestJS의 `forwardRef()`는 **순환 참조**를 런타임에 해결하는 도구지, 경계 위반을 허용하는 장치가 아니다. 오히려 순환 참조가 필요하다는 것은 슬라이스 경계가 이미 깨졌다는 신호 — `forwardRef`로 덮으면 문제가 **은폐**된다. 이 스킬은 `forwardRef` 사용을 **권장하지 않는다**. 순환이 나오면 DIP로 풀거나 슬라이스 재설계.

## 권장 조합 (프로젝트 규모별)

| 규모 | 조합 |
|---|---|
| 소 (1~3명, 단일 앱) | TS path alias + 동적 모듈 bootstrapping |
| 중 (3~10명, 단일 앱) | 위 + `eslint-plugin-boundaries` (IDE·PR 피드백) |
| 대 (Nx monorepo) | Nx `enforce-module-boundaries` + **실제 DIP 필요 지점에만** CQRS/EventBus |

한 번에 다 도입하지 말 것. 필요가 보이는 지점부터 하나씩 쌓는다.

## Spring Boot와의 대비

`@Configuration` + 컴포넌트 스캔은 **설정 응집형**이라 위 문제가 희석된다.

- `@Autowired`로 인터페이스 주입 → 구현체 import가 서비스 파일에 없음.
- 구현체의 `@Component`·`@Service` 선언만으로 DI 컨테이너가 자동 연결 → 중앙 설정도 얇다.

NestJS가 이를 부러워한다면: **#5(동적 모듈 + bootstrapping) 패턴**이 가장 근접한 재현이다. bootstrap 파일 한 곳이 Spring `@Configuration` 역할.

## .NET Core와의 대비

`Startup.cs`/`Program.cs`의 `builder.Services.AddScoped<IPostRemover, PostsService>()`는 완전한 중앙 집중. 슬라이스 파일들은 인터페이스만 안다.

NestJS에서 같은 효과: **#5 + 인터페이스 토큰**. 토큰(`POST_REMOVER`)만 공유되고 구체 클래스는 bootstrap에서만 참조.

## TypeORM / Drizzle 모듈 통합 차이

ORM 선택이 NestJS 모듈 구성에도 영향을 준다.

| | TypeORM | Drizzle |
|---|---|---|
| NestJS 모듈 | `TypeOrmModule.forRoot()` + `forFeature([Entity])` | `DrizzleModule` (커뮤니티 제공) 또는 직접 구현 |
| 리포지토리 주입 | `@InjectRepository(User)` | 직접 구현한 리포지토리를 provider로 등록 |
| 슬라이스 분리 | 엔티티 단위로 `forFeature`에 넣어 분리 쉬움 | 리포지토리 구현체를 shared/infra에 두고 토큰 바인딩 |

어느 쪽이든 **도메인 리포지토리 인터페이스를 domain에 두고 bootstrap에서 바인딩**하는 5번 패턴이 가장 깔끔 — ORM 종속을 슬라이스 외부에 격리.

자세한 ORM 비교: [`06-orm-strategies.md`](06-orm-strategies.md).

## 실무 체크리스트

- [ ] 같은 레이어 슬라이스 import를 정적으로 감지하는 수단이 있는가?
- [ ] 모듈 파일이 다른 슬라이스 모듈을 import하는가? → Bootstrapping 레이어 도입 검토.
- [ ] 실제 느슨한 결합이 필요한 곳(도메인 이벤트)에 CQRS를 고려했는가?
- [ ] `forwardRef`를 쓰고 있다면 왜 순환이 생겼는지 재점검.
- [ ] `tsconfig paths`만으로 경계를 지킨다고 믿고 있지 않은가? (보조 수단일 뿐)

## 관련

- 슬라이스 경계 규칙 → [`02-slices.md`](02-slices.md)
- DIP A안/B안 → [`07-dip-patterns.md`](07-dip-patterns.md)
- ORM 모듈 구성 (TypeOrmModule / DrizzleModule) → [`06-orm-strategies.md`](06-orm-strategies.md)
