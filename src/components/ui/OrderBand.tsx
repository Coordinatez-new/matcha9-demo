import { site } from "@/lib/site";
import { ButtonLink } from "./Button";
import { Reveal } from "./Reveal";

export function OrderBand() {
  return (
    <section className="bg-forest text-cream">
      <div className="container-page py-20 md:py-24">
        <Reveal className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-sage">Order ahead</p>
            <h2 className="mt-5 text-display-md text-cream">
              Skip the wait. <em>Your matcha, whisked and ready.</em>
            </h2>
            <p className="mt-5 leading-relaxed text-cream/70">
              Pickup from the matcha counter inside Taco Maya, Logan Square. {site.rewards}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={site.orderUrl} external variant="light">
              Order pickup
            </ButtonLink>
            <ButtonLink href="/visit/" variant="outline-light">
              Find us
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
