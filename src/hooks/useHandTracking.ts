import { useCallback, useEffect, useRef, useState } from 'react';
import { createCameraController } from '../vision/camera';
import { createHandLandmarkerController } from '../vision/hand-landmarker';
import type { CameraState, HandTrackingResult, VisionMetrics } from '../vision/vision-types';
import { interactionLogger } from '../kiosk/logger';
import { getDeviceInteractionOverrides } from '../config/device-config';

const INITIAL_METRICS: VisionMetrics = {
  fps: 0,
  inferenceLatencyMs: 0,
  handDetected: false,
  confidence: 0,
};

export function useHandTracking(enabled: boolean) {
  const [cameraState, setCameraState] = useState<CameraState>({
    status: 'idle',
    stream: null,
  });
  const [metrics, setMetrics] = useState<VisionMetrics>(INITIAL_METRICS);
  const [modelError, setModelError] = useState<string | undefined>();
  const [modelStatus, setModelStatus] = useState('idle');

  const trackingRef = useRef<HandTrackingResult | null>(null);
  const cameraRef = useRef(createCameraController());
  const landmarkerRef = useRef(createHandLandmarkerController());
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const frameCountRef = useRef(0);
  const inferenceFrameRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const handWasDetectedRef = useRef(false);

  const startCamera = useCallback(async () => {
    try {
      await cameraRef.current.start();
      interactionLogger.log('camera_started');
    } catch {
      interactionLogger.log('camera_error');
    }
  }, []);

  const retryCamera = useCallback(async () => {
    cameraRef.current.stop();
    await startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    async function init() {
      try {
        await landmarkerRef.current.initialize();
        if (mounted) {
          setModelStatus(landmarkerRef.current.getStatus());
          setModelError(undefined);
        }
      } catch (error) {
        if (mounted) {
          setModelError(
            error instanceof Error ? error.message : 'Lỗi tải model',
          );
          setModelStatus('error');
        }
      }

      await startCamera();
    }

    void init();

    const unsubCamera = cameraRef.current.onStateChange((state) => {
      if (mounted) setCameraState({ ...state });
    });

    return () => {
      mounted = false;
      unsubCamera();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      cameraRef.current.stop();
      landmarkerRef.current.close();
    };
  }, [enabled, startCamera]);

  useEffect(() => {
    if (cameraState.status !== 'active' || modelStatus !== 'ready') {
      return;
    }

    const { inferenceEveryNFrames = 1 } = getDeviceInteractionOverrides();
    runningRef.current = true;

    const loop = (timestamp: number) => {
      if (!runningRef.current) return;

      const video = cameraRef.current.getVideoElement();
      if (video) {
        inferenceFrameRef.current += 1;
        let result: HandTrackingResult | null = trackingRef.current;

        if (inferenceFrameRef.current % inferenceEveryNFrames === 0) {
          result = landmarkerRef.current.detect(video, timestamp);
          trackingRef.current = result;
        }

        if (result) {
          if (!handWasDetectedRef.current) {
            interactionLogger.log('hand_detected', { confidence: result.confidence });
            handWasDetectedRef.current = true;
          }
        } else if (handWasDetectedRef.current) {
          interactionLogger.log('hand_lost');
          handWasDetectedRef.current = false;
          trackingRef.current = null;
        }

        frameCountRef.current += 1;
        const now = performance.now();
        if (now - lastFpsTimeRef.current >= 1000) {
          const fps = frameCountRef.current;
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;

          setMetrics({
            fps,
            inferenceLatencyMs: result?.inferenceLatencyMs ?? 0,
            handDetected: result !== null,
            confidence: result?.confidence ?? 0,
          });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [cameraState.status, modelStatus]);

  return {
    cameraState,
    trackingRef,
    metrics,
    modelError,
    modelStatus,
    retryCamera,
    getVideoElement: () => cameraRef.current.getVideoElement(),
    getTrackingResult: () => trackingRef.current,
  };
}
