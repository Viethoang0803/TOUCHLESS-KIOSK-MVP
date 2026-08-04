import { TOUCHLESS_CONFIG } from '../config/touchless-config';
import type { KioskState } from './kiosk-state';

export interface SessionManagerCallbacks {
  onStateChange: (state: KioskState) => void;
  onActivate: () => void;
  onResetToIdle: () => void;
}

export class SessionManager {
  private state: KioskState = 'IDLE';
  private pointingSince: number | null = null;
  private lastActivityTime = Date.now();
  private callbacks: SessionManagerCallbacks;

  constructor(callbacks: SessionManagerCallbacks) {
    this.callbacks = callbacks;
  }

  getState(): KioskState {
    return this.state;
  }

  touchActivity(): void {
    this.lastActivityTime = Date.now();
  }

  getLastActivityTime(): number {
    return this.lastActivityTime;
  }

  update(handDetected: boolean, isPointing: boolean, now: number): void {
    switch (this.state) {
      case 'IDLE':
        if (isPointing) {
          if (this.pointingSince === null) {
            this.pointingSince = now;
          } else if (now - this.pointingSince >= TOUCHLESS_CONFIG.idleActivationMs) {
            this.setState('ACTIVATING');
            this.callbacks.onActivate();
            this.setState('ACTIVE');
            this.pointingSince = null;
          }
        } else {
          this.pointingSince = null;
        }
        break;

      case 'ACTIVE':
        if (!handDetected) {
          this.setState('HAND_LOST');
        }
        if (isPointing || handDetected) {
          this.touchActivity();
        }
        break;

      case 'HAND_LOST':
        if (handDetected) {
          this.setState('ACTIVE');
          this.touchActivity();
        }
        break;

      case 'ACTIVATING':
      case 'ERROR':
        break;
    }
  }

  resetToIdle(): void {
    this.pointingSince = null;
    this.setState('IDLE');
    this.callbacks.onResetToIdle();
  }

  setError(): void {
    this.setState('ERROR');
  }

  private setState(next: KioskState): void {
    if (this.state === next) return;
    this.state = next;
    this.callbacks.onStateChange(next);
  }
}
