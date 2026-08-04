import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { TouchlessButton } from '../components/TouchlessButton';
import styles from './ContactScreen.module.css';

const CONTACT = {
  company: 'Demo Tech Solutions',
  hotline: '1900 1234',
  email: 'contact@demotech.vn',
  qrData: 'https://demotech.vn/contact',
};

interface ContactScreenProps {
  onBack: () => void;
  onGoHome: () => void;
}

export function ContactScreen({ onBack, onGoHome }: ContactScreenProps) {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    void QRCode.toDataURL(CONTACT.qrData, { width: 280, margin: 2 }).then(setQrUrl);
  }, []);

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <h1>Liên hệ</h1>

        <div className={styles.qrSection}>
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code liên hệ" className={styles.qr} />
          ) : (
            <div className={styles.qrPlaceholder}>Đang tạo QR...</div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.company}>{CONTACT.company}</p>
          <p className={styles.detail}>Hotline: {CONTACT.hotline}</p>
          <p className={styles.detail}>Email: {CONTACT.email}</p>
        </div>

        <div className={styles.actions}>
          <TouchlessButton targetId="contact-back" onSelect={onBack} variant="secondary">
            Quay lại
          </TouchlessButton>
          <TouchlessButton targetId="contact-home" onSelect={onGoHome} variant="ghost">
            Về trang chủ
          </TouchlessButton>
        </div>
      </div>
    </div>
  );
}
