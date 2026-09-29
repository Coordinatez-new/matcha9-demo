import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow text-sage-deep">404</p>
      <h1 className="mt-6 text-display-xl">
        This page <em className="font-normal text-sage-deep">wandered off.</em>
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
        It may have moved, or it never existed. The matcha is still where it always is.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/menu/" variant="outline">
          See the menu
        </ButtonLink>
      </div>
    </section>
  );
}
