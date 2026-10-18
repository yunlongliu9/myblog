import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseStyles =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors";

const variantStyles = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700",

  secondary:
    "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",

  outline:
    "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  href,
  type = "button",
  ...props
}: ButtonProps) {
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} {...props}>
      {children}
    </button>
  );
}