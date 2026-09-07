import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Bottom-anchored on phones (thumb reach, clear of the navbar), top-right on desktop -->
    <div class="fixed z-[90] pointer-events-none flex flex-col gap-2.5
                left-3 right-3 bottom-3 sm:left-auto sm:bottom-auto sm:top-24 sm:right-5 sm:w-[22rem]"
      style="bottom: calc(0.75rem + env(safe-area-inset-bottom));">

      <div *ngFor="let toast of notificationService.toasts()"
        class="pointer-events-auto paper-card flex items-start gap-3 p-3.5 sm:p-4 animate-slide-in"
        [ngClass]="{
          'border-emerald-500/40': toast.type === 'success',
          'border-rose-500/40': toast.type === 'error',
          'border-amber-500/40': toast.type === 'warning',
          'border-blue-500/40': toast.type === 'info'
        }">

        <span class="w-9 h-9 rounded-xl grid place-items-center text-sm shrink-0 relative z-10"
          [ngClass]="{
            'bg-emerald-500/15 text-emerald-400': toast.type === 'success',
            'bg-rose-500/15 text-rose-400': toast.type === 'error',
            'bg-amber-500/15 text-amber-400': toast.type === 'warning',
            'bg-blue-500/15 text-blue-400': toast.type === 'info'
          }">
          <i class="fa-solid" [ngClass]="{
            'fa-check': toast.type === 'success',
            'fa-xmark': toast.type === 'error',
            'fa-exclamation': toast.type === 'warning',
            'fa-info': toast.type === 'info'
          }"></i>
        </span>

        <div class="flex-1 min-w-0 relative z-10">
          <h4 *ngIf="toast.title" class="font-heading font-bold text-sm leading-tight text-white">{{ toast.title }}</h4>
          <p class="text-xs leading-relaxed text-slate-300 mt-0.5">{{ toast.message }}</p>
        </div>

        <button type="button" (click)="notificationService.remove(toast.id)"
          class="relative z-10 text-slate-500 hover:text-slate-300 transition-colors p-1 -m-1 shrink-0"
          aria-label="Dismiss">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
