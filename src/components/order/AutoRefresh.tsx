"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isStaticDemo } from "@/lib/paths";

/** Re-render the page from the server every few seconds (and on return to the tab). */
export function AutoRefresh({ every = 5000, active = true }: { every?: number; active?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    // The static preview has no server to re-render from; its pages follow the demo store.
    if (!active || isStaticDemo) return;
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refresh, every);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, every, active]);

  return null;
}
