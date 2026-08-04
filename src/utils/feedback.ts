/** Play a short selection beep using Web Audio API */
export function playSelectionSound(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    setTimeout(() => void ctx.close(), 200);
  } catch {
    /* audio not available */
  }
}

/** Flash visual feedback on selected target */
export function flashTarget(targetId: string): void {
  const el = document.querySelector(`[data-touchless-target="${targetId}"]`);
  if (el instanceof HTMLElement) {
    el.classList.add('touchless-selected-flash');
    setTimeout(() => el.classList.remove('touchless-selected-flash'), 300);
  }
}
