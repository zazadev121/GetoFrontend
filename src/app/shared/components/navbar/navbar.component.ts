import { Component, HostListener, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { WebPushService } from '../../../core/services/web-push.service';
import { PollNotificationService } from '../../../core/services/poll-notification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationFeedService } from '../../../core/services/notification-feed.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NotificationSettingsComponent } from '../notification-settings/notification-settings.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, NotificationSettingsComponent],
  template: `
    <header class="nav-shell">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-3">

          <!-- Mark -->
          <a routerLink="/" (click)="closeMobileMenu()" class="flex items-center gap-2.5 shrink-0 group no-underline">
            <span class="w-10 h-10 sm:w-12 sm:h-12 squircle bg-slate-900 border border-blue-500/30 grid place-items-center p-0.5
                         shadow-[0_6px_18px_-8px_rgba(0,0,0,.6)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
              <img src="/icons/icon-192.png" alt="GETO" class="w-full h-full object-cover squircle">
            </span>
            <span class="leading-none">
              <span class="block font-heading font-extrabold text-base sm:text-xl tracking-tight text-white">GETO</span>
              <span class="block text-[8px] sm:text-[10px] font-semibold tracking-[0.24em] uppercase text-blue-400 mt-0.5">Portal</span>
            </span>
          </a>

          <!-- Desktop nav pill -->
          <nav class="hidden lg:flex nav-pill">
            <a *ngFor="let link of navLinks"
              [routerLink]="link.path" routerLinkActive="active-nav-link"
              (click)="closeMobileMenu()" class="nav-link">
              <i class="fa-solid text-[11px] opacity-80" [ngClass]="link.icon"></i>
              {{ translationService.isGeorgian() ? link.labelKa : link.labelEn }}
            </a>

            <a *ngIf="authService.isLoggedIn()" routerLink="/dashboard" routerLinkActive="active-nav-link" class="nav-link">
              <i class="fa-solid fa-user text-[11px] opacity-80"></i>
              {{ 'nav.cabinet' | translate }}
            </a>

            <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active-nav-link" class="nav-link">
              <i class="fa-solid fa-shield-halved text-[11px] opacity-80"></i>
              {{ 'nav.admin' | translate }}
            </a>
          </nav>

          <!-- Controls -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">

            <!-- Bell: taps straight through to the browser's own permission popup -->
            <button *ngIf="authService.isLoggedIn()" type="button" (click)="onBellClick()"
              class="icon-btn nav-ctl relative"
              [class.animate-pulse-ring]="wantsAttention()"
              [style.color]="bellColor()"
              [attr.aria-label]="'notify.title' | translate"
              [title]="'notify.title' | translate">
              <i class="fa-solid text-sm" [ngClass]="bellIcon()"></i>
              <span *ngIf="feed.unreadCount() > 0"
                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white
                       text-[10px] font-bold grid place-items-center border-2 border-slate-950">
                {{ feed.unreadCount() > 9 ? '9+' : feed.unreadCount() }}
              </span>
            </button>

            <button type="button" (click)="themeService.toggleTheme()"
              class="icon-btn nav-ctl"
              [style.color]="themeService.isDark() ? 'rgb(var(--c-honey-400))' : 'rgb(var(--c-plum-400))'"
              aria-label="Toggle theme">
              <i class="fa-solid text-sm" [ngClass]="themeService.isDark() ? 'fa-sun' : 'fa-moon'"></i>
            </button>

            <button type="button" (click)="translationService.toggleLanguage()"
              class="icon-btn nav-ctl text-[11px] font-bold tracking-wide"
              aria-label="Toggle language">
              {{ translationService.isGeorgian() ? 'GE' : 'EN' }}
            </button>

            <!-- Logged in (desktop): identity + sign out -->
            <div *ngIf="authService.isLoggedIn()" class="hidden lg:flex items-center gap-2 pl-1">
              <div class="text-right hidden xl:block max-w-[140px]">
                <div class="text-xs font-semibold truncate text-white">
                  {{ authService.currentUserSignal()?.name || 'User' }}
                </div>
                <div class="text-[10px] truncate text-slate-500">
                  {{ authService.currentUserSignal()?.email }}
                </div>
              </div>
              <button type="button" (click)="authService.logout()" class="icon-btn icon-btn-sm"
                [title]="'nav.logout' | translate" aria-label="Log out">
                <i class="fa-solid fa-right-from-bracket text-sm"></i>
              </button>
            </div>

            <!-- Logged out (desktop): the one loud call to action -->
            <div *ngIf="!authService.isLoggedIn()" class="hidden lg:flex items-center gap-2 pl-1">
              <a routerLink="/auth/login" class="btn btn-secondary btn-sm">{{ 'nav.login' | translate }}</a>
              <a routerLink="/auth/register" class="btn btn-primary btn-sm">{{ 'nav.register' | translate }}</a>
            </div>

            <button type="button" (click)="toggleMobileMenu()"
              class="icon-btn nav-ctl lg:hidden"
              [attr.aria-expanded]="isMobileMenuOpen" aria-label="Menu">
              <i class="fa-solid text-sm" [ngClass]="isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile drawer -->
      <!-- Anchored to the header itself, so it always sits flush under the bar
           whatever the safe-area inset or control size works out to. -->
      <div *ngIf="isMobileMenuOpen"
        class="mobile-drawer lg:hidden absolute inset-x-0 top-full z-50 shadow-2xl p-4 space-y-4
               max-h-[80vh] overflow-y-auto animate-fade-in">

        <nav class="flex flex-col gap-1.5">
          <a *ngFor="let link of navLinks; let i = index"
            [routerLink]="link.path" (click)="closeMobileMenu()" routerLinkActive="active-nav-link"
            class="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-200
                   border border-slate-700/40 bg-slate-900 no-underline active:scale-[.98] transition-transform">
            <span class="w-9 h-9 rounded-xl grid place-items-center bg-blue-500/12 text-blue-400 shrink-0">
              <i class="fa-solid text-xs" [ngClass]="link.icon"></i>
            </span>
            {{ translationService.isGeorgian() ? link.labelKa : link.labelEn }}
          </a>

          <a *ngIf="authService.isLoggedIn()" routerLink="/dashboard" (click)="closeMobileMenu()"
            routerLinkActive="active-nav-link"
            class="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-200
                   border border-slate-700/40 bg-slate-900 no-underline active:scale-[.98] transition-transform">
            <span class="w-9 h-9 rounded-xl grid place-items-center bg-blue-500/12 text-blue-400 shrink-0">
              <i class="fa-solid fa-user text-xs"></i>
            </span>
            {{ 'nav.cabinet' | translate }}
          </a>

          <a *ngIf="authService.isAdmin()" routerLink="/admin" (click)="closeMobileMenu()"
            routerLinkActive="active-nav-link"
            class="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-slate-200
                   border border-slate-700/40 bg-slate-900 no-underline active:scale-[.98] transition-transform">
            <span class="w-9 h-9 rounded-xl grid place-items-center bg-pink-500/12 text-pink-400 shrink-0">
              <i class="fa-solid fa-shield-halved text-xs"></i>
            </span>
            {{ 'nav.admin' | translate }}
          </a>
        </nav>

        <div class="pt-3 border-t border-slate-700/40">
          <div *ngIf="authService.isLoggedIn()"
            class="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-700/40 bg-slate-900">
            <div class="min-w-0">
              <div class="text-xs font-semibold truncate text-white">
                {{ authService.currentUserSignal()?.name || 'User' }}
              </div>
              <div class="text-[10px] truncate text-slate-500">
                {{ authService.currentUserSignal()?.email }}
              </div>
            </div>
            <button type="button" (click)="authService.logout(); closeMobileMenu()" class="btn btn-danger btn-sm shrink-0">
              {{ 'nav.logout' | translate }}
            </button>
          </div>

          <div *ngIf="!authService.isLoggedIn()" class="grid grid-cols-2 gap-3">
            <a routerLink="/auth/login" (click)="closeMobileMenu()" class="btn btn-secondary btn-sm justify-center">
              {{ 'nav.login' | translate }}
            </a>
            <a routerLink="/auth/register" (click)="closeMobileMenu()" class="btn btn-primary btn-sm justify-center">
              {{ 'nav.register' | translate }}
            </a>
          </div>
        </div>
      </div>
    </header>

    <app-notification-settings
      [isOpen]="showNotificationSettings"
      (closed)="showNotificationSettings = false">
    </app-notification-settings>
  `,
  styles: [`
    :host { display: block; }
    @media (min-width: 400px) { .xs\\:block { display: block; } }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  themeService = inject(ThemeService);
  webPushService = inject(WebPushService);
  feed = inject(NotificationFeedService);

  private poll = inject(PollNotificationService);
  private toast = inject(NotificationService);

  isMobileMenuOpen = false;
  showNotificationSettings = false;

  /** Nudge the eye when notifications have never been set up. */
  wantsAttention = computed(() => this.webPushService.status() === 'default');

  bellIcon = computed(() => {
    switch (this.webPushService.status()) {
      case 'on': return 'fa-bell';
      case 'denied': return 'fa-bell-slash';
      default: return 'fa-bell';
    }
  });

  bellColor = computed(() => {
    switch (this.webPushService.status()) {
      case 'on': return 'rgb(var(--c-sage-400))';
      case 'denied': return 'rgb(var(--c-berry-400))';
      case 'default': return 'rgb(var(--c-clay-400))';
      default: return 'rgb(var(--c-n-400))';
    }
  });

  navLinks = [
    { path: '/about', icon: 'fa-circle-info', labelEn: 'About', labelKa: 'ჩვენ შესახებ' },
    { path: '/news', icon: 'fa-newspaper', labelEn: 'News', labelKa: 'სიახლეები' },
    { path: '/german-course', icon: 'fa-language', labelEn: 'German Course', labelKa: 'გერმანული ენის კურსი' },
    { path: '/steuer', icon: 'fa-receipt', labelEn: 'Steuer', labelKa: 'შტოიერი' }
  ];

  /**
   * One tap, one outcome.
   *
   * When the browser has never been asked we call requestPermission() straight
   * from this click, so Chrome's own "Show notifications / Allow — Block" popup
   * appears immediately. Anything else opens the panel, which explains exactly
   * what to do (including how to unblock) instead of leaving people to dig
   * through browser settings.
   */
  async onBellClick() {
    this.webPushService.refreshPermission();

    if (this.webPushService.status() !== 'default') {
      this.showNotificationSettings = true;
      return;
    }

    const t = (k: string) => this.translationService.t(k);
    const result = await this.webPushService.enable();

    if (result.granted) {
      await this.poll.init();
      await this.webPushService.showLocalNotification('🔔 GETO Project', t('notify.testBody'));
      if (result.warning) this.toast.warning(t('notify.syncWarning'), t('notify.title'));
      else this.toast.success(t('notify.granted'), t('notify.title'));
      return;
    }

    // Blocked, unsupported, or dismissed — open the panel with the fix-it steps.
    this.showNotificationSettings = true;
  }

  toggleMobileMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMobileMenu() { this.isMobileMenuOpen = false; }

  @HostListener('document:keydown.escape')
  onEscape() { this.closeMobileMenu(); }
}
