
import Link from "next/link";
import NavLink from "./NavLink";

type NavItem = {
    label: string;
    href: string;
}

const navItems: NavItem[] = [
    {label: "Knowledge", href: "/knowledge"},
    {label: "Explore",href: "/explore"},
    {label: "Chat with me", href: "/ai"},
    {label: "Services", href: "/services"}
]

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="text-lg font-semibold hover:text-blue-500">
          Home
        </Link>

        <div className="flex items-center gap-8">
          {navItems.map(
            (item) => (
               <NavLink key={item.href} href={item.href} label={item.label} />
            )
          )}
        </div>

      </nav>
    </header>
  );
}