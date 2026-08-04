/** Auto-scroll when cursor is near viewport edges */
export interface EdgeScrollConfig {
  topEdgeRatio: number;
  bottomEdgeRatio: number;
  maxSpeedPx: number;
}

const DEFAULT: EdgeScrollConfig = {
  topEdgeRatio: 0.12,
  bottomEdgeRatio: 0.12,
  maxSpeedPx: 10,
};

export function applyEdgeScroll(
  cursorY: number,
  viewportHeight: number,
  config: Partial<EdgeScrollConfig> = {},
): void {
  const { topEdgeRatio, bottomEdgeRatio, maxSpeedPx } = { ...DEFAULT, ...config };
  const topZone = viewportHeight * topEdgeRatio;
  const bottomZone = viewportHeight * bottomEdgeRatio;
  const maxScroll = document.documentElement.scrollHeight - viewportHeight;

  if (maxScroll <= 0) return;

  if (cursorY > viewportHeight - bottomZone) {
    const t = (cursorY - (viewportHeight - bottomZone)) / bottomZone;
    window.scrollBy({ top: t * maxSpeedPx, left: 0, behavior: 'auto' });
  } else if (cursorY < topZone) {
    const t = (topZone - cursorY) / topZone;
    window.scrollBy({ top: -t * maxSpeedPx, left: 0, behavior: 'auto' });
  }
}

/** Scroll by fixed amount (used by scroll assist buttons) */
export function scrollPageBy(deltaPx: number): void {
  window.scrollBy({ top: deltaPx, left: 0, behavior: 'smooth' });
}

export function scrollPageUp(amountPx = 320): void {
  scrollPageBy(-amountPx);
}

export function scrollPageDown(amountPx = 320): void {
  scrollPageBy(amountPx);
}
