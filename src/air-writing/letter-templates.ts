import type { Point2D } from './point-2d';
import type { StrokeTemplate } from './unistroke-recognizer';

function line(x1: number, y1: number, x2: number, y2: number, steps = 10): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    });
  }
  return points;
}

function arc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  steps = 16,
): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * (endAngle - startAngle);
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return points;
}

function concat(...segments: Point2D[][]): Point2D[] {
  return segments.flat();
}

function tpl(name: string, points: Point2D[]): StrokeTemplate {
  return { name, points };
}

/** Single-stroke graffiti-style templates in a 250×250 box */
export const LETTER_TEMPLATES: StrokeTemplate[] = [
  tpl('A', concat(line(125, 25, 45, 215), line(45, 215, 205, 215), line(205, 215, 125, 25))),
  tpl('B', concat(line(70, 25, 70, 225), line(70, 25, 170, 60), line(170, 60, 70, 120), line(70, 120, 180, 160), line(180, 160, 70, 225))),
  tpl('C', arc(130, 125, 85, Math.PI * 0.55, Math.PI * 1.45, 24)),
  tpl('D', concat(line(70, 25, 70, 225), arc(70, 125, 95, -Math.PI / 2, Math.PI / 2, 20))),
  tpl('E', concat(line(190, 25, 55, 25), line(55, 25, 55, 225), line(55, 225, 190, 225), line(55, 125, 165, 125))),
  tpl('F', concat(line(55, 25, 55, 225), line(55, 25, 185, 25), line(55, 125, 160, 125))),
  tpl('G', concat(arc(130, 125, 85, Math.PI * 0.45, Math.PI * 1.55, 22), line(130, 125, 205, 125))),
  tpl('H', concat(line(70, 25, 70, 225), line(180, 25, 180, 225), line(70, 125, 180, 125))),
  tpl('I', line(125, 25, 125, 225, 24)),
  tpl('J', concat(line(170, 25, 170, 190), arc(125, 190, 45, 0, Math.PI, 12))),
  tpl('K', concat(line(70, 25, 70, 225), line(70, 125, 190, 25), line(70, 125, 190, 225))),
  tpl('L', concat(line(70, 25, 70, 225), line(70, 225, 190, 225))),
  tpl('M', concat(line(60, 225, 60, 25), line(60, 25, 125, 140), line(125, 140, 190, 25), line(190, 25, 190, 225))),
  tpl('N', concat(line(70, 225, 70, 25), line(70, 25, 180, 225), line(180, 225, 180, 25))),
  tpl('O', arc(125, 125, 85, 0, Math.PI * 2, 32)),
  tpl('P', concat(line(70, 225, 70, 25), line(70, 25, 175, 45), line(175, 45, 175, 110), line(175, 110, 70, 125))),
  tpl('Q', concat(arc(125, 125, 80, 0, Math.PI * 2, 28), line(155, 155, 205, 215))),
  tpl('R', concat(line(70, 225, 70, 25), line(70, 25, 175, 45), line(175, 45, 175, 110), line(175, 110, 70, 125), line(70, 125, 190, 225))),
  tpl('S', concat(arc(140, 70, 55, Math.PI * 0.8, Math.PI * 2.2, 14), arc(110, 180, 55, Math.PI * 1.8, Math.PI * 0.2, 14))),
  tpl('T', concat(line(125, 25, 125, 225), line(55, 25, 195, 25))),
  tpl('U', concat(line(70, 25, 70, 190), arc(125, 190, 55, Math.PI, 0, 14), line(180, 190, 180, 25))),
  tpl('V', concat(line(60, 25, 125, 225), line(125, 225, 190, 25))),
  tpl('W', concat(line(45, 25, 85, 225), line(85, 225, 125, 90), line(125, 90, 165, 225), line(165, 225, 205, 25))),
  tpl('X', concat(line(60, 25, 190, 225), line(190, 25, 60, 225))),
  tpl('Y', concat(line(60, 25, 125, 125), line(190, 25, 125, 125), line(125, 125, 125, 225))),
  tpl('Z', concat(line(60, 25, 190, 25), line(190, 25, 60, 225), line(60, 225, 190, 225))),
  tpl('0', arc(125, 125, 85, 0, Math.PI * 2, 32)),
  tpl('1', concat(line(110, 55, 125, 25), line(125, 25, 125, 225), line(95, 225, 155, 225))),
  tpl('2', concat(line(60, 70, 90, 35), line(90, 35, 180, 35), line(180, 35, 190, 90), line(190, 90, 70, 225), line(70, 225, 200, 225))),
  tpl('3', concat(line(70, 35, 180, 35), line(180, 35, 120, 125), line(120, 125, 180, 125), line(180, 125, 120, 225), line(120, 225, 190, 225))),
  tpl('4', concat(line(150, 25, 70, 160), line(70, 160, 200, 160), line(150, 25, 150, 225))),
  tpl('5', concat(line(180, 25, 70, 25), line(70, 25, 70, 120), line(70, 120, 170, 120), line(170, 120, 190, 170), line(190, 170, 170, 225), line(170, 225, 70, 225))),
  tpl('6', concat(arc(130, 160, 65, Math.PI * 0.3, Math.PI * 1.7, 18), arc(130, 95, 45, Math.PI * 1.2, Math.PI * 2.8, 12))),
  tpl('7', concat(line(60, 25, 190, 25), line(190, 25, 100, 225))),
  tpl('8', concat(arc(125, 80, 45, 0, Math.PI * 2, 18), arc(125, 165, 55, 0, Math.PI * 2, 18))),
  tpl('9', concat(arc(125, 95, 45, 0, Math.PI * 2, 18), line(125, 140, 125, 225), arc(125, 95, 70, Math.PI * 1.2, Math.PI * 2.8, 16))),
  tpl(' ', line(50, 125, 200, 125, 8)),
];

export const RECOGNITION_SCORE_THRESHOLD = 0.42;
