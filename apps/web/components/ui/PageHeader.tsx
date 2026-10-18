type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-10 ${className}`}>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h1>

      {description && (
        <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}