/**
 * The Pistachio Drip build on the home page, as fractions of its pinned scroll: 0 is the empty
 * glass, 1 the finished drink with its layers named. The 3D scene and the step rail both read
 * it, so scrolling back simply plays the build in reverse.
 */

export type BuildStep = {
  id: "ice" | "matcha" | "milk" | "pistachio" | "foam" | "finish";
  label: string;
  jp: string;
  start: number;
  end: number;
};

export const buildSteps: BuildStep[] = [
  { id: "ice", label: "Ice", jp: "氷", start: 0.04, end: 0.18 },
  { id: "matcha", label: "Matcha", jp: "抹茶", start: 0.18, end: 0.36 },
  { id: "milk", label: "Milk", jp: "ミルク", start: 0.36, end: 0.52 },
  { id: "pistachio", label: "Pistachio cream", jp: "ピスタチオ", start: 0.52, end: 0.65 },
  { id: "foam", label: "Foam", jp: "泡", start: 0.65, end: 0.77 },
  { id: "finish", label: "Roasted pistachio", jp: "仕上げ", start: 0.77, end: 0.87 },
];

/** After the last step the camera turns, a ring draws around the glass and the layers are named. */
export const REVEAL_START = 0.87;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Where p sits between a and b, clamped to 0..1. */
export const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export const easeIn = (t: number) => t * t;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Progress through one step, 0..1. */
export function stepProgress(p: number, id: BuildStep["id"]) {
  const step = buildSteps.find((s) => s.id === id)!;
  return span(p, step.start, step.end);
}

/** The step being built at p: -1 before the first, buildSteps.length once the drink is done. */
export function stepIndexAt(p: number) {
  if (p < buildSteps[0]!.start) return -1;
  const i = buildSteps.findIndex((s) => p < s.end);
  return i === -1 ? buildSteps.length : i;
}
