"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { defaultSelections, formatMoney, toOrderable, type MenuItem } from "@/lib/menu";
import { imageSrc } from "@/lib/paths";
import { useBag } from "@/components/order/BagProvider";
import { ArrowLink, ButtonLink, buttonClasses } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import type { AnchorId, DrinkScene, FrameInfo } from "./drink-build/scene";
import { buildSteps, easeOut, REVEAL_START, span, stepIndexAt } from "./drink-build/timeline";

/** The drink the scene builds. Name, copy, price and stock come from the live menu. */
const SLUG = "pistachio-drip";

const fallback = {
  name: "Pistachio Drip",
  description:
    "Pistachio cream drips down the glass through layers of matcha, finished with roasted pistachio scattered over the foam.",
};

/** Named once the drink is finished, staggered through the reveal. */
const layerLabels: { id: AnchorId; text: string; jp: string; tone: "ink" | "cream"; at: number }[] =
  [
    { id: "finish", text: "Roasted pistachio", jp: "仕上げ", tone: "ink", at: 0.28 },
    { id: "foam", text: "Foam", jp: "泡", tone: "ink", at: 0.36 },
    { id: "pistachio", text: "Pistachio cream", jp: "ピスタチオ", tone: "ink", at: 0.44 },
    { id: "milk", text: "Milk", jp: "ミルク", tone: "ink", at: 0.52 },
    { id: "matcha", text: "Ceremonial matcha", jp: "抹茶", tone: "cream", at: 0.6 },
  ];

type Mode = "loading" | "live" | "still" | "flat";

/**
 * The home page's opening: a Pistachio Drip built layer by layer as the guest scrolls, under
 * the site header. The section is pinned for a few screens of scroll while a Three.js scene
 * plays the build; the step rail follows along, and the finished drink gets its layers named.
 * Guests who prefer reduced motion see the finished drink without the pinned scroll, and
 * browsers without WebGL see the drink's photo.
 */
export function DrinkBuildHero({ items }: { items: MenuItem[] }) {
  const item = items.find((i) => i.slug === SLUG) ?? null;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const stepRef = useRef(-1);
  const [mode, setMode] = useState<Mode>("loading");
  const [step, setStep] = useState(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const slot = slotRef.current;
    if (!section || !stage || !canvas || !slot) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: DrinkScene | null = null;
    let cancelled = false;
    let firstFrame = true;
    let stickyTop = 0;

    const onFrame = ({ progress, anchors }: FrameInfo) => {
      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }
      const index = stepIndexAt(progress);
      if (index !== stepRef.current) {
        stepRef.current = index;
        setStep(index);
      }
      const built = span(progress, buildSteps[0]!.start, REVEAL_START);
      if (railRef.current) railRef.current.style.transform = `scaleY(${built})`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${built})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - span(progress, 0.004, 0.035));

      const reveal = span(progress, REVEAL_START, 1);
      layerLabels.forEach((label, i) => {
        const el = labelRefs.current[i];
        const at = anchors[label.id];
        if (!el || !at) return;
        const shown = easeOut(span(reveal, label.at, label.at + 0.28));
        el.style.opacity = String(shown);
        el.style.transform = `translate3d(${at.x}px, ${at.y + (1 - shown) * 10}px, 0) translate(-50%, -50%)`;
      });
    };

    const measure = () => {
      if (!scene) return;
      stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      const s = stage.getBoundingClientRect();
      const g = slot.getBoundingClientRect();
      scene.setLayout({
        width: Math.max(1, Math.round(s.width)),
        height: Math.max(1, Math.round(s.height)),
        slotX: g.left - s.left + g.width / 2,
        slotY: g.top - s.top + g.height / 2,
        slotHeight: Math.max(1, g.height),
      });
    };

    // 0 when the section reaches the header, 1 when its pinned stretch has scrolled by.
    const onScroll = () => {
      if (!scene) return;
      const top = section.getBoundingClientRect().top;
      const travel = section.offsetHeight - stage.offsetHeight;
      scene.setProgress(travel > 1 ? (stickyTop - top) / travel : 0);
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !scene) return;
      const r = stage.getBoundingClientRect();
      scene.setPointer(
        ((event.clientX - r.left) / r.width) * 2 - 1,
        ((event.clientY - r.top) / r.height) * 2 - 1,
      );
    };

    const resize = new ResizeObserver(measure);
    const visibility = new IntersectionObserver(([entry]) => {
      scene?.setActive(Boolean(entry?.isIntersecting));
    });

    import("./drink-build/scene")
      .then(({ mountDrinkScene }) => {
        if (cancelled) return;
        scene = mountDrinkScene(canvas, { still, onFrame });
        if (!scene) {
          setMode("flat");
          return;
        }
        setMode(still ? "still" : "live");
        measure();
        onScroll();
        resize.observe(stage);
        resize.observe(slot);
        visibility.observe(section);
        window.addEventListener("scroll", onScroll, { passive: true });
        stage.addEventListener("pointermove", onPointer, { passive: true });
      })
      .catch(() => {
        if (!cancelled) setMode("flat");
      });

    return () => {
      cancelled = true;
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("scroll", onScroll);
      stage.removeEventListener("pointermove", onPointer);
      scene?.destroy();
    };
  }, []);

  // The pinned scroll grows the section only once the scene is running, and re-measures then.
  useEffect(() => {
    if (mode === "live") window.dispatchEvent(new Event("scroll"));
  }, [mode]);

  const live = mode === "live";
  const done = mode === "still" || mode === "flat";
  const current = done ? buildSteps.length : step;
  const name = item?.name ?? fallback.name;
  const description = item?.description ?? fallback.description;
  const photo = item?.productImage ?? null;

  /** Scroll to the moment a step finishes, for the rail's buttons. */
  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || !live) return;
    const stepEnd = buildSteps[index]!.end - 0.012;
    const travel = section.offsetHeight - stage.offsetHeight;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - stickyTop + stepEnd * travel, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="signature-drink"
      data-live={live ? "" : undefined}
      className="relative data-live:h-[470svh] lg:data-live:h-[540svh]"
    >
      <div
        ref={stageRef}
        className="sticky top-20 h-[calc(100svh-5rem)] min-h-[36rem] overflow-hidden bg-cream"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-1000 ease-calm",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
        {/* The render's background is the page's cream; the same washi grain goes over it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:var(--washi)]"
        />

        {/* Layer names, positioned from the scene every frame. */}
        {!(mode === "flat" || mode === "loading") && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
            {layerLabels.map((label, i) => (
              <span
                key={label.id}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className={cn(
                  "absolute top-0 left-0 flex flex-col items-center text-center whitespace-nowrap opacity-0 will-change-transform",
                  label.tone === "cream"
                    ? "text-cream [text-shadow:0_0_14px_rgb(31_39_29/0.55)]"
                    : "text-moss [text-shadow:0_0_12px_rgb(250_247_242/0.95),0_0_3px_rgb(250_247_242/0.9)]",
                )}
              >
                <span className="text-[0.62rem] font-semibold tracking-[0.24em] uppercase md:text-[0.68rem]">
                  {label.text}
                </span>
                <span
                  lang="ja"
                  className="mt-0.5 font-jp text-[0.7rem] tracking-[0.2em] opacity-80"
                >
                  {label.jp}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="relative z-20 container-page grid h-full grid-rows-[auto_1fr_auto] gap-4 py-6 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-6 lg:py-10">
          {/* The drink */}
          <div className="lg:col-span-4">
            <p className="font-display text-xl text-sage-deep italic lg:text-2xl">
              Signature drink
            </p>
            {/* Sized by height as well as width, so it fits short laptop screens. */}
            <h1
              id="signature-drink"
              className="mt-1 text-display-lg lg:mt-[1.2vh] lg:text-[clamp(3rem,min(7.2vw,10.5vh),6.6rem)] lg:leading-[0.98] lg:tracking-[-0.02em]"
            >
              {name}
            </h1>
            <p className="mt-6 hidden max-w-sm leading-relaxed text-ink-soft lg:mt-[2.6vh] lg:block">
              {description}
            </p>
            {item && item.components.length > 0 && (
              <p className="mt-[2.6vh] hidden eyebrow text-sage-deep lg:[@media(min-height:761px)]:block">
                {item.components.join(" · ")}
              </p>
            )}
            {item && (
              <p className="mt-3 hidden font-display text-4xl text-moss tabular-nums lg:mt-[3.4vh] lg:block">
                {formatMoney(item.priceCents)}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-[2.4vh]">
              <HeroOrder item={item} />
              <span className="hidden sm:contents">
                <ArrowLink href={item ? `/menu/${item.slug}` : "/menu"} className="text-moss">
                  {item ? "About the drink" : "Explore the menu"}
                </ArrowLink>
              </span>
            </div>
          </div>

          {/* Where the glass stands; the whisk cursor whisks over it. */}
          <div
            ref={slotRef}
            data-cursor="whisk"
            className="relative min-h-0 lg:col-span-5 lg:h-[88%] lg:self-center"
          >
            {mode === "flat" && photo && (
              <Image
                src={imageSrc(photo.src)}
                alt={item?.productImageAlt ?? ""}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="mx-auto h-full w-auto object-contain mix-blend-multiply"
              />
            )}
          </div>

          {/* The steps: a vertical rail on large screens, a slim bar on phones. */}
          <div className="lg:col-span-3 lg:justify-self-end">
            <ol
              className="relative hidden space-y-5 lg:block"
              aria-label={`How a ${name} is built`}
            >
              <span
                aria-hidden="true"
                className="absolute top-2 bottom-2 left-[2.35rem] w-px bg-line"
              />
              <span
                ref={railRef}
                aria-hidden="true"
                className={cn(
                  "absolute top-2 bottom-2 left-[2.35rem] w-px origin-top bg-moss",
                  done ? "scale-y-100" : "scale-y-0",
                )}
              />
              {buildSteps.map((s, i) => {
                const state = i < current ? "done" : i === current ? "now" : "next";
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i)}
                      disabled={!live}
                      aria-current={state === "now" ? "step" : undefined}
                      className="group flex items-center gap-4 text-left disabled:cursor-default"
                    >
                      <span
                        className={cn(
                          "w-6 text-right font-display text-sm tabular-nums transition-colors duration-500",
                          state === "next" ? "text-sage" : "text-moss",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative z-10 grid size-3 place-items-center rounded-full border transition-[background-color,border-color,transform] duration-500 ease-calm",
                          state === "now"
                            ? "scale-150 border-moss bg-moss"
                            : state === "done"
                              ? "border-moss bg-moss"
                              : "border-line bg-cream group-hover:border-moss/50",
                        )}
                      />
                      <span className="flex items-baseline gap-2.5">
                        <span
                          className={cn(
                            "text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-500",
                            state === "next" ? "text-sage" : "text-moss",
                          )}
                        >
                          {s.label}
                        </span>
                        <span
                          lang="ja"
                          className={cn(
                            "font-jp text-xs tracking-[0.15em] transition-colors duration-500",
                            state === "now" ? "text-sage-deep" : "text-sage",
                          )}
                        >
                          {s.jp}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {live && (
              <p
                ref={hintRef}
                aria-hidden="true"
                className="mt-10 hidden items-center gap-3 pl-[1.9rem] text-[0.62rem] font-semibold tracking-[0.28em] text-sage-deep uppercase lg:flex"
              >
                <span className="block h-8 w-px animate-[scroll-cue_2.4s_var(--ease-calm)_infinite] bg-sage-deep/60" />
                Scroll to build it
              </p>
            )}

            <div className="lg:hidden">
              <p className="flex items-baseline justify-between gap-4 text-moss">
                <span className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
                  {current < 0
                    ? "Scroll to build it"
                    : current >= buildSteps.length
                      ? `${name}, ready`
                      : `${String(current + 1).padStart(2, "0")} · ${buildSteps[current]!.label}`}
                </span>
                {current >= 0 && current < buildSteps.length && (
                  <span lang="ja" className="font-jp text-xs tracking-[0.15em] text-sage-deep">
                    {buildSteps[current]!.jp}
                  </span>
                )}
              </p>
              <span aria-hidden="true" className="relative mt-3 block h-px bg-line">
                <span
                  ref={barRef}
                  className={cn(
                    "absolute inset-0 origin-left bg-moss",
                    done ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** "Add to bag" for the hero drink, with a quiet confirmation instead of opening the bag. */
function HeroOrder({ item }: { item: MenuItem | null }) {
  const { storefront, canOrder, add } = useBag();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!item) return <ButtonLink href="/menu">Explore the menu</ButtonLink>;
  if (storefront.mode === "toast") {
    return (
      <ButtonLink href={item.toastUrl ?? storefront.toastUrl} external>
        Order on Toast
      </ButtonLink>
    );
  }
  if (!canOrder) return <ButtonLink href={`/menu/${item.slug}`}>See the drink</ButtonLink>;
  if (!item.inStock) {
    return (
      <button type="button" disabled className={buttonClasses("primary")}>
        Sold out today
      </button>
    );
  }

  const orderable = toOrderable(item);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          add(orderable, defaultSelections(orderable));
          setAdded(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setAdded(false), 2400);
        }}
        className={
          added
            ? "inline-flex items-center justify-center gap-2.5 rounded-full bg-sage-deep px-7 py-3.5 text-[0.72rem] font-semibold tracking-[0.18em] whitespace-nowrap text-cream uppercase transition-colors duration-300 ease-calm"
            : buttonClasses("primary")
        }
      >
        {added ? (
          <>
            <CheckIcon className="size-4" /> Added to your bag
          </>
        ) : (
          <>Add to bag · {formatMoney(item.priceCents)}</>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {added ? `${item.name} added to your bag` : ""}
      </span>
    </>
  );
}
