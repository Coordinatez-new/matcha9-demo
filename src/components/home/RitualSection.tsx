import Image from "next/image";
import closeup from "@/assets/craft/whisked-matcha-closeup.webp";
import flatlay from "@/assets/craft/flatlay-prep.webp";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Paraphrased from the brand's own "About matcha" notes (QR ingredient pages).
const steps = [
  {
    title: "Measure",
    body: "Organic, ceremonial-grade ichibancha, the first spring harvest. We don’t do a small pour.",
  },
  {
    title: "Whisk",
    body: "Whisked into hot, never boiling, water with a bamboo chasen, before anything else goes in the glass.",
  },
  {
    title: "Layer",
    body: "Built in layers over milk, water or coconut water, hot or iced, so the first sip and the last aren’t the same drink.",
  },
  {
    title: "Stir",
    body: "Look at it, take a photo, then stir it properly before you get going.",
  },
];

export function RitualSection() {
  return (
    <section className="border-t border-line py-24 md:py-36">
      <div className="container-page grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-32">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-sand">
              <Image
                src={closeup}
                alt="Freshly whisked matcha in a spouted stoneware bowl beside a bamboo chasen"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative -mt-24 ml-auto hidden aspect-[9/16] w-40 overflow-hidden rounded-lg border-[6px] border-cream sm:block">
              <Image
                src={flatlay}
                alt="Top-down view of the matcha prep board: whisk, sifter, scoops and a finished drink"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <SectionHeader
              index="04"
              eyebrow="The ritual"
              title={
                <>
                  How every cup <em>is made.</em>
                </>
              }
            >
              Matcha doesn’t dissolve. It has to be whisked properly or it goes gritty, so every
              drink starts at the bowl, whisked by hand for your order.
            </SectionHeader>
          </Reveal>

          <ol className="mt-14 border-t border-line">
            {steps.map((step, i) => (
              <li key={step.title} className="border-b border-line">
                <Reveal
                  delay={i * 80}
                  className="grid grid-cols-[4.5rem_1fr] gap-4 py-9 md:grid-cols-[6rem_1fr]"
                >
                  <span className="font-display text-5xl leading-none text-sage italic md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-3xl text-moss">{step.title}</h3>
                    <p className="mt-3 max-w-md leading-relaxed text-ink-soft">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal>
            <ArrowLink href="/matcha/" className="mt-10 text-moss">
              The part most places don’t explain
            </ArrowLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
