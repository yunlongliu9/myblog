import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import ImageCard from "@/components/ui/ImageCard";
import GlassCard from "@/components/ui/GlassCard";
import HomeBackground from "@/components/home/HomeBackground";

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen">

      {/* 第一层：背景图片 + 毛玻璃 */}
      <HomeBackground />

      {/* 第二层：页面内容 */}
      <div className="relative z-10">

        {/* Hero */}
        <Section>
          <Container>
            <GlassCard>
              <h1 className="text-4xl font-bold md:text-6xl">
                Hello, I'm Yunlong.
              </h1>

              <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-300">
                Software Engineer | Cloud & Distributed Systems
                <br />
                AI Agents & Automation
              </p>

              <div className="mt-8">
                <Button href="/explore/projects">
                  Explore My Work
                </Button>
              </div>
            </GlassCard>
          </Container>
        </Section>

        {/* Photography & Travel */}
        <Section>
          <Container>
            <h2 className="mb-8 text-3xl font-bold">
              Photography & Travel
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

              <ImageCard
                src="/images/travel/fish.JPG"
                alt="Fish in Iceland"
                title="Iceland Fish"
                description="A fish lying on the shore of the ocean in Iceland."
              />

              <ImageCard
                src="/images/travel/plant.JPG"
                alt="Plants in Iceland"
                title="Plants in Iceland"
                description="Plants surviving on volcanic rocks in Iceland."
              />

              <ImageCard
                src="/images/travel/church.jpeg"
                alt="Church in Iceland"
                title="Icelandic Church"
                description="A solitary church standing against the Icelandic landscape."
              />

            </div>
          </Container>
        </Section>

      </div>
    </main>
  );
}