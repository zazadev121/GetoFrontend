import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { WebPushService } from '../../../core/services/web-push.service';
import { PollNotificationService } from '../../../core/services/poll-notification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

const SNOOZE_KEY = 'geto_notify_nudge_until';
const SNOOZE_DAYS = 7;

/**
 * A soft pre-prompt.
 *
 * Browsers only grant one shot at the native permission dialog per site — a
 * dismissal there is close to permanent. So we ask in our own UI first and only
 * raise the real popup once the user taps "Enable", straight from that click.
 */
@Component({
  selector: 'app-notification-prompt',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="visible()"
      class="fixed z-[70] left-3 right-3 sm:left-auto sm:right-6 sm:w-[22rem]
             bottom-3 sm:bottom-6 animate-rise"
      style="bottom: calc(0.75rem + env(safe-area-inset-bottom));">

      <div class="paper-card p-4 sm:p-5 flex items-start gap-3.5">
        <div class="w-11 h-11 rounded-2xl grid place-items-center shrink-0
                    bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse-ring">
          <i class="fa-solid fa-bell"></i>
        </div>

        <div class="min-w-0 flex-1 relative z-10">
          <h4 class="font-heading font-bold text-sm text-white leading-tight">
            {{ 'notify.nudgeTitle' | translate }}
          </h4>
          <p class="text-xs text-slate-400 leading-relaxed mt-1">
            {{ 'notify.nudgeBody' | translate }}
          </p>

          <div class="flex items-center gap-2 mt-3">
            <button type="button" (click)="enable()" [disabled]="busy" class="btn btn-primary btn-sm flex-1">
              {{ 'notify.allow' | translate }}
            </button>
            <button type="button" (click)="snooze()" class="btn btn-ghost btn-sm">
              {{ 'notify.nudgeLater' | translate }}
            </button>
          </div>
        </div>

        <button type="button" (click)="snooze()" aria-label="Dismiss"
          class="text-slate-500 hover:text-slate-300 transition-colors p-1 -m-1 relative z-10">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
    </div>
  `
})
export class NotificationPromptComponent {
  private auth = inject(AuthService);
  private webPush = inject(WebPushService);
  private poll = inject(PollNotificationService);
  private toast = inject(NotificationService);
  private translation = inject(TranslationService);

  busy = false;
  private snoozed = signal(this.isSnoozed());
  private armed = signal(false);

  visible = computed(() =>
    this.armed()
    && !this.snoozed()
    && this.auth.isLoggedIn()
    && this.webPush.status() === 'default'
  );

  constructor() {
    // Give the page a moment to settle before sliding anything in.
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();
      untracked(() => {
        if (!loggedIn) { this.armed.set(false); return; }
        setTimeout(() => this.armed.set(true), 3500);
      });
    });
  }

  async enable() {
    this.busy = true;
    try {
      const result = await this.webPush.enable();
      const t = (k: string) => this.translation.t(k);

      if (result.granted) {
        await this.poll.init();
        await this.webPush.showLocalNotification('🔔 GETO Project', t('notify.testBody'));
        this.toast.success(t('notify.granted'), t('notify.title'));
      } else if (result.status === 'denied') {
        this.toast.error(t('notify.blockedHelp'), t('notify.statusBlocked'));
        this.snooze();
      } else {
        this.snooze();
      }
    } finally {
      this.busy = false;
    }
  }

  snooze() {
    const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    try { localStorage.setItem(SNOOZE_KEY, String(until)); } catch { /* private mode */ }
    this.snoozed.set(true);
  }

  private isSnoozed(): boolean {
    try {
      const raw = localStorage.getItem(SNOOZE_KEY);
      return !!raw && Number(raw) > Date.now();
    } catch {
      return false;
    }
  }
}
