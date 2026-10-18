import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border border-white/20
        bg-white/30
        p-8
        shadow-xl
        backdrop-blur-xl
        dark:border-white/10
        dark:bg-zinc-900/30
        ${className}
      `}
    >
      {children}
    </div>
  );
}