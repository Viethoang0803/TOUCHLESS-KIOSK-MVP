import type { CameraState } from './vision-types';

const PREFERRED_WIDTH = 1280;
const PREFERRED_HEIGHT = 720;

export interface CameraController {
  start(): Promise<MediaStream>;
  stop(): void;
  getState(): CameraState;
  getVideoElement(): HTMLVideoElement | null;
  onStateChange(callback: (state: CameraState) => void): () => void;
}

export function createCameraController(): CameraController {
  let state: CameraState = { status: 'idle', stream: null };
  let videoElement: HTMLVideoElement | null = null;
  const listeners = new Set<(state: CameraState) => void>();

  function notify(): void {
    listeners.forEach((cb) => cb({ ...state }));
  }

  function setState(partial: Partial<CameraState>): void {
    state = { ...state, ...partial };
    notify();
  }

  async function start(): Promise<MediaStream> {
    if (state.status === 'active' && state.stream) {
      return state.stream;
    }

    setState({ status: 'loading', errorMessage: undefined });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: PREFERRED_WIDTH },
          height: { ideal: PREFERRED_HEIGHT },
          facingMode: 'user',
        },
        audio: false,
      });

      if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.style.transform = 'scaleX(-1)';
      }

      videoElement.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        if (!videoElement) {
          reject(new Error('Video element not initialized'));
          return;
        }

        const onReady = (): void => {
          videoElement?.removeEventListener('loadeddata', onReady);
          resolve();
        };

        videoElement.addEventListener('loadeddata', onReady);
        void videoElement.play().catch(reject);
      });

      setState({ status: 'active', stream, errorMessage: undefined });
      return stream;
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Quyền truy cập camera bị từ chối. Vui lòng cho phép camera trong trình duyệt.'
          : error instanceof Error
            ? error.message
            : 'Không thể khởi động camera.';

      setState({ status: 'error', stream: null, errorMessage: message });
      throw new Error(message);
    }
  }

  function stop(): void {
    state.stream?.getTracks().forEach((track) => track.stop());
    if (videoElement) {
      videoElement.srcObject = null;
    }
    setState({ status: 'idle', stream: null, errorMessage: undefined });
  }

  return {
    start,
    stop,
    getState: () => ({ ...state }),
    getVideoElement: () => videoElement,
    onStateChange: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}
