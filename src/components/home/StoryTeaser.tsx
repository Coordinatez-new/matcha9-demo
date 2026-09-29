import Image from "next/image";
import counterNight from "@/assets/place/counter-night-menus.webp";
import { founder, pullQuotes, storyTitle } from "@/content/story";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function StoryTeaser() {
  return (
    <section className="bg-forest py-24 text-cream md:py-36">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full">
            <Image
              src={counterNight}
              alt="The Matcha 9 counter at night, printed menus laid out beside the whisk and bowl"
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="flex items-center gap-3 eyebrow text-sage">
              <span className="font-display text-sm tracking-normal italic">05</span>
              <span className="h-px w-8 bg-cream/25" aria-hidden="true" />
              Our story
            </p>
            <h2 className="mt-5 text-display-lg text-cream">{storyTitle}</h2>
          </Reveal>

          <Reveal delay={100}>
            <blockquote className="mt-10 border-l border-terracotta/60 pl-6 font-display text-2xl leading-snug text-cream/90 italic md:text-3xl">
              “{pullQuotes.philosophy}”
            </blockquote>
            <div className="mt-8 max-w-xl space-y-4 leading-relaxed text-cream/70">
              <p>
                Growing up in a home deeply rooted in natural health, organic living, and Ayurvedic
                principles, I knew there had to be a better way to fuel our bodies.
              </p>
              <p>
                We didn’t want to launch just another green tea brand. For over a year and a half,
                our team traveled, sampled, and vetted matcha varieties from elite growers across
                the world. Our quest ended in the pristine, nutrient-dense tea fields of Japan.
              </p>
            </div>
          </Reveal>

          <Reveal delay={180} className="mt-12 flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="font-script text-5xl leading-none text-terracotta">{founder.name}</p>
              <p className="mt-3 eyebrow text-cream/50">{founder.role}, Matcha 9</p>
            </div>
            <ButtonLink href="/story" variant="outline-light">
              Read the full story
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
