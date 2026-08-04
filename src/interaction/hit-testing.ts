const TARGET_ATTR = 'data-touchless-target';
const DISABLED_ATTR = 'data-touchless-disabled';

export interface TouchlessTarget {
  element: HTMLElement;
  targetId: string;
}

function isElementVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isElementDisabled(el: HTMLElement): boolean {
  if (el.hasAttribute(DISABLED_ATTR)) return true;
  if (el.hasAttribute('disabled')) return true;
  if (el.getAttribute('aria-disabled') === 'true') return true;
  return false;
}

function findTouchlessTarget(el: Element): TouchlessTarget | null {
  let current: Element | null = el;

  while (current) {
    if (current instanceof HTMLElement && current.hasAttribute(TARGET_ATTR)) {
      if (!isElementVisible(current) || isElementDisabled(current)) {
        return null;
      }
      const targetId = current.getAttribute(TARGET_ATTR);
      if (!targetId) return null;
      return { element: current, targetId };
    }
    current = current.parentElement;
  }

  return null;
}

/** Find the topmost touchless target at screen coordinates */
export function hitTestTouchlessTarget(x: number, y: number): TouchlessTarget | null {
  const elements = document.elementsFromPoint(x, y);

  for (const el of elements) {
    const target = findTouchlessTarget(el);
    if (target) return target;
  }

  return null;
}
