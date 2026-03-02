# Design: Documents DB Migration

> Plan 참조: `docs/01-plan/features/documents-db-migration.plan.md`
> **변경**: Supabase → Firebase (Firestore + Auth) 로 전환 (사용자 요청)

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel (Next.js 15)                  │
│                                                         │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ / (목록) │  │ /archives/    │  │ /admin           │  │
│  │          │  │   [slug]      │  │   /login         │  │
│  │ SSR      │  │   SSR+iframe  │  │   /dashboard     │  │
│  └────┬─────┘  └───────┬───────┘  └────────┬─────────┘  │
│       │                │                    │            │
│  ┌────┴────────────────┴────────────────────┴─────────┐  │
│  │          Firebase Client (Admin SDK + Client SDK)   │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────┐
│                      Firebase Cloud                      │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │   Auth   │  │  Firestore   │  │ Security Rules     │ │
│  │          │  │              │  │                    │ │
│  │ Email/PW │  │ archives     │  │ read: public       │ │
│  │ Session  │  │ categories   │  │ write: auth only   │ │
│  └──────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택

| 영역 | 기술 | 버전 | 용도 |
|------|------|------|------|
| Framework | Next.js | 15 | App Router, SSR |
| Language | TypeScript | 5.x | 타입 안전성 |
| DB | Firebase Firestore | 10.x | NoSQL 문서 DB |
| Auth | Firebase Auth | 10.x | 이메일/비밀번호 인증 |
| Server SDK | firebase-admin | 13.x | SSR 서버사이드 조회 |
| Styling | Tailwind CSS | 4.x | 목록/Admin UI |
| 배포 | Vercel | - | 호스팅, 도메인 |
| 정렬 | @dnd-kit/core | latest | Admin 드래그 정렬 |

## 2. Firestore 컬렉션 설계

### 2.1 categories 컬렉션

```
/categories/{categoryId}
{
  label: string,          // "Talk", "Economy" 등
  color: string,          // "#6366f1"
  displayOrder: number,   // 0, 1, 2...
  createdAt: Timestamp
}
```

문서 ID = 카테고리 ID (`blog`, `md`, `f1` 등)

### 2.2 archives 컬렉션

```
/archives/{autoId}
{
  slug: string,           // URL 경로 (파일명에서 .html 제거)
  title: string,          // 문서 제목
  categoryId: string,     // 카테고리 참조
  contentHtml: string,    // 전체 HTML (<!DOCTYPE> ~ </html>)
  fileExt: string,        // "html"
  size: number,           // bytes
  date: string,           // "2025-03-20" (ISO date string)
  displayOrder: number,   // 정렬 순서
  thumbnail: string,      // 썸네일 URL (향후 사용)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2.3 Firestore 인덱스

```
// firestore.indexes.json
- archives: displayOrder ASC (기본 정렬)
- archives: categoryId ASC, displayOrder ASC (카테고리 필터)
```

### 2.4 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // archives: 누구나 읽기, 인증된 사용자만 쓰기
    match /archives/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // categories: 동일
    match /categories/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 3. 프로젝트 구조

```
documents/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # 루트 레이아웃 (폰트, 메타)
│   │   ├── page.tsx                    # 메인 목록 페이지 (SSR)
│   │   ├── archives/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # 문서 뷰어 (SSR + iframe)
│   │   ├── colophon/
│   │   │   └── page.tsx                # Colophon 페이지
│   │   └── admin/
│   │       ├── layout.tsx              # Admin 레이아웃 (인증 가드)
│   │       ├── login/
│   │       │   └── page.tsx            # 로그인 페이지
│   │       └── page.tsx                # 대시보드 (파일 목록/카테고리 관리)
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts               # Firebase 클라이언트 초기화
│   │   │   ├── admin.ts                # Firebase Admin SDK (서버)
│   │   │   └── auth.ts                 # Auth 헬퍼 함수
│   │   └── types.ts                    # 타입 정의
│   ├── components/
│   │   ├── archive-list.tsx            # 목록 컴포넌트
│   │   ├── archive-viewer.tsx          # iframe 뷰어
│   │   ├── category-filter.tsx         # 카테고리 필터 탭
│   │   ├── search-bar.tsx              # 검색 바
│   │   └── admin/
│   │       ├── file-form.tsx           # 파일 등록/수정 폼
│   │       ├── file-list.tsx           # 관리 파일 목록 (드래그 정렬)
│   │       └── category-manager.tsx    # 카테고리 CRUD
│   └── middleware.ts                   # Next.js 미들웨어 (세션)
├── scripts/
│   └── migrate.ts                      # 데이터 마이그레이션 스크립트
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── og-image.png
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local                          # Firebase 키
```

## 4. 페이지별 상세 설계

### 4.1 메인 목록 페이지 (`/`)

**렌더링**: SSR (서버 컴포넌트, Firebase Admin SDK)

**Firestore 쿼리 (서버):**
```typescript
// Firebase Admin SDK로 서버사이드 조회
const archivesSnap = await adminDb
  .collection('archives')
  .orderBy('displayOrder')
  .select('slug', 'title', 'categoryId', 'size', 'date', 'displayOrder', 'thumbnail')
  .get();

const categoriesSnap = await adminDb
  .collection('categories')
  .orderBy('displayOrder')
  .get();
```

**검색**: 클라이언트에서 제목 기반 필터링 (Firestore는 전문검색 미지원 → 클라이언트 필터)
- 향후 Algolia 또는 Typesense 연동으로 전문검색 확장 가능

### 4.2 문서 뷰어 (`/archives/[slug]`)

**렌더링**: SSR → HTML 콘텐츠를 서버에서 조회 → iframe으로 전달
**핵심**: 기존 디자인 100% 유지를 위한 iframe 격리

**Firestore 쿼리:**
```typescript
const snap = await adminDb
  .collection('archives')
  .where('slug', '==', slug)
  .limit(1)
  .get();
```

**iframe 내부 스크립트 주입** (기존 HTML의 `</body>` 앞에):
```javascript
<script>
  // 높이 전달
  new ResizeObserver(() => {
    parent.postMessage({
      type: 'resize',
      height: document.documentElement.scrollHeight
    }, '*');
  }).observe(document.documentElement);

  // Archives 링크 가로채기
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && (a.href.includes('/documents') || a.href.includes('doc.324.ing'))) {
      e.preventDefault();
      parent.postMessage({ type: 'navigate', url: '/' }, '*');
    }
  });
</script>
```

### 4.3 Admin 페이지 (`/admin`)

**인증**: Firebase Auth (이메일/비밀번호)
**보호**: 클라이언트 AuthContext에서 onAuthStateChanged 확인

**Firestore CRUD (클라이언트):**
```typescript
// 파일 등록
await addDoc(collection(db, 'archives'), {
  slug, title, categoryId, contentHtml, fileExt, size, date, displayOrder,
  createdAt: serverTimestamp(), updatedAt: serverTimestamp()
});

// 파일 수정
await updateDoc(doc(db, 'archives', id), {
  title, categoryId, contentHtml, size, date,
  updatedAt: serverTimestamp()
});

// 파일 삭제
await deleteDoc(doc(db, 'archives', id));

// 순서 변경 (배치)
const batch = writeBatch(db);
orderedIds.forEach((id, i) => {
  batch.update(doc(db, 'archives', id), { displayOrder: i });
});
await batch.commit();
```

### 4.4 Colophon 페이지 (`/colophon`)

기존 `colophon.html` 내용을 Next.js 페이지로 변환. DB 불필요.

## 5. URL 라우팅 및 SEO

### 5.1 URL 호환 (next.config.ts)

```typescript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/archives/:slug.html',
        destination: '/archives/:slug',
      },
    ];
  },
};
```

### 5.2 slug 규칙

파일명에서 `.html` 제거, 한글 포함 허용:
```
장류진_북토크.html → slug: "장류진_북토크"
```

### 5.3 SEO 메타데이터

```typescript
export async function generateMetadata({ params }) {
  const archive = await getArchiveBySlug(params.slug);
  return {
    title: `${archive.title} — 324 Archives`,
    openGraph: {
      title: archive.title,
      url: `https://doc.324.ing/archives/${archive.slug}`,
      image: '/og-image.png',
    },
  };
}
```

## 6. 마이그레이션 스크립트

### 6.1 데이터 매핑

| archives.json 필드 | Firestore 필드 | 변환 |
|---------------------|---------------|------|
| name | slug | `.html` 제거 |
| title | title | 그대로 |
| ext | fileExt | 그대로 |
| category | categoryId | 그대로 |
| size | size | 그대로 |
| date | date | 그대로 (string) |
| order | displayOrder | 그대로 |
| thumbnail | thumbnail | 그대로 |
| (파일 내용) | contentHtml | 파일 읽기 |

### 6.2 실행 흐름

```
1. categories.json 읽기 → Firestore categories 컬렉션에 set
2. archives.json 읽기 → 각 항목마다:
   a. archives/{name} 파일 내용 읽기
   b. Firestore archives 컬렉션에 add
3. 결과 리포트 출력
```

## 7. 인증 설계

### 7.1 Firebase Auth

- **방식**: 이메일/비밀번호
- **관리자 계정**: Firebase Console에서 직접 생성 (1개)
- **회원가입**: UI에서 비활성화 (관리자만 사용)

### 7.2 인증 흐름

```
1. /admin 접근 → AuthContext 확인
2. 미인증 → /admin/login 리다이렉트
3. signInWithEmailAndPassword() → 성공 → /admin 이동
4. 로그아웃 → signOut() → /admin/login 이동
```

## 8. 환경변수

```env
# .env.local (클라이언트)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc

# .env.local (서버 - Admin SDK)
FIREBASE_ADMIN_PROJECT_ID=xxx
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## 9. 구현 순서

| 순서 | 작업 | 의존성 | 예상 파일 |
|------|------|--------|-----------|
| 1 | Next.js 프로젝트 초기화 + Tailwind + TypeScript | 없음 | package.json, tsconfig |
| 2 | Firebase 클라이언트/Admin SDK 설정 | 1 | lib/firebase/*.ts |
| 3 | 마이그레이션 스크립트 작성 + 실행 | 2 | scripts/migrate.ts |
| 4 | 메인 목록 페이지 | 2, 3 | app/page.tsx, components |
| 5 | 문서 뷰어 페이지 | 2, 3 | app/archives/[slug]/page.tsx |
| 6 | Firebase Auth + Admin 로그인 | 2 | admin/login, lib/firebase/auth.ts |
| 7 | Admin 대시보드 | 6 | admin/page.tsx, admin components |
| 8 | Colophon 페이지 | 1 | app/colophon/page.tsx |
| 9 | URL rewrite + SEO | 4, 5 | next.config.ts |
| 10 | Vercel 배포 + 도메인 연결 | 전체 | - |

## 10. 검증 항목

| 항목 | 검증 방법 |
|------|-----------|
| 27개 문서 마이그레이션 완료 | Firestore 문서 수 = 27, 각 contentHtml 존재 |
| 기존 디자인 유지 | 각 문서 iframe 렌더링 → 기존 GitHub Pages와 비주얼 비교 |
| 카테고리 필터 작동 | 각 카테고리 클릭 → 정확한 문서 수 표시 |
| 검색 작동 | 제목 키워드 → 관련 문서 반환 |
| Admin 인증 | 비인증 접근 차단, 로그인 후 접근 허용 |
| Admin CRUD | 문서 등록/수정/삭제 후 목록 반영 확인 |
| 드래그 정렬 | 순서 변경 → 저장 → 새로고침 후 유지 |
| 기존 URL 호환 | `/archives/파일명.html` → 정상 렌더링 |
| 모바일 반응형 | 320px~1440px 뷰포트 확인 |
