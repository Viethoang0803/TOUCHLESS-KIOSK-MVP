import { useCallback, useEffect, useRef, useState } from 'react';
import { getProductById } from './data/products';
import type { AppScreen, KioskState } from './kiosk/kiosk-state';
import { SessionManager } from './kiosk/session-manager';
import { interactionLogger } from './kiosk/logger';
import { useHandTracking } from './hooks/useHandTracking';
import { useTouchlessInteraction } from './hooks/useTouchlessInteraction';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { VirtualCursor } from './components/VirtualCursor';
import { CameraView } from './components/CameraView';
import { DebugPanel, loadDebugSettings, type DebugSettings } from './components/DebugPanel';
import { IdleScreen } from './screens/IdleScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { ContactScreen } from './screens/ContactScreen';
import { TargetTestScreen } from './screens/TargetTestScreen';
import { MobileStartGate } from './components/MobileStartGate';
import { playSelectionSound, flashTarget } from './utils/feedback';
import styles from './App.module.css';

function needsTapToStart(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function getInitialScreen(): AppScreen {
  if (window.location.pathname === '/test') return 'test';
  return 'idle';
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [kioskState, setKioskState] = useState<KioskState>('IDLE');
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugSettings, setDebugSettings] = useState<DebugSettings>(loadDebugSettings);
  const [cameraError, setCameraError] = useState<string | undefined>();
  const [started, setStarted] = useState(!needsTapToStart());

  const sessionRef = useRef<SessionManager | null>(null);
  const testHandlersRef = useRef<{
    select: (num: number) => void;
    restart: () => void;
    download: () => void;
  } | null>(null);
  const screenRef = useRef(screen);
  const selectedProductIdRef = useRef(selectedProductId);
  screenRef.current = screen;
  selectedProductIdRef.current = selectedProductId;

  const navigate = useCallback((next: AppScreen) => {
    setScreen(next);
    interactionLogger.log('screen_changed', { screen: next });
  }, []);

  const resetToIdle = useCallback(() => {
    setScreen('idle');
    setSelectedProductId(null);
    interactionLogger.log('screen_changed', { screen: 'idle' });
    interactionLogger.log('session_ended');
    interactionLogger.newSession();
  }, []);

  useEffect(() => {
    sessionRef.current = new SessionManager({
      onStateChange: setKioskState,
      onActivate: () => navigate('catalog'),
      onResetToIdle: resetToIdle,
    });
    interactionLogger.newSession();
  }, [navigate, resetToIdle]);

  const {
    cameraState,
    trackingResult,
    metrics,
    modelError,
    retryCamera,
    getVideoElement,
  } = useHandTracking(started);

  const resolveTargetAction = useCallback(
    (targetId: string): (() => void) | null => {
      if (targetId.startsWith('open-')) {
        const productId = targetId.slice(5);
        if (getProductById(productId)) {
          return () => {
            setSelectedProductId(productId);
            navigate('product');
          };
        }
      }

      if (targetId.startsWith('test-cell-')) {
        const num = parseInt(targetId.replace('test-cell-', ''), 10);
        if (!Number.isNaN(num)) {
          return () => testHandlersRef.current?.select(num);
        }
        return null;
      }

      if (targetId === 'test-restart') {
        return () => testHandlersRef.current?.restart();
      }
      if (targetId === 'test-download') {
        return () => testHandlersRef.current?.download();
      }

      const routes: Record<string, () => void> = {
        'catalog-home': resetToIdle,
        'product-back': () => navigate('catalog'),
        'product-contact': () => navigate('contact'),
        'product-home': resetToIdle,
        'contact-back': () =>
          selectedProductIdRef.current ? navigate('product') : navigate('catalog'),
        'contact-home': resetToIdle,
        'test-exit': () => {
          window.history.pushState({}, '', '/');
          navigate('idle');
        },
        'test-exit-idle': () => {
          window.history.pushState({}, '', '/');
          navigate('idle');
        },
      };

      return routes[targetId] ?? null;
    },
    [navigate, resetToIdle],
  );

  const touchActivityRef = useRef<(() => void) | null>(null);

  const handleTargetSelect = useCallback(
    (targetId: string) => {
      playSelectionSound();
      flashTarget(targetId);
      touchActivityRef.current?.();

      const action = resolveTargetAction(targetId);
      if (action) action();
    },
    [resolveTargetAction],
  );

  const { snapshot, resetEngine, updateEngineConfig, engineRef } =
    useTouchlessInteraction(trackingResult, handleTargetSelect);

  const { touchActivity } = useInactivityTimer(() => {
    sessionRef.current?.resetToIdle();
    resetEngine();
  }, kioskState === 'ACTIVE' || kioskState === 'HAND_LOST');

  touchActivityRef.current = touchActivity;

  useEffect(() => {
    updateEngineConfig({
      smoothingAlpha: debugSettings.smoothingAlpha,
      dwellDurationMs: debugSettings.dwellDurationMs,
      activeRegion: debugSettings.activeRegion,
    });
  }, [debugSettings, updateEngineConfig]);

  useEffect(() => {
    const handDetected = trackingResult !== null;
    sessionRef.current?.update(
      handDetected,
      snapshot.gesture === 'POINTING',
      performance.now(),
    );

    if (handDetected || snapshot.gesture === 'POINTING') {
      touchActivity();
    }
  }, [trackingResult, snapshot.gesture, touchActivity]);

  useEffect(() => {
    if (cameraState.status === 'error') {
      setCameraError(cameraState.errorMessage);
    } else {
      setCameraError(undefined);
    }
  }, [cameraState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') setDebugOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : undefined;

  const renderScreen = () => {
    switch (screen) {
      case 'idle':
        return (
          <IdleScreen
            cameraStatus={cameraState.status}
            handDetected={metrics.handDetected}
            isPointing={snapshot.gesture === 'POINTING'}
            onToggleDebug={() => setDebugOpen(true)}
          />
        );
      case 'catalog':
        return (
          <CatalogScreen
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              navigate('product');
            }}
            onGoHome={resetToIdle}
          />
        );
      case 'product':
        if (!selectedProduct) {
          navigate('catalog');
          return null;
        }
        return (
          <ProductDetailScreen
            product={selectedProduct}
            onBack={() => navigate('catalog')}
            onContact={() => navigate('contact')}
            onGoHome={resetToIdle}
          />
        );
      case 'contact':
        return (
          <ContactScreen
            onBack={() =>
              selectedProductId ? navigate('product') : navigate('catalog')
            }
            onGoHome={resetToIdle}
          />
        );
      case 'test':
        return (
          <TargetTestScreen
            onRegisterHandlers={(handlers) => {
              testHandlersRef.current = handlers;
            }}
            onExit={() => {
              window.history.pushState({}, '', '/');
              navigate('idle');
            }}
            getDwellCancelled={() => engineRef.current?.getDwellCancelledCount() ?? 0}
            getMetrics={() => ({
              fps: metrics.fps,
              inferenceMs: metrics.inferenceLatencyMs,
            })}
            onTrackingLost={() => interactionLogger.log('hand_lost')}
            handDetected={metrics.handDetected}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.app}>
      {!started && <MobileStartGate onStart={() => setStarted(true)} />}

      {(modelError || cameraError) && (
        <div className={styles.errorBanner}>
          <p>{modelError ?? cameraError}</p>
          {cameraError && (
            <button type="button" onClick={() => void retryCamera()}>
              Thử lại camera
            </button>
          )}
        </div>
      )}

      {renderScreen()}

      <VirtualCursor
        x={snapshot.cursorX}
        y={snapshot.cursorY}
        visible={snapshot.visible && screen !== 'idle'}
        state={snapshot.cursorState}
        dwellProgress={snapshot.dwellProgress}
      />

      <CameraView
        videoElement={getVideoElement()}
        trackingResult={trackingResult}
        showOverlay={debugSettings.showLandmarkOverlay}
        visible={debugOpen && debugSettings.showCameraPreview}
      />

      <DebugPanel
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
        snapshot={snapshot}
        metrics={metrics}
        onSettingsChange={setDebugSettings}
        onResetInteraction={() => {
          resetEngine();
          sessionRef.current?.resetToIdle();
        }}
        onOpenTest={() => {
          window.history.pushState({}, '', '/test');
          navigate('test');
        }}
      />
    </div>
  );
}
