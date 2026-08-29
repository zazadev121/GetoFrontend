import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { SealBadgeComponent } from '../../shared/components/seal-badge/seal-badge.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, SealBadgeComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div class="grid lg:grid-cols-[1fr_minmax(0,26rem)] gap-10 lg:gap-16 items-center">

        <!-- Editorial side: the welcome, set large -->
        <div class="hidden lg:block space-y-6 relative">
          <div class="wash w-[24rem] h-[24rem] -top-32 -left-20" style="background: rgb(var(--c-clay-500) / .22)"></div>

          <div class="relative z-10 space-y-6">
            <p class="eyebrow">GETO Portal</p>
            <h1 class="display-xl text-white">{{ 'auth.welcome' | translate }}</h1>
            <p class="display-lead text-slate-300 max-w-md">{{ 'auth.loginSub' | translate }}</p>

            <div class="pill-stack pt-2">
              <span class="pill-tag pill-tag--clay">{{ translationService.isGeorgian() ? 'დოკუმენტაცია' : 'Documents' }}</span>
              <span class="pill-tag pill-tag--sage">{{ translationService.isGeorgian() ? 'სტატუსი რეალურ დროში' : 'Live status' }}</span>
              <span class="pill-tag">{{ translationService.isGeorgian() ? 'შეტყობინებები' : 'Notifications' }}</span>
            </div>

            <div class="pt-4">
              <app-seal-badge class="inline-block" text="GETO PROJECT · SIGN IN · SHESVLA · " icon="fa-key"></app-seal-badge>
            </div>
          </div>
        </div>

        <!-- Form card -->
        <div class="paper-card w-full p-6 sm:p-8 relative overflow-hidden">
        <!-- Language switch -->
        <div class="absolute top-4 right-4 z-20">
          <button type="button" (click)="translationService.toggleLanguage()"
            class="icon-btn icon-btn-sm text-[11px] font-bold">
            {{ translationService.isGeorgian() ? 'GE' : 'EN' }}
          </button>
        </div>

        <div class="mb-7 relative z-10 space-y-2">
          <span class="w-14 h-14 blob blob-morph grid place-items-center text-xl text-blue-400"
            style="background: rgb(var(--c-clay-500) / .18)">
            <i class="fa-solid fa-lock"></i>
          </span>
          <h2 class="font-heading text-2xl font-extrabold text-white pt-2">{{ 'auth.welcome' | translate }}</h2>
          <p class="text-sm text-slate-400">{{ 'auth.loginSub' | translate }}</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5 relative z-10">
          <!-- Email Field -->
          <div>
            <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold" for="login-email">
              {{ 'auth.email' | translate }}
            </label>
            <div class="relative flex items-center">
              <i class="fa-solid fa-envelope absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
              <input 
                id="login-email"
                type="email" 
                formControlName="email"
                autocomplete="username"
                placeholder="name@example.com"
                class="form-control !pl-10 text-sm"
                [ngClass]="{'!border-rose-500/60': isFieldInvalid('email')}">
            </div>
            <div *ngIf="isFieldInvalid('email')" class="form-error">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span *ngIf="loginForm.get('email')?.errors?.['required']">{{ 'auth.emailRequired' | translate }}</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">{{ 'auth.emailValid' | translate }}</span>
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold mb-0" for="login-password">
                {{ 'auth.password' | translate }}
              </label>
              <a routerLink="/auth/reset-password" class="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {{ 'auth.forgotPassword' | translate }}
              </a>
            </div>
            <div class="relative flex items-center">
              <i class="fa-solid fa-key absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
              <input 
                id="login-password"
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="form-control !pl-10 !pr-10 text-sm"
                [ngClass]="{'!border-rose-500/60': isFieldInvalid('password')}">
              <button 
                type="button" 
                (click)="showPassword = !showPassword"
                class="absolute right-3 text-slate-400 hover:text-slate-200 p-1">
                <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
            <div *ngIf="isFieldInvalid('password')" class="form-error">
              <i class="fa-solid fa-circle-exclamation"></i>
              {{ 'auth.passwordRequired' | translate }}
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="btn btn-primary w-full mt-3 py-3 font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25">
            <span *ngIf="!isLoading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-right-to-bracket"></i> {{ 'auth.loginBtn' | translate }}
            </span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin"></i> {{ 'auth.authenticating' | translate }}
            </span>
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400 relative z-10">
          {{ 'auth.dontHaveAccount' | translate }}
          <a routerLink="/auth/register" class="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">
            {{ 'auth.createAccount' | translate }}
          </a>
        </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  showPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200) {
          this.notificationService.success('Logged in successfully!', 'Welcome Back');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.notificationService.error(res.message || 'Login failed', 'Authentication Failed');
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
