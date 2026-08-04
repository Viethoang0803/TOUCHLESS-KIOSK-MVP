import { useCallback, useEffect, useRef, useState } from 'react';
import { TouchlessButton } from '../components/TouchlessButton';
import styles from './TargetTestScreen.module.css';

const SEQUENCE = [5, 1, 9, 3, 7, 5];

interface TestMetrics {
  totalTimeMs: number;
  targetTimes: number[];
  correctCount: number;
  wrongCount: number;
  dwellCancelled: number;
  trackingLost: number;
  avgFps: number;
  avgInferenceMs: number;
}

interface TargetTestScreenProps {
  onRegisterHandlers: (handlers: {
    select: (num: number) => void;
    restart: () => void;
    download: () => void;
  }) => void;
  onExit: () => void;
  getDwellCancelled: () => number;
  getMetrics: () => { fps: number; inferenceMs: number };
  onTrackingLost: () => void;
  handDetected: boolean;
}

export function TargetTestScreen({
  onRegisterHandlers,
  onExit,
  getDwellCancelled,
  getMetrics,
  onTrackingLost,
  handDetected,
}: TargetTestScreenProps) {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState<TestMetrics | null>(null);
  const startTimeRef = useRef(Date.now());
  const targetTimesRef = useRef<number[]>([]);
  const lastStepTimeRef = useRef(Date.now());
  const wrongCountRef = useRef(0);
  const trackingLostRef = useRef(0);
  const fpsSamplesRef = useRef<number[]>([]);
  const inferenceSamplesRef = useRef<number[]>([]);
  const prevHandRef = useRef(handDetected);

  useEffect(() => {
    if (prevHandRef.current && !handDetected) {
      trackingLostRef.current += 1;
      onTrackingLost();
    }
    prevHandRef.current = handDetected;
  }, [handDetected, onTrackingLost]);

  useEffect(() => {
    const interval = setInterval(() => {
      const m = getMetrics();
      if (m.fps > 0) fpsSamplesRef.current.push(m.fps);
      if (m.inferenceMs > 0) inferenceSamplesRef.current.push(m.inferenceMs);
    }, 1000);
    return () => clearInterval(interval);
  }, [getMetrics]);

  const handleSelect = useCallback(
    (num: number) => {
      const expected = SEQUENCE[step];
      const now = Date.now();

      if (num === expected) {
        targetTimesRef.current.push(now - lastStepTimeRef.current);
        lastStepTimeRef.current = now;

        if (step + 1 >= SEQUENCE.length) {
          const totalTime = now - startTimeRef.current;
          const fpsArr = fpsSamplesRef.current;
          const infArr = inferenceSamplesRef.current;

          setReport({
            totalTimeMs: totalTime,
            targetTimes: [...targetTimesRef.current],
            correctCount: SEQUENCE.length,
            wrongCount: wrongCountRef.current,
            dwellCancelled: getDwellCancelled(),
            trackingLost: trackingLostRef.current,
            avgFps: fpsArr.length ? fpsArr.reduce((a, b) => a + b, 0) / fpsArr.length : 0,
            avgInferenceMs: infArr.length ? infArr.reduce((a, b) => a + b, 0) / infArr.length : 0,
          });
          setFinished(true);
        } else {
          setStep((s) => s + 1);
        }
      } else {
        wrongCountRef.current += 1;
      }
    },
    [step, getDwellCancelled],
  );

  const restart = () => {
    setStep(0);
    setFinished(false);
    setReport(null);
    startTimeRef.current = Date.now();
    lastStepTimeRef.current = Date.now();
    targetTimesRef.current = [];
    wrongCountRef.current = 0;
    trackingLostRef.current = 0;
    fpsSamplesRef.current = [];
    inferenceSamplesRef.current = [];
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `target-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    onRegisterHandlers({ select: handleSelect, restart, download: downloadReport });
    return () => onRegisterHandlers({ select: () => {}, restart: () => {}, download: () => {} });
  }, [handleSelect, restart, downloadReport, onRegisterHandlers]);

  if (finished && report) {
    return (
      <div className={styles.screen}>
        <div className={styles.report}>
          <h1>Báo cáo kiểm thử</h1>
          <div className={styles.stats}>
            <p>Tổng thời gian: {(report.totalTimeMs / 1000).toFixed(1)}s</p>
            <p>Target đúng: {report.correctCount}</p>
            <p>Target sai: {report.wrongCount}</p>
            <p>Dwell hủy: {report.dwellCancelled}</p>
            <p>Mất tracking: {report.trackingLost}</p>
            <p>FPS trung bình: {report.avgFps.toFixed(1)}</p>
            <p>Inference TB: {report.avgInferenceMs.toFixed(1)} ms</p>
          </div>
          <div className={styles.reportActions}>
            <TouchlessButton targetId="test-restart" onSelect={restart}>
              Chạy lại
            </TouchlessButton>
            <TouchlessButton targetId="test-download" onSelect={downloadReport} variant="secondary">
              Tải JSON
            </TouchlessButton>
            <TouchlessButton targetId="test-exit" onSelect={onExit} variant="ghost">
              Quay về kiosk
            </TouchlessButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1>Target Test 3×3</h1>
        <p>
          Chọn theo thứ tự: {SEQUENCE.join(' → ')}
        </p>
        <p className={styles.step}>
          Bước {step + 1}/{SEQUENCE.length} — Chọn số <strong>{SEQUENCE[step]}</strong>
        </p>
      </header>

      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchlessButton
            key={num}
            targetId={`test-cell-${num}`}
            onSelect={() => handleSelect(num)}
            variant={num === SEQUENCE[step] ? 'primary' : 'secondary'}
          >
            {num}
          </TouchlessButton>
        ))}
      </div>

      <TouchlessButton targetId="test-exit-idle" onSelect={onExit} variant="ghost" size="md">
        Quay về kiosk
      </TouchlessButton>
    </div>
  );
}
