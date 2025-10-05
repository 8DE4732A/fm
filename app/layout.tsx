import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "中国广播电台 - Chinese FM Radio",
  description: "Listen to live FM radio stations from across China",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
