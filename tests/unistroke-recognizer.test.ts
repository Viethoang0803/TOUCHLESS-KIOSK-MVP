import { describe, expect, it } from 'vitest';
import { UnistrokeRecognizer } from '../src/air-writing/unistroke-recognizer';
import { LETTER_TEMPLATES } from '../src/air-writing/letter-templates';

describe('UnistrokeRecognizer', () => {
  const recognizer = new UnistrokeRecognizer(LETTER_TEMPLATES);

  it('recognizes a vertical stroke as I', () => {
    const stroke = Array.from({ length: 20 }, (_, i) => ({
      x: 125,
      y: 30 + i * 10,
    }));
    const result = recognizer.recognize(stroke);
    expect(result?.name).toBe('I');
    expect(result!.score).toBeLessThan(0.42);
  });

  it('returns a confident match for simple template strokes', () => {
    const vertical = LETTER_TEMPLATES.find((t) => t.name === 'I');
    const round = LETTER_TEMPLATES.find((t) => t.name === 'O');
    expect(recognizer.recognize(vertical!.points)?.name).toBe('I');
    expect(recognizer.recognize(round!.points)?.name).toBe('O');
  });

  it('returns null for very short strokes', () => {
    expect(recognizer.recognize([{ x: 0, y: 0 }])).toBeNull();
  });
});
