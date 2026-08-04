import { useEffect, useRef } from 'react';
import { InactivityManager } from '../kiosk/inactivity-manager';

export function useInactivityTimer(onTimeout: () => void, enabled: boolean) {
  const managerRef = useRef<InactivityManager | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!enabled) {
      managerRef.current?.stop();
      return;
    }

    const manager = new InactivityManager(() => onTimeoutRef.current());
    managerRef.current = manager;
    manager.start();

    return () => manager.stop();
  }, [enabled]);

  const touch = () => managerRef.current?.touch();

  return { touchActivity: touch };
}
