import { getTranslations } from "next-intl/server";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default async function ServicesPage() {
  const t = await getTranslations("Services");

  const services = [
    {
      title: "Franken Job Radar",
      description: t("radarDescription"),
      href: "/services/franken-job-radar/",
      action: t("openRadar"),
    },
    {
      title: t("foodTitle"),
      description: t("foodDescription"),
      href: "/service/food/",
      action: t("openFood"),
    },
  ];

  return (
    <main>
      <Section>
        <Container>
          <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {services.map(({ title, description, href, action }) => (
              <article
                key={href}
                className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-3 flex-1 text-zinc-600 dark:text-zinc-300">{description}</p>
                <a
                  href={href}
                  className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800"
                >
                  {action}
                </a>
              </article>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
