import Link from "next/link";
import Container from "@/components/ui/Container";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("Footer");

  const links = [
    { label: t("home"), href: "/" },
    { label: t("projects"), href: "/explore/projects" },
    { label: t("travel"), href: "/knowledge/travel" },
    { label: t("services"), href: "/services" },
  ];

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          <div>
            <h2 className="text-xl font-semibold">
              Yunlong's Blog
            </h2>

            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t("description")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold">{t("navigation")}</h3>

            <div className="mt-4 flex flex-col gap-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-zinc-600 hover:text-blue-500 dark:text-zinc-400"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">{t("connect")}</h3>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-blue-500 dark:text-zinc-400"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 hover:text-blue-500 dark:text-zinc-400"
              >
                LinkedIn
              </a>
            </div>
          </div>

        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-center text-sm text-zinc-500 dark:border-zinc-800">
          © 2026 Yunlong Liu. {t("rights")}
        </div>
      </Container>
    </footer>
  );
}