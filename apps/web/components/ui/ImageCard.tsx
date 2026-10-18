import Image from "next/image";
import Link from "next/link";

type ImageCardProps = {
  src: string;
  alt: string;
  title: string;
  description?: string;
  href?: string;
};

export default function ImageCard({
  src,
  alt,
  title,
  description,
  href,
}: ImageCardProps) {
  const content = (
    <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative w-full aspect-[4/3] min-h-[200px] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold">{title}</h3>

        {description && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}