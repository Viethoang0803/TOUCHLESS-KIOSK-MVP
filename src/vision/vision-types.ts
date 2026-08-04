export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingResult {
  landmarks: NormalizedLandmark[];
  handedness: 'Left' | 'Right' | 'Unknown';
  confidence: number;
  inferenceLatencyMs: number;
}

export type CameraStatus = 'idle' | 'loading' | 'active' | 'error';

export interface CameraState {
  status: CameraStatus;
  errorMessage?: string;
  stream: MediaStream | null;
}

export interface VisionMetrics {
  fps: number;
  inferenceLatencyMs: number;
  handDetected: boolean;
  confidence: number;
}
