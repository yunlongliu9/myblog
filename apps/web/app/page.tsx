import Image from "next/image";
import Container from "@/components/ui/Container";

export default function HomePage() {
  return (
    <main>
      <Container className="py-16">
        <h1 className="text-4xl font-bold">
          Welcome to yunlong's world
        </h1>

        <p className="mt-4 text-zinc-500">
          Technology, photography, travel and thoughts.
        </p>
      </Container>
    </main>
  );
}