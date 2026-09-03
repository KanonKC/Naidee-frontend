import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ไหนดี — แผนที่กิจกรรมกรุงเทพฯ",
  description: "หาอีเวนต์ เวิร์กช็อป และตลาดนัดใกล้คุณผ่านแผนที่ พร้อมตัวกรองวันที่และหมวดหมู่",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
