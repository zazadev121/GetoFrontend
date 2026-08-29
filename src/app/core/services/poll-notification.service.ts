import { Injectable, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NewsService } from './news.service';
import { WebPushService } from './web-push.service';
import { NotificationFeedService } from './notification-feed.service';
import { TranslationService } from './translation.service';

const SNAPSHOT_PREFIX = 'geto_poll_snapshot_v2_';
const ACTIVE_INTERVAL_MS = 45_000;
const IDLE_INTERVAL_MS = 180_000;
const MAX_BACKOFF_MS = 10 * 60_000;

interface Snapshot {
  status: number;
  phase: number;
  latestNewsId: number;
}

/**
 * Watches the user's application status, phase and the news feed, and raises a
 * notification when any of them changes.
 *
 * Notable fixes over the previous version:
 *  - the snapshot is keyed per user, so a second account on the same browser
 *    doesn't inherit the first one's state and fire phantom notifications;
 *  - status/phase/news are compared and written back in ONE atomic save, so two
 *    simultaneous changes can no longer overwrite each other and loop forever;
 *  - polling honours the user's own on/off preference, not just the browser
 *    permission, and stops entirely while the tab is hidden;
 *  - failures back off exponentially instead of hammering a sleeping backend.
 */
@Injectable({ providedIn: 'root' })
export class PollNotificationService {
  private authService = inject(AuthService);
  private newsService = inject(NewsService);
  private webPush = inject(WebPushService);
  private feed = inject(NotificationFeedService);
  private translation = inject(TranslationService);

  private timerId: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private inFlight = false;
  private failures = 0;
  private visibilityBound = false;

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  async init(): Promise<void> {
    if (this.running) return;
    if (!this.authService.isLoggedIn()) return;
    if (!this.canNotify()) return;

    this.running = true;
    this.failures = 0;
    this.bindVisibility();

    await this.ensureSnapshot();
    this.schedule(ACTIVE_INTERVAL_MS);
  }

  destroy(): void {
    this.running = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Drop every stored baseline — called on logout. It clears all of them rather
   * than the current user's, because by the time logout runs the auth claims are
   * already gone and there is no user id left to key on.
   */
  reset(): void {
    this.destroy();
    try {
      const stale: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(SNAPSHOT_PREFIX)) stale.push(key);
      }
      stale.forEach(key => localStorage.removeItem(key));
    } catch {
      /* private mode */
    }
  }

  // ─── Scheduling ──────────────────────────────────────────────────────────

  private bindVisibility(): void {
    if (this.visibilityBound || typeof document === 'undefined') return;
    this.visibilityBound = true;

    // A server push already told the user; move the baseline forward quietly so
    // the next poll doesn't repeat it.
    window.addEventListener('geto:push-received', () => this.rebaseline());

    document.addEventListener('visibilitychange', () => {
      if (!this.running) return;
      if (document.visibilityState === 'visible') {
        // Catch up immediately on return, then resume the normal cadence.
        this.schedule(1_000);
      } else {
        this.schedule(IDLE_INTERVAL_MS);
      }
    });
  }

  private schedule(delayMs: number): void {
    if (!this.running) return;
    if (this.timerId !== null) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => this.tick(), delayMs);
  }

  private nextDelay(): number {
    if (this.failures > 0) {
      return Math.min(ACTIVE_INTERVAL_MS * Math.pow(2, this.failures), MAX_BACKOFF_MS);
    }
    const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    return hidden ? IDLE_INTERVAL_MS : ACTIVE_INTERVAL_MS;
  }

  private canNotify(): boolean {
    return this.webPush.getPref() !== 'off'
      && typeof window !== 'undefined'
      && 'Notification' in window
      && Notification.permission === 'granted';
  }

  // ─── Snapshot ────────────────────────────────────────────────────────────

  private snapshotKey(): string | null {
    const userId = this.authService.currentUserSignal()?.userId;
    return userId ? `${SNAPSHOT_PREFIX}${userId}` : null;
  }

  private loadSnapshot(): Snapshot | null {
    const key = this.snapshotKey();
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed.status !== 'number') return null;
      return parsed as Snapshot;
    } catch {
      return null;
    }
  }

  private saveSnapshot(snap: Snapshot): void {
    const key = this.snapshotKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(snap));
    } catch {
      /* ignore quota errors */
    }
  }

  /** Moves the baseline to the current server state without notifying. */
  private rebaseline(): void {
    if (!this.authService.isLoggedIn()) return;
    this.fetchState().pipe(take(1)).subscribe({
      next: ({ profile, news }) => {
        const snap = this.toSnapshot(profile, news);
        if (snap) this.saveSnapshot(snap);
      },
      error: () => { /* the next poll will sort it out */ }
    });
  }

  /** Records the current server state as the baseline without notifying. */
  private ensureSnapshot(): Promise<void> {
    if (this.loadSnapshot()) return Promise.resolve();

    return new Promise<void>(resolve => {
      this.fetchState().pipe(take(1)).subscribe({
        next: ({ profile, news }) => {
          const snap = this.toSnapshot(profile, news);
          if (snap) this.saveSnapshot(snap);
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private fetchState() {
    return forkJoin({
      profile: this.authService.getProfile().pipe(take(1), catchError(() => of(null))),
      news: this.newsService.getAllNews().pipe(take(1), catchError(() => of(null)))
    }).pipe(take(1));
  }

  /** null when the profile call failed — we never baseline off a partial read. */
  private toSnapshot(profile: any, news: any): Snapshot | null {
    if (!profile || profile.statusCode !== 200 || !profile.data) return null;
    return {
      status: Number(profile.data.status),
      phase: Number(profile.data.userPhase),
      latestNewsId: this.latestNewsId(news)
    };
  }

  private newsItems(news: any): any[] {
    return news?.statusCode === 200 && Array.isArray(news.data) ? news.data : [];
  }

  private latestNewsId(news: any): number {
    const list = this.newsItems(news);
    return list.length ? Math.max(...list.map(n => Number(n.id) || 0)) : 0;
  }

  // ─── Polling ─────────────────────────────────────────────────────────────

  private tick(): void {
    if (!this.running) return;

    if (!this.authService.isLoggedIn() || !this.canNotify()) {
      this.destroy();
      return;
    }

    if (this.inFlight) {
      this.schedule(this.nextDelay());
      return;
    }
    this.inFlight = true;

    this.fetchState()
      .subscribe({
        next: ({ profile, news }) => {
          this.inFlight = false;

          const current = this.toSnapshot(profile, news);
          if (!current) {
            this.failures = Math.min(this.failures + 1, 6);
            this.schedule(this.nextDelay());
            return;
          }
          this.failures = 0;

          const newsList = this.newsItems(news);
          const snap = this.loadSnapshot();
          if (!snap) {
            // First successful read for this account — baseline only, stay quiet.
            this.saveSnapshot(current);
            this.schedule(this.nextDelay());
            return;
          }

          // Compare everything first, then write the whole snapshot exactly once.
          if (current.status !== snap.status) {
            this.notify(
              this.statusTitle(current.status),
              this.statusBody(current.status),
              '/dashboard',
              `status-${current.status}`
            );
          }

          if (current.phase !== snap.phase) {
            this.notify(
              this.phaseTitle(current.phase),
              this.phaseBody(current.phase),
              '/dashboard',
              `phase-${current.phase}`
            );
          }

          if (current.latestNewsId > snap.latestNewsId) {
            const newest = newsList.find(n => Number(n.id) === current.latestNewsId);
            this.notify(
              this.translation.isGeorgian() ? '📰 ახალი სიახლე — GETO Project' : '📰 New post — GETO Project',
              newest?.title ?? (this.translation.isGeorgian() ? 'ახალი სიახლე გამოქვეყნდა' : 'A new post was published'),
              `/news/${current.latestNewsId}`,
              `news-${current.latestNewsId}`
            );
          }

          this.saveSnapshot(current);
          this.schedule(this.nextDelay());
        },
        error: () => {
          this.inFlight = false;
          this.failures = Math.min(this.failures + 1, 6);
          this.schedule(this.nextDelay());
        }
      });
  }

  private notify(title: string, body: string, url: string, dedupeKey: string): void {
    // add() returns null when the same change was already announced recently,
    // which is what stops the old "same notification every 15 seconds" loop.
    if (!this.feed.add(title, body, url, dedupeKey)) return;
    void this.showOsNotification(title, body, url, dedupeKey);
  }

  private async showOsNotification(title: string, body: string, url: string, tag: string): Promise<void> {
    if (!this.canNotify()) return;

    const options: NotificationOptions = {
      body,
      icon: '/recommendations/Geto Logo.jpg',
      badge: '/recommendations/Geto Logo.jpg',
      tag: `geto-${tag}`,
      data: { url },
      requireInteraction: false
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, { ...options, renotify: true, vibrate: [200, 80, 200] } as NotificationOptions);
        return;
      }
    } catch {
      /* fall through to the page-level Notification */
    }

    try {
      const n = new Notification(title, options);
      n.onclick = () => { window.focus(); window.location.href = url; n.close(); };
    } catch {
      /* the in-app feed already has it */
    }
  }

  // ─── Copy ────────────────────────────────────────────────────────────────

  private ka(): boolean { return this.translation.isGeorgian(); }

  private statusTitle(status: number): string {
    const ka = this.ka();
    switch (status) {
      case 0: return ka ? '⏳ სტატუსი განახლდა — GETO Project' : '⏳ Status updated — GETO Project';
      case 1: return ka ? '✅ სტატუსი განახლდა — GETO Project' : '✅ Status updated — GETO Project';
      case 2: return ka ? '❌ სტატუსი განახლდა — GETO Project' : '❌ Status updated — GETO Project';
      case 3: return ka ? '🔄 სტატუსი განახლდა — GETO Project' : '🔄 Status updated — GETO Project';
      default: return ka ? '🔔 სტატუსი განახლდა — GETO Project' : '🔔 Status updated — GETO Project';
    }
  }

  private statusBody(status: number): string {
    const ka = this.ka();
    switch (status) {
      case 0: return ka ? 'თქვენი განაცხადი განხილვის პროცესშია.' : 'Your application is under review.';
      case 1: return ka ? 'გილოცავთ! თქვენი დოკუმენტაცია დადასტურებულია.' : 'Congratulations — your documents were approved.';
      case 2: return ka ? 'თქვენი განაცხადი უარყოფილია. დეტალებისთვის გადადით კაბინეტში.' : 'Your application was rejected. Open your cabinet for details.';
      case 3: return ka ? 'საჭიროა დოკუმენტების ხელახლა გამოგზავნა. გადახედეთ კაბინეტს.' : 'Documents need to be resubmitted. Please check your cabinet.';
      default: return ka ? 'თქვენი სტატუსი შეიცვალა. გადახედეთ პირად კაბინეტს.' : 'Your status changed. Please check your cabinet.';
    }
  }

  private phaseTitle(phase: number): string {
    const ka = this.ka();
    switch (phase) {
      case 0: return ka ? '📋 I ეტაპი — GETO Project' : '📋 Stage I — GETO Project';
      case 1: return ka ? '📋 II ეტაპი — GETO Project' : '📋 Stage II — GETO Project';
      case 2: return ka ? '📋 III ეტაპი — GETO Project' : '📋 Stage III — GETO Project';
      case 3: return ka ? '📋 ეტაპი გაუქმდა — GETO Project' : '📋 Stage cancelled — GETO Project';
      default: return ka ? '📋 ეტაპი განახლდა — GETO Project' : '📋 Stage updated — GETO Project';
    }
  }

  private phaseBody(phase: number): string {
    const ka = this.ka();
    switch (phase) {
      case 0: return ka ? 'I ეტაპი: გთხოვთ ატვირთოთ თქვენი რეზიუმე (CV).' : 'Stage I: please upload your CV.';
      case 1: return ka ? 'II ეტაპი: ჩამოტვირთეთ ხელშეკრულება, შეავსეთ და ატვირთეთ PDF-ად.' : 'Stage II: download the contract, complete it and upload it as a PDF.';
      case 2: return ka ? 'III ეტაპი: გადმოგეცემათ სამუშაო ნებართვა. დეტალებისთვის ეწვიეთ კაბინეტს.' : 'Stage III: your work permit is being issued. See your cabinet for details.';
      case 3: return ka ? 'თქვენი ეტაპი გაუქმებულია. კითხვებისთვის დაგვიკავშირდით.' : 'Your stage was cancelled. Contact us with any questions.';
      default: return ka ? 'თქვენი ეტაპი განახლდა. გადახედეთ პირად კაბინეტს.' : 'Your stage was updated. Please check your cabinet.';
    }
  }
}
