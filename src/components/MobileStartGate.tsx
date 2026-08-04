import styles from './MobileStartGate.module.css';

interface MobileStartGateProps {
  onStart: () => void;
}

export function MobileStartGate({ onStart }: MobileStartGateProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h1>Touchless Kiosk</h1>
        <p>Nhấn nút bên dưới để bật camera và bắt đầu.</p>
        <p className={styles.note}>
          iPhone yêu cầu thao tác chạm trước khi mở camera.
        </p>
        <button type="button" className={styles.startBtn} onClick={onStart}>
          Bắt đầu
        </button>
      </div>
    </div>
  );
}
