import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './TouchlessButton.module.css';

interface TouchlessButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  targetId: string;
  onSelect: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}

export function TouchlessButton({
  targetId,
  onSelect,
  children,
  variant = 'primary',
  size = 'lg',
  disabled,
  className = '',
  ...rest
}: TouchlessButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      data-touchless-target={targetId}
      data-touchless-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      onClick={onSelect}
      {...rest}
    >
      {children}
    </button>
  );
}
