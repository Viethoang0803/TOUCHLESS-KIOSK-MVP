import { describe, it, expect } from 'vitest';
import { detectPointing } from '../src/gestures/point-detector';
import type { NormalizedLandmark } from '../src/vision/vision-types';
import { GestureStabilizer } from '../src/gestures/gesture-stabilizer';

function createLandmarks(overrides: Partial<Record<number, Partial<NormalizedLandmark>>>): NormalizedLandmark[] {
  const base: Partial<Record<number, NormalizedLandmark>> = {
    0: { x: 0.5, y: 0.8, z: 0 },
    6: { x: 0.5, y: 0.55, z: 0 },
    8: { x: 0.5, y: 0.2, z: 0 },
    9: { x: 0.55, y: 0.65, z: 0 },
    10: { x: 0.55, y: 0.6, z: 0 },
    12: { x: 0.55, y: 0.62, z: 0 },
    14: { x: 0.6, y: 0.63, z: 0 },
    16: { x: 0.6, y: 0.64, z: 0 },
    18: { x: 0.65, y: 0.64, z: 0 },
    20: { x: 0.65, y: 0.65, z: 0 },
  };

  return Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    ...base[i],
    ...overrides[i],
  }));
}

describe('point-detector', () => {
  it('detects pointing gesture with extended index and folded others', () => {
    const landmarks = createLandmarks({});
    expect(detectPointing(landmarks)).toBe(true);
  });

  it('rejects when index is folded', () => {
    const landmarks = createLandmarks({
      8: { x: 0.5, y: 0.56, z: 0 },
    });
    expect(detectPointing(landmarks)).toBe(false);
  });

  it('rejects when middle finger is extended', () => {
    const landmarks = createLandmarks({
      12: { x: 0.55, y: 0.2, z: 0 },
    });
    expect(detectPointing(landmarks)).toBe(false);
  });
});

describe('GestureStabilizer', () => {
  it('requires consecutive frames to enter POINTING', () => {
    const stabilizer = new GestureStabilizer({ enterFrames: 4, exitFrames: 4 });

    expect(stabilizer.update(true)).toBe('NONE');
    expect(stabilizer.update(true)).toBe('NONE');
    expect(stabilizer.update(true)).toBe('NONE');
    expect(stabilizer.update(true)).toBe('POINTING');
  });

  it('requires consecutive frames to exit POINTING', () => {
    const stabilizer = new GestureStabilizer({ enterFrames: 4, exitFrames: 4 });

    for (let i = 0; i < 4; i++) stabilizer.update(true);
    expect(stabilizer.getState()).toBe('POINTING');

    expect(stabilizer.update(false)).toBe('POINTING');
    expect(stabilizer.update(false)).toBe('POINTING');
    expect(stabilizer.update(false)).toBe('POINTING');
    expect(stabilizer.update(false)).toBe('NONE');
  });

  it('resets state', () => {
    const stabilizer = new GestureStabilizer({ enterFrames: 4, exitFrames: 4 });
    for (let i = 0; i < 4; i++) stabilizer.update(true);
    stabilizer.reset();
    expect(stabilizer.getState()).toBe('NONE');
  });
});
