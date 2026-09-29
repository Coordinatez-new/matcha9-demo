import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const stats = [
  { value: "9", label: "Signature drinks, one matcha" },
  { value: "1st", label: "Spring harvest: ichibancha" },
  { value: "18", unit: "mo", label: "Tasting matcha from growers around the world" },
  { value: "0", label: "Additives, fillers or added sugar in our flagship" },
];

export function StandardSection() {
  return (
    <section className="py-24 md:py-36">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <SectionHeader
            index="01"
            eyebrow="The standard"
            title={
              <>
                One ingredient, <em>done right.</em>
              </>
            }
          />
        </Reveal>
        <Reveal className="lg:col-span-5 lg:col-start-8 lg:pt-14" delay={120}>
          <p className="text-lg leading-relaxed text-ink-soft">
            Every drink on our menu starts the same way: pure, certified organic, ceremonial-grade
            matcha from the tea fields of Japan, whisked fresh for your order. Our flagship has zero
            additives, fillers or added sugar. Our blends pair that same matcha with natural flavors
            people crave, so a daily wellness habit is something to look forward to.
          </p>
          <ArrowLink href="/matcha" className="mt-8 text-moss">
            Meet our matcha
          </ArrowLink>
        </Reveal>
      </div>

      <div className="container-page mt-20">
        <Reveal>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
            {stats.map((s) => (
              <li key={s.label} className="flex flex-col justify-between gap-6 bg-cream p-7 md:p-9">
                <p className="font-display text-6xl leading-none text-moss md:text-7xl">
                  {s.value}
                  {s.unit && <span className="ml-1 text-2xl text-sage-deep italic">{s.unit}</span>}
                </p>
                <p className="max-w-[14rem] text-sm leading-relaxed text-ink-soft">{s.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
