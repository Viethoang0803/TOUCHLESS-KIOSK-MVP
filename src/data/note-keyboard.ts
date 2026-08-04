export const NOTE_KEYBOARD_ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
];

export const NOTE_STORAGE_KEY = 'touchless-kiosk-note';

export function noteKeyTargetId(key: string): string {
  return `note-key-${key.toLowerCase()}`;
}

export function parseNoteKeyTargetId(targetId: string): string | null {
  if (!targetId.startsWith('note-key-')) return null;
  return targetId.slice('note-key-'.length);
}
