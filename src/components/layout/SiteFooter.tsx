import Image from "next/image";
import Link from "next/link";
import logoCream from "@/assets/brand/matcha9-logo-cream.webp";
import { footerNav, fullAddress, site } from "@/lib/site";
import { Hanko } from "@/components/ui/Hanko";
import { ArrowUpRight, InstagramIcon } from "@/components/ui/icons";

type SiteFooterProps = { hours: string; orderHref: string; orderExternal: boolean };

export function SiteFooter({ hours, orderHref, orderExternal }: SiteFooterProps) {
  const year = 2026;
  return (
    <footer className="bg-seigaiha relative overflow-hidden bg-forest text-cream">
      <div className="container-page pt-20 pb-10 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-end gap-5">
              <Image src={logoCream} alt={site.name} className="h-auto w-28" />
              <Hanko className="mb-2 size-10 text-xl" />
            </div>
            <p className="mt-8 font-script text-4xl text-terracotta">{site.motto}</p>
            <p lang="ja" className="mt-2 font-jp text-sm tracking-[0.4em] text-cream/45">
              心を込めて
            </p>
            <p className="mt-5 max-w-sm leading-relaxed text-cream/65">
              Certified organic, ceremonial-grade Japanese matcha, whisked to order into signature
              drinks. {site.values.join(" · ")}.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h2 className="eyebrow font-sans text-sage">Visit</h2>
              <address className="mt-5 space-y-1 text-sm leading-relaxed text-cream/75 not-italic">
                <p>{site.address.venue}</p>
                <p>{fullAddress}</p>
                <p className="pt-2">{hours}</p>
              </address>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-cream underline decoration-cream/25 underline-offset-4 hover:decoration-cream"
              >
                Get directions <ArrowUpRight className="size-3.5" />
              </a>
            </div>

            <div>
              <h2 className="eyebrow font-sans text-sage">Explore</h2>
              <ul className="mt-5 space-y-2.5 text-sm">
                {footerNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-cream/75 transition-colors hover:text-cream"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow font-sans text-sage">Say hello</h2>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  <a
                    href={site.phone.href}
                    className="text-cream/75 transition-colors hover:text-cream"
                  >
                    {site.phone.display}
                  </a>
                </li>
                <li>
                  <a
                    href={site.instagram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cream/75 transition-colors hover:text-cream"
                  >
                    <InstagramIcon className="size-4" /> {site.instagram.handle}
                  </a>
                </li>
                <li>
                  {orderExternal ? (
                    <a
                      href={orderHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-cream/75 transition-colors hover:text-cream"
                    >
                      Order pickup <ArrowUpRight className="size-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={orderHref}
                      className="text-cream/75 transition-colors hover:text-cream"
                    >
                      Order pickup
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 font-display text-[15vw] leading-none tracking-[0.06em] whitespace-nowrap text-cream/[0.06] uppercase select-none xl:text-[14rem]"
        >
          Matcha 9
        </p>

        <div className="mt-6 flex flex-col gap-3 border-t border-cream/10 pt-8 text-xs leading-relaxed text-cream/50 md:flex-row md:items-start md:justify-between">
          <p>
            A sister concept from the{" "}
            <a
              href={site.tacoMaya.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-cream"
            >
              {site.tacoMaya.name}
            </a>{" "}
            family. {site.allergyNote}
          </p>
          <p className="shrink-0">
            © {year} {site.name} · Website concept
          </p>
        </div>
      </div>
    </footer>
  );
}
