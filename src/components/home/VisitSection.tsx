import Image from "next/image";
import counter from "@/assets/place/matcha-counter.webp";
import { fullAddress, site } from "@/lib/site";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { ClockIcon, InstagramIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function VisitSection({ index = "07", hours }: { index?: string; hours: string }) {
  const rows = [
    { icon: PinIcon, label: "Address", value: fullAddress, note: site.address.venue },
    { icon: ClockIcon, label: "Hours", value: hours },
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
    <section className="bg-sand py-24 md:py-32">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12">
        <Reveal className="order-2 lg:order-1 lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg lg:aspect-[5/6]">
            <Image
              src={counter}
              alt="The Matcha 9 counter under a wall of hanging plants, with kettle, bowl and whisk"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
          <Reveal>
            <SectionHeader
              index={index}
              eyebrow="Visit"
              title={
                <>
                  Find us inside <em>Taco Maya.</em>
                </>
              }
            >
              Matcha 9 is the matcha counter inside Taco Maya in Logan Square. Come in for a morning
              cup or an afternoon pick-me-up, then stay for tacos.
            </SectionHeader>
          </Reveal>

          <Reveal delay={120}>
            <dl className="mt-10 border-t border-moss/15">
              {rows.map(({ icon: Icon, label, value, note, href, external }) => (
                <div
                  key={label}
                  className="grid grid-cols-[2rem_6rem_1fr] items-start gap-3 border-b border-moss/15 py-5"
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
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink href={site.mapsUrl} external>
                Get directions
              </ButtonLink>
              <ArrowLink href="/visit" className="text-moss">
                Plan your visit
              </ArrowLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
