import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

export function AnnouncementBar() {
  return (
    <div className="bg-forest text-cream">
      <Link
        href="/menu/very-berry/"
        className="group container-page flex items-center justify-center gap-3 py-2.5 text-center text-[0.72rem] tracking-[0.12em]"
      >
        <span className="font-semibold tracking-[0.22em] text-sage uppercase">New</span>
        <span className="h-3 w-px bg-cream/25" aria-hidden="true" />
        <span>
          Very Berry Matcha
          <span className="hidden sm:inline">
            , a whole-food blend of nearly forty organic fruits &amp; vegetables
          </span>
        </span>
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
