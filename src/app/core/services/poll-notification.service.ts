import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { NewsService } from './news.service';

const STORAGE_KEY = 'geto_poll_snapshot';
const POLL_INTERVAL_MS = 60_000; // 60 seconds

interface Snapshot {
  status: number;
  phase: number;
  latestNewsId: number;
}

@Injectable({ providedIn: 'root' })
export class PollNotificationService {
  private authService = inject(AuthService);
  private newsService = inject(NewsService);

  private intervalId: ReturnType<typeof setInterval> | null = null;

  // ─── Public API ─────────────────────────────────────────────
  async init(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;

    await this.requestPermission();
    await this.takeInitialSnapshot();
    this.startPolling();
  }

  destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ─── Permission ──────────────────────────────────────────────
  private async requestPermission(): Promise<void> {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private canNotify(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // ─── Snapshot helpers ────────────────────────────────────────
  private loadSnapshot(): Snapshot | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveSnapshot(snap: Snapshot): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  }

  private async takeInitialSnapshot(): Promise<void> {
    // Only write snapshot if we don't have one yet (fresh login)
    if (this.loadSnapshot()) return;

    let status = 0, phase = 0, latestNewsId = 0;

    await new Promise<void>(resolve => {
      this.authService.getProfile().subscribe({
        next: res => {
          if (res.statusCode === 200 && res.data) {
            status = Number(res.data.status);
            phase = Number(res.data.userPhase);
          }
          resolve();
        },
        error: () => resolve()
      });
    });

    await new Promise<void>(resolve => {
      this.newsService.getAllNews().subscribe({
        next: res => {
          if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
            latestNewsId = Math.max(...res.data.map((n: any) => n.id));
          }
          resolve();
        },
        error: () => resolve()
      });
    });

    this.saveSnapshot({ status, phase, latestNewsId });
  }

  // ─── Polling ─────────────────────────────────────────────────
  private startPolling(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  private poll(): void {
    if (!this.authService.isLoggedIn()) {
      this.destroy();
      return;
    }

    this.authService.getProfile().subscribe({
      next: res => {
        if (res.statusCode !== 200 || !res.data) return;
        const snap = this.loadSnapshot();
        if (!snap) return;

        const newStatus = Number(res.data.status);
        const newPhase = Number(res.data.userPhase);

        if (newStatus !== snap.status) {
          this.showNotification(
            this.getStatusTitle(newStatus),
            this.getStatusBody(newStatus),
            '/dashboard'
          );
          this.saveSnapshot({ ...snap, status: newStatus });
        }

        if (newPhase !== snap.phase) {
          this.showNotification(
            this.getPhaseTitle(newPhase),
            this.getPhaseBody(newPhase),
            '/dashboard'
          );
          this.saveSnapshot({ ...snap, phase: newPhase });
        }
      }
    });

    this.newsService.getAllNews().subscribe({
      next: res => {
        if (res.statusCode !== 200 || !Array.isArray(res.data) || res.data.length === 0) return;
        const snap = this.loadSnapshot();
        if (!snap) return;

        const maxId = Math.max(...res.data.map((n: any) => n.id));
        if (maxId > snap.latestNewsId) {
          const newest = res.data.find((n: any) => n.id === maxId);
          this.showNotification(
            '📰 სიახლე — GETO Project',
            newest?.title ?? 'ახალი სიახლე გამოქვეყნდა',
            `/news/${maxId}`
          );
          this.saveSnapshot({ ...snap, latestNewsId: maxId });
        }
      }
    });
  }

  // ─── Show notification ───────────────────────────────────────
  private showNotification(title: string, body: string, url: string): void {
    if (!this.canNotify()) return;
    const n = new Notification(title, {
      body,
      icon: '/recommendations/Geto Logo.jpg',
      badge: '/recommendations/Geto Logo.jpg',
      tag: `geto-${Date.now()}`,
      requireInteraction: false
    });
    n.onclick = () => {
      window.focus();
      window.location.href = url;
      n.close();
    };
  }

  // ─── Status labels ───────────────────────────────────────────
  private getStatusTitle(status: number): string {
    switch (status) {
      case 0: return '⏳ სტატუსი განახლდა — GETO Project';
      case 1: return '✅ სტატუსი განახლდა — GETO Project';
      case 2: return '❌ სტატუსი განახლდა — GETO Project';
      case 3: return '🔄 სტატუსი განახლდა — GETO Project';
      default: return '🔔 სტატუსი განახლდა — GETO Project';
    }
  }

  private getStatusBody(status: number): string {
    switch (status) {
      case 0: return 'თქვენი განაცხადი განხილვის პროცესშია.';
      case 1: return 'გილოცავთ! თქვენი დოკუმენტაცია დადასტურებულია.';
      case 2: return 'თქვენი განაცხადი უარყოფილია. დეტალებისთვის გადადით კაბინეტში.';
      case 3: return 'საჭიროა დოკუმენტების ხელახლა გამოგზავნა. გადახედეთ კაბინეტს.';
      default: return 'თქვენი სტატუსი შეიცვალა. გადახედეთ პირად კაბინეტს.';
    }
  }

  private getPhaseTitle(phase: number): string {
    switch (phase) {
      case 0: return '📋 I ეტაპი — GETO Project';
      case 1: return '📋 II ეტაპი — GETO Project';
      case 2: return '📋 III ეტაპი — GETO Project';
      case 3: return '📋 ეტაპი გაუქმდა — GETO Project';
      default: return '📋 ეტაპი განახლდა — GETO Project';
    }
  }

  private getPhaseBody(phase: number): string {
    switch (phase) {
      case 0: return 'I ეტაპი: გთხოვთ ატვირთოთ თქვენი რეზიუმე (CV).';
      case 1: return 'II ეტაპი: ჩამოტვირთეთ ხელშეკრულება, შეავსეთ და ატვირთეთ PDF-ად.';
      case 2: return 'III ეტაპი: გადმოგეცემათ სამუშაო ნებართვა. დეტალებისთვის ეწვიეთ კაბინეტს.';
      case 3: return 'თქვენი ეტაპი გაუქმებულია. კითხვებისთვის დაგვიკავშირდით.';
      default: return 'თქვენი ეტაპი განახლდა. გადახედეთ პირად კაბინეტს.';
    }
  }
}
