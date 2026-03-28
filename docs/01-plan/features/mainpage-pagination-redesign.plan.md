# 메인 페이지 리디자인 — 페이지네이션 + summary 필드

**작성일:** 2026-03-28
**상태:** 설계 완료 → 구현 대기
**대상:** doc.324.ing 메인 아카이브 목록 (`/`)
**원본 제안서:** `docs/proposals/mainpage-ui-redesign.md` 컨셉 A + 페이지네이션

---

## 문제

글이 늘어날수록 메인 페이지 스크롤이 길어짐. 현재 구조는 전체 아카이브를 한 페이지에 렌더링.

---

## 결정된 설계

### 스크롤 제어 방식: 페이지네이션

- **페이지당 20개**
- URL 구조: `/?page=2` (searchParams)
- 필터/검색 변경 시 자동으로 1페이지 리셋
- 아이템 수 < 20이면 페이지네이션 숨김

### 기존 기능 유지

- 그리드/리스트 토글 유지 (사용자 선호 존중, 리스트가 에디토리얼에 더 적합)
- 카테고리 필터 칩 유지
- 초성 검색 포함 검색 바 유지
- 연도/월 그룹핑 유지 (페이지 경계에서 그룹 분리 허용)

### summary 필드 추가 (컨셉 A 원래 의도 포함)

- Firestore `archives` 컬렉션에 `summary` 필드 추가 (string, nullable)
- 어드민 편집 폼에 summary 입력란 추가 (선택 입력)
- 목록에서 제목 아래 1-2줄 소개 텍스트로 표시 (있을 때만)
- `ArchiveListItem` 타입에 `summary?: string` 추가
- 메인 페이지 쿼리에 `.select(... "summary")` 추가

---

## 인터랙션 상태 명세

| 상태 | 표시 내용 |
|------|----------|
| 로딩 | 기존 `loading.tsx` 스켈레톤 유지 |
| 빈 검색 결과 | 이모지 없이 텍스트만: `"'[검색어]' 검색 결과가 없습니다"` |
| 1페이지 미만 | 페이지네이션 숨김 |
| 마지막 페이지 | 다음 버튼 비활성화 |
| 에러 | 기존 `error.tsx` 유지 |

---

## 페이지네이션 컴포넌트 명세

### 데스크탑 (481px+)
```
‹  1  2  3  ...  8  ›
```
- 현재 페이지: `background: var(--fg); color: var(--bg)`
- 버튼 스타일: `border: 1.5px solid var(--border); border-radius: 4px; width: 28px; height: 28px`
- 5페이지 이상일 때 중간 생략 (`···`)

### 모바일 (480px 이하)
```
‹  2 / 5  ›
```
- 이전/다음 화살표 + `현재/전체` 텍스트

---

## 반응형 명세

| Breakpoint | 페이지네이션 |
|-----------|------------|
| 481px+ | 번호 나열 `‹ 1 2 3 ... 8 ›` |
| 480px 이하 | `‹ N/T ›` 형식 |

---

## 구현 범위

### Phase 1 — 페이지네이션
1. `page.tsx`를 서버 컴포넌트 searchParams 방식으로 전환
2. `Pagination` 컴포넌트 신규 작성
3. 빈 상태 이모지(`🔍`) 제거 → 텍스트만
4. `/?page=N` URL 라우팅

### Phase 2 — summary 필드
5. `ArchiveListItem` 타입에 `summary?: string` 추가
6. Firestore 쿼리에 `summary` 필드 추가
7. 목록 UI에 summary 표시 (있을 때만, muted 작은 텍스트)
8. 어드민 편집 폼에 summary 입력란 추가

---

## 디자인 시스템

신규 컴포넌트는 모두 기존 CSS 변수 사용:
```css
--bg: #f8f6f1;  --fg: #1a1a18;  --muted: #5c5a55;
--accent: #c4450a;  --card-bg: #ffffff;  --border: #e5e2db;
```

---

## NOT in scope

- DESIGN.md 작성 (별도 작업)
- 타임라인 뷰 — 장기 과제
- 2패널 레이아웃 — 아카이브 50개+ 도달 시 재검토
- 가상 스크롤 — 페이지네이션으로 충분

## What already exists

- 카테고리 필터, 검색(초성), 그리드/리스트 토글 — 유지
- `loading.tsx`, `error.tsx` — 유지
- CSS 변수 시스템 — 신규 컴포넌트에 그대로 적용
- 연도/월 그룹핑 로직 — 유지, 페이지 단위 슬라이스만 추가

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 2 low issues: duplicate CSS (.item-summary/.card-summary), implicit Suspense fallback |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 4/10 → 8/10, 8 decisions made |

**VERDICT:** Design CLEAR — eng review required before implementation.
