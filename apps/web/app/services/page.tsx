import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default async function ServicesPage() {
  const t = await getTranslations("Services");

  return (
    <main>
      <Section>
        <Container>
          <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <article className="mt-8 max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-semibold">Franken Job Radar</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">{t("radarDescription")}</p>
            <a
              href="/services/franken-job-radar/"
              className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800"
            >
              {t("openRadar")}
            </a>
          </article>
        </Container>
      </Section>
    </main>
  );
}
