import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[85vh] flex items-center justify-center p-4">
      <div class="glass-card max-w-md w-full p-8 border-slate-700/50 relative overflow-hidden">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/30 mb-3">
            <i class="fa-solid fa-shield-check"></i>
          </div>
          <h2 class="text-2xl font-extrabold text-white font-heading">Verify Email</h2>
          <p class="text-sm text-slate-400 mt-1">Enter the 6-digit code sent to your email address</p>
        </div>

        <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Email Field -->
          <div>
            <label class="form-label" for="verify-email">Email Address</label>
            <input 
              id="verify-email"
              type="email" 
              formControlName="email"
              placeholder="name@example.com"
              class="form-control"
              [ngClass]="{'border-rose-500/60': isFieldInvalid('email')}">
            <div *ngIf="isFieldInvalid('email')" class="form-error">
              Valid email is required
            </div>
          </div>

          <!-- Code Field -->
          <div>
            <label class="form-label" for="verify-code">Verification Code</label>
            <input 
              id="verify-code"
              type="text" 
              formControlName="token"
              placeholder="e.g. 123456"
              class="form-control text-center tracking-widest font-mono text-lg font-bold"
              [ngClass]="{'border-rose-500/60': isFieldInvalid('token')}">
            <div *ngIf="isFieldInvalid('token')" class="form-error">
              Verification code is required
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="verifyForm.invalid || isLoading"
            class="btn btn-primary w-full mt-2 py-3">
            <span *ngIf="!isLoading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-check"></i> Verify & Continue
            </span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Verifying...
            </span>
          </button>
        </form>

        <!-- Resend Code Action -->
        <div class="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
          <p class="text-xs text-slate-400">Didn't receive the email code?</p>
          <button 
            (click)="onResendCode()" 
            [disabled]="isResending"
            class="btn btn-secondary btn-sm text-xs w-full py-2">
            <i class="fa-solid fa-paper-plane text-blue-400" [class.fa-spin]="isResending"></i>
            <span>{{ isResending ? 'Sending New Code...' : 'Resend Verification Code' }}</span>
          </button>

          <div class="pt-2">
            <a routerLink="/auth/login" class="text-xs text-slate-400 hover:text-white transition-colors">
              Return to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  isResending = false;

  verifyForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', Validators.required]
  });

  ngOnInit() {
    const emailParam = this.route.snapshot.queryParams['email'];
    if (emailParam) {
      this.verifyForm.patchValue({ email: emailParam });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.verifyForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, token } = this.verifyForm.value;

    this.authService.verifyEmail({ email: email!, token: token! }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200) {
          this.notificationService.success('Email verified successfully!', 'Verified');
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        } else {
          this.notificationService.error(res.message || 'Verification failed', 'Verification Error');
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onResendCode() {
    const email = this.verifyForm.get('email')?.value;
    if (!email) {
      this.notificationService.error('Please enter your email address to resend the code.', 'Email Required');
      return;
    }

    this.isResending = true;
    this.authService.resendCode(email).subscribe({
      next: (res) => {
        this.isResending = false;
        if (res.statusCode === 200) {
          this.notificationService.success('New verification code sent! Check your inbox.', 'Code Sent');
        } else {
          this.notificationService.error(res.message || 'Failed to resend code.', 'Error');
        }
      },
      error: () => {
        this.isResending = false;
      }
    });
  }
}
