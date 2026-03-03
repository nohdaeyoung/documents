import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개발노트 — 324 Lecture & Study Archives",
  description: "이 프로젝트가 만들어진 과정의 기록.",
};

const entries = [
  {
    date: "2026-03-04",
    title: "버그 수정 3종 · 카테고리 ID 마이그레이션 · 캐시 전략 개선",
    items: [
      "TOC 앵커 첫 클릭 새로고침 버그 수정 — iframe sandbox에서 allow-same-origin 제거, srcdoc이 부모 baseURI를 상속하지 않아 #anchor 클릭이 네이티브 스크롤로 처리됨",
      "아티클 저장 후 내용 미반영 수정 — revalidatePath를 encodeURIComponent(slug) 방식으로 개선해 한글 슬러그 캐시 키 불일치 해소, /archives/[slug] 페이지 ISR 타이머 제거 후 온디맨드 무효화로 전환",
      "카테고리 ID 수정 가능 — 편집 폼에 ID 입력 필드 추가, 변경 시 renameCategoryId 서버 액션으로 새 doc 생성 → archives.categoryId 일괄 마이그레이션 → 기존 doc 삭제 (Firestore batch 원자적 처리)",
      "카테고리 관리자 UX 개선 — 아카이브 수 배지(useMemo 계산), ↗ 카테고리 페이지 바로가기 링크, ID 변경 시 노란 경고 표시 및 영향 아카이브 수 안내",
      "PDCA 갭 분석 재실행 — 5개 변경사항 전부 검증, 전체 매치율 92% → 93% 상승",
    ],
    tags: ["Bugfix", "Admin", "Performance"],
  },
  {
    date: "2026-03-03",
    title: "전면 기능 확장 — 에디터·설정·분류 페이지",
    items: [
      "아티클 수정 팝업 → 전체 페이지 전환 — /admin/edit/[id] 전용 라우트 신설, URL 기반 접근 가능",
      "소스/미리보기/WYSIWYG 3탭 에디터 — HTML 소스 직접 편집 + 렌더링 미리보기 + designMode 기반 WYSIWYG 편집",
      "관리자 Settings 탭 추가 — archive-title·archive-subtitle 편집, head/body 코드 삽입 기능",
      "분류별 전용 페이지 신설 — /category/[id], SSG + 1시간 ISR, 메인 필터에서 '분류 페이지' 링크 연결",
      "메인 페이지 폭 10% 확장 — max-width 720px → 792px (colophon·notes·category 동일 적용)",
      "일자 시분초 표시 — datetime-local 입력으로 교체, 관리자·목록 모두 'YYYY-MM-DD HH:MM' 포맷 표시",
      "사이트 제목·부제 동적 로드 — Firestore settings 컬렉션 기반, 관리자에서 실시간 수정 가능",
    ],
    tags: ["Feature", "Editor", "Admin", "UI"],
  },
  {
    date: "2026-03-02",
    title: "개발노트 신설 · UI 개선 · 관리자 성능 최적화",
    items: [
      "개발노트 페이지 신설 — 프로젝트 시작부터 오늘까지 작업 히스토리 기록",
      "아카이브 목록 새창열기 아이콘 추가 — 각 항목 우측에 hover 시 노출, 별도 탭으로 열기",
      "Colophon 페이지 디자인 전면 개선 — tech stack 배지, 섹션 구조, 메인 페이지와 디자인 언어 통일",
      "관리자 목록 쿼리 최적화 — contentHtml 필드 제외 select() 적용, 수백 KB 전송 제거로 초기 로드 대폭 단축",
      "관리자 아카이브 편집 시 contentHtml lazy load — 편집 모달 열릴 때만 해당 문서 content 개별 fetch",
      "관리자 날짜순 정렬 적용 — 공개 페이지와 동일한 date desc 순서",
    ],
    tags: ["UI", "Performance", "Admin"],
  },
  {
    date: "2026-03-01",
    title: "속도 최적화 · 정렬 개선 · CSS 버그 수정",
    items: [
      "ISR 최적화 — generateStaticParams 적용으로 전체 아카이브 SSG 변환, 654ms(Dynamic) → 264ms(CDN HIT)",
      "revalidate 3600 설정 — 홈 및 아카이브 페이지 1시간 캐시 주기",
      "관리자 뮤테이션에 revalidatePath 추가 — 등록·수정·삭제·순서변경 즉시 캐시 무효화",
      "아카이브 목록 날짜순 정렬 — orderBy date desc, 최신 등록 문서가 상단에 노출",
      "아카이브 항목 파일 크기 표시 제거 — 불필요 정보 정리, 제목·날짜만 표시",
      "Section B hero margin-top 버그 수정 — 고정 상단 바(41.5px)와 콘텐츠 사이 공백 패치 (48px → 41px)",
    ],
    tags: ["Performance", "ISR", "Bugfix"],
  },
  {
    date: "2026-02",
    title: "관리자 페이지 보안 강화 · UX 개선",
    items: [
      "Firebase Client SDK → Admin SDK + Next.js Server Actions 전환 — 브라우저의 Firestore 직접 접근 제거",
      "관리자 인증 흐름 개선 — Firebase Auth 기반 서버 사이드 검증",
      "삭제 confirm() 네이티브 다이얼로그 → 인라인 확인/취소 버튼 UI로 교체 — 커스텀 스타일 적용 가능",
      "카테고리 관리 기능 안정화 — 생성·수정·삭제·순서 변경",
    ],
    tags: ["Security", "Admin", "UX"],
  },
  {
    date: "2026-01",
    title: "프로젝트 초기 구축",
    items: [
      "Next.js 16 App Router + Firebase Firestore 기반 아카이브 사이트 구축",
      "아카이브 뷰어 — iframe srcDoc으로 HTML 콘텐츠 직접 렌더링, postMessage 네비게이션",
      "관리자 페이지 — Firebase Auth 인증, 아카이브 CRUD, 카테고리 관리, 수동 순서 변경",
      "디자인 시스템 — DM Serif Display + Instrument Sans, 크림(#f8f6f1) 배경, 카드형 목록",
      "카테고리 필터 + 검색 기능 — 실시간 클라이언트사이드 필터링",
      "Vercel 배포 — d.324.ing 도메인 연결",
    ],
    tags: ["Architecture", "Design", "Launch"],
  },
];

export default function NotesPage() {
  return (
    <div className="notes-container">
      <header className="colophon-header">
        <a href="/" className="colophon-back">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Archives
        </a>
        <h1 className="colophon-title">개발노트</h1>
        <p className="colophon-subtitle">
          이 프로젝트가 만들어진 과정의 기록.
        </p>
      </header>

      <div className="notes-timeline">
        {entries.map((entry, i) => (
          <article key={i} className="notes-entry">
            <div className="notes-entry-date">{entry.date}</div>
            <div className="notes-entry-content">
              <h2>{entry.title}</h2>
              <ul>
                {entry.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
              <div className="notes-entry-tags">
                {entry.tags.map((tag) => (
                  <span key={tag} className="notes-entry-tag">{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="colophon-footer">
        324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
        <a href="/">Archives</a>
      </footer>
    </div>
  );
}
