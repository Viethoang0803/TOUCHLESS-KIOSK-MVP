export interface ActiveRegion {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Mirror X because camera preview is flipped horizontally */
export function mirrorNormalizedX(x: number): number {
  return 1 - x;
}

export function clampToActiveRegion(
  x: number,
  y: number,
  region: ActiveRegion,
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(x, region.minX), region.maxX),
    y: Math.min(Math.max(y, region.minY), region.maxY),
  };
}

/** Map normalized active region coordinates to viewport pixels */
export function mapToViewport(
  normalizedX: number,
  normalizedY: number,
  region: ActiveRegion,
  viewport: ViewportSize,
): ScreenPoint {
  const clamped = clampToActiveRegion(normalizedX, normalizedY, region);
  const tX = (clamped.x - region.minX) / (region.maxX - region.minX);
  const tY = (clamped.y - region.minY) / (region.maxY - region.minY);

  return {
    x: tX * viewport.width,
    y: tY * viewport.height,
  };
}

export function mapLandmarkToScreen(
  landmarkX: number,
  landmarkY: number,
  region: ActiveRegion,
  viewport: ViewportSize,
): ScreenPoint {
  const mirroredX = mirrorNormalizedX(landmarkX);
  return mapToViewport(mirroredX, landmarkY, region, viewport);
}
