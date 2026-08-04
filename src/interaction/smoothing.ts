export interface SmoothingConfig {
  alpha: number;
  deadZonePx: number;
}

export interface SmoothingState {
  x: number;
  y: number;
  initialized: boolean;
}

export class CursorSmoother {
  private state: SmoothingState = { x: 0, y: 0, initialized: false };
  private alpha: number;
  private deadZonePx: number;

  constructor(config: SmoothingConfig) {
    this.alpha = config.alpha;
    this.deadZonePx = config.deadZonePx;
  }

  updateConfig(config: Partial<SmoothingConfig>): void {
    if (config.alpha !== undefined) this.alpha = config.alpha;
    if (config.deadZonePx !== undefined) this.deadZonePx = config.deadZonePx;
  }

  smooth(currentX: number, currentY: number): { x: number; y: number } {
    if (!this.state.initialized) {
      this.state = { x: currentX, y: currentY, initialized: true };
      return { x: currentX, y: currentY };
    }

    const dx = currentX - this.state.x;
    const dy = currentY - this.state.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.deadZonePx) {
      return { x: this.state.x, y: this.state.y };
    }

    const smoothedX = this.alpha * currentX + (1 - this.alpha) * this.state.x;
    const smoothedY = this.alpha * currentY + (1 - this.alpha) * this.state.y;

    this.state = { x: smoothedX, y: smoothedY, initialized: true };
    return { x: smoothedX, y: smoothedY };
  }

  reset(): void {
    this.state = { x: 0, y: 0, initialized: false };
  }

  getState(): SmoothingState {
    return { ...this.state };
  }
}
