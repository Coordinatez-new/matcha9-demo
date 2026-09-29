import Link from "next/link";
import type { AnnouncementSettings } from "@/lib/settings";
import { ArrowRight } from "@/components/ui/icons";

/** Thin banner above the header, edited from the dashboard's settings. */
export function AnnouncementBar({ announcement }: { announcement: AnnouncementSettings }) {
  const { label, text, href } = announcement;
  // Keep the first clause on phones: "Very Berry Matcha, a whole-food blend…" → "Very Berry Matcha".
  const [lead, ...more] = text.split(/,(.+)/);
  const content = (
    <>
      {label && (
        <>
          <span className="font-semibold tracking-[0.22em] text-sage uppercase">{label}</span>
          <span className="h-3 w-px bg-cream/25" aria-hidden="true" />
        </>
      )}
      <span>
        {lead}
        {more[0] && <span className="hidden sm:inline">,{more[0]}</span>}
      </span>
      {href && (
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );
  const classes =
    "group container-page flex items-center justify-center gap-3 py-2.5 text-center text-[0.72rem] tracking-[0.12em]";

  return (
    <div className="bg-forest text-cream">
      {!href ? (
        <p className={classes}>{content}</p>
      ) : href.startsWith("/") ? (
        <Link href={href} className={classes}>
          {content}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      )}
    </div>
  );
}
