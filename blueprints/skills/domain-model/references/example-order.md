---
domain: order
status: active
owner: backend-team
related_prd: ../../lean-prd.md
---

# 주문 도메인 (Order)

## Role
사용자의 구매 의사를 기록하고, 결제·재고 도메인과 협력해 주문을 확정 상태로 전이시킨다. 환불·배송·정산은 이 도메인의 책임이 아니다.

## Ubiquitous Language
| 용어 | 의미 |
|------|------|
| 주문 (Order) | 구매자가 한 번에 결제하려는 상품 묶음 단위 |
| 주문항목 (OrderItem) | 주문에 포함된 상품 1종 + 수량 |
| 주문상태 (OrderStatus) | `PENDING` → `PAID` / `FAILED` / `CANCELED` |
| 구매자 (Buyer) | 주문을 생성한 사용자 (Identity 도메인의 User에 대응) |

## Invariants
- 주문은 최소 1개 이상의 주문항목을 가진다.
- 주문의 총금액은 모든 주문항목 금액의 합과 일치한다.
- 상태 전이는 `PENDING → PAID`, `PENDING → FAILED`, `PAID → CANCELED`만 허용한다.
- 한 번 `FAILED`가 된 주문은 다시 `PENDING`으로 돌아갈 수 없다.
- 주문항목의 수량은 양의 정수다.

## Domain Events
- `OrderCreated` — 주문이 `PENDING`으로 생성된 직후
- `OrderPaid` — 결제 승인 완료로 `PAID`로 전이된 직후
- `OrderFailed` — 결제 실패로 `FAILED`로 전이된 직후
- `OrderCanceled` — 관리자·시스템에 의해 `CANCELED`로 전이된 직후

## External Dependencies
| 도메인 | 상호작용 |
|--------|----------|
| Identity | 구매자 ID 확인 (동기) |
| Payment | 결제 승인 요청 (동기) |
| Inventory | 재고 확인·차감 (동기) |
| Notification | 주문 상태 이벤트 구독 (비동기) |

## Related Policies
- [POL-0001 환불 정책](../../policies/POL-0001-refund.md)
- [POL-0002 주문 취소 정책](../../policies/POL-0002-cancel.md)

## Open Questions
- 부분 취소(일부 항목만 취소)를 v2 범위에 포함할지 미정
- 주문 이력 보관 기간 결정 필요 (법적 요건 확인 중)
- 동시 주문 시 재고 락 전략 (낙관적 vs 비관적) 결정 필요
