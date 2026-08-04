import styles from './StatusIndicator.module.css';

interface StatusIndicatorProps {
  label: string;
  status: 'ok' | 'warn' | 'error' | 'idle';
  detail?: string;
}

export function StatusIndicator({ label, status, detail }: StatusIndicatorProps) {
  return (
    <div className={styles.indicator}>
      <span className={`${styles.dot} ${styles[status]}`} />
      <div className={styles.text}>
        <span className={styles.label}>{label}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </div>
    </div>
  );
}
