"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

type NavLinkeProps = {
    label: string;
    href: string;
}

export default function NavLink({label, href}: NavLinkeProps) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <
            Link 
            href = {href} 
            aria-current={isActive ? "page" : undefined}
            className = {`transition-colors 
                ${isActive?"font-semibold text-blue-500": "hover:text-blue-500"}`
            }
        >
        {label}
        </Link>
    );
}