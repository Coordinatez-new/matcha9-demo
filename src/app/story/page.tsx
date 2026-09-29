import { pageMetadata } from "@/lib/metadata";
import Image, { type StaticImageData } from "next/image";
import storyCard from "@/assets/community/brand-story-card.webp";
import closeup from "@/assets/craft/whisked-matcha-closeup.webp";
import counterNight from "@/assets/place/counter-night-menus.webp";
import counterWide from "@/assets/place/counter-plant-wall-wide.webp";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { chapters, founder, pullQuotes, signOff, storyTitle, timeline } from "@/content/story";

export const metadata = pageMetadata({
  title: "Our Story",
  description:
    "From Rooted Wisdom to Pure Energy: founder Nick Patel on natural health, Berry Boost Energy, and the eighteen-month search that became Matcha 9.",
});

type Interlude =
  | { kind: "quote"; text: string }
  | { kind: "image"; src: StaticImageData; alt: string; wide?: boolean };

// What follows each chapter: a pull quote or a photograph.
const interludes: Record<string, Interlude> = {
  "the-search": { kind: "quote", text: pullQuotes.philosophy },
  "the-discovery": {
    kind: "image",
    src: closeup,
    alt: "Freshly whisked matcha in a spouted stoneware bowl beside a bamboo chasen",
  },
  "the-quest": {
    kind: "image",
    src: counterWide,
    alt: "The Matcha 9 counter beneath a wall of hanging plants in Logan Square",
    wide: true,
  },
};

export default function StoryPage() {
  return (
    <>
      <section className="container-page grid gap-14 pt-14 pb-20 md:pt-20 lg:grid-cols-12 lg:items-end">
        <div className="animate-rise lg:col-span-7">
          <p className="eyebrow text-sage-deep">Our story · A letter from our founder</p>
          <h1 className="mt-6 text-display-xl">{storyTitle}</h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
            The letter printed on the card beside every Matcha 9 menu, in full. Why a natural-health
            upbringing, a berry energy drink and eighteen months of tasting ended in a matcha bar in
            Logan Square.
          </p>
        </div>
        <div className="animate-rise [animation-delay:120ms] lg:col-span-4 lg:col-start-9">
          <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-lg bg-sand">
            <Image
              src={storyCard}
              alt="The printed Matcha 9 brand-story card, held up at the counter"
              fill
              preload
              sizes="(min-width: 1024px) 28vw, 80vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-line">
        <ol className="container-page grid divide-line sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
          {timeline.map((t, i) => (
            <li key={t.when} className="py-8 lg:px-8 lg:first:pl-0">
              <Reveal delay={i * 80}>
                <p className="font-display text-3xl text-moss">{t.when}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.what}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page grid gap-16 py-24 md:py-32 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <nav aria-label="Chapters" className="sticky top-32">
            <p className="eyebrow text-sage-deep">Chapters</p>
            <ol className="mt-6 space-y-4 border-l border-line pl-5">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    className="group flex gap-3 text-sm text-ink-soft transition-colors hover:text-moss"
                  >
                    <span className="font-display text-sage italic">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="lg:col-span-8 lg:col-start-5">
          {chapters.map((chapter, i) => {
            const interlude = interludes[chapter.id];
            return (
              <div key={chapter.id}>
                <article id={chapter.id} className="scroll-mt-32 py-4">
                  <Reveal>
                    <p className="eyebrow text-sage-deep">
                      Chapter {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-4 text-display-md">{chapter.title}</h2>
                  </Reveal>
                  <div className="mt-8 space-y-6 text-lg leading-[1.8] text-ink-soft">
                    {chapter.paragraphs.map((p, j) => (
                      <Reveal key={j}>
                        <p
                          className={
                            i === 0 && j === 0
                              ? "first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-moss"
                              : undefined
                          }
                        >
                          {p}
                        </p>
                      </Reveal>
                    ))}
                  </div>
                </article>

                {interlude?.kind === "quote" && (
                  <Reveal className="my-20">
                    <blockquote className="border-y border-line py-12 text-center font-display text-3xl leading-snug text-moss italic md:text-4xl">
                      “{interlude.text}”
                    </blockquote>
                  </Reveal>
                )}
                {interlude?.kind === "image" && (
                  <Reveal className="my-20">
                    <div
                      className={
                        interlude.wide
                          ? "relative aspect-[4/3] overflow-hidden rounded-lg"
                          : "relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-lg"
                      }
                    >
                      <Image
                        src={interlude.src}
                        alt={interlude.alt}
                        fill
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </Reveal>
                )}
              </div>
            );
          })}

          <Reveal className="mt-20 border-t border-line pt-14">
            <p className="font-display text-3xl text-moss italic md:text-4xl">{signOff.line}</p>
            <p className="mt-8 text-ink-soft">{signOff.closing}</p>
            <p className="mt-2 font-script text-6xl leading-none text-terracotta-deep md:text-7xl">
              {founder.name}
            </p>
            <p className="mt-4 eyebrow text-sage-deep">{founder.role}, Matcha 9</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-forest text-cream">
        <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-sage">The promise, in a glass</p>
            <p className="mt-5 font-display text-display-md text-cream italic">
              “{pullQuotes.promise}”
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/menu/" variant="light">
                See the menu
              </ButtonLink>
              <ButtonLink href="/matcha/" variant="outline-light">
                Our matcha
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={120}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-full">
              <Image
                src={counterNight}
                alt="The Matcha 9 counter at night with printed menus laid out"
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
