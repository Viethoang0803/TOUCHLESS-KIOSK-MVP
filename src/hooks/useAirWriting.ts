import { useEffect, useRef, useState } from 'react';
import type { HandTrackingResult } from '../vision/vision-types';
import { AirWritingEngine } from '../air-writing/air-writing-engine';
import type { Point2D } from '../air-writing/point-2d';
import type { RecognitionResult } from '../air-writing/unistroke-recognizer';

export interface AirWritingState {
  isDrawing: boolean;
  strokePoints: Point2D[];
  lastChar: string | null;
  rejected: boolean;
}

export function useAirWriting(
  trackingRef: React.RefObject<HandTrackingResult | null>,
  enabled: boolean,
  padRef: React.RefObject<HTMLElement | null>,
  onCharacter: (char: string) => void,
) {
  const engineRef = useRef<AirWritingEngine | null>(null);
  const [state, setState] = useState<AirWritingState>({
    isDrawing: false,
    strokePoints: [],
    lastChar: null,
    rejected: false,
  });

  if (!engineRef.current) {
    engineRef.current = new AirWritingEngine();
  }

  useEffect(() => {
    if (!enabled) {
      engineRef.current?.reset();
      setState({
        isDrawing: false,
        strokePoints: [],
        lastChar: null,
        rejected: false,
      });
      return;
    }

    let raf = 0;

    const tick = () => {
      const engine = engineRef.current;
      const pad = padRef.current;
      if (!engine || !pad) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const rect = pad.getBoundingClientRect();
      engine.setWritingRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });

      const result = engine.processFrame(
        trackingRef.current?.landmarks ?? null,
        { width: window.innerWidth, height: window.innerHeight },
      );

      if (result.lastRecognition) {
        onCharacter(result.lastRecognition.name);
      }

      setState({
        isDrawing: result.isDrawing,
        strokePoints: result.strokePoints,
        lastChar: result.lastRecognition?.name ?? null,
        rejected: result.rejected,
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, trackingRef, padRef, onCharacter]);

  const clearPad = () => engineRef.current?.clearStroke();

  return { state, clearPad };
}

export type { RecognitionResult };
