"use client";

import { useEffect } from "react";

/** Last-resort screen if a page (or the database behind it) fails. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-page flex min-h-screen flex-col items-start justify-center py-24">
      <p className="eyebrow text-sage-deep">Something went wrong</p>
      <h1 className="mt-6 text-display-lg">
        We spilled the matcha. <em className="font-normal text-sage-deep">Sorry.</em>
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
        This page didn’t load properly. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 rounded-full bg-moss px-7 py-3.5 text-[0.72rem] font-semibold tracking-[0.18em] text-cream uppercase transition-colors hover:bg-forest"
      >
        Try again
      </button>
    </main>
  );
}
