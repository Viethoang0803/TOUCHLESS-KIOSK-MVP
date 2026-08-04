import { TOUCHLESS_CONFIG } from '../config/touchless-config';
import { getDeviceInteractionOverrides } from '../config/device-config';
import { detectFist, detectPointing } from '../gestures/point-detector';
import { GestureStabilizer } from '../gestures/gesture-stabilizer';
import { mapLandmarkToScreen } from '../interaction/coordinate-mapper';
import type { NormalizedLandmark } from '../vision/vision-types';
import { distance, pathLength, type Point2D } from './point-2d';
import { LETTER_TEMPLATES, RECOGNITION_SCORE_THRESHOLD } from './letter-templates';
import { UnistrokeRecognizer, type RecognitionResult } from './unistroke-recognizer';

export interface WritingRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AirWritingFrameResult {
  isDrawing: boolean;
  strokePoints: Point2D[];
  lastRecognition: RecognitionResult | null;
  rejected: boolean;
}

const MIN_STROKE_POINTS = 10;
const MIN_STROKE_LENGTH = 35;
const MIN_POINT_DISTANCE = 4;

export class AirWritingEngine {
  private recognizer = new UnistrokeRecognizer(LETTER_TEMPLATES);
  private gestureStabilizer = new GestureStabilizer({
    enterFrames: 2,
    exitFrames: 3,
  });
  private fistStabilizer = new GestureStabilizer({
    enterFrames: 2,
    exitFrames: 2,
  });
  private strokePoints: Point2D[] = [];
  private isDrawing = false;
  private lastRecognition: RecognitionResult | null = null;
  private rejected = false;
  private writingRect: WritingRect | null = null;

  setWritingRect(rect: WritingRect | null): void {
    this.writingRect = rect;
  }

  clearStroke(): void {
    this.strokePoints = [];
    this.isDrawing = false;
    this.lastRecognition = null;
    this.rejected = false;
  }

  reset(): void {
    this.clearStroke();
    this.gestureStabilizer.reset();
    this.fistStabilizer.reset();
  }

  processFrame(
    landmarks: NormalizedLandmark[] | null,
    viewport: { width: number; height: number },
  ): AirWritingFrameResult {
    this.lastRecognition = null;
    this.rejected = false;

    if (!landmarks || landmarks.length < 21 || !this.writingRect) {
      if (this.isDrawing) {
        this.finalizeStroke();
      }
      return this.snapshot(false);
    }

    const overrides = getDeviceInteractionOverrides();
    const activeRegion = overrides.activeRegion ?? TOUCHLESS_CONFIG.activeRegion;
    const yMapping = overrides.yMapping;

    const tip = landmarks[8];
    if (!tip) return this.snapshot(false);

    const rawPointing = detectPointing(landmarks);
    const pointing = this.gestureStabilizer.update(rawPointing) === 'POINTING';
    const rawFist = detectFist(landmarks);
    const fist = this.fistStabilizer.update(rawFist);

    const screen = mapLandmarkToScreen(
      tip.x,
      tip.y,
      activeRegion,
      viewport,
      yMapping,
    );

    const local = this.toLocalPoint(screen.x, screen.y);
    const inside = this.isInsideWritingArea(local);

    if (this.isDrawing) {
      if (pointing && (inside || this.strokePoints.length > 0)) {
        this.appendPoint(local);
      }

      if (fist || !pointing) {
        this.finalizeStroke();
      }
    } else if (pointing && inside) {
      this.isDrawing = true;
      this.strokePoints = [local];
    }

    return this.snapshot(this.isDrawing);
  }

  private appendPoint(point: Point2D): void {
    const last = this.strokePoints[this.strokePoints.length - 1];
    if (last && distance(last, point) < MIN_POINT_DISTANCE) return;
    this.strokePoints.push(point);
  }

  private finalizeStroke(): void {
    this.isDrawing = false;
    const points = this.strokePoints;
    this.strokePoints = [];

    if (points.length < MIN_STROKE_POINTS || pathLength(points) < MIN_STROKE_LENGTH) {
      this.rejected = points.length > 1;
      return;
    }

    const result = this.recognizer.recognize(points);
    if (!result || result.score > RECOGNITION_SCORE_THRESHOLD) {
      this.rejected = true;
      return;
    }

    this.lastRecognition = result;
  }

  private toLocalPoint(screenX: number, screenY: number): Point2D {
    const rect = this.writingRect!;
    return {
      x: screenX - rect.left,
      y: screenY - rect.top,
    };
  }

  private isInsideWritingArea(point: Point2D): boolean {
    const rect = this.writingRect!;
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x <= rect.width &&
      point.y <= rect.height
    );
  }

  private snapshot(isDrawing: boolean): AirWritingFrameResult {
    return {
      isDrawing,
      strokePoints: [...this.strokePoints],
      lastRecognition: this.lastRecognition,
      rejected: this.rejected,
    };
  }
}
