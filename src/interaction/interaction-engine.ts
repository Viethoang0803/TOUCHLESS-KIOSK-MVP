import { TOUCHLESS_CONFIG } from '../config/touchless-config';
import { detectPointing } from '../gestures/point-detector';
import { GestureStabilizer } from '../gestures/gesture-stabilizer';
import type { GestureState } from '../gestures/gesture-types';
import { hitTestTouchlessTarget } from './hit-testing';
import { mapLandmarkToScreen } from './coordinate-mapper';
import { CursorSmoother } from './smoothing';
import { DwellController } from './dwell-controller';
import type { NormalizedLandmark } from '../vision/vision-types';
import type { ActiveRegion } from './coordinate-mapper';

export type CursorVisualState = 'hidden' | 'normal' | 'hover' | 'dwell';

export interface InteractionSnapshot {
  visible: boolean;
  cursorX: number;
  cursorY: number;
  rawX: number;
  rawY: number;
  gesture: GestureState;
  rawPointing: boolean;
  hoverTargetId: string | null;
  dwellProgress: number;
  cursorState: CursorVisualState;
}

export interface InteractionEngineConfig {
  activeRegion: ActiveRegion;
  smoothingAlpha: number;
  deadZonePx: number;
  dwellDurationMs: number;
  dwellMovementTolerancePx: number;
  selectionCooldownMs: number;
  gestureEnterFrames: number;
  gestureExitFrames: number;
  handLostGracePeriodMs: number;
}

export type SelectionCallback = (targetId: string) => void;

export class InteractionEngine {
  private smoother: CursorSmoother;
  private gestureStabilizer: GestureStabilizer;
  private dwellController: DwellController;
  private config: InteractionEngineConfig;
  private lastHandTime = 0;
  private lastHoverTargetId: string | null = null;
  private onSelect: SelectionCallback | null = null;

  constructor(config?: Partial<InteractionEngineConfig>) {
    this.config = {
      activeRegion: TOUCHLESS_CONFIG.activeRegion,
      smoothingAlpha: TOUCHLESS_CONFIG.smoothingAlpha,
      deadZonePx: TOUCHLESS_CONFIG.cursorDeadZonePx,
      dwellDurationMs: TOUCHLESS_CONFIG.dwellDurationMs,
      dwellMovementTolerancePx: TOUCHLESS_CONFIG.dwellMovementTolerancePx,
      selectionCooldownMs: TOUCHLESS_CONFIG.selectionCooldownMs,
      gestureEnterFrames: TOUCHLESS_CONFIG.gestureEnterFrames,
      gestureExitFrames: TOUCHLESS_CONFIG.gestureExitFrames,
      handLostGracePeriodMs: TOUCHLESS_CONFIG.handLostGracePeriodMs,
      ...config,
    };

    this.smoother = new CursorSmoother({
      alpha: this.config.smoothingAlpha,
      deadZonePx: this.config.deadZonePx,
    });

    this.gestureStabilizer = new GestureStabilizer({
      enterFrames: this.config.gestureEnterFrames,
      exitFrames: this.config.gestureExitFrames,
    });

    this.dwellController = new DwellController({
      dwellDurationMs: this.config.dwellDurationMs,
      movementTolerancePx: this.config.dwellMovementTolerancePx,
      cooldownMs: this.config.selectionCooldownMs,
    });
  }

  setOnSelect(callback: SelectionCallback): void {
    this.onSelect = callback;
  }

  updateConfig(partial: Partial<InteractionEngineConfig>): void {
    this.config = { ...this.config, ...partial };

    this.smoother.updateConfig({
      alpha: this.config.smoothingAlpha,
      deadZonePx: this.config.deadZonePx,
    });

    this.dwellController.updateConfig({
      dwellDurationMs: this.config.dwellDurationMs,
      movementTolerancePx: this.config.dwellMovementTolerancePx,
      cooldownMs: this.config.selectionCooldownMs,
    });
  }

  processFrame(
    landmarks: NormalizedLandmark[] | null,
    viewport: { width: number; height: number },
    now: number,
  ): InteractionSnapshot {
    const defaultSnapshot: InteractionSnapshot = {
      visible: false,
      cursorX: 0,
      cursorY: 0,
      rawX: 0,
      rawY: 0,
      gesture: 'NONE',
      rawPointing: false,
      hoverTargetId: null,
      dwellProgress: 0,
      cursorState: 'hidden',
    };

    if (!landmarks || landmarks.length < 21) {
      if (now - this.lastHandTime > this.config.handLostGracePeriodMs) {
        this.smoother.reset();
        this.gestureStabilizer.reset();
      }
      return defaultSnapshot;
    }

    this.lastHandTime = now;

    const tip = landmarks[8];
    if (!tip) return defaultSnapshot;

    const rawPointing = detectPointing(landmarks);
    const gesture = this.gestureStabilizer.update(rawPointing);

    const rawScreen = mapLandmarkToScreen(
      tip.x,
      tip.y,
      this.config.activeRegion,
      viewport,
    );

    const smoothed =
      gesture === 'POINTING'
        ? this.smoother.smooth(rawScreen.x, rawScreen.y)
        : { x: rawScreen.x, y: rawScreen.y };

    if (gesture !== 'POINTING') {
      return {
        ...defaultSnapshot,
        rawX: rawScreen.x,
        rawY: rawScreen.y,
        gesture,
        rawPointing,
      };
    }

    const hit = hitTestTouchlessTarget(smoothed.x, smoothed.y);
    const targetId = hit?.targetId ?? null;
    const targetDisabled = hit ? hit.element.hasAttribute('data-touchless-disabled') : false;

    if (this.lastHoverTargetId && this.lastHoverTargetId !== targetId) {
      this.dwellController.onTargetLeave(this.lastHoverTargetId);
    }
    this.lastHoverTargetId = targetId;

    const dwellResult = this.dwellController.update({
      now,
      cursorX: smoothed.x,
      cursorY: smoothed.y,
      targetId,
      isPointing: gesture === 'POINTING',
      targetDisabled,
    });

    if (dwellResult.justSelected && dwellResult.selectedTargetId) {
      this.onSelect?.(dwellResult.selectedTargetId);
    }

    let cursorState: CursorVisualState = 'normal';
    if (dwellResult.state.phase === 'dwelling') cursorState = 'dwell';
    else if (targetId) cursorState = 'hover';

    return {
      visible: true,
      cursorX: smoothed.x,
      cursorY: smoothed.y,
      rawX: rawScreen.x,
      rawY: rawScreen.y,
      gesture,
      rawPointing,
      hoverTargetId: targetId,
      dwellProgress: dwellResult.state.progress,
      cursorState,
    };
  }

  reset(): void {
    this.smoother.reset();
    this.gestureStabilizer.reset();
    this.dwellController.reset();
    this.lastHoverTargetId = null;
    this.lastHandTime = 0;
  }

  getDwellCancelledCount(): number {
    return this.dwellController.getState().cancelledCount;
  }
}
