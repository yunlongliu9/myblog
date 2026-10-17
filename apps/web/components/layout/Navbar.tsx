import Link from "next/link";
import NavLink from "./NavLink";
import Dropdown from "./Dropdown";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTranslations } from "next-intl/server";
import MobileMenu from "./MobileMenu";
import ThemeSwitcher from "./ThemeSwitcher";
import AccountButton from "./AccountButton";

export default async function Navbar() {
  const t = await getTranslations("Navbar");

  const navItems = [
    { label: t("ai"), href: "/ai" },
    { label: t("services"), href: "/services" },
  ];

  const knowledgeItems = [
    { label: t("it"), href: "/knowledge/it" },
    { label: t("travel"), href: "/knowledge/travel" },
    { label: t("investment"), href: "/knowledge/investment" },
    { label: t("life"), href: "/knowledge/life" },
  ];

  const exploreItems = [
    { label: t("feed"), href: "/explore/feed" },
    { label: t("map"), href: "/explore/map" },
    { label: t("projects"), href: "/explore/projects" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

        {/* 首页 */}
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold hover:text-blue-500"
        >
          {t("home")}
        </Link>

        {/* PC 端导航 */}
        <div className="desktop-nav items-center gap-8">
          <Dropdown label={t("knowledge")} items={knowledgeItems} />
          <Dropdown label={t("explore")} items={exploreItems} />

          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
            />
          ))}
        </div>

        {/* 右侧功能区域 */}
        <div className="flex shrink-0 items-center gap-3">

          {/* 仅 PC 端显示语言和主题 */}
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          {/* PC + 手机端账户按钮 */}
          <AccountButton />

          {/* 仅手机端显示菜单 */}
          <MobileMenu
            knowledgeLabel={t("knowledge")}
            exploreLabel={t("explore")}
            knowledgeItems={knowledgeItems}
            exploreItems={exploreItems}
            navItems={navItems}
          />

        </div>

      </nav>
    </header>
  );
}