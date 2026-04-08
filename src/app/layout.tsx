import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "칼퇴 계산기 - 오늘 몇 시에 탈출?",
  description:
    "출근 시간을 입력하면 오늘의 예상 퇴근 시간을 재미있게 알려드립니다. 동료들과 퇴근 시간을 겨뤄보세요!",
  openGraph: {
    title: "칼퇴 계산기 🏃‍♂️💨",
    description: "오늘 나는 몇 시에 탈출할 수 있을까? 동료들과 퇴근 시간 대결!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8f6ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
