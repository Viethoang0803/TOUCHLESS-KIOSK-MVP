import type { NormalizedLandmark } from '../vision/vision-types';
import { distance2D } from '../vision/landmark-utils';

export interface PointDetectorConfig {
  /** Min distance tip-to-pip for extended finger */
  extendedRatio: number;
  /** Max distance tip-to-pip for folded finger (relative to hand scale) */
  foldedRatio: number;
}

const DEFAULT_CONFIG: PointDetectorConfig = {
  extendedRatio: 0.18,
  foldedRatio: 0.12,
};

function handScale(landmarks: NormalizedLandmark[]): number {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  if (!wrist || !middleMcp) return 0.1;
  return Math.max(distance2D(wrist, middleMcp), 0.05);
}

function isFingerExtended(
  landmarks: NormalizedLandmark[],
  tipIdx: number,
  pipIdx: number,
  scale: number,
  threshold: number,
): boolean {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[pipIdx - 1];
  if (!tip || !pip || !mcp) return false;

  const tipToPip = distance2D(tip, pip);
  const pipToMcp = distance2D(pip, mcp);
  return tipToPip / scale > threshold || tipToPip > pipToMcp * 0.8;
}

function isFingerFolded(
  landmarks: NormalizedLandmark[],
  tipIdx: number,
  pipIdx: number,
  scale: number,
  threshold: number,
): boolean {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const wrist = landmarks[0];
  if (!tip || !pip || !wrist) return false;

  const tipToPip = distance2D(tip, pip);
  const tipToWrist = distance2D(tip, wrist);
  const pipToWrist = distance2D(pip, wrist);

  return tipToPip / scale < threshold || tipToWrist < pipToWrist * 1.1;
}

/** Detect pointing gesture: index extended, middle/ring/pinky folded */
export function detectPointing(
  landmarks: NormalizedLandmark[],
  config: PointDetectorConfig = DEFAULT_CONFIG,
): boolean {
  if (landmarks.length < 21) return false;

  const scale = handScale(landmarks);

  const indexExtended = isFingerExtended(landmarks, 8, 6, scale, config.extendedRatio);
  const middleFolded = isFingerFolded(landmarks, 12, 10, scale, config.foldedRatio);
  const ringFolded = isFingerFolded(landmarks, 16, 14, scale, config.foldedRatio);
  const pinkyFolded = isFingerFolded(landmarks, 20, 18, scale, config.foldedRatio);

  return indexExtended && middleFolded && ringFolded && pinkyFolded;
}
