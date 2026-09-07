import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { WebPushService } from '../../../core/services/web-push.service';
import { PollNotificationService } from '../../../core/services/poll-notification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationFeedService } from '../../../core/services/notification-feed.service';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen"
      class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog" aria-modal="true"
      (click)="onBackdrop($event)">

      <div class="paper-card w-full sm:max-w-md max-h-[88vh] overflow-y-auto
                  rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-6 space-y-5 animate-rise"
        style="padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));"
        (click)="$event.stopPropagation()">

        <!-- grab handle (mobile sheet affordance) -->
        <div class="sm:hidden w-10 h-1.5 rounded-full bg-slate-700 mx-auto -mt-1"></div>

        <!-- Header -->
        <div class="flex items-start justify-between gap-3 relative z-10">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 rounded-2xl grid place-items-center text-lg shrink-0"
              [ngClass]="isOn()
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'">
              <i class="fa-solid" [ngClass]="isOn() ? 'fa-bell' : 'fa-bell-slash'"></i>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-bold font-heading text-white leading-tight">
                {{ 'notify.title' | translate }}
              </h3>
              <p class="text-xs mt-0.5 text-slate-400 truncate">{{ statusLabelKey() | translate }}</p>
            </div>
          </div>
          <button type="button" (click)="close()" class="icon-btn icon-btn-sm shrink-0" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p class="text-sm leading-relaxed text-slate-300 relative z-10">
          {{ 'notify.body' | translate }}
        </p>

        <!-- Blocked: exact steps, so nobody has to hunt through browser settings -->
        <div *ngIf="status() === 'denied'"
          class="relative z-10 rounded-2xl border border-rose-500/35 bg-rose-500/10 p-4 space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-rose-400">
            <i class="fa-solid fa-lock mr-1.5"></i>{{ 'notify.unblockTitle' | translate }}
          </p>
          <ol class="text-xs leading-relaxed text-slate-200 space-y-1.5 list-none">
            <li><span class="font-bold text-rose-400 mr-1">1.</span>{{ 'notify.unblockStep1' | translate }}</li>
            <li><span class="font-bold text-rose-400 mr-1">2.</span>{{ 'notify.unblockStep2' | translate }}</li>
            <li><span class="font-bold text-rose-400 mr-1">3.</span>{{ 'notify.unblockStep3' | translate }}</li>
          </ol>
        </div>

        <!-- iOS: push requires a Home Screen install -->
        <div *ngIf="status() === 'needs-install'"
          class="relative z-10 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-amber-400">
            <i class="fa-brands fa-apple mr-1.5"></i>{{ 'notify.installTitle' | translate }}
          </p>
          <ol class="text-xs leading-relaxed text-slate-200 space-y-1.5 list-none">
            <li><span class="font-bold text-amber-400 mr-1">1.</span>{{ 'notify.installStep1' | translate }}</li>
            <li><span class="font-bold text-amber-400 mr-1">2.</span>{{ 'notify.installStep2' | translate }}</li>
            <li><span class="font-bold text-amber-400 mr-1">3.</span>{{ 'notify.installStep3' | translate }}</li>
          </ol>
        </div>

        <div *ngIf="status() === 'unsupported'"
          class="relative z-10 rounded-2xl border border-slate-700 bg-slate-950/50 p-4 text-xs text-slate-300">
          {{ 'notify.notSupported' | translate }}
        </div>

        <!-- Actions -->
        <div class="relative z-10 flex flex-col sm:flex-row gap-2">
          <button *ngIf="status() === 'default'" type="button" (click)="allow()" [disabled]="busy"
            class="btn btn-primary flex-1 text-sm">
            <i class="fa-solid fa-bell"></i>{{ 'notify.enable' | translate }}
          </button>

          <button *ngIf="status() === 'paused'" type="button" (click)="resume()" [disabled]="busy"
            class="btn btn-primary flex-1 text-sm">
            <i class="fa-solid fa-bell"></i>{{ 'notify.resume' | translate }}
          </button>

          <button *ngIf="isOn()" type="button" (click)="test()" [disabled]="busy"
            class="btn btn-secondary flex-1 text-sm">
            <i class="fa-solid fa-paper-plane"></i>{{ 'notify.test' | translate }}
          </button>

          <button *ngIf="isOn()" type="button" (click)="turnOff()" [disabled]="busy"
            class="btn btn-danger flex-1 text-sm">
            <i class="fa-solid fa-bell-slash"></i>{{ 'notify.turnOff' | translate }}
          </button>
        </div>

        <p *ngIf="status() === 'default'" class="relative z-10 text-[11px] text-slate-500 -mt-2 text-center">
          {{ 'notify.promptHint' | translate }}
        </p>

        <!-- Installing is the single biggest win for lock-screen delivery -->
        <div *ngIf="pwa.canInstall() && !pwa.isInstalled()"
          class="relative z-10 rounded-2xl border border-blue-500/35 bg-blue-500/10 p-4 space-y-3">
          <p class="text-xs leading-relaxed text-slate-200">
            <i class="fa-solid fa-mobile-screen-button mr-1.5 text-blue-400"></i>
            {{ 'notify.installWhy' | translate }}
          </p>
          <button type="button" (click)="installApp()" class="btn btn-secondary btn-sm w-full">
            <i class="fa-solid fa-download"></i>{{ 'notify.installApp' | translate }}
          </button>
        </div>

        <!-- Where the chain stands, in plain terms -->
        <div class="relative z-10 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3.5 space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {{ 'notify.diagTitle' | translate }}
          </p>

          <div class="flex items-center justify-between gap-3 text-xs">
            <span class="text-slate-400">{{ 'notify.diagDevice' | translate }}</span>
            <span class="font-semibold inline-flex items-center gap-1.5"
              [ngClass]="localSubscribed ? 'text-emerald-400' : 'text-slate-500'">
              <i class="fa-solid text-[10px]" [ngClass]="localSubscribed ? 'fa-circle-check' : 'fa-circle-minus'"></i>
              {{ (localSubscribed ? 'notify.diagRegistered' : 'notify.diagNotRegistered') | translate }}
            </span>
          </div>

          <div *ngIf="serverDeviceCount !== null" class="flex items-center justify-between gap-3 text-xs">
            <span class="text-slate-400">{{ 'notify.diagServer' | translate }}</span>
            <span class="font-semibold" [ngClass]="serverDeviceCount ? 'text-emerald-400' : 'text-slate-500'">
              {{ serverDeviceCount }}
            </span>
          </div>

          <p *ngIf="serverConfigured === false" class="text-[11px] text-rose-400 leading-relaxed">
            <i class="fa-solid fa-triangle-exclamation mr-1"></i>{{ 'notify.diagServerOff' | translate }}
          </p>

          <p *ngIf="pwa.isInstalled()" class="text-[11px] text-emerald-400">
            <i class="fa-solid fa-circle-check mr-1"></i>{{ 'notify.installed' | translate }}
          </p>
        </div>

        <!-- In-app history: keeps the bell useful even when the OS layer is off -->
        <div class="relative z-10 pt-4 border-t border-slate-700/50 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">
              {{ 'notify.recent' | translate }}
            </h4>
            <button *ngIf="feed.items().length" type="button" (click)="feed.clear()"
              class="text-[11px] text-slate-500 hover:text-blue-400 transition-colors">
              {{ 'notify.clearAll' | translate }}
            </button>
          </div>

          <p *ngIf="!feed.items().length" class="text-xs text-slate-500 leading-relaxed">
            {{ 'notify.noRecent' | translate }}
          </p>

          <ul class="space-y-2">
            <li *ngFor="let item of feed.items().slice(0, 8)">
              <button type="button" (click)="openItem(item.url)"
                class="w-full text-left rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3
                       hover:border-blue-500/40 transition-colors">
                <div class="flex items-start gap-2.5">
                  <span class="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    [ngClass]="item.read ? 'bg-slate-600' : 'bg-blue-500'"></span>
                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold text-slate-200 leading-snug">{{ item.title }}</p>
                    <p class="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">{{ item.body }}</p>
                    <p class="text-[10px] text-slate-500 mt-1">{{ item.at | date: 'short' }}</p>
                  </div>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class NotificationSettingsComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  private router = inject(Router);
  translationService = inject(TranslationService);
  webPushService = inject(WebPushService);
  pollNotificationService = inject(PollNotificationService);
  notificationService = inject(NotificationService);
  feed = inject(NotificationFeedService);
  pwa = inject(PwaInstallService);

  busy = false;
  localSubscribed: boolean | null = null;
  serverDeviceCount: number | null = null;
  serverConfigured: boolean | null = null;

  status = computed(() => this.webPushService.status());
  isOn = computed(() => this.status() === 'on');

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue) void this.refreshDiagnostics();
  }

  async refreshDiagnostics() {
    this.localSubscribed = await this.webPushService.hasLocalSubscription();
    const diag = await this.webPushService.fetchDiagnostics();
    this.serverDeviceCount = diag?.deviceCount ?? null;
    this.serverConfigured = diag?.serverConfigured ?? null;
  }

  async installApp() {
    await this.pwa.promptInstall();
  }

  statusLabelKey(): string {
    switch (this.status()) {
      case 'unsupported': return 'notify.statusUnsupported';
      case 'needs-install': return 'notify.statusNeedsInstall';
      case 'denied': return 'notify.statusBlocked';
      case 'paused': return 'notify.statusPaused';
      case 'on': return 'notify.statusOn';
      default: return 'notify.statusOff';
    }
  }

  onBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.close();
  }

  close() {
    this.feed.markAllRead();
    this.closed.emit();
  }

  openItem(url: string) {
    this.feed.markAllRead();
    this.closed.emit();
    this.router.navigateByUrl(url);
  }

  /** Raises the browser's own permission popup — must stay in the click path. */
  async allow() {
    this.busy = true;
    try {
      const result = await this.webPushService.enable();
      this.reportEnableResult(result.status, result.granted, result.warning);
      if (result.granted) {
        await this.pollNotificationService.init();
        await this.webPushService.showLocalNotification(
          '🔔 GETO Project',
          this.translationService.t('notify.testBody')
        );
        this.close();
      }
    } finally {
      this.busy = false;
    }
  }

  async resume() {
    this.busy = true;
    try {
      const result = await this.webPushService.resume();
      this.reportEnableResult(result.status, result.granted, result.warning);
      if (result.granted) {
        await this.pollNotificationService.init();
        this.close();
      }
    } finally {
      this.busy = false;
    }
  }

  async turnOff() {
    this.busy = true;
    try {
      await this.webPushService.disable();
      this.pollNotificationService.destroy();
      this.notificationService.info(
        this.translationService.t('notify.turnedOff'),
        this.translationService.t('notify.title')
      );
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
        this.notificationService.success(
          res?.message || this.translationService.t('notify.active'),
          this.translationService.t('notify.title')
        );
      } catch (err: any) {
        // A failed server push is the interesting case — it means notifications
        // will not arrive with the app closed, so say so instead of "success".
        const detail = err?.error?.failures?.[0] || err?.error?.message;
        this.notificationService.error(
          detail || this.translationService.t('notify.testFailed'),
          this.translationService.t('notify.title')
        );
      }
      await this.refreshDiagnostics();
    } finally {
      this.busy = false;
    }
  }

  private reportEnableResult(status: string, granted: boolean, warning?: string) {
    const t = (k: string) => this.translationService.t(k);

    if (granted) {
      if (warning) this.notificationService.warning(t('notify.syncWarning'), t('notify.title'));
      else this.notificationService.success(t('notify.granted'), t('notify.title'));
      return;
    }

    if (status === 'denied') {
      this.notificationService.error(t('notify.blockedHelp'), t('notify.statusBlocked'));
    } else if (status === 'needs-install') {
      this.notificationService.info(t('notify.statusNeedsInstall'), t('notify.title'));
    } else if (status === 'unsupported') {
      this.notificationService.warning(t('notify.notSupported'), t('notify.title'));
    } else {
      this.notificationService.info(t('notify.dismissed'), t('notify.title'));
    }
  }
}
