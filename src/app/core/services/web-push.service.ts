import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { NotificationFeedService } from './notification-feed.service';
import { API_CONFIG } from '../config/api.config';
import { firstValueFrom } from 'rxjs';

const PREF_KEY = 'geto_notify_pref';
const VAPID_KEY = 'geto_vapid_key';
const BASE_URL = `${API_CONFIG.baseUrl}/Push`;

export type NotifyPref = 'on' | 'off' | null;

/**
 * What the UI needs to know in one value.
 *
 *  unsupported   – no Notification API at all (old browser, some in-app webviews)
 *  needs-install – iOS Safari: web push only works from a home-screen install
 *  default       – never asked; a tap can raise the native browser prompt
 *  denied        – the browser blocked us; only site settings can undo it
 *  paused        – permission granted, but the user switched notifications off here
 *  on            – granted and active
 */
export type NotifyStatus = 'unsupported' | 'needs-install' | 'default' | 'denied' | 'paused' | 'on';

export interface EnableResult {
  status: NotifyStatus;
  /** true when the OS-level permission is granted, whatever the server sync did */
  granted: boolean;
  /** true when the browser is registered with our backend and can receive push */
  subscribed: boolean;
  /** set when subscription failed but permission succeeded (offline, VPN, incognito…) */
  warning?: string;
}

@Injectable({ providedIn: 'root' })
export class WebPushService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private feed = inject(NotificationFeedService);

  /** Raw browser permission, kept live via the Permissions API where available. */
  permission = signal<string>(this.readPermission());
  /** True once this browser is registered with the backend for push. */
  subscribed = signal<boolean>(false);

  status = computed<NotifyStatus>(() => {
    const p = this.permission();
    if (p === 'unsupported') return this.isIosNeedingInstall() ? 'needs-install' : 'unsupported';
    if (p === 'denied') return 'denied';
    if (p === 'default') return 'default';
    return this.pref() === 'off' ? 'paused' : 'on';
  });

  enabled = computed(() => this.status() === 'on');

  private pref = signal<NotifyPref>(this.readPref());
  private swRegistration: Promise<ServiceWorkerRegistration | null> | null = null;
  private permissionWatchStarted = false;

  constructor() {
    this.watchPermission();
    this.listenForServiceWorkerMessages();
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  getPref(): NotifyPref {
    return this.pref();
  }

  isSupported(): boolean {
    return typeof window !== 'undefined'
      && 'Notification' in window
      && 'serviceWorker' in navigator
      && 'PushManager' in window;
  }

  refreshPermission(): string {
    const p = this.readPermission();
    this.permission.set(p);
    this.pref.set(this.readPref());
    return p;
  }

  /** Registers (once) the worker that shows notifications while the tab is closed. */
  registerWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);

    this.swRegistration ??= navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async registration => {
        await navigator.serviceWorker.ready;
        return registration;
      })
      .catch(err => {
        console.warn('[WebPush] Service worker registration failed', err);
        this.swRegistration = null; // allow a later retry
        return null;
      });

    return this.swRegistration;
  }

  /**
   * Keeps the subscription alive after login / reload.
   * Never prompts — a prompt outside a user gesture is what browsers punish.
   */
  async init(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    this.refreshPermission();

    if (!this.isSupported()) return;
    if (this.pref() === 'off') return;
    if (Notification.permission !== 'granted') return;

    await this.subscribeAndSync();
  }

  /**
   * The one call the bell makes. MUST run inside a click handler so the browser
   * accepts `Notification.requestPermission()` and shows its own popup.
   */
  async enable(): Promise<EnableResult> {
    if (!this.isSupported()) {
      const status: NotifyStatus = this.isIosNeedingInstall() ? 'needs-install' : 'unsupported';
      this.permission.set('unsupported');
      return { status, granted: false, subscribed: false };
    }

    let permission: NotificationPermission = Notification.permission;

    if (permission === 'default') {
      // Raise the browser's own prompt right here — this is the whole point of
      // wiring the bell straight to it instead of burying it in site settings.
      permission = await this.requestPermission();
    }

    this.permission.set(permission);

    if (permission !== 'granted') {
      // A block is a decision; a dismissal is not. Only the former is recorded,
      // so simply closing the popup leaves the bell ready to ask again.
      if (permission === 'denied') this.setPref('off');
      return { status: permission === 'denied' ? 'denied' : 'default', granted: false, subscribed: false };
    }

    this.setPref('on');
    const sync = await this.subscribeAndSync();

    return {
      status: 'on',
      granted: true,
      subscribed: sync.ok,
      warning: sync.ok ? undefined : sync.reason
    };
  }

  /** Turn notifications off for this app without touching the browser permission. */
  async disable(): Promise<void> {
    this.setPref('off');
    await this.unsubscribe();
  }

  /** Re-arm after a pause; no prompt needed because permission is already granted. */
  async resume(): Promise<EnableResult> {
    if (Notification.permission !== 'granted') return this.enable();
    this.setPref('on');
    const sync = await this.subscribeAndSync();
    return { status: 'on', granted: true, subscribed: sync.ok, warning: sync.ok ? undefined : sync.reason };
  }

  async sendTestPush(): Promise<any> {
    return firstValueFrom(this.http.post(`${BASE_URL}/test-push`, {}));
  }

  /** Shows a notification from the page itself (no server round-trip). */
  async showLocalNotification(title: string, body: string, url = '/dashboard'): Promise<boolean> {
    this.feed.add(title, body, url);

    if (!('Notification' in window) || Notification.permission !== 'granted') return false;

    const registration = await this.registerWorker();
    const options: NotificationOptions = {
      body,
      icon: '/recommendations/Geto Logo.jpg',
      badge: '/recommendations/Geto Logo.jpg',
      data: { url },
      tag: 'geto-local',
      requireInteraction: false,
      silent: false
    };

    try {
      if (registration) {
        await registration.showNotification(title, { ...options, renotify: true, vibrate: [200, 80, 200] } as NotificationOptions);
        return true;
      }
      const n = new Notification(title, options);
      n.onclick = () => { window.focus(); n.close(); };
      return true;
    } catch (err) {
      console.warn('[WebPush] Could not display notification', err);
      return false;
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) { this.subscribed.set(false); return; }

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      this.subscribed.set(false);

      if (this.authService.isLoggedIn()) {
        await firstValueFrom(this.http.request('delete', `${BASE_URL}/unsubscribe`, { body: { endpoint } }));
      }
    } catch (err) {
      console.warn('[WebPush] Unsubscribe error:', err);
    }
  }

  /** iOS Safari exposes push only to home-screen installs. */
  isIosNeedingInstall(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua)
      || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
    if (!isIos) return false;
    const standalone = (navigator as any).standalone === true
      || window.matchMedia('(display-mode: standalone)').matches;
    return !standalone;
  }

  // ─── Internals ───────────────────────────────────────────────────────────

  private requestPermission(): Promise<NotificationPermission> {
    // Safari <16 only has the callback form; support both without hanging.
    return new Promise(resolve => {
      let settled = false;
      const done = (p: NotificationPermission) => { if (!settled) { settled = true; resolve(p); } };
      try {
        const maybe = Notification.requestPermission(done);
        if (maybe && typeof maybe.then === 'function') maybe.then(done).catch(() => done(Notification.permission));
      } catch {
        done(Notification.permission);
      }
    });
  }

  private readPermission(): string {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  private readPref(): NotifyPref {
    const v = localStorage.getItem(PREF_KEY);
    return v === 'on' || v === 'off' ? v : null;
  }

  private setPref(value: NotifyPref): void {
    if (value) localStorage.setItem(PREF_KEY, value);
    else localStorage.removeItem(PREF_KEY);
    this.pref.set(value);
  }

  /**
   * Chrome/Edge/Firefox fire `change` when the user flips the site setting.
   * Without this the bell keeps showing a stale state until a full reload.
   */
  private async watchPermission(): Promise<void> {
    if (this.permissionWatchStarted) return;
    this.permissionWatchStarted = true;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.refreshPermission();
      });
    }

    try {
      const status = await navigator.permissions?.query({ name: 'notifications' as PermissionName });
      if (!status) return;
      status.onchange = () => {
        const was = this.permission();
        this.permission.set(status.state === 'prompt' ? 'default' : status.state);

        if (status.state !== 'granted') return;

        // Going denied -> granted means the user just unblocked us in site
        // settings. That is an opt-in, so clear the "off" we stored on the block.
        if (was === 'denied' && this.pref() === 'off') this.setPref('on');
        if (this.pref() !== 'off') this.subscribeAndSync();
      };
    } catch {
      /* Permissions API unavailable (older Safari) — visibilitychange covers us */
    }
  }

  /** A push that lands while the tab is open is mirrored into the in-app feed. */
  private listenForServiceWorkerMessages(): void {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('message', event => {
      const msg = event.data;
      if (msg?.type === 'geto-subscription-changed') {
        this.subscribeAndSync();
        return;
      }
      if (!msg || msg.type !== 'geto-push') return;

      this.feed.add(msg.title ?? 'GETO Project', msg.body ?? '', msg.url ?? '/dashboard');

      // The server just told the user about this. Let the polling fallback know
      // so it re-reads its baseline instead of announcing the same change again.
      window.dispatchEvent(new CustomEvent('geto:push-received'));
    });
  }

  private async subscribeAndSync(): Promise<{ ok: boolean; reason?: string }> {
    if (!this.authService.isLoggedIn()) return { ok: false, reason: 'not-logged-in' };
    if (!this.isSupported()) return { ok: false, reason: 'unsupported' };
    if (Notification.permission !== 'granted') return { ok: false, reason: 'no-permission' };

    try {
      const registration = await this.registerWorker();
      if (!registration) return { ok: false, reason: 'no-service-worker' };

      const vapidPublicKey = await this.fetchVapidKey();
      if (!vapidPublicKey) return { ok: false, reason: 'no-vapid-key' };

      let subscription = await registration.pushManager.getSubscription();

      // A rotated server key silently breaks delivery — drop the stale one.
      if (subscription && localStorage.getItem(VAPID_KEY) !== vapidPublicKey) {
        try { await subscription.unsubscribe(); } catch { /* ignore */ }
        subscription = null;
      }

      subscription ??= await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
      });

      const sub = subscription.toJSON();
      await firstValueFrom(
        this.http.post(`${BASE_URL}/subscribe`, {
          endpoint: sub.endpoint,
          p256dh: sub.keys?.['p256dh'] ?? '',
          auth: sub.keys?.['auth'] ?? ''
        })
      );

      localStorage.setItem(VAPID_KEY, vapidPublicKey);
      this.setPref('on');
      this.subscribed.set(true);
      return { ok: true };
    } catch (err: any) {
      this.subscribed.set(false);
      const reason = err?.name === 'AbortError' || String(err?.message).includes('push service')
        ? 'push-service-blocked'
        : (err?.message || 'subscribe-failed');
      console.warn('[WebPush] Subscription could not be completed:', reason);
      return { ok: false, reason };
    }
  }

  private async fetchVapidKey(): Promise<string> {
    try {
      const res: any = await firstValueFrom(this.http.get(`${BASE_URL}/vapid-public-key`));
      return res?.publicKey ?? '';
    } catch (err: any) {
      if (err?.status === 404 || err?.status === 0) {
        console.info('[WebPush] Push endpoint unavailable — backend may still be warming up.');
      } else {
        console.warn('[WebPush] Could not fetch VAPID key:', err?.message || err);
      }
      return '';
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
