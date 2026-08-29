import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PrivacyPolicyModalComponent } from '../privacy-policy-modal/privacy-policy-modal.component';
import { SealBadgeComponent } from '../seal-badge/seal-badge.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PrivacyPolicyModalComponent, SealBadgeComponent],
  template: `
    <footer class="relative mt-24 overflow-hidden">
      <div class="relative border-t border-slate-700/50 bg-slate-900/40">
        <div class="wash w-[30rem] h-[30rem] -bottom-72 left-1/2 -translate-x-1/2"
          style="background: rgb(var(--c-clay-500) / .12)"></div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">

          <!-- Wordmark, set large: the footer signs the page off -->
          <div class="reveal flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div class="space-y-5 max-w-md">
              <div class="flex items-center gap-3.5">
                <span class="w-12 h-12 squircle bg-slate-950 border border-blue-500/30 grid place-items-center p-0.5 shrink-0">
                  <img src="/icons/icon-192.png" alt="GETO" class="w-full h-full object-cover squircle">
                </span>
                <span class="leading-none">
                  <span class="block font-heading font-extrabold text-2xl text-white">GETO</span>
                  <span class="block text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-400 mt-1.5">Portal</span>
                </span>
              </div>

              <p class="text-sm leading-relaxed text-slate-400">
                {{ translationService.isGeorgian()
                  ? 'სტუდენტთა მხარდაჭერა, დოკუმენტაცია და სრული თანხლება გერმანიაში დასაქმებისა და სწავლის გზაზე.'
                  : 'Student support, documentation and end-to-end guidance on the way to work and study in Germany.' }}
              </p>
            </div>

            <app-seal-badge class="hidden sm:block shrink-0"
              text="GETO PROJECT · TBILISI · BERLIN · "
              icon="fa-stamp"></app-seal-badge>
          </div>

          <div class="rule-gold my-10 sm:my-12"></div>

          <!-- Reach us -->
          <div class="reveal flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div class="flex flex-wrap items-center gap-3">
              <a href="https://wa.me/995577547577" target="_blank" rel="noopener noreferrer"
                class="icon-btn" aria-label="WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
              <a href="https://www.facebook.com/Getoproject2020" target="_blank" rel="noopener noreferrer"
                class="icon-btn" aria-label="Facebook">
                <i class="fa-brands fa-facebook-f"></i>
              </a>
              <a href="tel:+995577547577" class="icon-btn" aria-label="Phone">
                <i class="fa-solid fa-phone"></i>
              </a>
              <a href="mailto:getogeto2020@gmail.com" class="icon-btn" aria-label="Email">
                <i class="fa-solid fa-envelope"></i>
              </a>

              <span class="ml-1 text-xs text-slate-500 font-mono hidden sm:inline">getogeto2020&#64;gmail.com</span>
            </div>

            <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" (click)="openModal()"
                class="link-draw text-xs text-slate-400 hover:text-blue-400">
                {{ 'privacy.policyTitle' | translate }}
              </button>
              <button type="button" (click)="openModal()"
                class="link-draw text-xs text-slate-400 hover:text-blue-400">
                {{ 'terms.consentTitle' | translate }}
              </button>
            </div>
          </div>

          <p class="mt-10 text-xs text-slate-600">
            &copy; 2026 GETO Project LLC. {{ translationService.isGeorgian() ? 'ყველა უფლება დაცულია.' : 'All rights reserved.' }}
          </p>
        </div>
      </div>

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

  openModal() {
    this.showModal = true;
  }

  onPolicyAgreed() {
    this.showModal = false;
  }
}
