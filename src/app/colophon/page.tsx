import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon — 324 Lecture & Study Archives",
  description: "이 프로젝트가 어떻게 만들어지는가에 대한 기록.",
};

export default function ColophonPage() {
  return (
    <div className="colophon-container">
      {/* ── Header ── */}
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
        <h1 className="colophon-title">Colophon</h1>
        <p className="colophon-subtitle">
          이 프로젝트가 어떻게 만들어지는가에 대한 기록.
        </p>
        <div className="colophon-stack">
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
            <span key={tech} className="colophon-stack-item">{tech}</span>
          ))}
        </div>
      </header>

      {/* ── Opening Statement ── */}
      <div className="colophon-body">
        <section className="colophon-section" style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-serif), serif",
              fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
              lineHeight: 1.55,
              letterSpacing: "-0.01em",
              marginBottom: 0,
            }}
          >
            강연은 한 번 듣고 나면 사라진다.
            <br />
            녹음이 있어도 90분을 다시 듣는 사람은 거의 없다.
          </p>
        </section>

        {/* ── Two Column ── */}
        <section className="colophon-section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
            }}
          >
            <div>
              <h2>사라지는 목소리를 남기는 작업</h2>
              <p>
                이 아카이브는 강연과 연구 내용을 AI를 활용해 구조화하고
                편집한 기록이다. 원본은 클로바노트(Clova Note)로 자동 녹취한
                텍스트이며, Claude AI가 이를 재구성한다.
              </p>
              <p>
                강연자의 말을 그대로 옮기는 것이 아니다. 90분짜리 강연을 읽는 데
                15분이 걸리는 문서로 압축하면서, 논증의 뼈대는 유지하되 반복과
                군더더기는 걷어낸다. 편집자의 판단이 개입하고, 그 판단이 어디서
                어떻게 이루어졌는지를 가능한 한 드러내려 한다.
              </p>
            </div>
            <div>
              <h2>왜 이 작업을 하는가</h2>
              <p>
                자동 녹취는 텍스트를 남기지만, 그것은 목소리의
                잔해이지 사유의 기록이 아니다. 누군가의 45분짜리 논증을 — 그 사람이
                수십 년 공부한 결과를 — 읽을 만한 형태로 남기는 것. 그리고 그 논증에
                대해 한 번 더 생각하는 것. 이 작업의 목적은 그것이다.
              </p>
            </div>
          </div>
        </section>

        {/* ── Pull Quote ── */}
        <section
          style={{
            borderTop: "2px solid var(--fg)",
            borderBottom: "2px solid var(--fg)",
            padding: "40px 0",
            margin: "48px 0",
            textAlign: "center",
          }}
        >
          <blockquote
            style={{
              fontFamily: "var(--font-serif), serif",
              fontSize: "1.35rem",
              lineHeight: 1.65,
              letterSpacing: "-0.01em",
              color: "var(--fg)",
            }}
          >
            &ldquo;누군가의 수십 년 공부 결과를 읽을 만한 형태로 남기는 것.
            <br />
            그리고 그 논증에 대해 한 번 더 생각하는 것.&rdquo;
          </blockquote>
        </section>

        {/* ── Process ── */}
        <section className="colophon-section">
          <h2>프로세스</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 0,
              marginTop: "24px",
            }}
          >
            {[
              { step: "01", label: "녹취", desc: "클로바노트로 강연 자동 녹취. 원본 텍스트 추출." },
              { step: "02", label: "구조화", desc: "Claude AI가 논증 구조를 파악하고, 트랜스크립트 오류를 교정." },
              { step: "03", label: "편집", desc: "강연의 성격에 맞는 디자인 컨셉을 정하고 HTML 문서로 작성." },
              { step: "04", label: "아카이브", desc: "완성된 문서를 카테고리별로 분류, 검색 가능한 형태로 게시." },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  borderLeft: "1px solid var(--border)",
                  paddingLeft: "24px",
                  paddingRight: "16px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-serif), serif",
                    fontSize: "2rem",
                    lineHeight: 1,
                    color: "var(--border)",
                    marginBottom: "8px",
                  }}
                >
                  {item.step}
                </span>
                <strong style={{ fontSize: "0.88rem", display: "block", marginBottom: "8px" }}>
                  {item.label}
                </strong>
                <p style={{ fontSize: "0.82rem", lineHeight: 1.65, color: "var(--muted)", marginBottom: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Design Principles ── */}
        <section className="colophon-section">
          <h2>디자인 원칙</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
            }}
          >
            <p>
              모든 문서는 동일한 기본 구조 — Archives 버튼, scroll-to-top,
              fadeUp 애니메이션, Noto Serif KR + Noto Sans KR — 를 공유하되, 각
              강연의 성격에 맞게 색상과 톤을 변주한다.
            </p>
            <p>
              영화 비평 강연은 극장 암실을, 경제학 강연은 학술서적의 종이를,
              인류학 강연은 관찰자의 차가움을 디자인 출발점으로 삼는다.
              폰트 사이즈는 기본값에서 약 0.06rem 크게 설정한다.
            </p>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="colophon-footer">
        <a href="/notes">개발노트</a> · <a href="/">Archives</a>
      </footer>
    </div>
  );
}
