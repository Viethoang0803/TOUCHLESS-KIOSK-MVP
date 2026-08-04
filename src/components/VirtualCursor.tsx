import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import styles from './VirtualCursor.module.css';

export type CursorVisualState = 'hidden' | 'normal' | 'hover' | 'dwell';

export interface CursorUpdate {
  x: number;
  y: number;
  visible: boolean;
  state: CursorVisualState;
  dwellProgress: number;
}

export interface VirtualCursorHandle {
  update: (data: CursorUpdate) => void;
}

export const VirtualCursor = forwardRef<VirtualCursorHandle>(function VirtualCursor(_, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const lastStateRef = useRef<CursorVisualState>('hidden');

  useImperativeHandle(ref, () => ({
    update({ x, y, visible, state, dwellProgress }) {
      const el = rootRef.current;
      if (!el) return;

      if (!visible) {
        el.style.display = 'none';
        return;
      }

      el.style.display = 'flex';
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (state !== lastStateRef.current) {
        el.classList.remove(styles.normal, styles.hover, styles.dwell);
        el.classList.add(
          state === 'dwell' ? styles.dwell : state === 'hover' ? styles.hover : styles.normal,
        );
        lastStateRef.current = state;
      }

      const ring = ringRef.current;
      if (ring) {
        const progress = state === 'dwell' ? dwellProgress : 0;
        if (progress <= 0) {
          ring.style.opacity = '0';
        } else {
          ring.style.opacity = '1';
          const radius = 22;
          const circumference = 2 * Math.PI * radius;
          ring.setAttribute('stroke-dashoffset', String(circumference - (progress / 100) * circumference));
        }
      }
    },
  }));

  return (
    <div ref={rootRef} className={`${styles.cursor} ${styles.normal}`} aria-hidden="true">
      <svg className={styles.ring} viewBox="0 0 52 52" aria-hidden="true">
        <circle className={styles.track} cx="26" cy="26" r="22" fill="none" strokeWidth="3" />
        <circle
          ref={ringRef}
          className={styles.progress}
          cx="26"
          cy="26"
          r="22"
          fill="none"
          strokeWidth="3"
          strokeDasharray={2 * Math.PI * 22}
          strokeDashoffset={2 * Math.PI * 22}
          transform="rotate(-90 26 26)"
        />
      </svg>
    </div>
  );
});
