export type MotionEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "ease-out-back";
export type MotionDirection = "left" | "right" | "top" | "bottom";
export type MotionEntrance = "none" | "fade-in" | "slide-in" | "slide-fade" | "rise-in" | "zoom-in" | "scale-fade" | "soft-pop" | "cinematic-title" | "rotate-in" | "overshoot" | "typewriter" | "character-reveal" | "word-reveal" | "character-pop";
export type MotionExit = "none" | "fade-out" | "slide-out" | "zoom-out" | "rotate-out";
export type MotionEmphasis = "none" | "float" | "pulse" | "drift" | "rotate";

export type ResolvedTextMotion = {
  type: MotionEntrance;
  duration: number;
  delay: number;
  direction: MotionDirection;
  easing: MotionEasing;
  exitType: MotionExit;
  exitDuration: number;
  exitStart: number;
  exitEasing: MotionEasing;
  emphasisType: MotionEmphasis;
  intensity: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

function finite(value: unknown, fallback: number, min: number, max: number) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function easing(value: unknown): MotionEasing {
  return ["linear", "ease-in", "ease-out", "ease-in-out", "ease-out-back"].includes(String(value))
    ? String(value) as MotionEasing
    : "ease-out";
}

function entranceType(value: unknown): MotionEntrance {
  if (value === "fade-in-out") return "fade-in";
  if (value === "slide-in-out") return "slide-in";
  if (value === "zoom-in-out") return "zoom-in";
  if (value === "character-reveal") return "character-reveal";
  return ["none", "fade-in", "slide-in", "slide-fade", "rise-in", "zoom-in", "scale-fade", "soft-pop", "cinematic-title", "rotate-in", "overshoot", "typewriter", "word-reveal", "character-pop"].includes(String(value))
    ? String(value) as MotionEntrance
    : "none";
}

function exitType(value: unknown): MotionExit {
  if (value === "fade-in-out") return "fade-out";
  if (value === "slide-in-out") return "slide-out";
  if (value === "zoom-in-out") return "zoom-out";
  return ["none", "fade-out", "slide-out", "zoom-out", "rotate-out"].includes(String(value))
    ? String(value) as MotionExit
    : "none";
}

export function resolveTextMotion(value: unknown, sceneDuration: number): ResolvedTextMotion {
  const anim = isRecord(value) ? value : {};
  const entrance = isRecord(anim.entrance) ? anim.entrance : anim;
  const exit = isRecord(anim.exit) ? anim.exit : {};
  const emphasis = isRecord(anim.emphasis) ? anim.emphasis : {};
  const scene = Math.max(0.1, finite(sceneDuration, 5, 0.1, 86400));
  const legacy = String(entrance.type ?? anim.type ?? "none");
  const type = entranceType(legacy);
  const oldExit = legacy === "fade-in-out" ? "fade-out" : legacy === "slide-in-out" ? "slide-out" : legacy === "zoom-in-out" ? "zoom-out" : "none";
  const exitPreset = exitType(exit.type ?? oldExit);
  const duration = Math.min(finite(entrance.duration ?? anim.duration, 1, 0.1, 10), Math.max(0.1, scene * 0.45));
  const exitDuration = Math.min(finite(exit.duration, Math.min(duration, scene / 3), 0.1, 10), Math.max(0.1, scene * 0.45));
  const delayMax = Math.max(0, scene - duration - (exitPreset === "none" ? 0 : exitDuration));
  const delay = Math.min(finite(entrance.start ?? entrance.delay ?? anim.delay, 0, 0, 120), delayMax);
  const exitLatest = Math.max(0, scene - exitDuration);
  const exitEarliest = Math.min(delay + duration, exitLatest);
  const exitStart = exitPreset === "none" ? exitLatest : Math.max(exitEarliest, Math.min(finite(exit.start ?? exit.delay, exitLatest, 0, scene), exitLatest));
  const directionValue = entrance.direction ?? anim.direction ?? exit.direction;
  const direction = ["left", "right", "top", "bottom"].includes(String(directionValue))
    ? String(directionValue) as MotionDirection
    : "bottom";
  const rawEmphasis = String(emphasis.type ?? (legacy === "float" || legacy === "pulse" ? legacy : "none"));
  const emphasisType: MotionEmphasis = ["none", "float", "pulse", "drift", "rotate"].includes(rawEmphasis)
    ? rawEmphasis as MotionEmphasis
    : "none";
  return {
    type,
    duration,
    delay,
    direction,
    easing: easing(entrance.easing ?? anim.easing),
    exitType: exitPreset,
    exitDuration,
    exitStart,
    exitEasing: easing(exit.easing ?? entrance.easing ?? anim.easing),
    emphasisType,
    intensity: finite(emphasis.intensity, 1, 0, 1),
  };
}

export function easeProgress(progress: number, value: MotionEasing): number {
  const p = Math.max(0, Math.min(1, progress));
  if (value === "linear") return p;
  if (value === "ease-in") return p ** 3;
  if (value === "ease-in-out") return p < 0.5 ? 4 * p ** 3 : 1 - ((-2 * p + 2) ** 3) / 2;
  if (value === "ease-out-back") {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2;
  }
  return 1 - (1 - p) ** 3;
}

/** Find when the shared easing curve first reaches a reveal step. */
export function timeForEasedProgress(
  start: number,
  duration: number,
  value: MotionEasing,
  threshold: number,
) {
  const target = Math.max(0, Math.min(1, threshold));
  if (target <= 0) return start;
  if (target >= 1) return start + duration;
  let low = 0;
  let high = 1;
  for (let index = 0; index < 32; index++) {
    const middle = (low + high) / 2;
    if (easeProgress(middle, value) >= target) high = middle;
    else low = middle;
  }
  return start + high * duration;
}

export function ffmpegProgress(start: number, duration: number, value: MotionEasing): string {
  const linear = `min(1,max(0,(t-${start.toFixed(3)})/${Math.max(0.001, duration).toFixed(3)}))`;
  if (value === "linear") return linear;
  if (value === "ease-in") return `pow(${linear},3)`;
  if (value === "ease-in-out") return `if(lt(${linear},0.5),4*pow(${linear},3),1-pow(-2*${linear}+2,3)/2)`;
  if (value === "ease-out-back") return `1+2.70158*pow(${linear}-1,3)+1.70158*pow(${linear}-1,2)`;
  return `1-pow(1-${linear},3)`;
}

export type SceneTransitionType = "hard-cut" | "cross-dissolve" | "fade-black" | "fade-white" | "slide" | "push" | "zoom" | "smooth-wipe" | "directional-reveal" | "blur-dissolve" | "cinematic-dissolve";
export type SceneTransition = { type: SceneTransitionType; duration: number; direction: MotionDirection };

export function resolveSceneTransition(value: unknown, maxDuration = 4): SceneTransition {
  const item = isRecord(value) ? value : {};
  const choices: SceneTransitionType[] = ["hard-cut", "cross-dissolve", "fade-black", "fade-white", "slide", "push", "zoom", "smooth-wipe", "directional-reveal", "blur-dissolve", "cinematic-dissolve"];
  const type = choices.includes(String(item.type) as SceneTransitionType) ? String(item.type) as SceneTransitionType : "hard-cut";
  const direction = ["left", "right", "top", "bottom"].includes(String(item.direction)) ? String(item.direction) as MotionDirection : "left";
  return { type, duration: Math.min(finite(item.duration, 0.8, 0.1, 4), Math.max(0.1, maxDuration)), direction };
}

export function ffmpegTransitionName(transition: SceneTransition): string | null {
  if (transition.type === "hard-cut") return null;
  if (transition.type === "cross-dissolve") return "fade";
  if (transition.type === "fade-black") return "fadeblack";
  if (transition.type === "fade-white") return "fadewhite";
  if (transition.type === "zoom") return "zoomin";
  if (transition.type === "blur-dissolve") return "hblur";
  if (transition.type === "cinematic-dissolve") return "fade";
  const names = {
    left: { slide: "slideleft", push: "coverleft", "smooth-wipe": "smoothleft", "directional-reveal": "revealleft" },
    right: { slide: "slideright", push: "coverright", "smooth-wipe": "smoothright", "directional-reveal": "revealright" },
    top: { slide: "slideup", push: "coverup", "smooth-wipe": "smoothup", "directional-reveal": "revealup" },
    bottom: { slide: "slidedown", push: "coverdown", "smooth-wipe": "smoothdown", "directional-reveal": "revealdown" },
  } as const;
  return names[transition.direction][transition.type as "slide" | "push" | "smooth-wipe" | "directional-reveal"];
}
