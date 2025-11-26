import { Menu } from "lucide-react";
import Link from "next/link";

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
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileMenuButton />
      </div>
    </header>
  );
}

function MobileMenuButton() {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
      aria-label="メニューを開く"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
