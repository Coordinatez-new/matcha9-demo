import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

// Sen no Rikyū's four principles of the way of tea, and what each means behind our bar.
const principles = [
  {
    kanji: "和",
    romaji: "Wa",
    meaning: "Harmony",
    body: "Matcha and whatever it’s poured over, in balance. Nothing drowns it out.",
  },
  {
    kanji: "敬",
    romaji: "Kei",
    meaning: "Respect",
    body: "For the growers, for the leaf, and for whoever is next in line at the counter.",
  },
  {
    kanji: "清",
    romaji: "Sei",
    meaning: "Purity",
    body: "Nothing to hide: zero additives, fillers or added sugar in our flagship.",
  },
  {
    kanji: "寂",
    romaji: "Jaku",
    meaning: "Tranquility",
    body: "A calm, steady lift instead of a spike and a crash.",
  },
];

/** Wa kei sei jaku: the four principles of the tea ceremony, kept in mind behind a busy bar. */
export function TeaPrinciples() {
  return (
    <section className="border-t border-line py-24 md:py-32">
      <div className="container-page">
        <Reveal>
          <SectionHeader
            eyebrow="The way of tea"
            jp="茶道"
            title={
              <>
                Four characters, <em>one cup.</em>
              </>
            }
          >
            Tea masters sum up the tea ceremony in four principles: wa, kei, sei, jaku. We keep them
            in mind behind a busy bar.
          </SectionHeader>
        </Reveal>
        <ul className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <li key={p.romaji} className="bg-cream p-8 md:p-10">
              <Reveal delay={i * 90}>
                <p lang="ja" className="font-jp text-6xl leading-none text-moss md:text-7xl">
                  {p.kanji}
                </p>
                <p className="mt-8 eyebrow text-sage-deep">
                  {p.romaji} · {p.meaning}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
