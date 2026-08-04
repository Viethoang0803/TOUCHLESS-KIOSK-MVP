import { TouchlessButton } from './TouchlessButton';
import styles from './ScrollAssist.module.css';

interface ScrollAssistProps {
  visible: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export function ScrollAssist({ visible, onScrollUp, onScrollDown }: ScrollAssistProps) {
  if (!visible) return null;

  return (
    <div className={styles.rail} aria-label="Cuộn trang">
      <TouchlessButton
        targetId="scroll-up"
        onSelect={onScrollUp}
        variant="secondary"
        size="md"
        className={styles.btn}
      >
        ▲ Lên
      </TouchlessButton>
      <TouchlessButton
        targetId="scroll-down"
        onSelect={onScrollDown}
        variant="secondary"
        size="md"
        className={styles.btn}
      >
        ▼ Xuống
      </TouchlessButton>
    </div>
  );
}
