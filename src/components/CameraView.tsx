import { useEffect, useRef } from 'react';
import { drawHandOverlay } from '../vision/landmark-utils';
import type { HandTrackingResult } from '../vision/vision-types';
import styles from './CameraView.module.css';

interface CameraViewProps {
  videoElement: HTMLVideoElement | null;
  getTrackingResult: () => HandTrackingResult | null;
  showOverlay: boolean;
  visible: boolean;
}

export function CameraView({
  videoElement,
  getTrackingResult,
  showOverlay,
  visible,
}: CameraViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoElement) return;

    if (videoElement.srcObject && videoEl !== videoElement) {
      videoEl.srcObject = videoElement.srcObject;
      void videoEl.play();
    }
  }, [videoElement]);

  useEffect(() => {
    if (!showOverlay || !visible) return;

    let rafId: number;

    const draw = () => {
      const trackingResult = getTrackingResult();
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas?.getContext('2d');

      if (trackingResult && canvas && video && ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        drawHandOverlay(ctx, trackingResult.landmarks, canvas.width, canvas.height);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [showOverlay, visible, getTrackingResult]);

  if (!visible) return null;

  return (
    <div ref={containerRef} className={styles.container}>
      <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
      {showOverlay && <canvas ref={canvasRef} className={styles.overlay} />}
    </div>
  );
}
