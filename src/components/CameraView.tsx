import { useEffect, useRef } from 'react';
import { drawHandOverlay } from '../vision/landmark-utils';
import type { HandTrackingResult } from '../vision/vision-types';
import styles from './CameraView.module.css';

interface CameraViewProps {
  videoElement: HTMLVideoElement | null;
  trackingResult: HandTrackingResult | null;
  showOverlay: boolean;
  visible: boolean;
}

export function CameraView({
  videoElement,
  trackingResult,
  showOverlay,
  visible,
}: CameraViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const videoEl = videoRef.current;
    if (!container || !videoEl || !videoElement) return;

    if (videoElement.srcObject && videoEl !== videoElement) {
      videoEl.srcObject = videoElement.srcObject;
      void videoEl.play();
    }
  }, [videoElement]);

  useEffect(() => {
    if (!showOverlay || !trackingResult || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    drawHandOverlay(ctx, trackingResult.landmarks, canvas.width, canvas.height);
  }, [showOverlay, trackingResult]);

  if (!visible) return null;

  return (
    <div ref={containerRef} className={styles.container}>
      <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
      {showOverlay && <canvas ref={canvasRef} className={styles.overlay} />}
    </div>
  );
}
