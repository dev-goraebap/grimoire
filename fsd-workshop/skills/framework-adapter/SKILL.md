---
name: framework-adapter
description: >
  fsd-workshop 파이프라인의 3단계 (최종). structure-planner가 완성한 fsd-blueprint.md를
  입력받아 특정 프레임워크(Next.js App Router, SvelteKit, Nuxt, Angular, React+Vite 등)의
  강제 폴더 구조와 FSD를 통합한 최종 디렉터리 트리를 생성하고 fsd-blueprint.md를 완성한다.
  "FSD 폴더 구조 만들어줘", "Next.js에서 FSD 어떻게 써", "fsd-workshop 3단계", "framework-adapter",
  "SvelteKit FSD 구조", "프레임워크별 FSD 매핑", "폴더 트리 완성" 같은 요청에 트리거.
  반드시 structure-planner 완료 후 실행한다.
allowed-tools: Read Write
metadata:
  author: dev-goraebap
  version: "0.1.0"
  pipeline: fsd-workshop
  pipeline-step: 3/3
  prev-skill: fsd-workshop:structure-planner
---

# framework-adapter

fsd-workshop 파이프라인의 **최종 단계**. 프레임워크가 강제하는 폴더 구조와 FSD 레이어를 통합해 실제 폴더 트리를 생성한다.

프레임워크마다 라우팅 폴더가 다르고 FSD의 `pages` / `app` 레이어와 충돌이 생기는 문제를 해결하는 것이 이 스킬의 핵심 역할이다.

---

## 사전 조건

`fsd-blueprint.md`가 존재하고 structure-planner 단계까지 완료되어야 한다. 파일을 먼저 읽어 프레임워크, 페이지 목록, 레이아웃, 공용 컴포넌트 정보를 파악한다.

파일이 없거나 structure-planner 섹션이 비어 있으면:
```
fsd-blueprint.md의 레이아웃 구조 / 공용 컴포넌트 섹션이 비어 있습니다.
먼저 `fsd-workshop:structure-planner`를 실행해 주세요.
```

---

## 1. 프레임워크 확인

`fsd-blueprint.md`의 메타 섹션에서 프레임워크를 읽는다. 미정이거나 다른 프레임워크를 쓰고 싶다면 확인한다.

```
현재 선택된 프레임워크: [값 또는 미정]

다른 프레임워크로 변경하거나 미정이면 선택해 주세요.

1) Next.js (App Router)
2) Next.js (Pages Router)
3) SvelteKit
4) Nuxt
5) Angular
6) React + Vite (TanStack Router / React Router)
7) Vue + Vite (Vue Router)
8) 현재 값 유지
```

---

## 2. 프레임워크별 통합 패턴

### 공통 원칙

모든 SSR/파일기반 라우팅 프레임워크에서 공통으로 적용되는 패턴:

> **프레임워크 라우팅 폴더는 얇은 re-export 껍데기다.**  
> 실제 구현은 `src/` 아래 FSD 레이어에 있고, 라우팅 파일은 FSD `pages` 레이어를 import만 한다.

### Next.js App Router

FSD와의 충돌: `app/` 폴더가 Next.js 라우팅을 담당하며 FSD의 `app` 레이어와 이름이 겹친다.

**해결책**:
```
[project-root]/
├── app/                          # Next.js 라우팅 껍데기 (re-export만)
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # export { LoginPage as default } from '@/pages/login'
│   │   └── layout.tsx            # export { AuthLayout as default } from '@/app/layouts/auth'
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── not-found.tsx
├── pages/                        # 빈 폴더 (Next.js Pages Router 오인 방지용)
│   └── README.md
└── src/
    ├── app/                      # FSD app 레이어
    │   ├── layouts/
    │   │   ├── auth-layout.tsx
    │   │   └── main-layout.tsx
    │   ├── providers/
    │   └── styles/
    ├── pages/                    # FSD pages 레이어
    │   ├── login/
    │   │   ├── ui/
    │   │   │   └── LoginPage.tsx
    │   │   └── index.ts
    │   └── dashboard/
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

Route Group `(auth)`, `(main)`, `(admin)` 등을 활용해 레이아웃을 분리한다.

### Next.js Pages Router

```
[project-root]/
├── pages/                        # Next.js 라우팅 껍데기
│   ├── _app.tsx                  # export { App as default } from '@/app/custom-app'
│   ├── login.tsx                 # export { LoginPage as default } from '@/pages/login'
│   └── dashboard.tsx
└── src/
    ├── app/
    │   └── custom-app/
    ├── pages/                    # FSD pages 레이어
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

### SvelteKit

config 변경으로 라우팅 폴더를 `src/app/routes`로 이동한다.

```
# svelte.config.ts 변경 필요
files: {
  routes: 'src/app/routes',
  lib: 'src',
  appTemplate: 'src/app/app.html'
}
alias: { '@/*': 'src/*' }
```

```
src/
├── app/
│   ├── routes/                   # SvelteKit 라우팅 껍데기
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── +page.svelte  # <script>import { LoginPage } from '@/pages/login'</script>
│   │   │   └── +layout.svelte
│   │   └── (main)/
│   │       └── +layout.svelte
│   ├── layouts/
│   └── app.html
├── pages/                        # FSD pages 레이어
├── widgets/
├── features/
├── entities/
└── shared/
```

### Nuxt

config 변경으로 라우팅과 레이아웃 폴더를 `src/app/` 안으로 이동한다.

```
# nuxt.config.ts 변경 필요
dir: {
  pages: './src/app/routes',
  layouts: './src/app/layouts'
}
alias: { '@': '../src' }
```

```
src/
├── app/
│   ├── routes/                   # Nuxt 라우팅 껍데기
│   ├── layouts/                  # Nuxt 레이아웃
│   └── router.config.ts
├── pages/                        # FSD pages 레이어
├── widgets/
├── features/
├── entities/
└── shared/
```

### Angular

Angular는 파일 기반 라우팅이 없으므로 FSD와의 구조적 충돌이 적다. 라우팅 설정은 `app/routes` 세그먼트에 둔다.

```
src/
├── app/                          # FSD app 레이어 (= Angular root module)
│   ├── routes/                   # 라우팅 설정 (RouterModule 또는 provideRouter)
│   │   └── app.routes.ts
│   ├── layouts/
│   │   ├── auth-layout/
│   │   └── main-layout/
│   └── app.config.ts
├── pages/
│   ├── login/
│   │   ├── ui/
│   │   │   └── login-page.component.ts
│   │   └── index.ts
│   └── dashboard/
├── widgets/
├── features/
├── entities/
└── shared/
    ├── ui/
    ├── api/
    ├── auth/                     # 토큰 관리 복잡 시
    └── lib/
```

### React + Vite (TanStack Router / React Router)

파일 기반 라우팅이 없으므로 순수 FSD 구조에 가장 가깝다.

```
src/
├── app/
│   ├── router.tsx                # createBrowserRouter 설정
│   ├── providers/
│   └── styles/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

---

## 3. 폴더 트리 생성

fsd-blueprint.md의 정보(페이지 목록, 레이아웃, shared/ui, widgets)를 기반으로 실제 폴더 트리를 작성한다.

폴더 트리 작성 규칙:
- FSD `pages` 레이어: 페이지 목록의 모든 항목을 슬라이스로 생성
- FSD `widgets` 레이어: widgets 후보 목록의 모든 항목 생성
- FSD `shared/ui`: shared/ui 후보 목록 기반
- FSD `shared/api`: 기본 생성 (API 클라이언트)
- FSD `shared/auth`: 토큰 관리가 중간 이상인 경우만 생성
- `features`, `entities`: 빈 폴더로만 표시 (구현 시 채움)

공통 표시 규칙:
- `# [설명]` 형태로 중요한 파일/폴더에 주석 추가
- re-export 파일(`index.ts`)은 슬라이스마다 표시
- 프레임워크 라우팅 껍데기 파일에 "re-export only" 주석 추가

---

## 4. 산출물 — fsd-blueprint.md 완성

기존 파일에 폴더 트리 섹션을 추가하고 진행 상태를 업데이트한다.

```markdown
## 폴더 트리

> 프레임워크: [프레임워크명]
> FSD 통합 패턴: [패턴 설명]

\`\`\`
[실제 폴더 트리]
\`\`\`

### 주요 파일 설명

| 파일/폴더 | 역할 |
|---------|------|
| `app/[route]/page.tsx` | Next.js 라우팅 껍데기 — FSD pages 레이어 re-export |
| `src/app/layouts/` | 레이아웃 컴포넌트 (FSD app 레이어) |
| `src/shared/auth/` | 토큰 관리 전용 세그먼트 |
| ... | ... |

### 설정 파일 변경 사항

[프레임워크별 필요한 config 변경 내용 요약]
```

업데이트 후 진행 상태:
```
> **현재 단계**: 3/3 — 완료 ✅
```

---

## 5. 강제 체크리스트

```
□ fsd-blueprint.md 읽기 완료 (메타, 페이지, 레이아웃, 공용컴포넌트 파악)
□ 프레임워크 확정됨
□ 프레임워크 충돌 해결 방식 적용됨 (re-export 패턴)
□ 모든 페이지가 pages 레이어 슬라이스로 매핑됨
□ 모든 레이아웃이 올바른 레이어에 배치됨
□ shared/ui 후보가 shared/ui 폴더에 반영됨
□ widgets 후보가 widgets 폴더에 반영됨
□ shared/auth 생성 여부 토큰 복잡도에 따라 결정됨
□ 프레임워크 config 변경 사항 명시됨
□ 기존 fsd-blueprint.md 내용 보존됨
□ 진행 단계 3/3 완료로 업데이트됨
```

---

## 6. 절대 하지 말 것

- 파일/클래스/함수명까지 생성하기 — 폴더 구조만 다룬다.
- features / entities 하위 슬라이스를 미리 채우기 — 빈 폴더 표시만.
- 프레임워크 충돌 해결 없이 FSD 구조를 그대로 적용하기.
- 사용자 확인 없이 프레임워크를 임의로 변경하기.
