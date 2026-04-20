# 예제: 단순 단일 Aggregate (flat 구조)

BC가 불명확하거나 단일 Aggregate일 때의 기본 형태.  
파일 경로: `docs/domains/order.md`

---

```markdown
---
aggregate: Order
status: active
---

# Order

## Role

구매자의 구매 의사를 기록하고, 상태 전이를 관리한다.
결제 승인과 재고 확보는 각각 Payment · Inventory 소관이다.
환불·배송·정산은 이 Aggregate의 책임이 아니다.

## Ubiquitous Language

| 용어 | 의미 |
|------|------|
| 주문 (Order) | 구매자가 한 번에 결제하려는 상품 묶음 단위 |
| 주문항목 (OrderItem) | 주문에 포함된 상품 1종 + 수량. Order 없이 단독 존재 불가. |
| 주문상태 (OrderStatus) | `PENDING → PAID / FAILED`, `PAID → CANCELED` |
| 총금액 (Money) | 주문의 지불 금액 (VO) |

## Structure

- **Root**: Order
- **내부 Entity**: OrderItem
- **VO**: OrderStatus, Money
- **외부 참조**: `buyerId: string` (Identity의 User ID)

## Invariants

- 주문은 최소 1개 이상의 OrderItem을 가진다
- 총금액은 모든 OrderItem 금액의 합과 일치한다
- 상태 전이: `PENDING → PAID`, `PENDING → FAILED`, `PAID → CANCELED`만 허용
- `FAILED` 상태는 `PENDING`으로 되돌릴 수 없다
- OrderItem의 단가·수량은 생성 후 변경 불가

## External Dependencies

| Aggregate / BC | 참조 방식 | 비고 |
|----------------|-----------|------|
| Identity (User) | `buyerId: string` | ID 참조. 사용자 상세는 Identity 소관. |
| Payment | 계약 인터페이스 | 결제 승인 요청. 결과(성공/실패)로 상태 전이. |
| Inventory | 계약 인터페이스 | 재고 확인·차감. |

## Open Questions

- 부분 취소(일부 항목만 취소) 지원 시 Invariant 완화 여부
- 동시 주문 시 재고 락 전략 (낙관적 vs 비관적) 결정 필요
```
