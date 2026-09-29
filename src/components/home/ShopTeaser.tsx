import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

// Planned products listed on the client's site ("Product TBD").
const planned = ["Ceremonial matcha tin", "Bamboo whisk set", "Matcha 9 tumbler"];

export function ShopTeaser() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <Reveal className="grid gap-12 rounded-lg border border-line p-8 md:p-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 eyebrow text-sage-deep">
              Shop
              <span className="rounded-full border border-terracotta/40 px-2.5 py-0.5 text-[0.6rem] tracking-[0.18em] text-terracotta-deep">
                Coming soon
              </span>
            </p>
            <h2 className="mt-5 text-display-md">
              Take the ritual <em>home.</em>
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
              The same ceremonial-grade matcha we whisk behind the counter, packed for your kitchen.
              Follow {site.instagram.handle} to hear when the shop opens.
            </p>
            <ArrowLink href={site.instagram.href} external className="mt-8 text-moss">
              Follow {site.instagram.handle}
            </ArrowLink>
          </div>
          <ul className="border-t border-line lg:col-span-5 lg:col-start-8">
            {planned.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline justify-between gap-6 border-b border-line py-5"
              >
                <span className="font-display text-2xl text-moss">{item}</span>
                <span className="font-display text-sm text-sage italic">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
