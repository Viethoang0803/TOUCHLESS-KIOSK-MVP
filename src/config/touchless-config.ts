export const TOUCHLESS_CONFIG = {
  maxHands: 1,
  minHandDetectionConfidence: 0.6,
  minHandPresenceConfidence: 0.6,
  minTrackingConfidence: 0.6,

  smoothingAlpha: 0.25,
  cursorDeadZonePx: 3,

  dwellDurationMs: 800,
  dwellMovementTolerancePx: 30,
  selectionCooldownMs: 600,

  gestureEnterFrames: 4,
  gestureExitFrames: 4,

  handLostGracePeriodMs: 800,
  inactivityTimeoutMs: 30_000,
  idleActivationMs: 500,

  activeRegion: {
    minX: 0.15,
    maxX: 0.85,
    minY: 0.15,
    maxY: 0.8,
  },

  modelPath: '/models/hand_landmarker.task',
  wasmPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm',
} as const;

export type TouchlessConfig = typeof TOUCHLESS_CONFIG;
