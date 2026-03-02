import type { Metadata } from "next";
import { DM_Serif_Display, Instrument_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${dmSerif.variable} ${instrumentSans.variable}`}
        style={{ fontFamily: "var(--font-sans), sans-serif" }}
      >
        <div className="noise" />
        {children}
      </body>
    </html>
  );
}
