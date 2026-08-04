import { TOUCHLESS_CONFIG } from '../config/touchless-config';
import type { HandTrackingResult, NormalizedLandmark } from './vision-types';

export type HandLandmarkerStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface HandLandmarkerController {
  initialize(): Promise<void>;
  detect(video: HTMLVideoElement, timestampMs: number): HandTrackingResult | null;
  getStatus(): HandLandmarkerStatus;
  getError(): string | undefined;
  close(): void;
}

interface MediaPipeLandmarker {
  detectForVideo(
    video: HTMLVideoElement,
    timestamp: number,
  ): {
    landmarks: { x: number; y: number; z: number }[][];
    handedness: { categoryName?: string; score?: number }[][];
  };
  close(): void;
}

function mapLandmarks(landmarks: { x: number; y: number; z: number }[]): NormalizedLandmark[] {
  return landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }));
}

function parseResult(
  result: ReturnType<MediaPipeLandmarker['detectForVideo']>,
  inferenceLatencyMs: number,
): HandTrackingResult | null {
  if (!result.landmarks.length) {
    return null;
  }

  const handedness =
    result.handedness[0]?.[0]?.categoryName === 'Left'
      ? 'Left'
      : result.handedness[0]?.[0]?.categoryName === 'Right'
        ? 'Right'
        : 'Unknown';

  const confidence = result.handedness[0]?.[0]?.score ?? 0;

  return {
    landmarks: mapLandmarks(result.landmarks[0]),
    handedness,
    confidence,
    inferenceLatencyMs,
  };
}

export function createHandLandmarkerController(): HandLandmarkerController {
  let landmarker: MediaPipeLandmarker | null = null;
  let status: HandLandmarkerStatus = 'idle';
  let errorMessage: string | undefined;

  async function createWithDelegate(delegate: 'GPU' | 'CPU'): Promise<MediaPipeLandmarker> {
    const mp = await import('@mediapipe/tasks-vision');
    const vision = await mp.FilesetResolver.forVisionTasks(TOUCHLESS_CONFIG.wasmPath);
    return (await mp.HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: TOUCHLESS_CONFIG.modelPath,
        delegate,
      },
      runningMode: 'VIDEO',
      numHands: TOUCHLESS_CONFIG.maxHands,
      minHandDetectionConfidence: TOUCHLESS_CONFIG.minHandDetectionConfidence,
      minHandPresenceConfidence: TOUCHLESS_CONFIG.minHandPresenceConfidence,
      minTrackingConfidence: TOUCHLESS_CONFIG.minTrackingConfidence,
    })) as MediaPipeLandmarker;
  }

  async function initialize(): Promise<void> {
    if (status === 'ready' || status === 'loading') {
      return;
    }

    status = 'loading';

    try {
      const modelResponse = await fetch(TOUCHLESS_CONFIG.modelPath);
      if (!modelResponse.ok) {
        throw new Error(
          'Model MediaPipe chưa được tải. Hãy đặt file hand_landmarker.task vào public/models/.',
        );
      }

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isIOS) {
        landmarker = await createWithDelegate('CPU');
      } else {
        try {
          landmarker = await createWithDelegate('GPU');
        } catch {
          landmarker = await createWithDelegate('CPU');
        }
      }

      status = 'ready';
      errorMessage = undefined;
    } catch (error) {
      status = 'error';
      errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể tải model MediaPipe Hand Landmarker.';
      throw new Error(errorMessage);
    }
  }

  function detect(video: HTMLVideoElement, timestampMs: number): HandTrackingResult | null {
    if (!landmarker || status !== 'ready') {
      return null;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    const start = performance.now();
    const result = landmarker.detectForVideo(video, timestampMs);
    const inferenceLatencyMs = performance.now() - start;

    return parseResult(result, inferenceLatencyMs);
  }

  function close(): void {
    landmarker?.close();
    landmarker = null;
    status = 'idle';
  }

  return {
    initialize,
    detect,
    getStatus: () => status,
    getError: () => errorMessage,
    close,
  };
}
