import { StatusIndicator } from '../components/StatusIndicator';
import styles from './IdleScreen.module.css';

interface IdleScreenProps {
  cameraStatus: string;
  handDetected: boolean;
  isPointing: boolean;
  onToggleDebug: () => void;
}

export function IdleScreen({
  cameraStatus,
  handDetected,
  isPointing,
  onToggleDebug,
}: IdleScreenProps) {
  const cameraOk = cameraStatus === 'active';
  const handStatus = handDetected ? (isPointing ? 'ok' : 'warn') : 'idle';

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <h1 className={styles.title}>Touchless Kiosk</h1>
        <p className={styles.subtitle}>
          Giơ bàn tay và duỗi ngón trỏ để bắt đầu
        </p>

        <div className={styles.animation} aria-hidden="true">
          <div className={styles.handIcon}>👆</div>
          <div className={styles.pulseRing} />
        </div>

        <div className={styles.statusGroup}>
          <StatusIndicator
            label="Camera"
            status={cameraOk ? 'ok' : cameraStatus === 'error' ? 'error' : 'warn'}
            detail={cameraStatus}
          />
          <StatusIndicator
            label="Bàn tay"
            status={handStatus}
            detail={handDetected ? (isPointing ? 'Đang chỉ' : 'Phát hiện') : 'Chưa phát hiện'}
          />
        </div>
      </div>

      <button type="button" className={styles.debugToggle} onClick={onToggleDebug}>
        Debug (D)
      </button>
    </div>
  );
}
