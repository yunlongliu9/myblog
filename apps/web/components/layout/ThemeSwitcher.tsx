"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark" || saved === "system") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      const isDark =
        theme === "dark" || (theme === "system" && media.matches);

      document.documentElement.classList.toggle("dark", isDark);
    }

    applyTheme();

    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  function changeTheme(value: Theme) {
    setTheme(value);
    localStorage.setItem("theme", value);
  }
const t = useTranslations("Navbar");
  return (
    <select

  aria-label={t("theme")}

  value={theme}

  onChange={(e) => changeTheme(e.target.value as Theme)}

  className="cursor-pointer bg-transparent text-sm outline-none"

>

  <option value="system">💻 {t("system")}</option>

  <option value="light">☀️ {t("light")}</option>

  <option value="dark">🌙 {t("dark")}</option>

</select>
  );
}