export type DwellPhase = 'idle' | 'hovering' | 'dwelling' | 'cooldown';

export interface DwellConfig {
  dwellDurationMs: number;
  movementTolerancePx: number;
  cooldownMs: number;
}

export interface DwellState {
  phase: DwellPhase;
  targetId: string | null;
  progress: number;
  dwellStartTime: number | null;
  cooldownEndTime: number | null;
  anchorX: number;
  anchorY: number;
  cancelledCount: number;
}

export interface DwellUpdateInput {
  now: number;
  cursorX: number;
  cursorY: number;
  targetId: string | null;
  isPointing: boolean;
  targetDisabled: boolean;
}

export interface DwellUpdateResult {
  state: DwellState;
  justSelected: boolean;
  selectedTargetId: string | null;
}

export class DwellController {
  private state: DwellState = {
    phase: 'idle',
    targetId: null,
    progress: 0,
    dwellStartTime: null,
    cooldownEndTime: null,
    anchorX: 0,
    anchorY: 0,
    cancelledCount: 0,
  };

  private config: DwellConfig;
  private activatedTargets = new Set<string>();

  constructor(config: DwellConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<DwellConfig>): void {
    this.config = { ...this.config, ...config };
  }

  update(input: DwellUpdateInput): DwellUpdateResult {
    const { now, cursorX, cursorY, targetId, isPointing, targetDisabled } = input;
    let justSelected = false;
    let selectedTargetId: string | null = null;

    if (this.state.phase === 'cooldown') {
      if (this.state.cooldownEndTime && now >= this.state.cooldownEndTime) {
        this.state.phase = 'idle';
        this.state.cooldownEndTime = null;
        this.state.progress = 0;
      } else {
        return { state: { ...this.state }, justSelected, selectedTargetId };
      }
    }

    if (!isPointing || !targetId || targetDisabled) {
      if (this.state.phase === 'dwelling' || this.state.phase === 'hovering') {
        this.state.cancelledCount += 1;
      }
      this.state.phase = 'idle';
      this.state.targetId = null;
      this.state.progress = 0;
      this.state.dwellStartTime = null;
      return { state: { ...this.state }, justSelected, selectedTargetId };
    }

    if (this.activatedTargets.has(targetId)) {
      this.state.phase = 'hovering';
      this.state.targetId = targetId;
      this.state.progress = 0;
      this.state.dwellStartTime = null;
      return { state: { ...this.state }, justSelected, selectedTargetId };
    }

    if (this.state.targetId !== targetId) {
      this.state.phase = 'hovering';
      this.state.targetId = targetId;
      this.state.dwellStartTime = null;
      this.state.anchorX = cursorX;
      this.state.anchorY = cursorY;
      this.state.progress = 0;
      return { state: { ...this.state }, justSelected, selectedTargetId };
    }

    const moved = Math.hypot(cursorX - this.state.anchorX, cursorY - this.state.anchorY);
    if (moved > this.config.movementTolerancePx) {
      this.state.cancelledCount += 1;
      this.state.phase = 'hovering';
      this.state.dwellStartTime = null;
      this.state.anchorX = cursorX;
      this.state.anchorY = cursorY;
      this.state.progress = 0;
      return { state: { ...this.state }, justSelected, selectedTargetId };
    }

    if (this.state.dwellStartTime === null) {
      this.state.dwellStartTime = now;
      this.state.phase = 'hovering';
      return { state: { ...this.state }, justSelected, selectedTargetId };
    }

    this.state.phase = 'dwelling';

    const elapsed = now - this.state.dwellStartTime;
    this.state.progress = Math.min(100, (elapsed / this.config.dwellDurationMs) * 100);

    if (elapsed >= this.config.dwellDurationMs) {
      justSelected = true;
      selectedTargetId = targetId;
      this.activatedTargets.add(targetId);
      this.state.phase = 'cooldown';
      this.state.cooldownEndTime = now + this.config.cooldownMs;
      this.state.progress = 100;
      this.state.dwellStartTime = null;
    }

    return { state: { ...this.state }, justSelected, selectedTargetId };
  }

  onTargetLeave(targetId: string): void {
    this.activatedTargets.delete(targetId);
  }

  reset(): void {
    this.state = {
      phase: 'idle',
      targetId: null,
      progress: 0,
      dwellStartTime: null,
      cooldownEndTime: null,
      anchorX: 0,
      anchorY: 0,
      cancelledCount: this.state.cancelledCount,
    };
    this.activatedTargets.clear();
  }

  getState(): DwellState {
    return { ...this.state };
  }
}
