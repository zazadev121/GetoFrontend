import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div 
        *ngFor="let toast of notificationService.toasts()" 
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-slide-in"
        [ngClass]="{
          'bg-emerald-950/80 border-emerald-500/30 text-emerald-100': toast.type === 'success',
          'bg-rose-950/80 border-rose-500/30 text-rose-100': toast.type === 'error',
          'bg-amber-950/80 border-amber-500/30 text-amber-100': toast.type === 'warning',
          'bg-blue-950/80 border-blue-500/30 text-blue-100': toast.type === 'info'
        }">
        <div class="text-xl mt-0.5">
          <i class="fa-solid" [ngClass]="{
            'fa-circle-check text-emerald-400': toast.type === 'success',
            'fa-circle-xmark text-rose-400': toast.type === 'error',
            'fa-triangle-exclamation text-amber-400': toast.type === 'warning',
            'fa-circle-info text-blue-400': toast.type === 'info'
          }"></i>
        </div>
        <div class="flex-1">
          <h4 *ngIf="toast.title" class="font-bold text-sm leading-tight mb-1">{{ toast.title }}</h4>
          <p class="text-xs opacity-90 leading-relaxed">{{ toast.message }}</p>
        </div>
        <button 
          (click)="notificationService.remove(toast.id)" 
          class="text-xs opacity-60 hover:opacity-100 transition-opacity p-1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
