import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

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

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;

      // Do not suppress the browser's native banner before the user interacts.
      // The banner will only appear when we later call prompt() from a click.
      this.deferredPrompt = installEvent;
      this.canInstall.set(true);
      console.log('[PWA] install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.isInstalled.set(true);
      console.log('[PWA] app installed');
    });
  }

  /** Must be called from a user gesture. Returns true if the user accepted. */
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('[PWA] no deferred install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.canInstall.set(false);
      return choice?.outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] prompt failed', error);
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
