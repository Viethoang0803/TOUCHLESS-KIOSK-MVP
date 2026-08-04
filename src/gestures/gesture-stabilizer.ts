import type { GestureState } from './gesture-types';

export interface GestureStabilizerConfig {
  enterFrames: number;
  exitFrames: number;
}

export class GestureStabilizer {
  private stableGesture: GestureState = 'NONE';
  private enterCount = 0;
  private exitCount = 0;
  private readonly enterFrames: number;
  private readonly exitFrames: number;

  constructor(config: GestureStabilizerConfig) {
    this.enterFrames = config.enterFrames;
    this.exitFrames = config.exitFrames;
  }

  update(rawPointing: boolean): GestureState {
    if (rawPointing) {
      this.enterCount += 1;
      this.exitCount = 0;

      if (this.stableGesture === 'NONE' && this.enterCount >= this.enterFrames) {
        this.stableGesture = 'POINTING';
      }
    } else {
      this.exitCount += 1;
      this.enterCount = 0;

      if (this.stableGesture === 'POINTING' && this.exitCount >= this.exitFrames) {
        this.stableGesture = 'NONE';
      }
    }

    return this.stableGesture;
  }

  getState(): GestureState {
    return this.stableGesture;
  }

  getFrameCounts(): { enterCount: number; exitCount: number } {
    return { enterCount: this.enterCount, exitCount: this.exitCount };
  }

  reset(): void {
    this.stableGesture = 'NONE';
    this.enterCount = 0;
    this.exitCount = 0;
  }
}
