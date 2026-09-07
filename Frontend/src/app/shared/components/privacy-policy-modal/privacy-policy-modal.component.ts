import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-privacy-policy-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div class="glass-card max-w-3xl w-full p-6 sm:p-8 border-blue-500/30 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        
        <!-- Modal Header & Language Selector -->
        <div class="space-y-4 border-b border-white/10 pb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white font-heading">
                  {{ 'nav.terms' | translate }}
                </h3>
                <p class="text-xs text-slate-400">Geto Project Legal & Privacy Policy Documentation</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- In-Modal Language Toggle -->
              <button 
                type="button"
                (click)="translationService.toggleLanguage()"
                class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-blue-500/50 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 shadow-sm">
                <span class="text-sm">{{ translationService.isGeorgian() ? '🇬🇪' : '🇬🇧' }}</span>
                <span>{{ translationService.isGeorgian() ? 'KA' : 'EN' }}</span>
              </button>

              <button 
                *ngIf="canCloseWithoutAgree"
                (click)="onCancel()" 
                class="text-slate-400 hover:text-white p-1">
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Document Selector Tabs -->
          <div class="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/5">
            <button 
              type="button" 
              (click)="activeTab = 'policy'"
              [ngClass]="activeTab === 'policy' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
              class="py-2 px-3 text-xs rounded-lg transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-file-shield"></i>
              <span>{{ 'privacy.policyTitle' | translate }}</span>
            </button>
            <button 
              type="button" 
              (click)="activeTab = 'terms'"
              [ngClass]="activeTab === 'terms' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'"
              class="py-2 px-3 text-xs rounded-lg transition-all flex items-center justify-center gap-2">
              <i class="fa-solid fa-signature"></i>
              <span>{{ 'terms.consentTitle' | translate }}</span>
            </button>
          </div>
        </div>

        <!-- Tab 1: Privacy Policy Document (Text 2) -->
        <div *ngIf="activeTab === 'policy'" class="flex-1 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 class="font-bold text-white text-base">{{ 'privacy.policyTitle' | translate }}</h4>
            <span class="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{{ 'privacy.lastUpdated' | translate }}</span>
          </div>

          <p class="font-semibold text-slate-200">
            {{ 'privacy.policyIntro' | translate }}
          </p>

          <div class="space-y-4 pt-2">
            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec1Title' | translate }}</h5>
              <p>{{ 'privacy.sec1Body' | translate }}</p>
            </div>

            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec2Title' | translate }}</h5>
              <p>{{ 'privacy.sec2Body' | translate }}</p>
            </div>

            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec3Title' | translate }}</h5>
              <p>{{ 'privacy.sec3Body' | translate }}</p>
            </div>

            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec4Title' | translate }}</h5>
              <p>{{ 'privacy.sec4Body' | translate }}</p>
            </div>

            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec5Title' | translate }}</h5>
              <p>{{ 'privacy.sec5Body' | translate }}</p>
            </div>

            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec6Title' | translate }}</h5>
              <p>{{ 'privacy.sec6Body' | translate }}</p>
            </div>

            <div>
              <h5 class="font-bold text-blue-400 text-sm mb-1">{{ 'privacy.sec7Title' | translate }}</h5>
              <p>{{ 'privacy.sec7Body' | translate }}</p>
            </div>
          </div>
        </div>

        <!-- Tab 2: Consent Terms Document (Text 1) -->
        <div *ngIf="activeTab === 'terms'" class="flex-1 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <h4 class="font-bold text-white text-base border-b border-white/5 pb-2">{{ 'terms.consentTitle' | translate }}</h4>

          <p class="font-semibold text-slate-200">
            {{ 'terms.consentIntro' | translate }}
          </p>

          <div class="space-y-3">
            <p>{{ 'terms.p1' | translate }}</p>
            <p>{{ 'terms.p2' | translate }}</p>
            <p>{{ 'terms.p3' | translate }}</p>
            <p>{{ 'terms.p4' | translate }}</p>
            <p class="italic text-slate-400">{{ 'terms.p5' | translate }}</p>
          </div>
        </div>

        <!-- Checkbox & Confirmation Action -->
        <div class="space-y-4 pt-2 border-t border-white/10">
          <label class="flex items-start gap-3 cursor-pointer p-3 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
            <input 
              type="checkbox" 
              [(ngModel)]="isChecked" 
              class="w-5 h-5 mt-0.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500">
            <span class="text-xs sm:text-sm font-semibold text-slate-200">
              {{ 'terms.checkbox' | translate }}
            </span>
          </label>

          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <button 
                type="button"
                (click)="activeTab = activeTab === 'policy' ? 'terms' : 'policy'"
                class="text-xs text-blue-400 hover:text-blue-300 font-semibold underline">
                Switch to {{ activeTab === 'policy' ? 'Consent Terms' : 'Privacy Policy' }}
              </button>
            </div>

            <div class="flex items-center gap-3">
              <button 
                *ngIf="canCloseWithoutAgree"
                (click)="onCancel()" 
                class="btn btn-secondary btn-sm">
                Close
              </button>
              <button 
                (click)="onAgree()" 
                [disabled]="!isChecked"
                class="btn btn-primary py-2.5 px-6 font-bold shadow-lg shadow-blue-500/25">
                <i class="fa-solid fa-check-double"></i> {{ 'terms.acceptBtn' | translate }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PrivacyPolicyModalComponent {
  translationService = inject(TranslationService);

  @Input() isOpen = false;
  @Input() canCloseWithoutAgree = false;

  @Output() agreed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  activeTab: 'policy' | 'terms' = 'terms';
  isChecked = false;

  onAgree() {
    if (this.isChecked) {
      this.agreed.emit();
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}
