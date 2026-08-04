import { describe, it, expect } from 'vitest';
import { CursorSmoother } from '../src/interaction/smoothing';

describe('CursorSmoother', () => {
  it('returns first point without smoothing', () => {
    const smoother = new CursorSmoother({ alpha: 0.25, deadZonePx: 3 });
    const result = smoother.smooth(100, 200);
    expect(result).toEqual({ x: 100, y: 200 });
  });

  it('applies exponential moving average', () => {
    const smoother = new CursorSmoother({ alpha: 0.5, deadZonePx: 0 });
    smoother.smooth(100, 100);
    const result = smoother.smooth(200, 200);
    expect(result.x).toBe(150);
    expect(result.y).toBe(150);
  });

  it('respects dead zone', () => {
    const smoother = new CursorSmoother({ alpha: 0.5, deadZonePx: 10 });
    smoother.smooth(100, 100);
    const result = smoother.smooth(105, 105);
    expect(result).toEqual({ x: 100, y: 100 });
  });

  it('resets state', () => {
    const smoother = new CursorSmoother({ alpha: 0.25, deadZonePx: 3 });
    smoother.smooth(100, 200);
    smoother.reset();
    const result = smoother.smooth(50, 60);
    expect(result).toEqual({ x: 50, y: 60 });
  });
});
