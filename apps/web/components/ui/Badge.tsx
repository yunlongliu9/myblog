import type { ReactNode } from "react";

type BadgeVariant = "default" | "blue" | "green";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variants = {
  default:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  blue:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  green:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}