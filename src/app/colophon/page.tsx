import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon — 324 Lecture & Study Archives",
  description: "이 프로젝트가 어떻게 만들어지는가에 대한 기록.",
};

export default function ColophonPage() {
  return (
    <div className="relative z-1">
      {/* ── Hero ── */}
      <header
        className="border-b-2 border-[var(--fg)]"
        style={{ padding: "100px 0 64px" }}
      >
        <div className="max-w-[1000px] mx-auto px-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-[var(--muted)] no-underline tracking-[0.06em] uppercase mb-12 transition-colors hover:text-[var(--fg)]"
          >
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

          <div className="flex items-end justify-between gap-12 flex-wrap">
            <div>
              <p className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-3">
                About This Project
              </p>
              <h1
                className="font-normal leading-[1.05]"
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontSize: "clamp(3rem, 7vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                Colophon
              </h1>
            </div>
            <p
              className="text-[var(--muted)] text-[0.9rem] leading-[1.6] max-w-[280px] pb-1"
              style={{ fontFamily: "var(--font-sans), sans-serif" }}
            >
              이 프로젝트가 어떻게 만들어지는가에 대한 기록.
            </p>
          </div>
        </div>
      </header>

      {/* ── Opening Statement ── */}
      <section className="max-w-[1000px] mx-auto px-6" style={{ padding: "72px 24px 0" }}>
        <div className="max-w-[680px]">
          <p
            className="text-[1.6rem] leading-[1.55] font-normal text-[var(--fg)]"
            style={{
              fontFamily: "var(--font-serif), serif",
              letterSpacing: "-0.01em",
            }}
          >
            강연은 한 번 듣고 나면 사라진다.
            <br />
            녹음이 있어도 90분을 다시 듣는 사람은 거의 없다.
          </p>
        </div>
      </section>

      {/* ── Two Column Editorial ── */}
      <section className="max-w-[1000px] mx-auto px-6" style={{ padding: "64px 24px 0" }}>
        <div
          className="grid gap-16"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Left Column */}
          <article
            className="text-[0.92rem] leading-[1.9] text-[var(--fg)]"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
          >
            <h2
              className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-6 pb-3 border-b border-[var(--border)]"
            >
              사라지는 목소리를 남기는 작업
            </h2>
            <p className="mb-5 text-justify">
              이 아카이브는 강연과 연구 내용을 AI를 활용해 구조화하고
              편집한 기록이다. 원본은 클로바노트(Clova Note)로 자동 녹취한
              텍스트이며, Claude AI가 이를 재구성한다.
            </p>
            <p className="text-justify">
              강연자의 말을 그대로 옮기는 것이 아니다. 90분짜리 강연을 읽는 데
              15분이 걸리는 문서로 압축하면서, 논증의 뼈대는 유지하되 반복과
              군더더기는 걷어낸다. 편집자의 판단이 개입하고, 그 판단이 어디서
              어떻게 이루어졌는지를 가능한 한 드러내려 한다.
            </p>
          </article>

          {/* Right Column */}
          <article
            className="text-[0.92rem] leading-[1.9] text-[var(--fg)]"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
          >
            <h2
              className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-6 pb-3 border-b border-[var(--border)]"
            >
              왜 이 작업을 하는가
            </h2>
            <p className="text-justify">
              자동 녹취는 텍스트를 남기지만, 그것은 목소리의
              잔해이지 사유의 기록이 아니다. 누군가의 45분짜리 논증을 — 그 사람이
              수십 년 공부한 결과를 — 읽을 만한 형태로 남기는 것. 그리고 그 논증에
              대해 한 번 더 생각하는 것. 이 작업의 목적은 그것이다.
            </p>
          </article>
        </div>
      </section>

      {/* ── Pull Quote ── */}
      <section className="max-w-[1000px] mx-auto px-6" style={{ padding: "72px 24px" }}>
        <div className="border-t-2 border-b-2 border-[var(--fg)]" style={{ padding: "40px 0" }}>
          <blockquote
            className="text-center text-[1.35rem] leading-[1.65] font-normal text-[var(--fg)]"
            style={{
              fontFamily: "var(--font-serif), serif",
              letterSpacing: "-0.01em",
            }}
          >
            &ldquo;누군가의 수십 년 공부 결과를 읽을 만한 형태로 남기는 것.
            <br />
            그리고 그 논증에 대해 한 번 더 생각하는 것.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="max-w-[1000px] mx-auto px-6" style={{ paddingBottom: "72px" }}>
        <h2
          className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-10 pb-3 border-b border-[var(--border)]"
        >
          프로세스
        </h2>

        <div className="grid gap-0" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
          {[
            { step: "01", label: "녹취", desc: "클로바노트로 강연 자동 녹취. 원본 텍스트 추출." },
            { step: "02", label: "구조화", desc: "Claude AI가 논증 구조를 파악하고, 트랜스크립트 오류를 교정." },
            { step: "03", label: "편집", desc: "강연의 성격에 맞는 디자인 컨셉을 정하고 HTML 문서로 작성." },
            { step: "04", label: "아카이브", desc: "완성된 문서를 카테고리별로 분류, 검색 가능한 형태로 게시." },
          ].map((item) => (
            <div
              key={item.step}
              className="border-l border-[var(--border)] pl-6 pr-4"
              style={{ paddingTop: "4px", paddingBottom: "4px" }}
            >
              <span
                className="block text-[2rem] font-normal text-[var(--border)] mb-2"
                style={{ fontFamily: "var(--font-serif), serif", lineHeight: 1 }}
              >
                {item.step}
              </span>
              <h3 className="text-[0.88rem] font-semibold mb-2 text-[var(--fg)]">
                {item.label}
              </h3>
              <p className="text-[0.82rem] leading-[1.65] text-[var(--muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Design Principles ── */}
      <section className="max-w-[1000px] mx-auto px-6" style={{ paddingBottom: "72px" }}>
        <h2
          className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-10 pb-3 border-b border-[var(--border)]"
        >
          디자인 원칙
        </h2>

        <div className="grid gap-16" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div
            className="text-[0.92rem] leading-[1.9] text-[var(--fg)]"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
          >
            <p className="text-justify">
              모든 문서는 동일한 기본 구조 — Archives 버튼, scroll-to-top,
              fadeUp 애니메이션, Noto Serif KR + Noto Sans KR — 를 공유하되, 각
              강연의 성격에 맞게 색상과 톤을 변주한다.
            </p>
          </div>
          <div
            className="text-[0.92rem] leading-[1.9] text-[var(--fg)]"
            style={{ fontFamily: "var(--font-sans), sans-serif" }}
          >
            <p className="text-justify">
              영화 비평 강연은 극장 암실을, 경제학 강연은 학술서적의 종이를,
              인류학 강연은 관찰자의 차가움을 디자인 출발점으로 삼는다.
              폰트 사이즈는 기본값에서 약 0.06rem 크게 설정한다.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section
        className="border-t border-[var(--border)]"
        style={{ padding: "56px 0 72px" }}
      >
        <div className="max-w-[1000px] mx-auto px-6">
          <h2
            className="text-[0.72rem] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-8"
          >
            Built With
          </h2>

          <div className="flex gap-3 flex-wrap">
            {[
              "Next.js 16",
              "React 19",
              "Tailwind CSS 4",
              "Firebase Firestore",
              "Firebase Auth",
              "Vercel",
              "Claude Opus 4.6",
              "Clova Note",
            ].map((tech) => (
              <span
                key={tech}
                className="text-[0.75rem] font-medium tracking-[0.04em] px-3 py-1.5 border border-[var(--border)] rounded-sm text-[var(--fg)] transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Colophon Meta ── */}
      <footer
        className="border-t border-[var(--border)]"
        style={{ padding: "40px 0 80px" }}
      >
        <div className="max-w-[1000px] mx-auto px-6 flex items-center justify-between text-[0.78rem] text-[var(--muted)]">
          <span>324 Lecture &amp; Study Archives</span>
          <div className="flex items-center gap-6">
            <a href="/notes" className="underline hover:text-[var(--fg)] transition-colors">
              개발노트
            </a>
            <a href="/" className="underline hover:text-[var(--fg)] transition-colors">
              Archives
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
