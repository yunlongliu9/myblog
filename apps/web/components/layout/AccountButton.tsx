"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
export default function AccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
const t = useTranslations("Navbar");
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={t("account")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg px-2 py-1 text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        👤
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <Link
            role="menuitem"
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block rounded px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
           {t("login")}
          </Link>

          <Link
            role="menuitem"
            href="/register"
            onClick={() => setIsOpen(false)}
            className="block rounded px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {t("register")}
          </Link>
        </div>
      )}
    </div>
  );
}