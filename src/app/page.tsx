import Image from "next/image";
import logo from "@/assets/brand/matcha9-logo.webp";
import { site } from "@/lib/site";

// Setup placeholder. Replaced by the full homepage during development.
export default function Home() {
  const { address } = site;

  return (
    <main className="flex min-h-svh flex-col">
      <section className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
        <Image src={logo} alt={site.name} loading="eager" className="h-auto w-40 sm:w-48" />

        <p className="mt-12 eyebrow text-sage-deep">
          {address.neighborhood} · {address.city}
        </p>

        <h1 className="mt-5 text-5xl sm:text-6xl md:text-7xl">
          Wellness drinks,
          <br />
          <em className="text-sage-deep">made beautiful.</em>
        </h1>

        <p className="mt-6 font-script text-3xl text-terracotta-deep sm:text-4xl">{site.motto}</p>

        <p className="mt-10 max-w-md text-ink-soft">
          Our new website is being whisked to order. Until then, find us at the matcha counter
          inside Taco Maya.
        </p>
      </section>

      <footer className="container-page flex flex-col items-center gap-3 border-t border-line py-8 text-sm text-ink-soft sm:flex-row sm:justify-between">
        <span>
          {address.street}, {address.city}, {address.region} {address.postalCode}
        </span>
        <span className="flex gap-6">
          <a href={site.phone.href} className="transition-colors hover:text-moss">
            {site.phone.display}
          </a>
          <a href={site.instagram.href} className="transition-colors hover:text-moss">
            {site.instagram.handle}
          </a>
        </span>
      </footer>
    </main>
  );
}
