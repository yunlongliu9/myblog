import Image from "next/image";

export default function HomeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

      {/* 第一层：背景照片 */}
      <Image
        src="/images/background/home.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* 第二层：半透明毛玻璃 */}
      <div
        className="
          absolute inset-0
          bg-white/30
          backdrop-blur-lg
          dark:bg-black/40
        "
      />

    </div>
  );
}