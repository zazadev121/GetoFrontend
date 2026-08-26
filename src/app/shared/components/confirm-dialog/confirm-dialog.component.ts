import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div class="glass-card max-w-md w-full p-6 border-slate-700/50 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ title }}</h3>
            <p class="text-xs text-slate-400">Action cannot be undone</p>
          </div>
        </div>

        <p class="text-sm text-slate-300 leading-relaxed">{{ message }}</p>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button (click)="onCancel()" class="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button (click)="onConfirm()" class="btn btn-danger btn-sm">
            <i class="fa-solid fa-trash-can"></i> {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
