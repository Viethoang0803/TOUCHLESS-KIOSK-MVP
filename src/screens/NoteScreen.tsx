import { useCallback, useEffect, useRef, useState } from 'react';
import type { HandTrackingResult } from '../vision/vision-types';
import { TouchlessButton } from '../components/TouchlessButton';
import { AirWritingCanvas } from '../components/AirWritingCanvas';
import { useAirWriting } from '../hooks/useAirWriting';
import {
  NOTE_KEYBOARD_ROWS,
  NOTE_STORAGE_KEY,
  noteKeyTargetId,
  parseNoteKeyTargetId,
} from '../data/note-keyboard';
import { playSelectionSound } from '../utils/feedback';
import styles from './NoteScreen.module.css';

export type NoteInputMode = 'air' | 'keyboard';

export interface NoteScreenHandlers {
  pressKey: (key: string) => void;
  save: () => void;
  setMode: (mode: NoteInputMode) => void;
  clearPad: () => void;
}

interface NoteScreenProps {
  trackingRef: React.RefObject<HandTrackingResult | null>;
  onRegisterHandlers: (handlers: NoteScreenHandlers | null) => void;
  onBack: () => void;
  onGoHome: () => void;
}

export function NoteScreen({
  trackingRef,
  onRegisterHandlers,
  onBack,
  onGoHome,
}: NoteScreenProps) {
  const [text, setText] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [mode, setMode] = useState<NoteInputMode>('air');
  const padRef = useRef<HTMLDivElement | null>(null);

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

  const onAirCharacter = useCallback((char: string) => {
    setSavedAt(null);
    setText((prev) => prev + char);
    playSelectionSound();
  }, []);

  const { state: airState, clearPad } = useAirWriting(
    trackingRef,
    mode === 'air',
    padRef,
    onAirCharacter,
  );

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
      setMode,
      clearPad,
    });
    return () => onRegisterHandlers(null);
  }, [onRegisterHandlers, pressKey, saveNote, clearPad]);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1>Viết ghi chú</h1>
        <p className={styles.hint}>
          {mode === 'air'
            ? 'Giơ ngón trỏ, viết chữ trong khung xanh. Nắm tay (hoặc hạ tay) để hoàn thành — hệ thống tự nhận chữ và ghi vào ô bên dưới.'
            : 'Giơ ngón trỏ, giữ trên phím ~1 giây để gõ.'}
        </p>
      </header>

      <div className={styles.modeTabs}>
        <TouchlessButton
          targetId="note-mode-air"
          onSelect={() => setMode('air')}
          variant={mode === 'air' ? 'primary' : 'secondary'}
          size="md"
          className={styles.modeBtn}
        >
          Viết không trung
        </TouchlessButton>
        <TouchlessButton
          targetId="note-mode-keyboard"
          onSelect={() => setMode('keyboard')}
          variant={mode === 'keyboard' ? 'primary' : 'secondary'}
          size="md"
          className={styles.modeBtn}
        >
          Bàn phím ảo
        </TouchlessButton>
      </div>

      {mode === 'air' && (
        <div className={styles.airSection}>
          <AirWritingCanvas
            ref={padRef}
            strokePoints={airState.strokePoints}
            isDrawing={airState.isDrawing}
            rejected={airState.rejected}
            lastChar={airState.lastChar}
          />
          <div className={styles.airActions}>
            <TouchlessButton
              targetId={noteKeyTargetId('space')}
              onSelect={() => pressKey('space')}
              variant="secondary"
              size="md"
            >
              Dấu cách
            </TouchlessButton>
            <TouchlessButton
              targetId={noteKeyTargetId('backspace')}
              onSelect={() => pressKey('backspace')}
              variant="secondary"
              size="md"
            >
              ← Xóa chữ
            </TouchlessButton>
            <TouchlessButton
              targetId="note-clear-pad"
              onSelect={clearPad}
              variant="ghost"
              size="md"
            >
              Xóa nét vẽ
            </TouchlessButton>
          </div>
        </div>
      )}

      <div className={styles.noteArea} aria-live="polite">
        {text}
      </div>

      <p className={styles.savedBadge}>{savedAt ? `Đã lưu lúc ${savedAt}` : '\u00A0'}</p>

      {mode === 'keyboard' && (
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
      )}

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
