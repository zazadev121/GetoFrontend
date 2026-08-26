import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div class="glass-card max-w-md w-full p-8 border-slate-700/50 relative overflow-hidden shadow-2xl">
        <!-- Ambient background glows -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Embedded Language Selector Switcher -->
        <div class="absolute top-4 right-4 z-20">
          <button (click)="translationService.toggleLanguage()" 
            class="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-globe text-blue-400 text-xs"></i>
            {{ translationService.isGeorgian() ? 'GE' : 'EN' }}
          </button>
        </div>

        <div class="text-center mb-8 relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-500/30 mb-4 transform hover:scale-105 transition-transform">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-white font-heading tracking-tight">{{ 'auth.welcome' | translate }}</h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">{{ 'auth.loginSub' | translate }}</p>
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
