"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type DropdownItem = {
  label: string;
  href: string;
};

type DropdownProps = {
  label: string;
  items: DropdownItem[];
};


export default function Dropdown({label,items,}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(
     ()=>{
              if (!isOpen) return;
              function handleClickOutside(event: PointerEvent) {
                  const target = event.target;

                  if (target instanceof Node &&
                        dropdownRef.current &&
                    !dropdownRef.current.contains(target)) {
                    setIsOpen(false);
                  }
              }

              function handleEscape(event: KeyboardEvent){
                if(event.key === "Escape"){
                  setIsOpen(false);
                }
              }

              //(now the dropdown page is open)reg the event listener when "dropdown" is open; 
              // and remove it when click outside;
              document.addEventListener("pointerdown", handleClickOutside);
              document.addEventListener("keydown", handleEscape);
              return () => {
                  document.removeEventListener("pointerdown", handleClickOutside);
                  document.removeEventListener("keydown", handleEscape);
              };

    },
  [isOpen]
)


  return (
    <div className="relative" ref={dropdownRef} >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="transition-colors hover:text-blue-500"
      >
        {label} ▾
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-3 w-52 rounded-xl border border-zinc-200 bg-white p-2 text-zinc-900 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}