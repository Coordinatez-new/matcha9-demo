import Image from "next/image";
import barSeating from "@/assets/place/bar-seating.webp";
import counterWide from "@/assets/place/counter-plant-wall-wide.webp";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { ClockIcon, InstagramIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OrderPickupButton } from "@/components/order/OrderPickupButton";
import { fullAddress, site } from "@/lib/site";

const goodToKnow = [
  {
    q: "Can I order ahead?",
    a: [
      "Yes. Tap “Order pickup”, choose a time, and collect your drinks from the matcha counter inside Taco Maya. You pay when you pick up. For delivery, order through our Toast ordering page.",
    ],
  },
  {
    q: "Hot or iced?",
    a: ["Ask for it hot or iced, over milk, water or coconut water."],
  },
  {
    q: "How much caffeine is in a cup?",
    a: [
      "Roughly 90–120 mg, close to a cup of coffee, with L-theanine for a steadier lift. If you’re watching your caffeine, say so and we’ll build it lighter.",
    ],
  },
  {
    q: "Allergies",
    a: [
      site.allergyNote,
      "Green Glow and Very Berry aren’t gluten-free. Their full ingredient lists are on each drink’s page.",
    ],
  },
  {
    q: "Is it just matcha?",
    a: [
      "Matcha 9 is a sister concept from the Taco Maya family, so you’re welcome to come in for a morning cup or an afternoon pick-me-up, then stay for tacos.",
    ],
  },
];

/** The visit page: address, hours, map and good-to-know answers. */
export function VisitView({ hours, hoursNote }: { hours: string; hoursNote: string }) {
  const rows = [
    {
      icon: PinIcon,
      label: "Address",
      value: fullAddress,
      note: `${site.address.venue}, ${site.address.neighborhood}`,
    },
    {
      icon: ClockIcon,
      label: "Hours",
      value: hours,
      note: hoursNote || undefined,
    },
    { icon: PhoneIcon, label: "Phone", value: site.phone.display, href: site.phone.href },
    {
      icon: InstagramIcon,
      label: "Instagram",
      value: site.instagram.handle,
      href: site.instagram.href,
      external: true,
    },
  ];

  return (
    <>
      <LocalBusinessJsonLd />

      <section className="container-page grid gap-14 pt-14 pb-24 md:pt-20 lg:grid-cols-12 lg:items-center">
        <div className="animate-rise lg:col-span-6">
          <p className="eyebrow text-sage-deep">Visit · {site.address.neighborhood}</p>
          <h1 className="mt-6 text-display-xl">
            Find us inside <em className="font-normal text-sage-deep">Taco Maya.</em>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
            Matcha 9 is the matcha counter inside Taco Maya on Milwaukee Avenue. Come in for a
            morning cup or an afternoon pick-me-up, then stay for tacos.
          </p>

          <dl className="mt-12 border-t border-line">
            {rows.map(({ icon: Icon, label, value, note, href, external }) => (
              <div
                key={label}
                className="grid grid-cols-[2rem_6.5rem_1fr] items-start gap-3 border-b border-line py-5"
              >
                <Icon className="mt-0.5 size-5 text-sage-deep" />
                <dt className="pt-1 eyebrow text-sage-deep">{label}</dt>
                <dd className="text-ink">
                  {href ? (
                    <a
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="underline decoration-moss/25 underline-offset-4 transition-colors hover:decoration-moss"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                  {note && <span className="mt-0.5 block text-sm text-ink-soft">{note}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={site.mapsUrl} external>
              Get directions
            </ButtonLink>
            <OrderPickupButton variant="outline" />
          </div>
        </div>

        <div className="animate-rise [animation-delay:120ms] lg:col-span-5 lg:col-start-8">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-sand">
            <Image
              src={barSeating}
              alt="The bar at Taco Maya: marquee BAR letters, bar stools and a wall of plants"
              fill
              preload
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-sand py-24 md:py-32">
        <div className="container-page">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow="On the map"
              title={
                <>
                  2529 N Milwaukee Ave, <em>Ste B.</em>
                </>
              }
            >
              In Logan Square, Chicago, IL 60647. Look for Taco Maya; the matcha counter is inside.
            </SectionHeader>
            <ArrowLink href={site.mapsUrl} external className="text-moss">
              Open in Google Maps
            </ArrowLink>
          </Reveal>
          <Reveal className="mt-12" delay={100}>
            <div className="overflow-hidden rounded-lg border border-moss/10 bg-cream">
              <iframe
                title="Map showing Matcha 9 inside Taco Maya at 2529 N Milwaukee Ave, Chicago"
                src={site.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[26rem] w-full grayscale-[35%] sepia-[12%] md:h-[32rem]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <SectionHeader
              eyebrow="Good to know"
              title={
                <>
                  Before you <em>come by.</em>
                </>
              }
            />
          </Reveal>
          <Reveal className="lg:col-span-7 lg:col-start-6" delay={100}>
            <Accordion items={goodToKnow} defaultOpen={0} />
          </Reveal>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <Reveal className="container-page">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg sm:aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={counterWide}
              alt="The Matcha 9 counter beneath a wall of hanging plants"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-forest/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-8 text-cream md:flex-row md:items-end md:justify-between md:p-12">
              <p className="font-script text-4xl leading-tight text-cream sm:text-5xl md:text-6xl">
                See you at the counter.
              </p>
              <ButtonLink href={site.mapsUrl} external variant="light">
                Get directions
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
