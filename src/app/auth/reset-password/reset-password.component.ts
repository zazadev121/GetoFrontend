import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center p-4">
      <div class="glass-card max-w-md w-full p-8 border-slate-700/50 relative overflow-hidden">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-white text-xl shadow-lg shadow-amber-500/30 mb-3">
            <i class="fa-solid fa-key"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-white font-heading">Reset Password</h2>
          <p class="text-sm text-slate-400 mt-1">Request a reset code or submit your new password</p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-xl mb-6 border border-white/5">
          <button 
            type="button" 
            (click)="activeTab = 'request'"
            [ngClass]="activeTab === 'request' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
            class="py-2 text-xs rounded-lg transition-all">
            1. Request Code
          </button>
          <button 
            type="button" 
            (click)="activeTab = 'reset'"
            [ngClass]="activeTab === 'reset' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
            class="py-2 text-xs rounded-lg transition-all">
            2. Enter Code & New Password
          </button>
        </div>

        <!-- Tab 1: Forgot Password (Request Code) -->
        <form *ngIf="activeTab === 'request'" [formGroup]="requestForm" (ngSubmit)="onRequestCode()" class="space-y-4">
          <div>
            <label class="form-label" for="request-email">Account Email</label>
            <input 
              id="request-email"
              type="email" 
              formControlName="email"
              placeholder="name@example.com"
              class="form-control"
              [ngClass]="{'border-rose-500/60': isFieldInvalid(requestForm, 'email')}">
            <div *ngIf="isFieldInvalid(requestForm, 'email')" class="form-error">
              Valid email address required
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="requestForm.invalid || isRequesting"
            class="btn btn-primary w-full py-3">
            <span *ngIf="!isRequesting" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-paper-plane"></i> Send Reset Code
            </span>
            <span *ngIf="isRequesting" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Sending Email...
            </span>
          </button>
        </form>

        <!-- Tab 2: Reset Password Form -->
        <form *ngIf="activeTab === 'reset'" [formGroup]="resetForm" (ngSubmit)="onResetPassword()" class="space-y-4">
          <div>
            <label class="form-label" for="reset-email">Email Address</label>
            <input 
              id="reset-email"
              type="email" 
              formControlName="email"
              placeholder="name@example.com"
              class="form-control"
              [ngClass]="{'border-rose-500/60': isFieldInvalid(resetForm, 'email')}">
            <div *ngIf="isFieldInvalid(resetForm, 'email')" class="form-error">
              Valid email address required
            </div>
          </div>

          <div>
            <label class="form-label" for="reset-token">Reset Code (Token)</label>
            <input 
              id="reset-token"
              type="text" 
              formControlName="token"
              placeholder="Verification code received in email"
              class="form-control tracking-wider font-mono text-center"
              [ngClass]="{'border-rose-500/60': isFieldInvalid(resetForm, 'token')}">
            <div *ngIf="isFieldInvalid(resetForm, 'token')" class="form-error">
              Reset code is required
            </div>
          </div>

          <div>
            <label class="form-label" for="reset-password">New Password</label>
            <input 
              id="reset-password"
              type="password" 
              formControlName="newPassword"
              placeholder="At least 6 characters"
              class="form-control"
              [ngClass]="{'border-rose-500/60': isFieldInvalid(resetForm, 'newPassword')}">
            <div *ngIf="isFieldInvalid(resetForm, 'newPassword')" class="form-error">
              Password must be at least 6 characters
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="resetForm.invalid || isResetting"
            class="btn btn-primary w-full py-3">
            <span *ngIf="!isResetting" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-rotate"></i> Update Password
            </span>
            <span *ngIf="isResetting" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Updating...
            </span>
          </button>
        </form>

        <div class="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          Remembered your password? 
          <a routerLink="/auth/login" class="text-blue-400 font-semibold hover:text-blue-300 transition-colors ml-1">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  activeTab: 'request' | 'reset' = 'request';
  isRequesting = false;
  isResetting = false;

  requestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  isFieldInvalid(form: any, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onRequestCode() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isRequesting = true;
    const email = this.requestForm.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isRequesting = false;
        if (res.statusCode === 200) {
          this.notificationService.success('Reset code sent! Check your inbox.', 'Email Sent');
          this.resetForm.patchValue({ email });
          this.activeTab = 'reset';
        } else {
          this.notificationService.error(res.message || 'Failed to send reset code', 'Error');
        }
      },
      error: () => {
        this.isRequesting = false;
      }
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isResetting = true;
    const { email, token, newPassword } = this.resetForm.value;

    this.authService.resetPassword({ email: email!, token: token!, newPassword: newPassword! }).subscribe({
      next: (res) => {
        this.isResetting = false;
        if (res.statusCode === 200) {
          this.notificationService.success('Password updated successfully! Please log in with your new password.', 'Success');
          this.router.navigate(['/auth/login']);
        } else {
          this.notificationService.error(res.message || 'Failed to reset password', 'Error');
        }
      },
      error: () => {
        this.isResetting = false;
      }
    });
  }
}
