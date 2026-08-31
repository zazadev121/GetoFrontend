import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../config/api.config';
import { firstValueFrom } from 'rxjs';

const PREF_KEY = 'geto_notify_pref';
const BASE_URL = `${API_CONFIG.baseUrl}/Push`;

export type NotifyPref = 'on' | 'off' | null;

@Injectable({ providedIn: 'root' })
export class WebPushService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /** UI-friendly permission: granted | denied | default | unsupported */
  permission = signal(this.readPermission());
  enabled = signal(this.readPermission() === 'granted' && this.getPref() !== 'off');

  getPref(): NotifyPref {
    const v = localStorage.getItem(PREF_KEY);
    return v === 'on' || v === 'off' ? v : null;
  }

  refreshPermission(): string {
    const p = this.readPermission();
    this.permission.set(p);
    this.enabled.set(p === 'granted' && this.getPref() !== 'off');
    return p;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined'
      && 'Notification' in window
      && 'serviceWorker' in navigator
      && 'PushManager' in window;
  }

  async registerWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return registration;
    } catch (err) {
      console.warn('[WebPush] Service worker registration failed', err);
      return null;
    }
  }

  /** Keep subscription alive after login / page load. Never prompts the browser. */
  async init(_forceSync: boolean = false): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    if (this.getPref() === 'off') return;
    if (!this.isSupported()) return;
    if (Notification.permission !== 'granted') {
      this.refreshPermission();
      return;
    }

    await this.subscribeAndSync();
    this.refreshPermission();
  }

  /** Call only from a user gesture (Allow in the popup). */
  async enableFromUserGesture(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
    if (!('Notification' in window)) return 'unsupported';

    let permission: NotificationPermission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      localStorage.setItem(PREF_KEY, 'off');
      this.refreshPermission();
      return permission;
    }

    localStorage.setItem(PREF_KEY, 'on');
    await this.subscribeAndSync();
    this.refreshPermission();
    return 'granted';
  }

  async disableFromUser(): Promise<void> {
    localStorage.setItem(PREF_KEY, 'off');
    await this.unsubscribe();
    this.refreshPermission();
  }

  declineForNow(): void {
    localStorage.setItem(PREF_KEY, 'off');
    this.refreshPermission();
  }

  async sendTestPush(): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE_URL}/test-push`, {}));
  }

  async showLocalNotification(title: string, body: string, url = '/dashboard'): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const registration = await this.registerWorker();
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/recommendations/Geto Logo.jpg',
        badge: '/recommendations/Geto Logo.jpg',
        data: { url },
        tag: `geto-local-${Date.now()}`,
        requireInteraction: true,
        silent: false,
        vibrate: [300, 100, 300]
      } as NotificationOptions);
      return;
    }

    const n = new Notification(title, {
      body,
      icon: '/recommendations/Geto Logo.jpg',
      badge: '/recommendations/Geto Logo.jpg'
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  }

  async unsubscribe(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      if (this.authService.isLoggedIn()) {
        await firstValueFrom(
          this.http.delete(`${BASE_URL}/unsubscribe`, { body: { endpoint } })
        );
      }
    } catch (err) {
      console.error('[WebPush] Unsubscribe error:', err);
    }
  }

  private readPermission(): string {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  private async subscribeAndSync(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    if (!this.isSupported()) {
      console.warn('[WebPush] Not supported in this browser');
      return;
    }

    try {
      const registration = await this.registerWorker();
      if (!registration) return;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        let vapidPublicKey = '';
        try {
          const keyRes: any = await firstValueFrom(
            this.http.get(`${BASE_URL}/vapid-public-key`)
          );
          vapidPublicKey = keyRes?.publicKey;
        } catch (err: any) {
          if (err?.status === 404) {
            console.info('[WebPush] Backend WebPush service is deploying or warming up on Render.');
          } else {
            console.warn('[WebPush] Could not fetch VAPID key from server:', err?.message || err);
          }
          return;
        }

        if (!vapidPublicKey) return;
        const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      const sub = subscription.toJSON();
      await firstValueFrom(
        this.http.post(`${BASE_URL}/subscribe`, {
          endpoint: sub.endpoint,
          p256dh: sub.keys?.['p256dh'] ?? '',
          auth: sub.keys?.['auth'] ?? ''
        })
      );

      localStorage.setItem(PREF_KEY, 'on');
      console.log('[WebPush] Successfully subscribed & synced to backend for user');
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('push service error')) {
        console.warn('[WebPush] Push subscription disabled or blocked by browser (Incognito mode, VPN, or Push Service restriction).');
      } else {
        console.warn('[WebPush] Push initialization note:', err?.message || err);
      }
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
