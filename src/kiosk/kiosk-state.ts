export type KioskState = 'IDLE' | 'ACTIVATING' | 'ACTIVE' | 'HAND_LOST' | 'ERROR';

export type AppScreen = 'idle' | 'catalog' | 'product' | 'contact' | 'note' | 'test';

export interface KioskSession {
  sessionId: string;
  kioskState: KioskState;
  currentScreen: AppScreen;
  selectedProductId: string | null;
  lastActivityTime: number;
}
