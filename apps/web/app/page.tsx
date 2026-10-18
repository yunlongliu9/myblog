import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ImageCard from "@/components/ui/ImageCard";
export default function HomePage() {
  return (
    <main>
      <Section>
        <Container>
          <PageHeader
            title="Welcome to my world"
            description="Technology, photography, travel and thoughts."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <h2 className="text-xl font-semibold">Technology</h2>
              <p className="mt-3 text-zinc-500">
                Cloud, Distributed Systems and AI.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">

                <Badge variant="blue">Java</Badge>

                <Badge variant="blue">Docker</Badge>

                <Badge variant="green">Raft</Badge>

                <Badge>Distributed Systems</Badge>

              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold">Travel</h2>
              <p className="mt-3 text-zinc-500">
                Exploring the world through photography.
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold">Thoughts</h2>
              <p className="mt-3 text-zinc-500">
                Notes on life, society and personal growth.
              </p>
            </Card>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="primary" href="/explore/projects">
              Explore My Work
            </Button>

            <Button variant="secondary" href="/knowledge/life">
              About Me
            </Button>

            <Button variant="outline" href="/knowledge/it">
              Read More
            </Button>
          </div>
        </Container>
      </Section>
      <Section>
  <Container>
    <h2 className="mb-8 text-3xl font-bold">
      Photography & Travel
    </h2>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <ImageCard
        src="/images/travel/fish.JPG"
        alt="fish in iceland"
        title="iceland fish"
        description="fish lies on the shore of the ocean in iceland"
      />

      <ImageCard
        src="/images/travel/plant.JPG"
        alt="plant in iceland"
        title="plant in iceland"
        description="the plant survive on the volcanic rock in iceland"
      />

      <ImageCard
        src="/images/travel/church.jpeg"
        alt="chruch in iceland"
        title="chruch"
        description="iceland church alone on the mountain"
      />
    </div>
  </Container>
</Section>
    </main>
  );
}