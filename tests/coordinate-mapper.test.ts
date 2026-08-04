import { describe, it, expect } from 'vitest';
import {
  mirrorNormalizedX,
  clampToActiveRegion,
  mapToViewport,
  mapLandmarkToScreen,
} from '../src/interaction/coordinate-mapper';
import { TOUCHLESS_CONFIG } from '../src/config/touchless-config';

describe('coordinate-mapper', () => {
  const region = TOUCHLESS_CONFIG.activeRegion;
  const viewport = { width: 1920, height: 1080 };

  it('mirrors normalized X', () => {
    expect(mirrorNormalizedX(0)).toBe(1);
    expect(mirrorNormalizedX(1)).toBe(0);
    expect(mirrorNormalizedX(0.5)).toBe(0.5);
  });

  it('clamps coordinates to active region', () => {
    expect(clampToActiveRegion(0, 0, region)).toEqual({ x: region.minX, y: region.minY });
    expect(clampToActiveRegion(1, 1, region)).toEqual({ x: region.maxX, y: region.maxY });
    expect(clampToActiveRegion(0.5, 0.5, region)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('maps active region to full viewport', () => {
    const topLeft = mapToViewport(region.minX, region.minY, region, viewport);
    expect(topLeft).toEqual({ x: 0, y: 0 });

    const bottomRight = mapToViewport(region.maxX, region.maxY, region, viewport);
    expect(bottomRight).toEqual({ x: viewport.width, y: viewport.height });
  });

  it('maps landmark with mirror to screen', () => {
    const point = mapLandmarkToScreen(1, region.minY, region, viewport);
    expect(point.x).toBe(0);
    expect(point.y).toBe(0);
  });
});
