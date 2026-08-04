import { distance, pathLength, type Point2D } from './point-2d';

export interface StrokeTemplate {
  name: string;
  points: Point2D[];
}

export interface RecognitionResult {
  name: string;
  score: number;
}

const NUM_POINTS = 64;
const SQUARE_SIZE = 250;
const DIAGONAL = Math.hypot(SQUARE_SIZE, SQUARE_SIZE);
const ANGLE_RANGE = (Math.PI / 180) * 45;
const ANGLE_PRECISION = (Math.PI / 180) * 2;

function resample(points: Point2D[], sampleCount: number): Point2D[] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return Array.from({ length: sampleCount }, () => ({ ...points[0] }));
  }

  const interval = pathLength(points) / (sampleCount - 1);
  let carry = 0;
  const cloned = points.map((p) => ({ ...p }));
  const result: Point2D[] = [{ ...cloned[0] }];

  let i = 1;
  while (result.length < sampleCount) {
    if (i >= cloned.length) {
      result.push({ ...cloned[cloned.length - 1] });
      continue;
    }

    const segment = distance(cloned[i - 1], cloned[i]);
    if (carry + segment >= interval) {
      const ratio = (interval - carry) / segment;
      const point = {
        x: cloned[i - 1].x + ratio * (cloned[i].x - cloned[i - 1].x),
        y: cloned[i - 1].y + ratio * (cloned[i].y - cloned[i - 1].y),
      };
      result.push(point);
      cloned.splice(i, 0, point);
      carry = 0;
    } else {
      carry += segment;
      i += 1;
    }
  }

  return result;
}

function centroid(points: Point2D[]): Point2D {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
}

function translateToOrigin(points: Point2D[]): Point2D[] {
  const center = centroid(points);
  return points.map((point) => ({
    x: point.x - center.x,
    y: point.y - center.y,
  }));
}

function boundingBox(points: Point2D[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function scaleToSquare(points: Point2D[], size: number): Point2D[] {
  const box = boundingBox(points);
  const scale = size / Math.max(box.width, box.height, 1);
  return points.map((point) => ({
    x: point.x * scale,
    y: point.y * scale,
  }));
}

function indicativeAngle(points: Point2D[]): number {
  const start = points[0];
  const end = points[Math.floor(points.length / 4)];
  return Math.atan2(end.y - start.y, end.x - start.x);
}

function rotateBy(points: Point2D[], radians: number): Point2D[] {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((point) => ({
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  }));
}

function normalizeStroke(points: Point2D[]): Point2D[] {
  if (points.length === 0) return [];
  const resampled = resample(points, NUM_POINTS);
  const translated = translateToOrigin(resampled);
  const scaled = scaleToSquare(translated, SQUARE_SIZE);
  const angle = indicativeAngle(scaled);
  return rotateBy(scaled, -angle);
}

function pathDistance(pointsA: Point2D[], pointsB: Point2D[]): number {
  let total = 0;
  for (let i = 0; i < pointsA.length; i++) {
    total += distance(pointsA[i], pointsB[i]);
  }
  return total / pointsA.length;
}

function distanceAtBestAngle(points: Point2D[], template: Point2D[]): number {
  const base = indicativeAngle(points);
  let best = Infinity;

  for (let angle = -ANGLE_RANGE; angle <= ANGLE_RANGE; angle += ANGLE_PRECISION) {
    const rotated = rotateBy(points, base + angle);
    best = Math.min(best, pathDistance(rotated, template));
  }

  return best;
}

function prepareTemplate(template: StrokeTemplate): StrokeTemplate {
  return {
    name: template.name,
    points: normalizeStroke(template.points),
  };
}

export class UnistrokeRecognizer {
  private templates: StrokeTemplate[];

  constructor(templates: StrokeTemplate[]) {
    this.templates = templates.map(prepareTemplate);
  }

  recognize(points: Point2D[]): RecognitionResult | null {
    if (points.length < 2) return null;

    const candidate = normalizeStroke(points);
    let bestName = '';
    let bestScore = Infinity;

    for (const template of this.templates) {
      const score = distanceAtBestAngle(candidate, template.points);
      if (score < bestScore) {
        bestScore = score;
        bestName = template.name;
      }
    }

    if (!bestName) return null;
    return { name: bestName, score: bestScore / DIAGONAL };
  }
}
