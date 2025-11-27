import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import { cn } from "@/shared/lib/utils";
import { Footer, Header } from "@/widgets/layout";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HIFU比較ナビ | 機種×クリニック×価格を透明に比較",
    template: "%s | HIFU比較ナビ",
  },
  description:
    "HIFU施術の機種ごとの取扱いクリニックと正規化された価格情報を集約。同条件で比較・意思決定できる透明な情報体験を提供します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={cn(notoSansJP.variable, jetBrainsMono.variable, "font-sans antialiased")}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
