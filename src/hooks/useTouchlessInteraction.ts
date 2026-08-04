import { useEffect, useRef, useState } from 'react';
import { InteractionEngine, type InteractionSnapshot } from '../interaction/interaction-engine';
import type { HandTrackingResult } from '../vision/vision-types';
import { interactionLogger } from '../kiosk/logger';
import { applyEdgeScroll } from '../interaction/edge-scroll';
import { getDeviceInteractionOverrides, getMobileEdgeScrollConfig } from '../config/device-config';
import type { VirtualCursorHandle } from '../components/VirtualCursor';

const EMPTY_SNAPSHOT: InteractionSnapshot = {
  visible: false,
  cursorX: 0,
  cursorY: 0,
  rawX: 0,
  rawY: 0,
  gesture: 'NONE',
  rawPointing: false,
  hoverTargetId: null,
  dwellProgress: 0,
  cursorState: 'hidden',
};

function snapshotChanged(a: InteractionSnapshot, b: InteractionSnapshot): boolean {
  return (
    a.visible !== b.visible ||
    a.gesture !== b.gesture ||
    a.hoverTargetId !== b.hoverTargetId ||
    a.cursorState !== b.cursorState ||
    Math.abs(a.dwellProgress - b.dwellProgress) >= 2
  );
}

export function useTouchlessInteraction(
  trackingRef: React.RefObject<HandTrackingResult | null>,
  onSelect: (targetId: string) => void,
  cursorRef: React.RefObject<VirtualCursorHandle | null>,
  cursorEnabledRef: React.RefObject<boolean>,
) {
  const engineRef = useRef<InteractionEngine | null>(null);
  const [snapshot, setSnapshot] = useState<InteractionSnapshot>(EMPTY_SNAPSHOT);
  const snapshotRef = useRef<InteractionSnapshot>(EMPTY_SNAPSHOT);
  const onSelectRef = useRef(onSelect);
  const prevGestureRef = useRef<string>('NONE');
  const prevHoverRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const overrides = getDeviceInteractionOverrides();
    const { inferenceEveryNFrames: _skip, edgeScroll: _edge, ...engineOverrides } = overrides;
    const engine = new InteractionEngine(engineOverrides);
    engine.setOnSelect((targetId) => {
      interactionLogger.log('target_selected', { targetId });
      onSelectRef.current(targetId);
    });
    engineRef.current = engine;

    return () => {
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const engine = engineRef.current;
      if (!engine) return;

      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const result = engine.processFrame(
        trackingRef.current?.landmarks ?? null,
        viewport,
        performance.now(),
      );

      if (result.visible && result.gesture === 'POINTING') {
        applyEdgeScroll(result.cursorY, viewport.height, getMobileEdgeScrollConfig());
      }

      cursorRef.current?.update({
        x: result.cursorX,
        y: result.cursorY,
        visible: result.visible && cursorEnabledRef.current,
        state: result.cursorState,
        dwellProgress: result.dwellProgress,
      });

      if (result.gesture !== prevGestureRef.current) {
        if (result.gesture === 'POINTING') {
          interactionLogger.log('pointing_started');
        } else if (prevGestureRef.current === 'POINTING') {
          interactionLogger.log('pointing_ended');
        }
        prevGestureRef.current = result.gesture;
      }

      if (result.hoverTargetId !== prevHoverRef.current) {
        if (result.hoverTargetId) {
          interactionLogger.log('hover_started', { targetId: result.hoverTargetId });
        } else if (prevHoverRef.current) {
          interactionLogger.log('hover_ended', { targetId: prevHoverRef.current });
        }
        prevHoverRef.current = result.hoverTargetId;
      }

      if (snapshotChanged(snapshotRef.current, result)) {
        snapshotRef.current = result;
        setSnapshot(result);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [trackingRef, cursorRef, cursorEnabledRef]);

  const resetEngine = () => engineRef.current?.reset();

  const updateEngineConfig = (config: Parameters<InteractionEngine['updateConfig']>[0]) => {
    engineRef.current?.updateConfig(config);
  };

  return { snapshot, resetEngine, updateEngineConfig, engineRef };
}
