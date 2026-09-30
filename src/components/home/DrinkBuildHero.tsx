"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { preload } from "react-dom";
import { cn } from "@/lib/cn";
import { defaultSelections, formatMoney, toOrderable, type MenuItem } from "@/lib/menu";
import { imageSrc } from "@/lib/paths";
import { useBag } from "@/components/order/BagProvider";
import { ArrowLink, ButtonLink, buttonClasses } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import type { AnchorId, DrinkScene, FrameInfo } from "./drink-build/scene";
import { stillAnchors, stillFrames, stillSize } from "./drink-build/stills";
import {
  buildSteps,
  clamp01,
  easeInOut,
  easeOut,
  REVEAL_START,
  span,
  stepIndexAt,
} from "./drink-build/timeline";

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

// The still frames' box is centred on the glass's slot and a little taller than it, the way
// the 3D camera frames the slot, so frames and scene line up exactly.
const STILL_SIZES = "(min-width: 1024px) 86vh, 66vh";

function stillImage(src: string) {
  return getImageProps({
    src: imageSrc(src),
    alt: "",
    width: stillSize.width,
    height: stillSize.height,
    sizes: STILL_SIZES,
  }).props;
}

type Navigator3D = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

/**
 * A WebGL 2 context for the live 3D, or null when this device should keep the still frames.
 * Phones and tablets always keep them: the frames are smooth there and cost nothing, where the
 * 3D would cost battery and risk the browser dropping it under memory pressure. So do data
 * savers, slow connections, machines with little memory or few cores, and software GPUs.
 */
function hardwareContext(canvas: HTMLCanvasElement) {
  const nav = navigator as Navigator3D;
  if (window.matchMedia("(pointer: coarse)").matches) return null;
  if (nav.connection?.saveData) return null;
  if (/(^|-)2g$|^3g$/.test(nav.connection?.effectiveType ?? "")) return null;
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return null;
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    stencil: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  return gl;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether the guest prefers reduced motion (false while rendering on the server). */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** Run once the page has loaded and the browser has a quiet moment. */
function whenSettled(run: () => void) {
  const idle = () =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(run, { timeout: 2500 })
      : window.setTimeout(run, 600);
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

/**
 * The home page's opening: a Pistachio Drip built layer by layer as the guest scrolls, under
 * the site header. The section is pinned for a few screens of scroll while the build plays and
 * the step rail follows along; the finished drink gets its layers named.
 *
 * The build first plays as still frames rendered from the 3D scene: they show with the page,
 * crossfade as you scroll and need no WebGL. Once the page has loaded, capable devices swap in
 * the live 3D scene, drawing the same frame, so the switch can't be seen. Phones and tablets,
 * machines that can't keep it smooth, data savers and slow connections keep the frames. Guests
 * who prefer reduced motion see the finished drink without the pinned scroll.
 */
export function DrinkBuildHero({ items }: { items: MenuItem[] }) {
  const item = items.find((i) => i.slug === SLUG) ?? null;
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const frameRefs = useRef<(HTMLImageElement | null)[]>([]);
  const stillLabelRefs = useRef<(HTMLElement | null)[]>([]);
  const liveLabelRefs = useRef<(HTMLElement | null)[]>([]);
  const stepRef = useRef(-1);
  const repaintRef = useRef<() => void>(() => {});
  const [step, setStep] = useState(-1);
  const [live, setLive] = useState(false);
  const [framesWanted, setFramesWanted] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const slot = slotRef.current;
    const box = boxRef.current;
    if (!section || !stage || !canvas || !slot || !box) return;

    // With reduced motion, CSS shows the finished drink with its layers named, and doesn't pin.
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    let scene: DrinkScene | null = null;
    let cancelled = false;
    let threeD = false;
    let stickyTop = 0;
    let target = 0;
    let shown = 0;
    let raf = 0;
    let last = 0;

    const wantFrames = () => setFramesWanted(true);

    // Crossfade the still frames: every frame up to the current one stays under it, so a frame
    // that hasn't loaded yet simply leaves the last one showing.
    const paintFrames = (p: number) => {
      let current = 0;
      while (current + 1 < stillFrames.length && stillFrames[current + 1]!.at <= p) current++;
      const next = Math.min(current + 1, stillFrames.length - 1);
      const from = stillFrames[current]!.at;
      const to = stillFrames[next]!.at;
      const blend = next === current ? 0 : easeInOut(span(p, from + (to - from) * 0.3, to));
      let base = current;
      while (base > 0 && !loaded(frameRefs.current[base])) base--;
      frameRefs.current.forEach((img, k) => {
        if (!img) return;
        const opacity = k === base || (k > base && k <= current) ? 1 : k === next ? blend : 0;
        img.style.opacity = String(opacity);
        img.style.visibility = opacity > 0 && k >= base ? "visible" : "hidden";
      });
      const reveal = span(p, REVEAL_START, 1);
      layerLabels.forEach((label, i) => {
        const el = stillLabelRefs.current[i];
        if (el) el.style.opacity = String(easeOut(span(reveal, label.at, label.at + 0.28)));
      });
    };

    const paint = (p: number) => {
      const index = stepIndexAt(p);
      if (index !== stepRef.current) {
        stepRef.current = index;
        setStep(index);
      }
      const built = span(p, buildSteps[0]!.start, REVEAL_START);
      if (railRef.current) railRef.current.style.transform = `scaleY(${built})`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${built})`;
      if (hintRef.current) hintRef.current.style.opacity = String(1 - span(p, 0.004, 0.035));
      if (!threeD) {
        paintFrames(p);
        if (p > 0.004) wantFrames();
      }
      scene?.setProgress(p);
    };
    repaintRef.current = () => paint(shown);

    // Smooth the scroll position into the progress on screen.
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      shown += (target - shown) * (1 - Math.exp(-dt * 6.5));
      if (Math.abs(target - shown) < 1e-4) shown = target;
      paint(shown);
      raf = shown === target ? 0 : requestAnimationFrame(tick);
    };

    // 0 when the section reaches the header, 1 when its pinned stretch has scrolled by.
    const onScroll = () => {
      const travel = section.offsetHeight - stage.offsetHeight;
      target = travel > 1 ? clamp01((stickyTop - section.getBoundingClientRect().top) / travel) : 0;
      if (!raf && target !== shown) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const measure = () => {
      stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      onScroll();
      if (!scene) return;
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

    const onFrame = ({ anchors }: FrameInfo) => {
      if (!threeD) {
        threeD = true;
        setLive(true);
      }
      layerLabels.forEach((label, i) => {
        const el = liveLabelRefs.current[i];
        const at = anchors[label.id];
        if (!el || !at) return;
        const reveal = span(shown, REVEAL_START, 1);
        const on = easeOut(span(reveal, label.at, label.at + 0.28));
        el.style.opacity = String(on);
        el.style.transform = `translate3d(${at.x}px, ${at.y + (1 - on) * 10}px, 0) translate(-50%, -50%)`;
      });
    };

    // The GPU gave up, or couldn't keep up: back to the frames, for good.
    const onFail = () => {
      threeD = false;
      scene?.destroy();
      scene = null;
      setLive(false);
      wantFrames();
      paint(shown);
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
    resize.observe(stage);
    resize.observe(slot);
    const visibility = new IntersectionObserver(([entry]) => {
      scene?.setActive(Boolean(entry?.isIntersecting));
    });
    visibility.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    stage.addEventListener("pointermove", onPointer, { passive: true });
    measure();
    paint(shown);

    // The live 3D, once the page has settled, on devices that can carry it.
    whenSettled(async () => {
      if (cancelled) return;
      const context = hardwareContext(canvas);
      if (!context) {
        wantFrames();
        return;
      }
      try {
        const { createDrinkScene } = await import("./drink-build/scene");
        if (cancelled) return;
        const area = stage.clientWidth * stage.clientHeight;
        const created = await createDrinkScene(canvas, context, {
          // At most 1.5 device pixels per CSS pixel, and no more than ~2.4 megapixels in all.
          pixelRatio: Math.max(
            1,
            Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2.4e6 / Math.max(area, 1))),
          ),
          transmissionScale: 0.85,
          onFrame,
          onFail,
        });
        if (cancelled) {
          created.destroy();
          return;
        }
        scene = created;
        measure();
        scene.setProgress(shown);
        if (process.env.NODE_ENV !== "production") {
          // For scripts/render-drink-stills.mjs, which renders the still frames from the scene.
          (window as Window & { __m9DrinkSnapshot?: unknown }).__m9DrinkSnapshot = (
            p: number,
            ratio: number,
          ) => {
            const s = stage.getBoundingClientRect();
            const b = box.getBoundingClientRect();
            const shot = created.snapshot(p, ratio);
            return {
              ...shot,
              box: { x: b.left - s.left, y: b.top - s.top, width: b.width, height: b.height },
            };
          };
          (window as Window & { __m9DrinkEnvironment?: unknown }).__m9DrinkEnvironment = () =>
            created.bakeEnvironment();
        }
      } catch {
        if (!cancelled) onFail();
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      visibility.disconnect();
      window.removeEventListener("scroll", onScroll);
      stage.removeEventListener("pointermove", onPointer);
      scene?.destroy();
    };
  }, []);

  // Frames that mount later, and the live scene's labels once they mount, pick up the current
  // state.
  useEffect(() => {
    repaintRef.current();
  }, [framesWanted, live]);

  const done = reduced;
  const current = reduced ? buildSteps.length : step;
  const name = item?.name ?? fallback.name;
  const description = item?.description ?? fallback.description;
  const poster = stillImage(stillFrames[0]!.src);
  const finished = stillImage(stillFrames.at(-1)!.src);
  // The first frame is what the page opens on: fetch it before the body is parsed.
  preload(poster.src, {
    as: "image",
    imageSrcSet: poster.srcSet,
    imageSizes: poster.sizes,
    fetchPriority: "high",
    media: "(prefers-reduced-motion: no-preference)",
  });

  /** Scroll to the moment a step finishes, for the rail's buttons. */
  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || reduced) return;
    const stepEnd = buildSteps[index]!.end - 0.012;
    const travel = section.offsetHeight - stage.offsetHeight;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - stickyTop + stepEnd * travel, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="signature"
      aria-labelledby="signature-drink"
      className="relative motion-safe:h-[470svh] lg:motion-safe:h-[540svh]"
    >
      {/* Without JavaScript nothing plays the build, so don't pin the section. */}
      <noscript>
        <style>{"#signature{height:auto}"}</style>
      </noscript>
      <div
        ref={stageRef}
        className="sticky top-20 h-[calc(100svh-5rem)] min-h-[28rem] overflow-hidden bg-cream lg:min-h-[36rem]"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-700 ease-calm",
            live ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Layer names on the live scene, positioned from it every frame. */}
        {live && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
            {layerLabels.map((label, i) => (
              <LayerLabel
                key={label.id}
                label={label}
                ref={(el) => {
                  liveLabelRefs.current[i] = el;
                }}
                className="top-0 left-0 will-change-transform"
              />
            ))}
          </div>
        )}

        {/* Washi grain over the render and the frames, and leaf shadows falling across both. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 [background-image:var(--washi)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 z-30 h-[85%] w-[75%] bg-cover bg-right-top opacity-60 mix-blend-multiply lg:w-[62%]"
          style={{ backgroundImage: `url(${imageSrc("/images/drink-build/komorebi.webp")})` }}
        />

        <div className="relative z-20 container-page grid h-full grid-rows-[auto_1fr_auto] gap-4 py-6 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-6 lg:py-10">
          {/* The drink */}
          <div className="relative z-10 lg:col-span-4">
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
            <div
              ref={boxRef}
              aria-hidden="true"
              className={cn(
                "m9-still-fade pointer-events-none absolute top-1/2 left-1/2 aspect-[4/5] h-[124%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ease-calm",
                live ? "opacity-0" : "opacity-100",
              )}
            >
              <picture>
                <source
                  media="(prefers-reduced-motion: reduce)"
                  srcSet={finished.srcSet}
                  sizes={finished.sizes}
                />
                <img
                  {...poster}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                  ref={(el) => {
                    frameRefs.current[0] = el;
                  }}
                  className="absolute inset-0 size-full"
                />
              </picture>
              {framesWanted &&
                stillFrames.slice(1).map((frame, i) => {
                  const props = stillImage(frame.src);
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={frame.src}
                      {...props}
                      alt=""
                      loading="eager"
                      fetchPriority="low"
                      ref={(el) => {
                        frameRefs.current[i + 1] = el;
                      }}
                      onLoad={() => repaintRef.current()}
                      className="invisible absolute inset-0 size-full opacity-0"
                    />
                  );
                })}
              {layerLabels.map((label, i) => (
                <LayerLabel
                  key={label.id}
                  label={label}
                  ref={(el) => {
                    stillLabelRefs.current[i] = el;
                  }}
                  className="-translate-x-1/2 -translate-y-1/2 motion-reduce:!opacity-100"
                  style={{
                    left: `${stillAnchors[label.id][0] * 100}%`,
                    top: `${stillAnchors[label.id][1] * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* The steps: a vertical rail on large screens, a slim bar on phones. */}
          <div className="relative z-10 lg:col-span-3 lg:justify-self-end">
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
                      disabled={reduced}
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
            <p
              ref={hintRef}
              aria-hidden="true"
              className="mt-10 hidden items-center gap-3 pl-[1.9rem] text-[0.62rem] font-semibold tracking-[0.28em] text-sage-deep uppercase motion-safe:lg:flex"
            >
              <span className="block h-8 w-px animate-[scroll-cue_2.4s_var(--ease-calm)_infinite] bg-sage-deep/60" />
              Scroll to build it
            </p>

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

function loaded(img: HTMLImageElement | null | undefined) {
  return Boolean(img && img.complete && img.naturalWidth > 0);
}

/** One layer's name, in English and Japanese; positioned by whoever places it. */
function LayerLabel({
  label,
  className,
  style,
  ref,
}: {
  label: (typeof layerLabels)[number];
  className?: string;
  style?: CSSProperties;
  ref: (el: HTMLSpanElement | null) => void;
}) {
  return (
    <span
      ref={ref}
      style={style}
      className={cn(
        "absolute flex flex-col items-center text-center whitespace-nowrap opacity-0",
        label.tone === "cream"
          ? "text-cream [text-shadow:0_0_14px_rgb(31_39_29/0.55)]"
          : "text-moss [text-shadow:0_0_12px_rgb(250_247_242/0.95),0_0_3px_rgb(250_247_242/0.9)]",
        className,
      )}
    >
      <span className="text-[0.62rem] font-semibold tracking-[0.24em] uppercase md:text-[0.68rem]">
        {label.text}
      </span>
      <span lang="ja" className="mt-0.5 font-jp text-[0.7rem] tracking-[0.2em] opacity-80">
        {label.jp}
      </span>
    </span>
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
