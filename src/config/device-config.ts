export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function getDeviceInteractionOverrides() {
  if (!isMobileDevice()) {
    return {};
  }

  return {
    smoothingAlpha: 0.38,
    cursorDeadZonePx: 4,
    dwellMovementTolerancePx: 36,
    activeRegion: {
      minX: 0.08,
      maxX: 0.92,
      minY: 0.08,
      maxY: 0.92,
    },
    inferenceEveryNFrames: 2,
  };
}
