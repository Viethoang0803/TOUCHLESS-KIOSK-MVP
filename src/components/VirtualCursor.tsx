import styles from './VirtualCursor.module.css';
import { DwellProgress } from './DwellProgress';

export type CursorVisualState = 'hidden' | 'normal' | 'hover' | 'dwell';

interface VirtualCursorProps {
  x: number;
  y: number;
  visible: boolean;
  state: CursorVisualState;
  dwellProgress: number;
}

export function VirtualCursor({ x, y, visible, state, dwellProgress }: VirtualCursorProps) {
  if (!visible) return null;

  const stateClass =
    state === 'dwell'
      ? styles.dwell
      : state === 'hover'
        ? styles.hover
        : styles.normal;

  return (
    <div
      className={`${styles.cursor} ${stateClass}`}
      style={{ left: x, top: y }}
      aria-hidden="true"
    >
      <DwellProgress progress={state === 'dwell' ? dwellProgress : 0} />
    </div>
  );
}
