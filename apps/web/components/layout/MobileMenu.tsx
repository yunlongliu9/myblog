"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

import ThemeSwitcher from "./ThemeSwitcher";
type NavItem = {
  label: string;
  href: string;
};

type MobileMenuProps = {
  knowledgeLabel: string;
  exploreLabel: string;
  knowledgeItems: NavItem[];
  exploreItems: NavItem[];
  navItems: NavItem[];
};

export default function MobileMenu({
  knowledgeLabel,
  exploreLabel,
  knowledgeItems,
  exploreItems,
  navItems,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
useEffect(() => {

  if (!isOpen) return;

  function handleClickOutside(event: PointerEvent) {

    const target = event.target;

    if (

      target instanceof Node &&

      menuRef.current &&

      !menuRef.current.contains(target)

    ) {

      setIsOpen(false);

    }

  }

  function handleEscape(event: KeyboardEvent) {

    if (event.key === "Escape") {

      setIsOpen(false);

    }

  }

  document.addEventListener("pointerdown", handleClickOutside);

  document.addEventListener("keydown", handleEscape);

  return () => {

    document.removeEventListener("pointerdown", handleClickOutside);

    document.removeEventListener("keydown", handleEscape);

  };

}, [isOpen]);
    
  return (
    <div ref={menuRef} className="lg:hidden">
      <button
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="text-2xl"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full w-full border-b border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4">
            <div className="font-semibold">{knowledgeLabel}</div>

            {knowledgeItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="pl-4 hover:text-blue-500"
              >
                {item.label}
              </Link>
            ))}

            <div className="font-semibold">{exploreLabel}</div>

            {exploreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="pl-4 hover:text-blue-500"
              >
                {item.label}
              </Link>
            ))}

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="font-semibold hover:text-blue-500"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">

        <LanguageSwitcher />

        <ThemeSwitcher />

        </div>
          </div>
        </div>
      )}
    </div>
  );
}