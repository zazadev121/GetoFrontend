import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';
import { WebPushService } from '../../../core/services/web-push.service';
import { PollNotificationService } from '../../../core/services/poll-notification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      (click)="onBackdrop($event)">
      <div class="max-w-md w-full rounded-2xl border shadow-2xl p-6 space-y-5"
        [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.98)' : '#ffffff'"
        [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.8)' : '#e2e8f0'"
        (click)="$event.stopPropagation()">

        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
              [style.background-color]="isOn() ? 'rgba(16,185,129,0.18)' : 'rgba(59,130,246,0.18)'"
              [style.color]="isOn() ? '#34d399' : '#60a5fa'">
              <i class="fa-solid" [ngClass]="isOn() ? 'fa-bell' : 'fa-bell-slash'"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold font-heading"
                [style.color]="themeService.isDark() ? '#f8fafc' : '#0f172a'">
                {{ 'notify.title' | translate }}
              </h3>
              <p class="text-xs mt-0.5" [style.color]="themeService.isDark() ? '#94a3b8' : '#64748b'">
                {{ statusLabelKey() | translate }}
              </p>
            </div>
          </div>
          <button type="button" (click)="close()" class="p-1.5 rounded-lg"
            [style.color]="themeService.isDark() ? '#94a3b8' : '#64748b'">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <p class="text-sm leading-relaxed" [style.color]="themeService.isDark() ? '#cbd5e1' : '#334155'">
          {{ 'notify.body' | translate }}
        </p>

        <div *ngIf="webPushService.permission() === 'denied'"
          class="text-xs rounded-xl border p-3 leading-relaxed"
          [style.background-color]="themeService.isDark() ? 'rgba(244,63,94,0.1)' : '#fff1f2'"
          [style.border-color]="themeService.isDark() ? 'rgba(244,63,94,0.35)' : '#fecdd3'"
          [style.color]="themeService.isDark() ? '#fda4af' : '#9f1239'">
          {{ 'notify.blockedHelp' | translate }}
        </div>

        <div class="flex flex-col sm:flex-row gap-2 pt-1">
          <button *ngIf="!isOn()"
            type="button"
            (click)="allow()"
            [disabled]="busy"
            class="btn btn-primary flex-1 text-sm py-2.5 disabled:opacity-60">
            <i class="fa-solid fa-check"></i>
            {{ 'notify.allow' | translate }}
          </button>

          <button *ngIf="isOn()"
            type="button"
            (click)="test()"
            [disabled]="busy"
            class="btn btn-secondary flex-1 text-sm py-2.5 disabled:opacity-60">
            <i class="fa-solid fa-paper-plane"></i>
            {{ 'notify.test' | translate }}
          </button>

          <button *ngIf="isOn()"
            type="button"
            (click)="decline()"
            [disabled]="busy"
            class="btn btn-danger flex-1 text-sm py-2.5 disabled:opacity-60">
            <i class="fa-solid fa-bell-slash"></i>
            {{ 'notify.turnOff' | translate }}
          </button>

          <button *ngIf="!isOn()"
            type="button"
            (click)="decline()"
            [disabled]="busy"
            class="btn btn-secondary flex-1 text-sm py-2.5 disabled:opacity-60">
            {{ 'notify.decline' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationSettingsComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  themeService = inject(ThemeService);
  translationService = inject(TranslationService);
  webPushService = inject(WebPushService);
  pollNotificationService = inject(PollNotificationService);
  notificationService = inject(NotificationService);

  busy = false;

  isOn(): boolean {
    return this.webPushService.enabled();
  }

  statusLabelKey(): string {
    const p = this.webPushService.permission();
    if (p === 'unsupported') return 'notify.statusUnsupported';
    if (p === 'denied') return 'notify.statusBlocked';
    if (this.isOn()) return 'notify.statusOn';
    return 'notify.statusOff';
  }

  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.close();
  }

  close() {
    this.closed.emit();
  }

  async allow() {
    this.busy = true;
    try {
      const result = await this.webPushService.enableFromUserGesture();
      if (result === 'unsupported') {
        this.notificationService.warning(
          this.translationService.t('notify.notSupported'),
          this.translationService.t('notify.title')
        );
        return;
      }
      if (result === 'denied') {
        this.notificationService.error(
          this.translationService.t('notify.blockedHelp'),
          this.translationService.t('notify.statusBlocked')
        );
        return;
      }
      if (result === 'granted') {
        await this.pollNotificationService.init();
        await this.webPushService.showLocalNotification(
          '🔔 GETO Project',
          this.translationService.t('notify.testBody')
        );
        try {
          const res: any = await this.webPushService.sendTestPush();
          this.notificationService.success(res?.message || this.translationService.t('notify.active'), this.translationService.t('notify.title'));
        } catch {
          this.notificationService.success(this.translationService.t('notify.active'), this.translationService.t('notify.title'));
        }
      }
    } finally {
      this.busy = false;
    }
  }

  async decline() {
    this.busy = true;
    try {
      if (this.isOn()) {
        await this.webPushService.disableFromUser();
        this.pollNotificationService.destroy();
        this.notificationService.info(this.translationService.t('notify.turnedOff'), this.translationService.t('notify.title'));
      } else {
        this.webPushService.declineForNow();
      }
      this.close();
    } finally {
      this.busy = false;
    }
  }

  async test() {
    this.busy = true;
    try {
      await this.webPushService.showLocalNotification(
        '🔔 GETO Project',
        this.translationService.t('notify.testBody')
      );
      try {
        const res: any = await this.webPushService.sendTestPush();
        this.notificationService.success(res?.message || this.translationService.t('notify.active'), this.translationService.t('notify.title'));
      } catch {
        this.notificationService.success(this.translationService.t('notify.active'), this.translationService.t('notify.title'));
      }
    } finally {
      this.busy = false;
    }
  }
}
