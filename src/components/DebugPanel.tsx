import { useEffect, useState } from 'react';
import { TOUCHLESS_CONFIG } from '../config/touchless-config';
import type { InteractionLog } from '../kiosk/logger';
import { interactionLogger } from '../kiosk/logger';
import type { InteractionSnapshot } from '../interaction/interaction-engine';
import type { VisionMetrics } from '../vision/vision-types';
import styles from './DebugPanel.module.css';

export interface DebugSettings {
  showCameraPreview: boolean;
  showLandmarkOverlay: boolean;
  smoothingAlpha: number;
  dwellDurationMs: number;
  activeRegion: typeof TOUCHLESS_CONFIG.activeRegion;
}

const STORAGE_KEY = 'touchless-kiosk-debug';

export function loadDebugSettings(): DebugSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DebugSettings;
  } catch {
    /* use defaults */
  }
  return {
    showCameraPreview: true,
    showLandmarkOverlay: true,
    smoothingAlpha: TOUCHLESS_CONFIG.smoothingAlpha,
    dwellDurationMs: TOUCHLESS_CONFIG.dwellDurationMs,
    activeRegion: { ...TOUCHLESS_CONFIG.activeRegion },
  };
}

export function saveDebugSettings(settings: DebugSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface DebugPanelProps {
  open: boolean;
  onClose: () => void;
  snapshot: InteractionSnapshot;
  metrics: VisionMetrics;
  onSettingsChange: (settings: DebugSettings) => void;
  onResetInteraction: () => void;
  onOpenTest: () => void;
}

export function DebugPanel({
  open,
  onClose,
  snapshot,
  metrics,
  onSettingsChange,
  onResetInteraction,
  onOpenTest,
}: DebugPanelProps) {
  const [settings, setSettings] = useState<DebugSettings>(loadDebugSettings);
  const [logs, setLogs] = useState<InteractionLog[]>([]);

  useEffect(() => {
    return interactionLogger.subscribe(setLogs);
  }, []);

  useEffect(() => {
    if (open) saveDebugSettings(settings);
    onSettingsChange(settings);
  }, [settings, open, onSettingsChange]);

  if (!open) return null;

  const update = (partial: Partial<DebugSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Debug Panel</h2>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <section className={styles.section}>
        <h3>Hiển thị</h3>
        <label className={styles.row}>
          <input
            type="checkbox"
            checked={settings.showCameraPreview}
            onChange={(e) => update({ showCameraPreview: e.target.checked })}
          />
          Camera preview
        </label>
        <label className={styles.row}>
          <input
            type="checkbox"
            checked={settings.showLandmarkOverlay}
            onChange={(e) => update({ showLandmarkOverlay: e.target.checked })}
          />
          Landmark overlay
        </label>
      </section>

      <section className={styles.section}>
        <h3>Metrics</h3>
        <div className={styles.metric}>FPS: {metrics.fps}</div>
        <div className={styles.metric}>Inference: {metrics.inferenceLatencyMs.toFixed(1)} ms</div>
        <div className={styles.metric}>Hand: {metrics.handDetected ? 'Yes' : 'No'}</div>
        <div className={styles.metric}>Confidence: {(metrics.confidence * 100).toFixed(0)}%</div>
        <div className={styles.metric}>Gesture: {snapshot.gesture}</div>
        <div className={styles.metric}>
          Raw: ({snapshot.rawX.toFixed(0)}, {snapshot.rawY.toFixed(0)})
        </div>
        <div className={styles.metric}>
          Smooth: ({snapshot.cursorX.toFixed(0)}, {snapshot.cursorY.toFixed(0)})
        </div>
        <div className={styles.metric}>Hover: {snapshot.hoverTargetId ?? '—'}</div>
        <div className={styles.metric}>Dwell: {snapshot.dwellProgress.toFixed(0)}%</div>
      </section>

      <section className={styles.section}>
        <h3>Cấu hình</h3>
        <label className={styles.row}>
          Smoothing alpha: {settings.smoothingAlpha.toFixed(2)}
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={settings.smoothingAlpha}
            onChange={(e) => update({ smoothingAlpha: parseFloat(e.target.value) })}
          />
        </label>
        <label className={styles.row}>
          Dwell (ms): {settings.dwellDurationMs}
          <input
            type="range"
            min="400"
            max="2000"
            step="100"
            value={settings.dwellDurationMs}
            onChange={(e) => update({ dwellDurationMs: parseInt(e.target.value, 10) })}
          />
        </label>
      </section>

      <section className={styles.section}>
        <h3>Hành động</h3>
        <button type="button" className={styles.actionBtn} onClick={onResetInteraction}>
          Reset interaction
        </button>
        <button type="button" className={styles.actionBtn} onClick={onOpenTest}>
          Mở Target Test
        </button>
      </section>

      <section className={styles.section}>
        <h3>Logs ({logs.length})</h3>
        <div className={styles.logList}>
          {logs.slice(0, 50).map((log, i) => (
            <div key={`${log.timestamp}-${i}`} className={styles.logEntry}>
              <span className={styles.logTime}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span>{log.eventType}</span>
              {log.targetId && <span className={styles.logTarget}>{log.targetId}</span>}
            </div>
          ))}
        </div>
        <div className={styles.logActions}>
          <button type="button" className={styles.actionBtn} onClick={() => interactionLogger.downloadJson()}>
            Tải JSON
          </button>
          <button type="button" className={styles.actionBtn} onClick={() => interactionLogger.clear()}>
            Xóa log
          </button>
        </div>
      </section>
    </div>
  );
}
