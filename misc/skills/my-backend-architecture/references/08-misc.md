---
section: misc
---

# 기타

## 이 스킬의 적용 범위

### 적합

- 신규 서비스 초기 구조 잡기
- 레거시의 "services/ 안에 수백 개 파일" 평탄 구조 재편
- 팀 2~10명, DI 프레임워크 사용 (NestJS·Spring Boot·.NET 등)
- 도메인이 3~15개 범위

### 부적합

- 한 파일짜리 스크립트, FaaS 단일 람다
- 이미 마이크로서비스로 잘게 쪼개진 조직 (서비스 내부는 오히려 얇아도 됨)
- 조직이 공식적으로 헥사고날·Clean을 규정한 곳 (그 규칙을 따를 것)

---

## ORM 전략 비교

### TypeORM — Rich Entity

엔티티 클래스 자체가 도메인 모델. ORM 데코레이터가 domain 파일에 공존.

```ts
@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;

  promote(newPosition: Position): void {  // 도메인 규칙 메서드
    if (this.tenureMonths < 12) throw new InsufficientTenureError();
    this.position = newPosition;
  }
}
```

| | |
|---|---|
| 보일러플레이트 | 낮음 |
| 도메인 순수성 | 낮음 (ORM 의존이 domain에 새어 들어옴) |
| 단위 테스트 | 좋음 (엔티티 메서드 직접 테스트) |
| 적합한 상황 | ORM 교체 계획 없음, 빠른 시작, 중·소 프로젝트 |

### Drizzle — 스키마 + 도메인 모델 분리

스키마 객체(`shared/db/schema/`)와 도메인 모델(`domain/`)을 분리. Repository가 매핑.

```ts
// shared/db/schema/employees.schema.ts
export const employees = pgTable('employees', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
});

// domain/employee/employee.entity.ts
export class Employee {  // 순수 POJO — ORM 의존 없음
  constructor(readonly id: string, readonly name: string) {}
  promote(newPosition: Position): void { ... }
}
```

| | |
|---|---|
| 보일러플레이트 | 높음 (매핑 코드 직접 작성) |
| 도메인 순수성 | 높음 |
| 단위 테스트 | 매우 좋음 (domain이 ORM과 완전 독립) |
| 적합한 상황 | 도메인 순수성 중시, ORM 교체 가능성 고려, SQL 제어·성능 중요 |

### Prisma — Drizzle과 유사

`schema.prisma` DSL에서 타입 자동 생성. Drizzle과 같은 분리 전략.

| | |
|---|---|
| 보일러플레이트 | 중간 (스키마 DSL이 직관적) |
| 도메인 순수성 | 높음 |
| 단위 테스트 | 매우 좋음 |
| 적합한 상황 | 스키마 DSL 선호, 마이그레이션 자동화, 대중적 생태계 원할 때 |

### 선택 기준

```
ORM 교체 계획 없고 빠른 시작이 우선  →  TypeORM
도메인 순수성 + SQL 제어가 우선      →  Drizzle
스키마 DSL + 자동 마이그레이션 선호  →  Prisma
```

---

## 의식적 타협 — Not Clean Architecture

이 스킬은 완벽한 클린 아키텍처(Uncle Bob 기준)가 아니다.

| 지점 | Clean 원칙 | 이 스킬 |
|------|-----------|---------|
| 도메인의 외부 의존 | 0 | `shared` 참조 허용 |
| 도메인 모델 vs ORM 엔티티 | 항상 분리 | ORM 전략별 선택 |
| Port/Adapter | 모든 외부 경계에 | 실제 필요할 때만 DIP 적용 |
| Presentation / Application 분리 | 명시적 분리 | `app` 레이어에서 결합 |

**타협 이유**:
- 단위 테스트 가능성만 지켜지면 순수성의 추가 이득은 한계체감이 빠르다
- 레이어 수가 늘수록 머릿속 모델도 무거워진다 — 과한 순수성은 생산성 세금

**대신 반드시 지키는 것**:
- 레이어 의존의 단방향성
- module 경계 (Public API)
- 도메인 정책의 단위 테스트 가능성
