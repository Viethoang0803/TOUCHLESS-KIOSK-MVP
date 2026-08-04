export type GestureState = 'NONE' | 'POINTING';

export interface GestureDetectionResult {
  rawPointing: boolean;
  stableGesture: GestureState;
  enterFrameCount: number;
  exitFrameCount: number;
}
