import { Injectable, computed, signal } from '@angular/core';

export interface FeedItem {
  id: string;
  title: string;
  body: string;
  url: string;
  at: number;
  read: boolean;
}

const FEED_KEY = 'geto_feed_v1';
const MAX_ITEMS = 40;

/**
 * A small in-app notification history.
 *
 * Everything the app pushes to the OS is mirrored here, so the bell stays
 * useful even when the browser has notifications blocked, when the user is on
 * iOS Safari outside a home-screen install, or when a push arrived while the
 * tab was closed.
 */
@Injectable({ providedIn: 'root' })
export class NotificationFeedService {
  items = signal<FeedItem[]>(this.load());
  unreadCount = computed(() => this.items().filter(i => !i.read).length);

  /** Adds an item unless the same key was already recorded in the last 6 hours. */
  add(title: string, body: string, url = '/dashboard', dedupeKey?: string): FeedItem | null {
    const key = dedupeKey ?? `${title}|${body}`;
    const cutoff = Date.now() - 6 * 60 * 60 * 1000;

    if (this.items().some(i => i.id.startsWith(key) && i.at > cutoff)) return null;

    const item: FeedItem = {
      id: `${key}#${Date.now()}`,
      title,
      body,
      url,
      at: Date.now(),
      read: false
    };

    this.items.update(list => [item, ...list].slice(0, MAX_ITEMS));
    this.persist();
    return item;
  }

  markAllRead(): void {
    this.items.update(list => list.map(i => ({ ...i, read: true })));
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  private load(): FeedItem[] {
    try {
      const raw = localStorage.getItem(FEED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(FEED_KEY, JSON.stringify(this.items()));
    } catch {
      /* quota or private-mode — the feed is a convenience, never a hard dependency */
    }
  }
}
