import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PrivacyPolicyModalComponent } from '../privacy-policy-modal/privacy-policy-modal.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, PrivacyPolicyModalComponent],
  template: `
    <footer class="py-8 border-t border-white/10 bg-slate-950/90 text-slate-400 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Brand & Copyright -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/30 p-0.5 bg-slate-900 flex items-center justify-center">
              <img src="/recommendations/Geto Logo.jpg" alt="GETO Logo" class="w-full h-full object-cover rounded">
            </div>
            <span class="font-bold text-slate-300 font-heading">GETO Project Portal</span>
            <span class="text-slate-600">&bull;</span>
            <span>&copy; 2026 All rights reserved.</span>
          </div>

          <!-- Policy & Document Buttons -->
          <div class="flex items-center gap-4 flex-wrap justify-center">
            <a routerLink="/about" class="hover:text-blue-400 transition-colors">
              <i class="fa-solid fa-circle-info mr-1 text-slate-500"></i> {{ 'nav.about' | translate }}
            </a>

            <button 
              type="button" 
              (click)="openModal('policy')" 
              class="hover:text-blue-400 transition-colors underline font-medium cursor-pointer">
              <i class="fa-solid fa-file-shield mr-1 text-blue-400"></i> {{ 'privacy.policyTitle' | translate }}
            </button>

            <button 
              type="button" 
              (click)="openModal('terms')" 
              class="hover:text-blue-400 transition-colors underline font-medium cursor-pointer">
              <i class="fa-solid fa-signature mr-1 text-emerald-400"></i> {{ 'terms.consentTitle' | translate }}
            </button>
          </div>

        </div>
      </div>

      <!-- Policy Modal Triggered From Footer -->
      <app-privacy-policy-modal
        [isOpen]="showModal"
        [canCloseWithoutAgree]="true"
        (agreed)="onPolicyAgreed()"
        (cancelled)="showModal = false">
      </app-privacy-policy-modal>
    </footer>
  `
})
export class FooterComponent {
  translationService = inject(TranslationService);
  showModal = false;

  openModal(tab: 'policy' | 'terms') {
    this.showModal = true;
  }

  onPolicyAgreed() {
    this.showModal = false;
  }
}
