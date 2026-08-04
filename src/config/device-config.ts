import type { YMappingProfile } from '../interaction/y-mapping';
import { MOBILE_Y_MAPPING } from '../interaction/y-mapping';

export function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export interface MobileInteractionSettings {
  smoothingAlpha: number;
  cursorDeadZonePx: number;
  dwellMovementTolerancePx: number;
  activeRegion: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  yMapping: YMappingProfile;
  inferenceEveryNFrames: number;
  edgeScroll: {
    topEdgeRatio: number;
    bottomEdgeRatio: number;
    maxSpeedPx: number;
  };
}

export function getDeviceInteractionOverrides(): Partial<MobileInteractionSettings> {
  if (!isMobileDevice()) {
    return {};
  }

  return {
    smoothingAlpha: 0.2,
    cursorDeadZonePx: 5,
    dwellMovementTolerancePx: 38,
    activeRegion: {
      minX: 0.05,
      maxX: 0.95,
      minY: 0.2,
      maxY: 0.95,
    },
    yMapping: MOBILE_Y_MAPPING,
    inferenceEveryNFrames: 1,
    // Vùng cuộn lên rộng hơn cuộn xuống — cân bằng tư thế tay
    edgeScroll: {
      topEdgeRatio: 0.28,
      bottomEdgeRatio: 0.16,
      maxSpeedPx: 14,
    },
  };
}

export function getMobileEdgeScrollConfig() {
  const overrides = getDeviceInteractionOverrides();
  return (
    overrides.edgeScroll ?? {
      topEdgeRatio: 0.12,
      bottomEdgeRatio: 0.12,
      maxSpeedPx: 12,
    }
  );
}

export function getMobileYMapping(): YMappingProfile | undefined {
  return getDeviceInteractionOverrides().yMapping;
}
