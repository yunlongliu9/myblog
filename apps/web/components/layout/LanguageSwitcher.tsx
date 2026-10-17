"use client";

import {useLocale} from "next-intl";
import {useRouter} from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function changeLanguage(newLocale: string) {
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span>🌐</span>

      <select
        aria-label="Select language"
        value={locale}
        onChange={(event) => changeLanguage(event.target.value)}
        className="cursor-pointer bg-transparent text-sm outline-none"
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
        <option value="cn">中文</option>
      </select>
    </div>
  );
}