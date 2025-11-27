import Link from "next/link";
import { Button } from "@/components/ui/button";

const footerLinks = {
  explore: [
    { href: "/devices", label: "機種一覧" },
    { href: "/clinics", label: "クリニック検索" },
    { href: "/compare", label: "条件比較" },
    { href: "/prices", label: "相場ガイド" },
  ],
  info: [
    { href: "/about", label: "運営について" },
    { href: "/policy", label: "免責・プライバシー" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <span className="text-xl">HIFU</span>
              <span className="text-sm font-normal text-muted-foreground">比較ナビ</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              HIFU施術の機種ごとの取扱いクリニックと正規化された価格情報を集約。
              同条件での比較と透明性のある情報提供で、あなたの意思決定をサポートします。
            </p>
            <p className="mt-4 text-xs text-muted-foreground/70">
              ※ 価格情報には必ず確認日と根拠URLを表示しています
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">探す</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Button asChild variant="link" className="h-auto p-0 text-sm">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">サイト情報</h3>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Button asChild variant="link" className="h-auto p-0 text-sm">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HIFU比較ナビ. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70">
            当サイトの情報は参考情報です。施術に関する判断は医師にご相談ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
