/** Auto-scroll page when cursor is near viewport edges (touchless navigation) */
export interface EdgeScrollConfig {
  edgeZoneRatio: number;
  maxSpeedPx: number;
}

const DEFAULT: EdgeScrollConfig = {
  edgeZoneRatio: 0.12,
  maxSpeedPx: 10,
};

export function applyEdgeScroll(
  cursorY: number,
  viewportHeight: number,
  config: EdgeScrollConfig = DEFAULT,
): void {
  const edgeZone = viewportHeight * config.edgeZoneRatio;
  const maxScroll = document.documentElement.scrollHeight - viewportHeight;

  if (maxScroll <= 0) return;

  if (cursorY > viewportHeight - edgeZone) {
    const t = (cursorY - (viewportHeight - edgeZone)) / edgeZone;
    const speed = t * config.maxSpeedPx;
    window.scrollBy({ top: speed, left: 0, behavior: 'auto' });
  } else if (cursorY < edgeZone) {
    const t = (edgeZone - cursorY) / edgeZone;
    const speed = t * config.maxSpeedPx;
    window.scrollBy({ top: -speed, left: 0, behavior: 'auto' });
  }
}

/** Adjust hit-test Y for scroll position */
export function getDocumentCursorY(viewportY: number): number {
  return viewportY + window.scrollY;
}

/** Hit test uses viewport coords; elementsFromPoint needs client coordinates */
export function getClientCursorY(viewportY: number): number {
  return viewportY;
}

export { getClientCursorY as toClientY };
