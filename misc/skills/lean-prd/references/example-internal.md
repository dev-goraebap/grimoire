---
name: 배포 자동화 CLI
type: internal
goals_style: strict
status: active
version: v1
---

# Lean PRD — 배포 자동화 CLI

## Overview
백엔드 서비스 배포 절차를 CLI 한 커맨드로 묶어 Jenkins UI 의존을 제거한다.

## Background
현재 배포는 Jenkins UI에서 5단계(빌드 확인 → 스테이징 → 헬스체크 → 프로덕션 승격 → 모니터링)를 클릭해 진행한다. 신규 팀원 온보딩이 평균 2주 걸리고, 클릭 순서 실수로 인한 장애가 분기에 1~2건 발생한다.

## Goals
- 2026-Q2 내 한 커맨드(`deploy prod`)로 전체 파이프라인 실행
- 배포 실패 시 자동 롤백 적중률 95% 이상
- 배포 관련 PagerDuty 알람을 월 5건 이하로 감소 (현재 월 12건)
- 신규 팀원이 첫 배포까지 걸리는 시간을 1일로 단축 (현재 2주)

## Non-goals
- 프론트엔드 배포 (별도 팀 소관)
- 멀티 리전 배포 (단일 리전 전제)
- Jenkins 자체 대체 (내부 러너로 계속 사용)

## Scope
- 사전 체크: 빌드·테스트 상태 확인 — <!-- link: SEQ-001 -->
- 스테이징 배포 + 헬스체크 대기 — <!-- link: SEQ-002 -->
- 프로덕션 승격(승인 필요) — <!-- link: SEQ-003 -->
- 자동 롤백 — <!-- link: SEQ-004 -->
- Slack 배포 알림 — <!-- link: SEQ-005 -->

## Later
- 카나리 배포 지원 (2026-Q3 검토)
- Slack 봇 인터페이스로 CLI 래핑
- 배포 지표 대시보드 (Grafana)

## Constraints / Open Questions
- 프로덕션 승격 시 수동 승인 단계를 CLI에 어떻게 녹일지 (Slack 응답? 웹 링크?)
- 롤백 기준을 헬스체크 실패 횟수로 할지, 지연 시간 임계치로 할지 미정
- 기존 Jenkins Job들과의 병행 운영 기간 결정 필요
