import { generateId } from '../utils/id';

export type InteractionEventType =
  | 'camera_started'
  | 'camera_error'
  | 'hand_detected'
  | 'hand_lost'
  | 'pointing_started'
  | 'pointing_ended'
  | 'hover_started'
  | 'hover_ended'
  | 'dwell_started'
  | 'dwell_cancelled'
  | 'target_selected'
  | 'screen_changed'
  | 'session_started'
  | 'session_ended';

export interface InteractionLog {
  timestamp: number;
  sessionId: string;
  eventType: InteractionEventType;
  targetId?: string;
  screen?: string;
  confidence?: number;
  inferenceLatencyMs?: number;
}

const MAX_LOGS = 200;

class InteractionLogger {
  private logs: InteractionLog[] = [];
  private sessionId: string;
  private listeners = new Set<(logs: InteractionLog[]) => void>();

  constructor() {
    this.sessionId = generateId();
  }

  newSession(): void {
    this.sessionId = generateId();
    this.log('session_started');
  }

  getSessionId(): string {
    return this.sessionId;
  }

  log(
    eventType: InteractionEventType,
    extra?: Omit<InteractionLog, 'timestamp' | 'sessionId' | 'eventType'>,
  ): void {
    const entry: InteractionLog = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      eventType,
      ...extra,
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs.length = MAX_LOGS;
    }

    this.listeners.forEach((cb) => cb([...this.logs]));
  }

  getLogs(limit = 50): InteractionLog[] {
    return this.logs.slice(0, limit);
  }

  clear(): void {
    this.logs = [];
    this.listeners.forEach((cb) => cb([]));
  }

  downloadJson(): void {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `touchless-kiosk-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  subscribe(callback: (logs: InteractionLog[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.logs]);
    return () => this.listeners.delete(callback);
  }
}

export const interactionLogger = new InteractionLogger();
