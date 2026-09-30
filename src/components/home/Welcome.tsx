import Image from "next/image";
import hero from "@/assets/place/hero-plant-wall.webp";
import { site } from "@/lib/site";
import { OrderPickupButton } from "@/components/order/OrderPickupButton";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Seal } from "@/components/ui/Seal";

const facts = [
  { label: "The matcha", value: "Ceremonial grade" },
  { label: "The source", value: "Certified organic, Japan" },
  { label: "The craft", value: "Whisked to order" },
];

/** The welcome under the signature drink: who Matcha 9 is, in one screen. */
export function Welcome() {
  const { address } = site;
  return (
    <section className="relative">
      <div className="container-page grid items-center gap-16 pt-20 pb-20 md:pt-28 lg:grid-cols-12 lg:gap-10 lg:pb-28">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 eyebrow text-sage-deep">
              <span>
                {address.neighborhood} · {address.city}
              </span>
              <span className="h-px w-8 bg-line" aria-hidden="true" />
              <span>{address.venue}</span>
            </p>
            <h2 className="mt-7 text-display-xl">
              Wellness drinks,
              <br />
              <em className="font-normal text-sage-deep">made beautiful.</em>
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
              A matcha bar built around one ingredient done right: certified organic,
              ceremonial-grade Japanese matcha, whisked to order. Order ahead and pick it up at the
              counter.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/menu">Explore the menu</ButtonLink>
              <OrderPickupButton variant="outline" />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <dl className="mt-16 grid max-w-2xl gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="eyebrow text-sage-deep">{f.label}</dt>
                  <dd className="mt-2 font-display text-xl text-moss">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5">
          <p
            lang="ja"
            aria-hidden="true"
            className="absolute top-2 -right-2 hidden font-jp text-sm tracking-[0.5em] text-sage-deep tategaki lg:block xl:-right-8"
          >
            抹茶
            <span className="my-3 inline-block h-10 w-px bg-line align-middle" />
            心を込めて
          </p>
          <Reveal delay={100}>
            <div className="relative mx-auto aspect-[3/4.15] w-full max-w-md overflow-hidden rounded-t-full bg-sand">
              <Image
                src={hero}
                alt="An iced layered matcha held up in front of the plant wall at Matcha 9"
                fill
                sizes="(min-width: 1024px) 34vw, (min-width: 640px) 28rem, 90vw"
                className="object-cover object-[50%_72%]"
              />
            </div>
            <Seal
              text="Crafted with intention · Matcha 9 · "
              className="absolute -bottom-8 left-2 shadow-[0_10px_40px_-12px_rgb(31_39_29/0.35)] sm:left-8 lg:-left-6"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
