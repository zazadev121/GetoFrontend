import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PrivacyPolicyModalComponent } from '../privacy-policy-modal/privacy-policy-modal.component';
import { SealBadgeComponent } from '../seal-badge/seal-badge.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, PrivacyPolicyModalComponent, SealBadgeComponent],
  template: `
    <footer class="relative mt-20 overflow-hidden">
      <!-- The footer reads as a separate sheet of paper tucked under the page -->
      <div class="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style="background: linear-gradient(180deg, transparent, rgb(var(--c-n-900) / .5))"></div>

      <div class="relative border-t border-slate-700/40 bg-slate-900/60 backdrop-blur-sm">
        <div class="wash w-[28rem] h-[28rem] -bottom-60 -left-32"
          style="background: rgb(var(--c-clay-500) / .18)"></div>

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

          <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">

            <!-- Brand -->
            <div class="space-y-5">
              <div class="flex items-center gap-3">
                <span class="w-12 h-12 squircle bg-slate-950 border border-blue-500/30 grid place-items-center p-0.5 shrink-0">
                  <img src="/recommendations/Geto Logo.jpg" alt="GETO" class="w-full h-full object-cover squircle">
                </span>
                <span class="leading-none">
                  <span class="block font-heading font-extrabold text-xl text-white">GETO</span>
                  <span class="block text-[10px] font-semibold tracking-[0.28em] uppercase text-blue-400 mt-1">Portal</span>
                </span>
              </div>

              <p class="text-sm leading-relaxed text-slate-400 max-w-sm">
                {{ translationService.isGeorgian()
                  ? 'სტუდენტთა მხარდაჭერა, დოკუმენტაცია და სრული თანხლება გერმანიაში დასაქმებისა და სწავლის გზაზე.'
                  : 'Student support, documentation and end-to-end guidance on the way to work and study in Germany.' }}
              </p>

              <div class="flex items-center gap-3 pt-1">
                <a href="https://wa.me/995577547577" target="_blank" rel="noopener noreferrer"
                  class="icon-btn icon-btn-sm" aria-label="WhatsApp">
                  <i class="fa-brands fa-whatsapp"></i>
                </a>
                <a href="https://www.facebook.com/Getoproject2020" target="_blank" rel="noopener noreferrer"
                  class="icon-btn icon-btn-sm" aria-label="Facebook">
                  <i class="fa-brands fa-facebook-f"></i>
                </a>
                <a href="mailto:getogeto2020@gmail.com" class="icon-btn icon-btn-sm" aria-label="Email">
                  <i class="fa-solid fa-envelope"></i>
                </a>
              </div>
            </div>

            <!-- Navigate -->
            <nav class="space-y-3">
              <h3 class="eyebrow">{{ translationService.isGeorgian() ? 'ნავიგაცია' : 'Navigate' }}</h3>
              <ul class="space-y-2.5">
                <li *ngFor="let link of links">
                  <a [routerLink]="link.path"
                    class="text-sm text-slate-400 hover:text-blue-400 transition-colors no-underline inline-flex items-center gap-2">
                    <i class="fa-solid fa-arrow-right text-[10px] opacity-0 -ml-4 transition-all duration-300"></i>
                    {{ translationService.isGeorgian() ? link.ka : link.en }}
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Legal -->
            <div class="space-y-3">
              <h3 class="eyebrow">{{ translationService.isGeorgian() ? 'სამართლებრივი' : 'Legal' }}</h3>
              <ul class="space-y-2.5">
                <li>
                  <button type="button" (click)="openModal()"
                    class="text-sm text-slate-400 hover:text-blue-400 transition-colors text-left">
                    <i class="fa-solid fa-file-shield mr-2 text-blue-400/70"></i>{{ 'privacy.policyTitle' | translate }}
                  </button>
                </li>
                <li>
                  <button type="button" (click)="openModal()"
                    class="text-sm text-slate-400 hover:text-blue-400 transition-colors text-left">
                    <i class="fa-solid fa-signature mr-2 text-emerald-400/70"></i>{{ 'terms.consentTitle' | translate }}
                  </button>
                </li>
              </ul>

              <div class="pt-4">
                <app-seal-badge class="inline-block"
                  text="GETO PROJECT · TBILISI · BERLIN · "
                  icon="fa-stamp"></app-seal-badge>
              </div>
            </div>
          </div>

          <div class="mt-12 pt-6 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p class="text-xs text-slate-500">&copy; 2026 GETO Project LLC. {{ translationService.isGeorgian() ? 'ყველა უფლება დაცულია.' : 'All rights reserved.' }}</p>
            <p class="text-xs text-slate-600 font-mono">getogeto2020&#64;gmail.com</p>
          </div>
        </div>
      </div>

      <app-privacy-policy-modal
        [isOpen]="showModal"
        [canCloseWithoutAgree]="true"
        (agreed)="onPolicyAgreed()"
        (cancelled)="showModal = false">
      </app-privacy-policy-modal>
    </footer>
  `,
  styles: [`
    nav a:hover i { opacity: 1; margin-left: 0; }
  `]
})
export class FooterComponent {
  translationService = inject(TranslationService);
  showModal = false;

  links = [
    { path: '/about', en: 'About', ka: 'ჩვენ შესახებ' },
    { path: '/news', en: 'News', ka: 'სიახლეები' },
    { path: '/german-course', en: 'German Course', ka: 'გერმანული ენის კურსი' },
    { path: '/steuer', en: 'Steuer', ka: 'შტოიერი' },
    { path: '/contact', en: 'Contact', ka: 'კონტაქტი' }
  ];

  openModal() {
    this.showModal = true;
  }

  onPolicyAgreed() {
    this.showModal = false;
  }
}
