import Image from "next/image";
import { events } from "@/content/community";
import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function CommunitySection() {
  return (
    <section className="py-24 md:py-36">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            index="06"
            eyebrow={site.values.join(" · ")}
            title={
              <>
                Come for the matcha. <em>Stay for the club.</em>
              </>
            }
          >
            Pop-ups, creator afternoons and our 09.09 launch. The Matcha Club is wellness, community
            and good vibes, one cup at a time.
          </SectionHeader>
          <ArrowLink href="/community" className="text-moss">
            Inside the Matcha Club
          </ArrowLink>
        </Reveal>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {events.map((event, i) => (
            <Reveal key={event.title} delay={i * 110}>
              <article className="group">
                <a href={event.href} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                    <Image
                      src={event.poster}
                      alt={event.posterAlt}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover transition-transform duration-[1.4s] ease-calm group-hover:scale-[1.035]"
                    />
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <time dateTime={event.date} className="eyebrow text-sage-deep">
                      {event.day}
                    </time>
                    <span className="h-px w-6 bg-line" aria-hidden="true" />
                    <span className="eyebrow text-terracotta-deep">{event.kind}</span>
                  </div>
                  <h3 className="mt-3 font-display text-3xl text-moss">{event.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{event.time}</p>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
