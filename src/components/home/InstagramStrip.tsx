import Image from "next/image";
import { gallery } from "@/content/community";
import { site } from "@/lib/site";
import { ArrowLink } from "@/components/ui/Button";
import { InstagramIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";

export function InstagramStrip({ count = 6 }: { count?: number }) {
  return (
    <section className="pb-24 md:pb-32">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 eyebrow text-sage-deep">
              <InstagramIcon className="size-4" /> On Instagram
            </p>
            <h2 className="mt-4 text-display-md">{site.instagram.handle}</h2>
          </div>
          <ArrowLink href={site.instagram.href} external className="text-moss">
            Follow along
          </ArrowLink>
        </Reveal>
        <Reveal delay={100}>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.slice(0, count).map((img) => (
              <li key={img.alt}>
                <a
                  href={img.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-md bg-sand"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 32vw, 48vw"
                    className="object-cover transition-transform duration-[1.2s] ease-calm group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-forest/0 transition-colors duration-500 group-hover:bg-forest/15" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
