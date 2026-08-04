import { TOUCHLESS_CONFIG } from '../config/touchless-config';

export class InactivityManager {
  private lastActivityTime = Date.now();
  private timeoutMs: number;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private onTimeout: () => void;

  constructor(onTimeout: () => void, timeoutMs = TOUCHLESS_CONFIG.inactivityTimeoutMs) {
    this.onTimeout = onTimeout;
    this.timeoutMs = timeoutMs;
  }

  start(): void {
    this.stop();
    this.lastActivityTime = Date.now();
    this.timerId = setInterval(() => {
      if (Date.now() - this.lastActivityTime >= this.timeoutMs) {
        this.onTimeout();
        this.touch();
      }
    }, 1000);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  touch(): void {
    this.lastActivityTime = Date.now();
  }

  setTimeoutMs(ms: number): void {
    this.timeoutMs = ms;
  }
}
