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
    if (this.authService.isAdmin()) return; // admins don't need to subscribe
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[WebPush] Not supported in this browser');
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[WebPush] Notification permission denied');
        return;
      }

      // Check if already subscribed
      const existing = await registration.pushManager.getSubscription();
      if (existing && localStorage.getItem(VAPID_LOCAL_KEY)) {
        // Already subscribed — nothing to do
        return;
      }

      // Get VAPID public key from backend
      const keyRes: any = await firstValueFrom(
        this.http.get(`${BASE_URL}/vapid-public-key`)
      );
      const vapidPublicKey = keyRes.publicKey;
      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      const sub = subscription.toJSON();

      // Send subscription to backend
      await firstValueFrom(
        this.http.post(`${BASE_URL}/subscribe`, {
          endpoint: sub.endpoint,
          p256dh: sub.keys?.['p256dh'] ?? '',
          auth: sub.keys?.['auth'] ?? ''
        })
      );

      localStorage.setItem(VAPID_LOCAL_KEY, 'true');
      console.log('[WebPush] Successfully subscribed to push notifications');
    } catch (err) {
      console.error('[WebPush] Init error:', err);
    }
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
