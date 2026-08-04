import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Point2D } from '../air-writing/point-2d';
import styles from './AirWritingCanvas.module.css';

interface AirWritingCanvasProps {
  strokePoints: Point2D[];
  isDrawing: boolean;
  rejected: boolean;
  lastChar: string | null;
}

export const AirWritingCanvas = forwardRef<HTMLDivElement, AirWritingCanvasProps>(
  function AirWritingCanvas({ strokePoints, isDrawing, rejected, lastChar }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const resize = () => {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      };

      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      if (strokePoints.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(strokePoints[0].x, strokePoints[0].y);
        for (let i = 1; i < strokePoints.length; i++) {
          ctx.lineTo(strokePoints[i].x, strokePoints[i].y);
        }
        ctx.stroke();
      }

      if (strokePoints.length > 0) {
        const tip = strokePoints[strokePoints.length - 1];
        ctx.fillStyle = isDrawing ? '#fbbf24' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }, [strokePoints, isDrawing]);

    return (
      <div
        ref={containerRef}
        className={`${styles.airPad} ${rejected ? styles.rejected : ''}`}
        aria-label="Khung viết không trung"
      >
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.overlay}>
          <span className={styles.guide}>
            {isDrawing
              ? 'Đang viết... nắm tay để hoàn thành chữ'
              : 'Viết chữ cái/số trong khung này'}
          </span>
          {lastChar && !isDrawing && (
            <span className={styles.recognized}>
              Nhận dạng: {lastChar === ' ' ? 'Dấu cách' : lastChar}
            </span>
          )}
          {rejected && !isDrawing && (
            <span className={styles.rejectedText}>Không nhận dạng được — thử viết rõ hơn</span>
          )}
        </div>
      </div>
    );
  },
);
