import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DwellController } from '../src/interaction/dwell-controller';

describe('DwellController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const config = {
    dwellDurationMs: 800,
    movementTolerancePx: 30,
    cooldownMs: 600,
  };

  it('starts dwelling on valid target', () => {
    const controller = new DwellController(config);
    const now = 1000;

    const result = controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    expect(result.state.phase).toBe('hovering');
  });

  it('cancels dwell when leaving target', () => {
    const controller = new DwellController(config);

    controller.update({
      now: 1000,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    const result = controller.update({
      now: 1100,
      cursorX: 100,
      cursorY: 100,
      targetId: null,
      isPointing: true,
      targetDisabled: false,
    });

    expect(result.state.phase).toBe('idle');
    expect(result.justSelected).toBe(false);
  });

  it('completes dwell after duration', () => {
    const controller = new DwellController(config);
    let now = 1000;

    controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    now += 1;
    controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    now += 800;
    const result = controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    expect(result.justSelected).toBe(true);
    expect(result.selectedTargetId).toBe('btn-1');
    expect(result.state.phase).toBe('cooldown');
  });

  it('prevents re-selection during same hover via activatedTargets', () => {
    const controller = new DwellController(config);
    let now = 1000;

    controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    now += 1;
    controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    now += 800;
    controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    now += 700;
    const result = controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: 'btn-1',
      isPointing: true,
      targetDisabled: false,
    });

    expect(result.justSelected).toBe(false);
  });

  it('allows re-selection after leaving target', () => {
    const controller = new DwellController(config);
    let now = 1000;

    const completeDwell = () => {
      controller.update({
        now,
        cursorX: 100,
        cursorY: 100,
        targetId: 'btn-1',
        isPointing: true,
        targetDisabled: false,
      });
      now += 1;
      controller.update({
        now,
        cursorX: 100,
        cursorY: 100,
        targetId: 'btn-1',
        isPointing: true,
        targetDisabled: false,
      });
      now += 800;
      return controller.update({
        now,
        cursorX: 100,
        cursorY: 100,
        targetId: 'btn-1',
        isPointing: true,
        targetDisabled: false,
      });
    };

    completeDwell();
    now += 700;

    controller.update({
      now,
      cursorX: 100,
      cursorY: 100,
      targetId: null,
      isPointing: true,
      targetDisabled: false,
    });

    controller.onTargetLeave('btn-1');
    now += 100;

    const result = completeDwell();
    expect(result.justSelected).toBe(true);
  });
});
