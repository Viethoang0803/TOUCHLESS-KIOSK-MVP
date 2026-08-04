import { describe, expect, it } from 'vitest';
import { noteKeyTargetId, parseNoteKeyTargetId } from '../src/data/note-keyboard';

describe('note-keyboard', () => {
  it('builds stable target ids', () => {
    expect(noteKeyTargetId('A')).toBe('note-key-a');
    expect(noteKeyTargetId('space')).toBe('note-key-space');
  });

  it('parses note key targets', () => {
    expect(parseNoteKeyTargetId('note-key-q')).toBe('q');
    expect(parseNoteKeyTargetId('note-key-backspace')).toBe('backspace');
    expect(parseNoteKeyTargetId('catalog-note')).toBeNull();
  });
});
