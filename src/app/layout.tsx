import type { Metadata } from "next";
import { Instrument_Sans, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/app/admin/actions";
import { HeadCodeInjector } from "@/components/code-injector";

const notoSerifKR = Noto_Serif_KR({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://d.324.ing"),
  title: "324 Lecture & Study Archives",
  description:
    "324가 듣고, 채득하고, 연구한 내용을 AI를 통해 정리하는 아카이브입니다.",
  openGraph: {
    title: "324 Lecture & Study Archives",
    description:
      "324가 듣고, 채득하고, 연구한 내용을 AI를 통해 정리하는 아카이브입니다.",
    url: "https://d.324.ing/",
    images: ["/og-image.png"],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "324 Lecture & Study Archives",
    description:
      "324가 듣고, 채득하고, 연구한 내용을 AI를 통해 정리하는 아카이브입니다.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headCode = "";
  let bodyCode = "";
  try {
    const settings = await getSiteSettings();
    headCode = settings.headCode || "";
    bodyCode = settings.bodyCode || "";
  } catch (_) {
    // settings not yet configured — skip injection
  }

  return (
    <html lang="ko">
      <body
        className={`${notoSerifKR.variable} ${instrumentSans.variable}`}
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
      >
        <div className="noise" />
        {children}
        {/* head code injection (client-side, appended to document.head) */}
        {headCode && <HeadCodeInjector code={headCode} />}
        {/* body code injection (end of body) */}
        {bodyCode && (
          <div dangerouslySetInnerHTML={{ __html: bodyCode }} />
        )}
      </body>
    </html>
  );
}
