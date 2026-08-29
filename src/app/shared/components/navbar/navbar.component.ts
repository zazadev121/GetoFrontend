import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { WebPushService } from '../../../core/services/web-push.service';
import { PollNotificationService } from '../../../core/services/poll-notification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <header class="sticky top-0 z-50 w-full backdrop-blur-xl border-b" 
      [style.background-color]="themeService.isDark() ? 'rgba(9,13,22,0.92)' : 'rgba(255,255,255,0.96)'"
      [style.border-bottom-color]="themeService.isDark() ? 'rgba(255,255,255,0.08)' : '#e2e8f0'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          
          <!-- Logo -->
          <a routerLink="/" (click)="closeMobileMenu()" class="flex items-center gap-2.5 text-decoration-none group shrink-0">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-blue-500/30 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform shadow-md shrink-0"
              [style.background-color]="themeService.isDark() ? '#0f172a' : '#f1f5f9'">
              <img src="/recommendations/Geto Logo.jpg" alt="GETO Logo" class="w-full h-full object-cover rounded-lg">
            </div>
            <span class="font-extrabold text-lg tracking-tight font-heading"
              [style.color]="themeService.isDark() ? '#f8fafc' : '#0f172a'">
              GETO<span class="text-blue-500">Portal</span>
            </span>
          </a>

          <!-- Desktop Nav -->
          <nav class="hidden lg:flex items-center gap-0.5 xl:gap-1">
            <a *ngFor="let link of navLinks"
              [routerLink]="link.path" 
              routerLinkActive="active-nav-link"
              (click)="closeMobileMenu()"
              class="nav-item px-3 py-1.5 rounded-lg text-[13px] xl:text-sm font-medium transition-all flex items-center gap-1.5"
              [style.color]="themeService.isDark() ? '#94a3b8' : '#475569'">
              <i class="fa-solid text-xs" [ngClass]="link.icon" [style.color]="link.color"></i>
              {{ translationService.isGeorgian() ? link.labelKa : link.labelEn }}
            </a>

            <a *ngIf="authService.isLoggedIn()"
              routerLink="/dashboard" routerLinkActive="active-nav-link"
              class="nav-item px-3 py-1.5 rounded-lg text-[13px] xl:text-sm font-medium transition-all flex items-center gap-1.5"
              [style.color]="themeService.isDark() ? '#94a3b8' : '#475569'">
              <i class="fa-solid fa-user text-xs" style="color:#3b82f6"></i>
              {{ 'nav.cabinet' | translate }}
            </a>

            <a *ngIf="authService.isAdmin()"
              routerLink="/admin" routerLinkActive="active-nav-link"
              class="nav-item px-3 py-1.5 rounded-lg text-[13px] xl:text-sm font-medium transition-all flex items-center gap-1.5"
              [style.color]="themeService.isDark() ? '#94a3b8' : '#475569'">
              <i class="fa-solid fa-shield-halved text-xs" style="color:#ec4899"></i>
              {{ 'nav.admin' | translate }}
            </a>
          </nav>

          <!-- Desktop Right -->
          <div class="hidden lg:flex items-center gap-2">
            <button *ngIf="authService.isLoggedIn()" (click)="enableNotifications()"
              class="nav-btn p-2 rounded-lg border transition-all flex items-center justify-center relative"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="notificationPermission === 'granted' ? '#10b981' : (themeService.isDark() ? '#94a3b8' : '#64748b')"
              [title]="notificationPermission === 'granted' ? 'Chrome Notifications Enabled' : 'Click to Enable Chrome Notifications'">
              <i class="fa-solid" [ngClass]="notificationPermission === 'granted' ? 'fa-bell' : 'fa-bell-slash'"></i>
            </button>

            <button (click)="themeService.toggleTheme()"
              class="nav-btn p-2 rounded-lg border transition-all flex items-center justify-center"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="themeService.isDark() ? '#fbbf24' : '#6366f1'">
              <i class="fa-solid" [ngClass]="themeService.isDark() ? 'fa-sun' : 'fa-moon'"></i>
            </button>

            <button (click)="translationService.toggleLanguage()"
              class="nav-btn px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="themeService.isDark() ? '#cbd5e1' : '#334155'">
              {{ translationService.isGeorgian() ? 'GE' : 'EN' }}
            </button>

            <div *ngIf="authService.isLoggedIn()" class="flex items-center gap-2">
              <div class="text-right hidden xl:block">
                <div class="text-xs font-semibold truncate max-w-[120px]"
                  [style.color]="themeService.isDark() ? '#e2e8f0' : '#0f172a'">
                  {{ authService.currentUserSignal()?.name || 'User' }}
                </div>
                <div class="text-[10px] truncate max-w-[120px]"
                  [style.color]="themeService.isDark() ? '#64748b' : '#94a3b8'">
                  {{ authService.currentUserSignal()?.email }}
                </div>
              </div>
              <button (click)="authService.logout()"
                class="p-2 rounded-lg transition-all hover:bg-rose-500/10"
                [style.color]="themeService.isDark() ? '#94a3b8' : '#64748b'"
                [title]="'nav.logout' | translate">
                <i class="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>

            <div *ngIf="!authService.isLoggedIn()" class="flex items-center gap-2">
              <a routerLink="/auth/login" class="btn btn-secondary btn-sm text-xs">{{ 'nav.login' | translate }}</a>
              <a routerLink="/auth/register" class="btn btn-primary btn-sm text-xs">{{ 'nav.register' | translate }}</a>
            </div>
          </div>

          <!-- Mobile Controls -->
          <div class="flex items-center gap-1.5 lg:hidden">
            <button *ngIf="authService.isLoggedIn()" (click)="enableNotifications()"
              class="p-2 rounded-lg border flex items-center justify-center transition-all"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="notificationPermission === 'granted' ? '#10b981' : (themeService.isDark() ? '#94a3b8' : '#64748b')"
              [title]="notificationPermission === 'granted' ? 'Mobile Push Notifications Active' : 'Tap to Enable Mobile Push Notifications'">
              <i class="fa-solid text-sm" [ngClass]="notificationPermission === 'granted' ? 'fa-bell' : 'fa-bell-slash'"></i>
            </button>

            <button (click)="themeService.toggleTheme()"
              class="p-2 rounded-lg border"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="themeService.isDark() ? '#fbbf24' : '#6366f1'">
              <i class="fa-solid text-sm" [ngClass]="themeService.isDark() ? 'fa-sun' : 'fa-moon'"></i>
            </button>

            <button (click)="translationService.toggleLanguage()"
              class="px-2 py-1.5 rounded-lg border text-xs font-bold"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="themeService.isDark() ? '#cbd5e1' : '#334155'">
              {{ translationService.isGeorgian() ? 'GE' : 'EN' }}
            </button>

            <button (click)="toggleMobileMenu()"
              class="p-2 rounded-lg border"
              [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.8)' : '#f1f5f9'"
              [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.6)' : '#cbd5e1'"
              [style.color]="isMobileMenuOpen ? '#f87171' : (themeService.isDark() ? '#60a5fa' : '#3b82f6')"
              aria-label="Menu">
              <i class="fa-solid text-base" [ngClass]="isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'"></i>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Menu -->
      <div *ngIf="isMobileMenuOpen" 
        class="mobile-drawer lg:hidden fixed inset-x-0 top-14 sm:top-16 z-50 backdrop-blur-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-fade-in"
        [style.background-color]="themeService.isDark() ? 'rgba(9,13,22,0.97)' : 'rgba(255,255,255,0.98)'"
        [style.border-bottom]="themeService.isDark() ? '1px solid rgba(51,65,85,0.5)' : '1px solid #e2e8f0'">
        
        <nav class="flex flex-col gap-1">
          <a *ngFor="let link of navLinks"
            [routerLink]="link.path" (click)="closeMobileMenu()"
            routerLinkActive="active-nav-link"
            class="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 border border-transparent transition-all"
            [style.color]="themeService.isDark() ? '#e2e8f0' : '#1e293b'">
            <i class="fa-solid" [ngClass]="link.icon" [style.color]="link.color"></i>
            {{ translationService.isGeorgian() ? link.labelKa : link.labelEn }}
          </a>

          <a *ngIf="authService.isLoggedIn()"
            routerLink="/dashboard" (click)="closeMobileMenu()"
            routerLinkActive="active-nav-link"
            class="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 border border-transparent transition-all"
            [style.color]="themeService.isDark() ? '#e2e8f0' : '#1e293b'">
            <i class="fa-solid fa-user" style="color:#3b82f6"></i>
            {{ 'nav.cabinet' | translate }}
          </a>

          <a *ngIf="authService.isAdmin()"
            routerLink="/admin" (click)="closeMobileMenu()"
            routerLinkActive="active-nav-link"
            class="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 border border-transparent transition-all"
            [style.color]="themeService.isDark() ? '#e2e8f0' : '#1e293b'">
            <i class="fa-solid fa-shield-halved" style="color:#ec4899"></i>
            {{ 'nav.admin' | translate }}
          </a>
        </nav>

        <div class="pt-3" [style.border-top]="themeService.isDark() ? '1px solid rgba(51,65,85,0.5)' : '1px solid #e2e8f0'">
          <div *ngIf="authService.isLoggedIn()" 
            class="flex items-center justify-between p-3 rounded-xl border"
            [style.background-color]="themeService.isDark() ? 'rgba(15,23,42,0.6)' : '#f8fafc'"
            [style.border-color]="themeService.isDark() ? 'rgba(51,65,85,0.5)' : '#e2e8f0'">
            <div class="overflow-hidden">
              <div class="text-xs font-semibold truncate" [style.color]="themeService.isDark() ? '#e2e8f0' : '#0f172a'">
                {{ authService.currentUserSignal()?.name || 'User' }}
              </div>
              <div class="text-[10px] truncate" [style.color]="themeService.isDark() ? '#64748b' : '#94a3b8'">
                {{ authService.currentUserSignal()?.email }}
              </div>
            </div>
            <button (click)="authService.logout(); closeMobileMenu()" class="btn btn-danger btn-sm text-xs">
              Logout
            </button>
          </div>

          <div *ngIf="!authService.isLoggedIn()" class="grid grid-cols-2 gap-3">
            <a routerLink="/auth/login" (click)="closeMobileMenu()" class="btn btn-secondary text-xs text-center py-2.5">
              {{ 'nav.login' | translate }}
            </a>
            <a routerLink="/auth/register" (click)="closeMobileMenu()" class="btn btn-primary text-xs text-center py-2.5">
              {{ 'nav.register' | translate }}
            </a>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nav-item:hover { background: rgba(0,82,255,0.06); color: #0052ff !important; }
    .active-nav-link { background: rgba(0,82,255,0.08) !important; color: #3b82f6 !important; font-weight: 600; }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  themeService = inject(ThemeService);
  webPushService = inject(WebPushService);
  pollNotificationService = inject(PollNotificationService);
  notificationService = inject(NotificationService);
  isMobileMenuOpen = false;

  get notificationPermission(): string {
    return ('Notification' in window) ? Notification.permission : 'denied';
  }

  async enableNotifications() {
    if (!('Notification' in window)) {
      this.notificationService.warning('Notifications are not supported in this browser.', 'Not Supported');
      return;
    }

    // Request permission IMMEDIATELY on click gesture so Chrome presents its native popup modal
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }

    if (perm === 'denied') {
      this.notificationService.error(
        'Notifications blocked by browser. Click the Lock/Tune icon next to the URL in your address bar and select ALLOW.',
        'Permission Blocked'
      );
      return;
    }

    await this.pollNotificationService.init();
    await this.webPushService.init(true);

    if (perm === 'granted') {
      this.pollNotificationService.sendTestNotification();
      try {
        const res: any = await this.webPushService.sendTestPush();
        this.notificationService.success(res?.message || 'Test notification sent!', 'Notifications Active');
      } catch (err: any) {
        this.notificationService.success('Browser notifications active on this device.', 'Notifications Active');
      }
    }
  }

  navLinks = [
    { path: '/about', icon: 'fa-circle-info', color: '#3b82f6', labelEn: 'About', labelKa: 'ჩვენ შესახებ' },
    { path: '/news', icon: 'fa-newspaper', color: '#3b82f6', labelEn: 'News', labelKa: 'სიახლეები' },
    { path: '/german-course', icon: 'fa-language', color: '#10b981', labelEn: 'German Course', labelKa: 'გერმანული ენის კურსი' },
    { path: '/steuer', icon: 'fa-receipt', color: '#14b8a6', labelEn: 'Steuer', labelKa: 'შტოიერი' },
    { path: '/contact', icon: 'fa-phone', color: '#6366f1', labelEn: 'Contact', labelKa: 'კონტაქტი' },
  ];

  toggleMobileMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMobileMenu() { this.isMobileMenuOpen = false; }
}
