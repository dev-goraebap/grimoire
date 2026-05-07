---
name: erd
description: >
  ERD(Entity-Relationship Diagram)를 Mermaid .mmd 파일로 생성·갱신하는 스킬.
  요구사항 문서(PRD, DDD 산출물, 러프한 설명)로 초안을 작성하거나,
  기존 소스코드(TypeORM, Prisma, Drizzle, JPA, SQL DDL, Django 등)를 읽어
  실제 테이블 구조와 ERD를 동기화한다. 개념·논리·물리 3종 ERD를 지원하며
  다크 테마 + handDrawn 스타일로 출력한다.
  "ERD 만들어줘", "테이블 관계도", "DB 설계 시각화", "엔티티 관계 다이어그램",
  "코드에서 ERD 뽑아줘", "ERD 동기화", "스키마 시각화", "데이터 모델링",
  "개념 ERD", "논리 ERD", "물리 ERD", "mermaid ERD", "DB 스키마 그려줘",
  "테이블 설계", "ORM 엔티티 ERD" 등의 요청에 트리거한다.
  다른 스킬이나 외부 환경에 의존하지 않고 독립 실행된다.
allowed-tools: Read Write Glob Grep
metadata:
  author: dev-goraebap
  version: "1.0.0"
---

# erd

ERD를 Mermaid `.mmd` 파일로 생성하고 지속 관리하는 스킬. 요구사항 단계의 초안 작성부터 구현 이후 코드 동기화까지 ERD의 전체 생명주기를 담당한다.

`references/`에 HR 플랫폼 도메인 완성 예제 3종이 있다. ERD 생성 시 해당 수준의 파일을 읽고 구조·문법·스타일링을 그대로 따른다.

| 수준 | 파일 | 설명 |
|------|------|------|
| Conceptual | `references/conceptual-erd-example.mmd` | 엔티티 + 관계만, 속성 없음 |
| Logical | `references/logical-erd-example.mmd` | 한글 속성명 + 추상 타입 + PK/FK |
| Physical | `references/physical-erd-example.mmd` | 영문 컬럼명 + DB 종속 타입 + 인덱스 |

---

## 대화 UX 규약

- **1문 1답 기본.** 단순 Yes/No는 2~3개까지 번호로 묶기 허용.
- **"모름" / "나중에" / "스킵" 항상 허용** → `⚠️ 미정`으로 기록.
- 추출·도출한 목록은 사용자에게 보여주고 확인받은 뒤 파일을 작성한다.

---

## 1. 진입 모드 선택

스킬 시작 시 항상 먼저 묻는다:

```
ERD를 어떻게 만들까요?

1) 요구사항 기반 — PRD·DDD 산출물·러프한 설명으로 초안 작성
2) 코드 동기화  — 소스코드에서 테이블 구조를 읽어 ERD 생성·갱신
3) 기존 ERD 수정 — .mmd 파일을 열어 수정·수준 전환·색상 변경
```

---

## 2. 공통 인터뷰 (모든 모드 공통)

모드 선택 후 아래 항목을 순서대로 확인한다.

### 2-1. ERD 수준

```
어떤 수준의 ERD를 원하시나요?

1) 개념(Conceptual) — 엔티티와 관계만 (속성 없음)
2) 논리(Logical)    — 한글 속성명 + 추상 타입 + PK/FK
3) 물리(Physical)   — 영문 컬럼명 + DB 종속 타입 + 인덱스
```

수준 미정이면 `⚠️ 미정`으로 두고 논리를 기본값으로 사용한다.

### 2-2. 저장 위치

```
ERD 파일을 어디에 저장할까요?

1) docs/
2) design/
3) docs/erd/
4) 직접 입력
```

폴더가 없으면 생성한다.

### 2-3. 파일명

```
파일명 프리픽스를 알려주세요.
(예: "hr-platform" → hr-platform-logical-erd.mmd)
```

미입력 시 `erd` 를 기본값으로 사용한다 (`erd-logical-erd.mmd`).

---

## 3. Mode 1 — 요구사항 기반

### 3-1. 입력 수용

다음 형태를 모두 수용한다:
- 자연어 프롬프트 ("쇼핑몰 ERD 만들어줘")
- 파일 경로 (`.md`, `.pdf`, `.txt` — PRD, 요구사항 정의서, DDD 산출물)
- 기존 ERD 확장 요청 ("여기에 결제 도메인 추가해줘")

### 3-2. 데이터 모델 도출

1. **도메인 식별** — 주요 업무 영역을 먼저 식별한다 (예: 조직관리, 급여, 채용)
2. **엔티티 도출** — 각 도메인의 핵심 명사를 엔티티로 추출한다
3. **관계 정의** — 카디널리티(1:1, 1:N, N:M)와 관계 동사를 정의한다
4. **속성 정의** (논리/물리만) — 엔티티별 속성, 타입, 제약조건을 결정한다

도출 결과를 사용자에게 표로 보여주고 확인받는다:

```
아래 엔티티와 관계를 도출했습니다. 맞나요?

엔티티: 회원, 주문, 상품, 결제, 배송
주요 관계:
  - 회원 1:N 주문
  - 주문 N:M 상품 (주문상품 연결 테이블)
  - 주문 1:1 결제
  - 주문 1:1 배송

추가하거나 수정할 것이 있으면 알려주세요.
```

---

## 4. Mode 2 — 코드 동기화

소스코드에서 테이블 구조를 읽어 ERD를 생성하거나 기존 ERD를 갱신한다.

### 4-1. 소스코드 경로 수집

```
테이블 정의가 있는 파일 또는 폴더 경로를 알려주세요.

예시:
  - src/entities/         (TypeORM 엔티티 폴더)
  - prisma/schema.prisma  (Prisma 스키마 파일)
  - src/db/schema.ts      (Drizzle 스키마 파일)
  - src/main/java/.../domain/  (JPA 엔티티 폴더)
  - db/migrations/        (SQL DDL 마이그레이션 폴더)
  - 여러 경로는 쉼표로 구분
```

### 4-2. ORM/방식별 파싱 패턴

파일을 읽은 뒤 아래 패턴으로 엔티티·컬럼·관계를 식별한다.

| ORM / 방식 | 엔티티 식별 | 컬럼 식별 | 관계 식별 |
|-----------|-----------|---------|---------|
| **TypeORM** | `@Entity()` 데코레이터 클래스 | `@Column()`, `@PrimaryGeneratedColumn()`, `@CreateDateColumn()` | `@ManyToOne()`, `@OneToMany()`, `@OneToOne()`, `@ManyToMany()` |
| **Prisma** | `model Xxx { }` 블록 | 필드 정의 라인 (`id Int @id` 등) | `@relation()`, 필드 타입이 다른 model인 경우 |
| **Drizzle** | `pgTable()`, `mysqlTable()`, `sqliteTable()` 호출 | `text()`, `integer()`, `boolean()`, `timestamp()` 등 | `references: () =>` |
| **JPA (Java/Kotlin)** | `@Entity`, `@Table` 어노테이션 클래스 | `@Column`, `@Id`, `@GeneratedValue` | `@ManyToOne`, `@OneToMany`, `@JoinColumn` |
| **SQL DDL** | `CREATE TABLE 테이블명` | 컬럼 정의 라인 | `FOREIGN KEY ... REFERENCES` |
| **Django** | `models.Model` 상속 클래스 | `models.CharField()`, `models.IntegerField()` 등 | `models.ForeignKey()`, `models.ManyToManyField()` |

파싱이 불확실한 부분은 사용자에게 확인한다.

### 4-3. 추출 결과 확인

```
소스코드에서 아래 구조를 추출했습니다.

테이블 목록:
  - users (id, email, name, created_at)
  - posts (id, user_id, title, body, published_at)
  - comments (id, post_id, user_id, content, created_at)

관계:
  - users 1:N posts
  - users 1:N comments
  - posts 1:N comments

맞나요? 누락되거나 잘못 읽힌 테이블이 있으면 알려주세요.
```

확인 후 선택한 수준의 ERD를 생성한다.

### 4-4. 기존 ERD와의 동기화

기존 `.mmd` 파일이 있으면:

```
기존 ERD 파일이 있습니다: ./docs/erd-logical-erd.mmd

코드와 비교한 결과:
  추가된 테이블: refresh_tokens
  삭제된 테이블: (없음)
  변경된 컬럼:  users.nickname 추가

기존 ERD를 갱신할까요?
1) 갱신한다 (변경 사항만 반영)
2) 새 파일로 생성한다
```

---

## 5. Mode 3 — 기존 ERD 수정

`.mmd` 파일 경로를 제공받아 열고, 아래 작업을 수행한다:

- 엔티티 추가/삭제/이름 변경
- 속성 추가/삭제/타입 변경
- 관계 추가/삭제/카디널리티 변경
- 색상 변경
- **수준 전환** (아래 참고)

### 수준 전환 규칙

| 변환 | 처리 |
|------|------|
| 개념 → 논리 | 각 엔티티에 한글 속성명 + 추상 타입 추가 |
| 논리 → 물리 | 속성명 → 영문 snake_case, 타입 → DB 종속 타입, 인덱스/DEFAULT 추가 |
| 물리 → 논리 | 영문→한글, DB 타입→추상 타입으로 역변환 |
| 논리 → 개념 | 속성 블록 비움 |

---

## 6. ERD 수준 스펙

| 수준 | 엔티티 | 속성명 | 타입 | PK/FK | 인덱스/DDL | 관계 라벨 |
|------|--------|--------|------|-------|-----------|----------|
| **Conceptual** | O | X | X | X | X | 한글 동사 |
| **Logical** | O | 한글 | 추상 (`Long`, `String`, `Enum` 등) | O | X | 한글 동사 |
| **Physical** | O | 영문 snake_case | DB 종속 (`BIGINT`, `VARCHAR(50)` 등) | O | O | 영문 동사 |

**추상 타입 목록** (논리 ERD 전용): `Long`, `String`, `Int`, `Float`, `Boolean`, `Date`, `DateTime`, `Text`, `Enum`

---

## 7. Mermaid 출력 규칙

### 7-1. 파일 구조

```
---
config:
  theme: dark
  look: handDrawn
  layout: elk
---
erDiagram
    direction BT

    엔티티 정의들...

    관계 정의들...

    엔티티:::클래스 적용들...

    classDef 정의들...
```

순서가 중요하다: **엔티티 → 관계 → 클래스 적용 → classDef 정의** 순으로 작성해야 스타일이 적용된다.

### 7-2. 속성 문법 (논리/물리)

```
type name [PK|FK|UK] ["comment"]
```

- 첫 번째: 타입 (필수)
- 두 번째: 속성명 (필수)
- 세 번째: 키 표기 — `PK`, `FK`, `UK`, 복합은 `PK, FK` (선택)
- 네 번째: 코멘트 — 큰따옴표로 감싼다 (선택, 없으면 `""`)

```
%% 논리 예시
Long 직원ID PK ""
String 이메일 "UQ"
Enum 재직상태 "NN"

%% 물리 예시
BIGINT employee_id PK "AUTO_INCREMENT"
VARCHAR(255) email "UQ, NN"
TIMESTAMP created_at "NN, DEFAULT NOW()"
```

개념 ERD에서는 엔티티 블록을 비워둔다:
```
직원 :::blue {

}
```

### 7-3. 관계 문법

```
엔티티A||--o{엔티티B:"관계동사"
```

| 카디널리티 | Mermaid 표기 |
|-----------|-------------|
| 1:1 | `\|\|--\|\|` |
| 1:N | `\|\|--o{` |
| N:1 | `}o--\|\|` |
| N:M | `}o--o{` |
| 0..1 | `\|\|--o\|` |

### 7-4. 다크 테마 색상 팔레트 (15색)

```
classDef blue   stroke-width:1px,stroke-dasharray:none,stroke:#5b6ef5,fill:#1a2040,color:#a4b0ff
classDef teal   stroke-width:1px,stroke-dasharray:none,stroke:#2dd4bf,fill:#0d2926,color:#7eecd8
classDef gold   stroke-width:1px,stroke-dasharray:none,stroke:#f0c040,fill:#2a2408,color:#f5d87a
classDef green  stroke-width:1px,stroke-dasharray:none,stroke:#4ade80,fill:#0f2518,color:#8aedb3
classDef orange stroke-width:1px,stroke-dasharray:none,stroke:#fb923c,fill:#2a1a0d,color:#fdb97a
classDef red    stroke-width:1px,stroke-dasharray:none,stroke:#f87171,fill:#2a1414,color:#fba4a4
classDef purple stroke-width:1px,stroke-dasharray:none,stroke:#e879f9,fill:#1f0e2a,color:#f0a8fc
classDef lime   stroke-width:1px,stroke-dasharray:none,stroke:#a3e635,fill:#1a2408,color:#c4ee7a
classDef slate  stroke-width:1px,stroke-dasharray:none,stroke:#94a3b8,fill:#1a1e24,color:#b8c4d4
classDef cyan   stroke-width:1px,stroke-dasharray:none,stroke:#67e8f9,fill:#0e2428,color:#9ef0fb
classDef amber  stroke-width:1px,stroke-dasharray:none,stroke:#fbbf24,fill:#2a2208,color:#fcd76a
classDef pink   stroke-width:1px,stroke-dasharray:none,stroke:#f472b6,fill:#2a1020,color:#f9a4d0
classDef indigo stroke-width:1px,stroke-dasharray:none,stroke:#818cf8,fill:#181a30,color:#b0b8fb
classDef violet stroke-width:1px,stroke-dasharray:none,stroke:#a78bfa,fill:#1e1630,color:#c8b4fc
classDef sky    stroke-width:1px,stroke-dasharray:none,stroke:#38bdf8,fill:#0e1e2a,color:#7ed4fb
```

엔티티 수가 15개를 초과하면 색상을 재사용하거나 새 색상을 추가한다.

---

## 8. 파일 작성 후 안내

파일 저장 후 사용자에게 안내한다:

```
✅ ERD 파일을 저장했습니다: ./docs/hr-platform-logical-erd.mmd

VS Code에서 프리뷰하려면:
  1. 파일 열기
  2. Mermaid Preview 확장 설치 (없는 경우): bierner.markdown-mermaid 또는 Mermaid Editor
  3. Ctrl+Shift+P → "Mermaid: Preview" 실행

수정이 필요하면 언제든지 말씀해 주세요.
```

---

## 9. 강제 체크리스트 (파일 작성 전)

```
□ 진입 모드 선택됨 (요구사항 / 코드 동기화 / 기존 수정)
□ ERD 수준 선택됨 (개념 / 논리 / 물리)
□ 저장 위치 확인됨
□ 파일명 프리픽스 확인됨
□ 도출/추출 결과 사용자 확인 완료
□ 해당 수준의 references/ 예제 파일을 읽고 구조 확인함
□ 엔티티 → 관계 → 클래스 적용 → classDef 순서 준수
□ 모든 엔티티에 색상 배정됨
□ 파일 저장 후 VS Code 프리뷰 안내 출력
```

---

## 10. 절대 하지 말 것

- 사용자 확인 없이 파일을 덮어쓰기.
- 코드 파싱 결과를 사용자에게 보여주지 않고 바로 ERD 작성.
- 모드 선택 없이 임의로 진행.
- 다른 스킬(`ddd-workshop` 등)의 설치 여부를 확인하거나 의존.
- classDef를 엔티티 블록 앞에 배치 (렌더링 오류 발생).
