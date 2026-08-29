import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { API_CONFIG } from '../config/api.config';
import { firstValueFrom } from 'rxjs';

const VAPID_LOCAL_KEY = 'geto_push_subscribed';
const BASE_URL = `${API_CONFIG.baseUrl}/Push`;

@Injectable({ providedIn: 'root' })
export class WebPushService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  async init(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[WebPush] Not supported in this browser');
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // Request notification permission if default
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('[WebPush] Notification permission denied by user');
          return;
        }
      } else if (Notification.permission !== 'granted') {
        console.warn('[WebPush] Notification permission blocked');
        return;
      }

      // Check if browser already has a PushManager subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Get VAPID public key from backend
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

        // Subscribe to push in browser
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      // ALWAYS sync active subscription to backend DB for currently logged-in user
      const sub = subscription.toJSON();
      await firstValueFrom(
        this.http.post(`${BASE_URL}/subscribe`, {
          endpoint: sub.endpoint,
          p256dh: sub.keys?.['p256dh'] ?? '',
          auth: sub.keys?.['auth'] ?? ''
        })
      );

      localStorage.setItem(VAPID_LOCAL_KEY, 'true');
      console.log('[WebPush] Successfully subscribed & synced to backend for user');
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('push service error')) {
        console.warn('[WebPush] Push subscription disabled or blocked by browser (Incognito mode, VPN, or Push Service restriction).');
      } else {
        console.warn('[WebPush] Push initialization note:', err?.message || err);
      }
    }
  }

  async sendTestPush(): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE_URL}/test-push`, {}));
  }

  async unsubscribe(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await firstValueFrom(
        this.http.delete(`${BASE_URL}/unsubscribe`, { body: { endpoint } })
      );

      localStorage.removeItem(VAPID_LOCAL_KEY);
      console.log('[WebPush] Unsubscribed');
    } catch (err) {
      console.error('[WebPush] Unsubscribe error:', err);
    }
  }

  // Convert base64 string to Uint8Array for VAPID key
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
