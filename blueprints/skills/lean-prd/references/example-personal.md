---
name: 블로그 자동 포스팅 봇
type: personal
goals_style: free
status: draft
version: v1
---

# Lean PRD — 블로그 자동 포스팅 봇

## Overview
매주 노션에 쌓이는 글 초안을 Markdown으로 변환해 GitHub Pages 기반 블로그에 자동으로 올리는 봇.

## Background
매번 노션 → Markdown 변환 → GitHub 푸시를 수동으로 하고 있어 시간이 아깝고 종종 포스팅을 까먹는다. 주말 한 번에 몰아 올리는 패턴도 글의 신선도를 떨어뜨린다.

## Goals
- 노션 문서를 수동 개입 없이 블로그로 발행
- 예약 발행(주간 배치)로 포스팅 루틴을 고정
- 이미지 경로·frontmatter 손질 같은 반복 작업 제거

## Non-goals
- 블로그 테마 커스터마이징 (Hugo 기본 테마 그대로)
- 여러 블로그 플랫폼 동시 지원 (GitHub Pages 전용)
- 댓글·분석 기능 자체 구현

## Scope
- 노션 문서 조회(태그 필터) — <!-- link: SEQ-001 -->
- Markdown 변환 + frontmatter 주입 — <!-- link: SEQ-002 -->
- 이미지 다운로드 + 상대 경로 치환 — <!-- link: SEQ-003 -->
- GitHub 푸시 + Actions 트리거 — <!-- link: SEQ-004 -->

## Later
- 이미지 자동 최적화 (WebP 변환)
- 태그 기반 카테고리 자동 분류
- 발행 예약 시각 개별 지정
- OG 이미지 자동 생성

## Constraints / Open Questions
- 노션 API rate limit이 배치 크기 제한 요소
- 기존 수동 발행 문서와 ID 충돌 처리 방안 미정
