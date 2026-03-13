import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon — 324 Lecture & Study Archives",
  description: "이 프로젝트가 어떻게 만들어지는가에 대한 기록.",
};

export default function ColophonPage() {
  return (
    <div className="colophon-container">
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
          {["Next.js", "Firebase", "Claude", "Vercel"].map((t) => (
            <span key={t} className="colophon-stack-item">{t}</span>
          ))}
        </div>
      </header>

      <article className="colophon-body">
        <section className="colophon-section">
          <h2>사라지는 목소리를 남기는 작업</h2>
          <p>
            이 아카이브는 강연과 연구 내용을 AI를 활용해 구조화하고 편집한
            기록이다. 원본은 클로바노트(Clova Note)로 자동 녹취한 텍스트이며,
            Claude AI가 이를 재구성한다.
          </p>
          <p>
            강연자의 말을 그대로 옮기는 것이 아니다. 90분짜리 강연을 읽는 데
            15분이 걸리는 문서로 압축하면서, 논증의 뼈대는 유지하되 반복과
            군더더기는 걷어낸다. 편집자의 판단이 개입하고, 그 판단이 어디서
            어떻게 이루어졌는지를 가능한 한 드러내려 한다.
          </p>
        </section>

        <section className="colophon-section">
          <h2>프로세스</h2>
          <p>
            작업 흐름은 대략 이렇다. 클로바노트 트랜스크립트를 Claude에 넘긴다.
            Claude가 전체 내용을 파악하고, 강연의 핵심 논증 구조를 추출한다. 이
            과정에서 강연자의 전공, 저서, 학문적 배경을 참조해서 트랜스크립트의
            오류를 바로잡는다. 구조화된 내용을 바탕으로 HTML을 작성하되, 각
            강연의 성격에 맞는 디자인 컨셉을 먼저 정하고 코드를 짠다.
          </p>
        </section>

        <section className="colophon-section">
          <h2>디자인 원칙</h2>
          <p>
            모든 문서는 동일한 기본 구조(Archives 버튼, scroll-to-top, fadeUp
            애니메이션, Noto Serif KR + Noto Sans KR)를 공유하되, 각 강연의
            성격에 맞게 색상과 톤을 변주한다. 영화 비평 강연은 극장 암실을,
            경제학 강연은 학술서적의 종이를, 인류학 강연은 관찰자의 차가움을
            디자인 출발점으로 삼는다.
          </p>
          <p>
            폰트 사이즈는 기본값에서 약 0.06rem 크게 설정한다. 긴 텍스트를 읽는
            데 필요한 최소한의 여유를 확보하기 위해서다. 카드 구조를 사용해
            논증, 데이터, 인용, 논쟁을 시각적으로 분리한다.
          </p>
        </section>

        <section className="colophon-section">
          <h2>왜 이 작업을 하는가</h2>
          <p>
            강연은 한 번 듣고 나면 사라진다. 녹음이 있어도 90분을 다시 듣는
            사람은 거의 없다. 자동 녹취는 텍스트를 남기지만, 그것은 목소리의
            잔해이지 사유의 기록이 아니다. 누군가의 45분짜리 논증을 — 그 사람이
            수십 년 공부한 결과를 — 읽을 만한 형태로 남기는 것. 그리고 그 논증에
            대해 한 번 더 생각하는 것. 이 작업의 목적은 그것이다.
          </p>
        </section>
      </article>

      <footer className="colophon-footer">
        324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
        <a href="/">Archives</a> ·{" "}
        <a href="/notes">개발노트</a>
      </footer>
    </div>
  );
}
