import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import clubSign from "@/assets/community/matcha-club-sign.webp";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { InstagramIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { events, gallery } from "@/content/community";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Community",
  description:
    "The Matcha Club: wellness, community and good vibes. Pop-ups, creator afternoons and the 09.09 launch at Matcha 9 in Logan Square.",
});

export default function CommunityPage() {
  return (
    <>
      <section className="container-page grid gap-14 pt-14 pb-20 md:pt-20 lg:grid-cols-12 lg:items-center">
        <div className="animate-rise lg:col-span-6">
          <p className="eyebrow text-sage-deep">{site.values.join(" · ")}</p>
          <h1 className="mt-6 text-display-xl">
            Welcome to the <em className="font-normal text-sage-deep">Matcha Club.</em>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
            Wellness, community and good vibes. Since opening on 09.09 we’ve hosted a launch party,
            an afternoon for Chicago creators and a free-matcha pop-up. Here’s what we’ve been up
            to.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={site.instagram.href} external>
              Follow {site.instagram.handle}
            </ButtonLink>
            <ButtonLink href="/visit/" variant="outline">
              Visit the bar
            </ButtonLink>
          </div>
        </div>
        <div className="animate-rise [animation-delay:120ms] lg:col-span-5 lg:col-start-8">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-sand">
            <Image
              src={clubSign}
              alt="Jewelled Matcha 9 A-frame sign outside a window lettered Matcha Club, wellness, community, good vibes"
              fill
              preload
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-line py-24 md:py-32">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-sage-deep">So far</p>
            <h2 className="mt-5 text-display-lg">
              Moments from <em>the counter.</em>
            </h2>
          </Reveal>
          <ol className="mt-16 space-y-20">
            {events.map((event, i) => (
              <li key={event.title}>
                <Reveal className="grid gap-10 md:grid-cols-12 md:items-center">
                  <div
                    className={i % 2 ? "md:order-2 md:col-span-5 md:col-start-8" : "md:col-span-5"}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
                      <Image
                        src={event.poster}
                        alt={event.posterAlt}
                        fill
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className={i % 2 ? "md:col-span-6" : "md:col-span-6 md:col-start-7"}>
                    <p className="flex flex-wrap items-center gap-3">
                      <time dateTime={event.date} className="eyebrow text-sage-deep">
                        {event.day}
                      </time>
                      <span className="h-px w-6 bg-line" aria-hidden="true" />
                      <span className="eyebrow text-terracotta-deep">{event.kind}</span>
                    </p>
                    <h3 className="mt-4 text-display-md">{event.title}</h3>
                    <p className="mt-3 font-display text-xl text-ink-soft">{event.time}</p>
                    <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                      {event.body}
                    </p>
                    <ArrowLink href={event.href} external className="mt-8 text-moss">
                      View on Instagram
                    </ArrowLink>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-sand py-24 md:py-32">
        <div className="container-page">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 eyebrow text-sage-deep">
                <InstagramIcon className="size-4" /> {site.instagram.handle}
              </p>
              <h2 className="mt-5 text-display-lg">
                The club, <em>in pictures.</em>
              </h2>
            </div>
            <ArrowLink href={site.instagram.href} external className="text-moss">
              See more on Instagram
            </ArrowLink>
          </Reveal>
          <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.map((img, i) => (
              <li key={img.alt} className={i === 0 || i === 5 ? "md:row-span-2" : undefined}>
                <Reveal delay={(i % 4) * 70} className="h-full">
                  <a
                    href={img.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative block overflow-hidden rounded-lg bg-cream ${i === 0 || i === 5 ? "aspect-[3/4] md:aspect-auto md:h-full" : "aspect-square"}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-[1.2s] ease-calm group-hover:scale-105"
                    />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <Reveal className="container-page text-center">
          <p className="font-script text-5xl text-terracotta-deep md:text-6xl">{site.motto}</p>
          <h2 className="mx-auto mt-6 max-w-3xl text-display-lg">
            Catch the next pop-up <em>on Instagram.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Follow along for new drinks, pop-ups and Matcha Club afternoons, and tag a friend you’d
            bring.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href={site.instagram.href} external>
              Follow {site.instagram.handle}
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
