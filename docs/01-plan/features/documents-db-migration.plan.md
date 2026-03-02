# Plan: Documents DB Migration

## 1. 개요

### 1.1 프로젝트 배경
- **현재 상태**: GitHub Pages 정적 사이트 (`doc.324.ing`)
- **문제**: JSON 파일 기반 데이터 관리의 한계 (동시 수정 충돌, 본문 검색 불가, 확장성 부족)
- **목표**: Supabase DB로 전환하여 메타데이터 + 콘텐츠 모두 동적 관리
- **핵심 제약**: 각 문서의 고유 디자인(CSS/레이아웃) 100% 유지

### 1.2 프로젝트 범위
| 포함 | 제외 |
|------|------|
| 메타데이터 DB 마이그레이션 (archives.json → Supabase) | 문서 콘텐츠 자체의 디자인 변경 |
| 카테고리 DB 마이그레이션 (categories.json → Supabase) | 새로운 문서 작성 |
| 27개 HTML 콘텐츠 DB 저장 | 모바일 앱 개발 |
| Admin 페이지 Supabase 연동 | 유료 결제/구독 기능 |
| 프론트엔드 동적 렌더링 전환 | 다국어 지원 |
| 인증 체계 개선 (하드코딩 → Supabase Auth) | |

## 2. 현재 시스템 분석

### 2.1 현재 아키텍처
```
GitHub Pages (정적 호스팅)
├── index.html          → fetch('archives.json') → 클라이언트 렌더링
├── archives.json       → 27개 문서 메타데이터 (JSON 배열)
├── categories.json     → 7개 카테고리 정의
├── archives/           → 27개 독립 HTML 파일 (각각 고유 CSS)
├── admin/index.html    → GitHub API로 CRUD, 하드코딩 인증
├── colophon.html       → 프로젝트 소개
└── .github/workflows/  → push 시 archives.json 자동 재생성
```

### 2.2 데이터 구조 (현재)

**archives.json 엔트리:**
```json
{
  "name": "파일명.html",
  "title": "문서 제목",
  "ext": "html",
  "category": "blog",
  "size": 25588,
  "date": "2025-03-20",
  "order": 4,
  "thumbnail": ""
}
```

**categories.json 엔트리:**
```json
{
  "id": "blog",
  "label": "Talk",
  "color": "#6366f1"
}
```

**콘텐츠 특성:**
- 각 HTML 파일은 완전 독립적 (자체 `<style>`, 자체 font import, 자체 색상 체계)
- 강연자/주제에 맞춘 개별 디자인 (예: 영화 비평 → 극장 암실 톤, 경제학 → 학술 종이 톤)
- 파일 크기: 12KB ~ 357KB
- 공통 요소: Archives 돌아가기 버튼, scroll-to-top, fadeUp 애니메이션

### 2.3 현재 문제점
1. **보안**: Admin 비밀번호 클라이언트 하드코딩 (`dynoworld/0324`)
2. **데이터**: JSON 파일 동시 수정 충돌 가능, GitHub API 의존
3. **검색**: 제목/파일명만 검색 가능 (본문 검색 불가)
4. **확장성**: 모든 메타데이터를 한 번에 fetch (페이지네이션 없음)
5. **콘텐츠 관리**: 27개 HTML을 개별 파일로 관리, 공통 변경 어려움

## 3. 목표 시스템 설계

### 3.1 목표 아키텍처
```
Next.js (Vercel 배포)
├── / (메인 목록)         → Supabase에서 메타데이터 조회
├── /archives/[slug]      → Supabase에서 HTML 콘텐츠 조회 → 렌더링
├── /admin                → Supabase Auth 인증 → CRUD 관리
├── /colophon             → 정적 페이지 유지
│
└── Supabase
    ├── archives 테이블   → 메타데이터 + HTML 본문
    ├── categories 테이블 → 카테고리 정의
    └── Auth              → 관리자 인증
```

### 3.2 DB 스키마 (Supabase)

**archives 테이블:**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동 생성 |
| slug | text (UNIQUE) | URL 경로용 (기존 파일명에서 .html 제거) |
| title | text | 문서 제목 |
| category_id | text (FK) | 카테고리 참조 |
| content_html | text | 전체 HTML 콘텐츠 (스타일 포함) |
| size | integer | 콘텐츠 크기 (bytes) |
| date | date | 원본 날짜 |
| display_order | integer | 정렬 순서 |
| thumbnail | text | 썸네일 URL (향후 사용) |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

**categories 테이블:**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | text (PK) | 카테고리 ID (html, md, blog 등) |
| label | text | 표시명 |
| color | text | HEX 색상 코드 |
| display_order | integer | 정렬 순서 |
| created_at | timestamptz | 생성일 |

### 3.3 콘텐츠 렌더링 전략

**핵심 결정: HTML 전체를 DB에 저장 + iframe/srcdoc 또는 shadow DOM으로 렌더링**

각 문서가 완전히 다른 CSS를 가지므로:
- `content_html` 컬럼에 `<!DOCTYPE html>` ~ `</html>` 전체 저장
- 뷰어 페이지에서 `<iframe srcdoc={content_html}>` 방식으로 격리 렌더링
- 기존 디자인 100% 유지 (CSS 충돌 없음)
- iframe 내부의 네비게이션(Archives 버튼 등)은 부모 프레임과 통신

### 3.4 인증 체계 개선
| 현재 | 목표 |
|------|------|
| 하드코딩 ID/PW (`dynoworld/0324`) | Supabase Auth (이메일/비밀번호) |
| GitHub PAT 입력 | 불필요 (Supabase RLS로 대체) |
| sessionStorage 기반 | Supabase 세션 관리 |

## 4. 마이그레이션 전략

### 4.1 단계별 계획

**Phase 1: 프로젝트 초기화** (기반 작업)
- Next.js 프로젝트 생성 (App Router)
- Supabase 프로젝트 생성 및 테이블 생성
- 환경변수 설정

**Phase 2: 데이터 마이그레이션**
- 마이그레이션 스크립트 작성 (Node.js)
- archives.json → archives 테이블
- categories.json → categories 테이블
- 27개 HTML 파일 내용 → archives.content_html

**Phase 3: 프론트엔드 구축**
- 메인 목록 페이지 (기존 index.html 디자인 유지)
- 개별 문서 뷰어 (iframe 기반 렌더링)
- 카테고리 필터 + 검색 (Supabase full-text search)
- colophon 페이지

**Phase 4: Admin 페이지 재구축**
- Supabase Auth 로그인
- 문서 CRUD (파일 업로드 → DB 저장)
- 카테고리 관리
- 드래그 앤 드롭 정렬
- HTML 에디터 + 미리보기

**Phase 5: 배포 및 전환**
- Vercel 배포 설정
- 도메인 전환 (doc.324.ing → Vercel)
- GitHub Pages 리다이렉트 설정
- SEO 유지 (기존 URL 호환)

### 4.2 리스크 및 대응

| 리스크 | 영향 | 대응 |
|--------|------|------|
| iframe 내 링크 클릭 시 네비게이션 문제 | 중 | postMessage API로 부모-자식 통신 |
| 대용량 HTML (357KB) DB 저장 성능 | 하 | Supabase text 컬럼 제한 없음, 필요시 Storage 분리 |
| SEO 변경 (기존 URL 깨짐) | 고 | Next.js rewrites로 기존 `/archives/파일명.html` 경로 유지 |
| 기존 디자인 깨짐 | 고 | iframe sandboxing으로 완전 격리, 마이그레이션 후 전수 검증 |
| Supabase 무료 플랜 제한 | 중 | 현재 규모(27문서)면 충분, 추후 확장 시 유료 전환 |

## 5. 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| 프론트엔드 | Next.js 15 (App Router) | SSR/SSG, 파일 라우팅, Vercel 최적화 |
| DB/백엔드 | Supabase (PostgreSQL) | 인증, 실시간, RLS, 무료 플랜 |
| 배포 | Vercel | Next.js 최적 호스팅, 자동 빌드 |
| 스타일링 | Tailwind CSS (목록/Admin) + 기존 CSS (문서 내부) | 목록 페이지는 Tailwind, 문서는 기존 유지 |

## 6. 성공 기준

| 항목 | 기준 |
|------|------|
| 데이터 마이그레이션 | 27개 문서 + 7개 카테고리 100% 이전 |
| 디자인 유지 | 각 문서의 기존 디자인이 100% 동일하게 렌더링 |
| 인증 보안 | 하드코딩 비밀번호 제거, Supabase Auth 적용 |
| 기존 URL 호환 | `/archives/파일명.html` 경로 접근 가능 |
| 검색 기능 | 제목 + 본문 전문 검색 가능 |
| Admin CRUD | 문서 등록/수정/삭제/정렬 정상 작동 |
| 성능 | 메인 페이지 로딩 2초 이내 |
