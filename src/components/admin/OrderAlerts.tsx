"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const KEY = "m9-order-sound";
const listeners = new Set<() => void>();

function readSound() {
  try {
    return window.localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

function writeSound(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the setting lasts for this page view only.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let audio: AudioContext | null = null;

/** Two soft sine notes, like a small bell. */
function chime() {
  audio ??= new AudioContext();
  const ctx = audio;
  void ctx.resume();
  [659.25, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + i * 0.18;
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.95);
  });
}

/**
 * Watches the newest order number on the (auto-refreshing) orders page. New orders show a
 * badge and a count in the tab title, and chime if the owner has switched sound on.
 */
export function OrderAlerts({ latest }: { latest: number }) {
  const sound = useSyncExternalStore(subscribe, readSound, () => false);
  const [seenUpTo, setSeenUpTo] = useState(latest);
  const previous = useRef(latest);
  const fresh = Math.max(0, latest - seenUpTo);

  useEffect(() => {
    if (latest > previous.current && sound) chime();
    previous.current = latest;
  }, [latest, sound]);

  useEffect(() => {
    const base = document.title.replace(/^\(\d+ new\) /, "");
    document.title = fresh > 0 ? `(${fresh} new) ${base}` : base;
  }, [fresh]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {fresh > 0 && (
        <button
          type="button"
          onClick={() => setSeenUpTo(latest)}
          className="animate-fade-in rounded-full bg-terracotta/20 px-4 py-2 text-sm text-terracotta-deep transition-colors hover:bg-terracotta/30"
        >
          {fresh === 1 ? "1 new order" : `${fresh} new orders`} · Got it
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          writeSound(!sound);
          if (!sound) chime();
        }}
        aria-pressed={sound}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
          sound
            ? "border-moss bg-moss text-cream"
            : "border-line bg-paper text-ink-soft hover:text-moss",
        )}
      >
        <span
          aria-hidden="true"
          className={cn("size-2 rounded-full", sound ? "bg-matcha" : "bg-sage/60")}
        />
        Sound alerts {sound ? "on" : "off"}
      </button>
    </div>
  );
}
