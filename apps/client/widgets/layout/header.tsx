import { Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/devices", label: "機種から探す" },
  { href: "/clinics", label: "クリニックから探す" },
  { href: "/compare", label: "条件比較" },
  { href: "/prices", label: "相場ガイド" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          <span className="text-xl">HIFU</span>
          <span className="text-sm font-normal text-muted-foreground">比較ナビ</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <MobileMenuButton />
      </div>
    </header>
  );
}

function MobileMenuButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="md:hidden"
      aria-label="メニューを開く"
    >
      <Menu className="h-6 w-6" />
    </Button>
  );
}
