import styles from './DwellProgress.module.css';

interface DwellProgressProps {
  progress: number;
}

export function DwellProgress({ progress }: DwellProgressProps) {
  if (progress <= 0) return null;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className={styles.ring} viewBox="0 0 52 52" aria-hidden="true">
      <circle
        className={styles.track}
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        strokeWidth="3"
      />
      <circle
        className={styles.progress}
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 26 26)"
      />
    </svg>
  );
}
