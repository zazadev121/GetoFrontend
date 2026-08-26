import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { PrivacyPolicyModalComponent } from '../../shared/components/privacy-policy-modal/privacy-policy-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    TranslatePipe, 
    PrivacyPolicyModalComponent
  ],
  template: `
    <div class="min-h-[90vh] flex items-center justify-center p-4 py-8">
      <div class="glass-card max-w-lg w-full p-8 border-slate-700/50 relative overflow-hidden shadow-2xl">
        <!-- Ambient background glow -->
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="text-center mb-6 relative z-10">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-500/30 mb-3 transform hover:scale-105 transition-transform">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-white font-heading tracking-tight">
            {{ 'auth.registerBtn' | translate }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 mt-1">Register to start submitting and managing documents</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4 relative z-10">
          <!-- Name & Last Name Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold" for="reg-name">
                {{ 'auth.name' | translate }}
              </label>
              <div class="relative flex items-center">
                <i class="fa-solid fa-user absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
                <input 
                  id="reg-name"
                  type="text" 
                  formControlName="name"
                  placeholder="John"
                  class="form-control !pl-10 text-sm"
                  [ngClass]="{'!border-rose-500/60': isFieldInvalid('name')}">
              </div>
              <div *ngIf="isFieldInvalid('name')" class="form-error">
                First name is required
              </div>
            </div>

            <div>
              <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold" for="reg-lastname">
                {{ 'auth.lastName' | translate }}
              </label>
              <div class="relative flex items-center">
                <i class="fa-solid fa-user-tag absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
                <input 
                  id="reg-lastname"
                  type="text" 
                  formControlName="lastName"
                  placeholder="Doe"
                  class="form-control !pl-10 text-sm"
                  [ngClass]="{'!border-rose-500/60': isFieldInvalid('lastName')}">
              </div>
              <div *ngIf="isFieldInvalid('lastName')" class="form-error">
                Last name is required
              </div>
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold" for="reg-email">
              {{ 'auth.email' | translate }}
            </label>
            <div class="relative flex items-center">
              <i class="fa-solid fa-envelope absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
              <input 
                id="reg-email"
                type="email" 
                formControlName="email"
                placeholder="name@example.com"
                class="form-control !pl-10 text-sm"
                [ngClass]="{'!border-rose-500/60': isFieldInvalid('email')}">
            </div>
            <div *ngIf="isFieldInvalid('email')" class="form-error">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email address is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
            </div>
          </div>

          <!-- Phone Number Field -->
          <div>
            <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold" for="reg-phone">
              {{ 'auth.phone' | translate }}
            </label>
            <div class="relative flex items-center">
              <i class="fa-solid fa-phone absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
              <input 
                id="reg-phone"
                type="tel" 
                formControlName="phonenumber"
                placeholder="+1 555 019 2834"
                class="form-control !pl-10 text-sm"
                [ngClass]="{'!border-rose-500/60': isFieldInvalid('phonenumber')}">
            </div>
            <div *ngIf="isFieldInvalid('phonenumber')" class="form-error">
              Phone number is required
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label class="form-label text-xs uppercase tracking-wider text-slate-300 font-semibold" for="reg-password">
              {{ 'auth.password' | translate }}
            </label>
            <div class="relative flex items-center">
              <i class="fa-solid fa-key absolute left-3.5 text-slate-400 text-sm pointer-events-none"></i>
              <input 
                id="reg-password"
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password"
                placeholder="At least 6 characters"
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
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <!-- Terms & Privacy Checkbox -->
          <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <label class="flex items-start gap-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                formControlName="agreeTerms"
                class="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500">
              <span class="text-xs text-slate-300">
                {{ 'privacy.checkbox' | translate }}
              </span>
            </label>
            <div class="text-right">
              <button 
                type="button" 
                (click)="showTermsModal = true" 
                class="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline">
                <i class="fa-solid fa-file-contract"></i> Read Full Terms & Policy
              </button>
            </div>
            <div *ngIf="isFieldInvalid('agreeTerms')" class="form-error text-[11px]">
              You must agree to the privacy policy to register.
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="registerForm.invalid || isLoading"
            class="btn btn-primary w-full mt-4 py-3 font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25">
            <span *ngIf="!isLoading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-user-plus"></i> {{ 'auth.registerBtn' | translate }}
            </span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...
            </span>
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-400 relative z-10">
          Already have an account? 
          <a routerLink="/auth/login" class="text-blue-400 font-bold hover:text-blue-300 transition-colors ml-1">
            {{ 'auth.loginBtn' | translate }}
          </a>
        </div>
      </div>

      <!-- Privacy Policy Terms Modal -->
      <app-privacy-policy-modal
        [isOpen]="showTermsModal"
        [canCloseWithoutAgree]="true"
        (agreed)="onTermsAgreedFromModal()"
        (cancelled)="showTermsModal = false">
      </app-privacy-policy-modal>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  translationService = inject(TranslationService);
  private router = inject(Router);

  isLoading = false;
  showPassword = false;
  showTermsModal = false;

  registerForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phonenumber: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    agreeTerms: [false, Validators.requiredTrue]
  });

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onTermsAgreedFromModal() {
    this.registerForm.patchValue({ agreeTerms: true });
    this.showTermsModal = false;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { agreeTerms, ...formData } = this.registerForm.value as any;

    this.authService.register(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200) {
          this.notificationService.success('Registration successful! Please check your email for the verification code.', 'Account Created');
          this.router.navigate(['/auth/verify-email'], { 
            queryParams: { email: formData.email } 
          });
        } else {
          this.notificationService.error(res.message || 'Registration failed', 'Error');
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
