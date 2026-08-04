import { useCallback, useEffect, useState } from 'react';
import { TouchlessButton } from '../components/TouchlessButton';
import {
  NOTE_KEYBOARD_ROWS,
  NOTE_STORAGE_KEY,
  noteKeyTargetId,
  parseNoteKeyTargetId,
} from '../data/note-keyboard';
import styles from './NoteScreen.module.css';

export interface NoteScreenHandlers {
  pressKey: (key: string) => void;
  save: () => void;
}

interface NoteScreenProps {
  onRegisterHandlers: (handlers: NoteScreenHandlers | null) => void;
  onBack: () => void;
  onGoHome: () => void;
}

export function NoteScreen({ onRegisterHandlers, onBack, onGoHome }: NoteScreenProps) {
  const [text, setText] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(NOTE_STORAGE_KEY);
    if (saved) setText(saved);
  }, []);

  const pressKey = useCallback((rawKey: string) => {
    setSavedAt(null);

    switch (rawKey) {
      case 'space':
        setText((prev) => `${prev} `);
        break;
      case 'backspace':
        setText((prev) => prev.slice(0, -1));
        break;
      case 'clear':
        setText('');
        break;
      case 'enter':
        setText((prev) => `${prev}\n`);
        break;
      default:
        setText((prev) => prev + rawKey.toUpperCase());
        break;
    }
  }, []);

  const saveNote = useCallback(() => {
    localStorage.setItem(NOTE_STORAGE_KEY, text);
    const time = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setSavedAt(time);
  }, [text]);

  useEffect(() => {
    onRegisterHandlers({
      pressKey: (targetIdOrKey: string) => {
        const parsed = parseNoteKeyTargetId(targetIdOrKey);
        if (parsed) pressKey(parsed);
        else pressKey(targetIdOrKey);
      },
      save: saveNote,
    });
    return () => onRegisterHandlers(null);
  }, [onRegisterHandlers, pressKey, saveNote]);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1>Viết ghi chú</h1>
        <p className={styles.hint}>
          Giơ ngón trỏ, giữ trên phím ~1 giây để gõ. Không cần chạm màn hình hay bàn phím vật lý.
        </p>
      </header>

      <div className={styles.noteArea} aria-live="polite">
        {text}
      </div>

      <p className={styles.savedBadge}>{savedAt ? `Đã lưu lúc ${savedAt}` : '\u00A0'}</p>

      <div className={styles.keyboard} aria-label="Bàn phím ảo">
        {NOTE_KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((key) => (
              <TouchlessButton
                key={key}
                targetId={noteKeyTargetId(key)}
                onSelect={() => pressKey(key)}
                variant="secondary"
                size="md"
                className={styles.key}
              >
                {key}
              </TouchlessButton>
            ))}
          </div>
        ))}

        <div className={styles.row}>
          <TouchlessButton
            targetId={noteKeyTargetId('space')}
            onSelect={() => pressKey('space')}
            variant="secondary"
            size="md"
            className={`${styles.key} ${styles.keyExtraWide}`}
          >
            Dấu cách
          </TouchlessButton>
          <TouchlessButton
            targetId={noteKeyTargetId('backspace')}
            onSelect={() => pressKey('backspace')}
            variant="secondary"
            size="md"
            className={`${styles.key} ${styles.keyWide}`}
          >
            ← Xóa
          </TouchlessButton>
          <TouchlessButton
            targetId={noteKeyTargetId('clear')}
            onSelect={() => pressKey('clear')}
            variant="secondary"
            size="md"
            className={`${styles.key} ${styles.keyWide}`}
          >
            Xóa hết
          </TouchlessButton>
          <TouchlessButton
            targetId={noteKeyTargetId('enter')}
            onSelect={() => pressKey('enter')}
            variant="secondary"
            size="md"
            className={`${styles.key} ${styles.keyWide}`}
          >
            Xuống dòng
          </TouchlessButton>
        </div>
      </div>

      <div className={styles.actions}>
        <TouchlessButton targetId="note-save" onSelect={saveNote} variant="primary" size="md">
          Lưu ghi chú
        </TouchlessButton>
        <TouchlessButton targetId="note-back" onSelect={onBack} variant="secondary" size="md">
          Quay lại
        </TouchlessButton>
        <TouchlessButton targetId="note-home" onSelect={onGoHome} variant="ghost" size="md">
          Về trang chủ
        </TouchlessButton>
      </div>
    </div>
  );
}
