import { describe, it, expect } from 'vitest';
import { applyYMapping, MOBILE_Y_MAPPING } from '../src/interaction/y-mapping';

describe('y-mapping', () => {
  it('maps comfortable hand height to upper screen without extreme raise', () => {
    // tY=0.4 = hand at 40% of range (moderate, not fully raised)
    const mapped = applyYMapping(0.4, MOBILE_Y_MAPPING);
    // Should be in top ~30% of screen (scroll zone is ~28%)
    expect(mapped).toBeLessThan(0.3);
  });

  it('maps low hand to bottom of screen', () => {
    expect(applyYMapping(1, MOBILE_Y_MAPPING)).toBe(1);
  });

  it('maps high hand to top of screen', () => {
    expect(applyYMapping(0, MOBILE_Y_MAPPING)).toBe(0);
  });

  it('is monotonically increasing', () => {
    let prev = 0;
    for (let t = 0; t <= 1; t += 0.1) {
      const v = applyYMapping(t, MOBILE_Y_MAPPING);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('upper hand band covers less viewport than lower band proportionally', () => {
    const midUpper = applyYMapping(0.325, MOBILE_Y_MAPPING);
    const midLower = applyYMapping(0.825, MOBILE_Y_MAPPING);
    expect(midUpper).toBeLessThan(MOBILE_Y_MAPPING.upperViewportBand);
    expect(midLower).toBeGreaterThan(MOBILE_Y_MAPPING.upperViewportBand);
  });
});
