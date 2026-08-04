/**
 * Asymmetric Y mapping: upper portion of hand movement range maps to top of screen.
 * Fixes ergonomics — raising arm high is harder than lowering it.
 */
export interface YMappingProfile {
  /** Hand range [0–1] treated as the upper band (default 0.65) */
  upperHandBand: number;
  /** Viewport fraction [0–1] assigned to upper band (default 0.32) */
  upperViewportBand: number;
}

export const MOBILE_Y_MAPPING: YMappingProfile = {
  upperHandBand: 0.65,
  upperViewportBand: 0.32,
};

export const DESKTOP_Y_MAPPING: YMappingProfile = {
  upperHandBand: 0.5,
  upperViewportBand: 0.45,
};

/** Map hand tY (0=high hand, 1=low hand) → viewport tY (0=top, 1=bottom) */
export function applyYMapping(tY: number, profile?: YMappingProfile): number {
  if (!profile) return tY;

  const t = Math.min(1, Math.max(0, tY));
  const { upperHandBand, upperViewportBand } = profile;

  if (t <= upperHandBand) {
    return (t / upperHandBand) * upperViewportBand;
  }

  const lowerHandSpan = 1 - upperHandBand;
  const lowerViewportSpan = 1 - upperViewportBand;
  return upperViewportBand + ((t - upperHandBand) / lowerHandSpan) * lowerViewportSpan;
}
