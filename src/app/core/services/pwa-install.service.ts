import { Injectable, signal } from '@angular/core';

/**
 * Captures the browser's install prompt.
 *
 * This matters for notifications, not vanity: an installed PWA gets its own app
 * identity, so Android stops freezing it with the rest of the browser's
 * background work, and iOS Safari only allows web push at all once the site has
 * been added to the Home Screen.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  /** True when the browser has offered us a prompt we can still show. */
  canInstall = signal(false);
  /** True when we are already running as an installed app. */
  isInstalled = signal(this.detectStandalone());

  private deferredPrompt: any = null;

  constructor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.isInstalled.set(true);
    });
  }

  /** Must be called from a user gesture. Returns true if the user accepted. */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    try {
      this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      // The event can only be used once, whatever the answer.
      this.deferredPrompt = null;
      this.canInstall.set(false);
      return choice?.outcome === 'accepted';
    } catch {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      return false;
    }
  }

  private detectStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
  }
}
