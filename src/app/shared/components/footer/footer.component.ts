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

          <div class="reveal grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">

            <!-- Who we are -->
            <div class="space-y-5">
              <div class="flex items-center gap-3.5">
                <span class="w-12 h-12 squircle bg-slate-950 border border-blue-500/30 grid place-items-center p-0.5 shrink-0">
                  <img src="/icons/icon-192.png" alt="GETO" class="w-full h-full object-cover squircle">
                </span>
                <span class="leading-none">
                  <span class="block font-heading font-extrabold text-2xl text-white">GETO</span>
                  <span class="block text-[10px] font-semibold tracking-[0.3em] uppercase text-blue-400 mt-1.5">Portal</span>
                </span>
              </div>

              <p class="text-sm leading-relaxed text-slate-300 max-w-md">
                {{ translationService.isGeorgian()
                  ? 'დოკუმენტაციის წარდგენასა და პროგრამასთან დაკავშირებული საკითხების შესახებ კონსულტაციის მისაღებად, გთხოვთ, დაგვიკავშირდეთ.'
                  : 'For consultation on document submission and programme-related matters, please get in touch with us.' }}
              </p>

              <p class="text-xs text-slate-500">
                {{ translationService.isGeorgian()
                  ? 'შპს გეთო ფროჯექთი (GETO Project LLC)'
                  : 'GETO Project LLC' }}
              </p>
            </div>

            <!-- Reach us: this replaces the standalone contact page -->
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-4">
                <h3 class="eyebrow">{{ translationService.isGeorgian() ? 'კონტაქტი' : 'Contact' }}</h3>
                <app-seal-badge class="hidden sm:block shrink-0 scale-[.6] origin-right -my-5"
                  text="GETO PROJECT · TBILISI · BERLIN · "
                  icon="fa-stamp"></app-seal-badge>
              </div>

              <ul class="grid sm:grid-cols-2 gap-2.5">
                <li *ngFor="let channel of channels">
                  <a [href]="channel.href"
                    [attr.target]="channel.external ? '_blank' : null"
                    [attr.rel]="channel.external ? 'noopener noreferrer' : null"
                    class="group flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3
                           hover:border-blue-500/45 transition-colors no-underline">
                    <span class="w-9 h-9 rounded-xl grid place-items-center text-sm shrink-0 transition-transform group-hover:scale-110"
                      [style.background]="'rgb(var(--c-' + channel.accent + '-500) / .15)'"
                      [style.color]="'rgb(var(--c-' + channel.accent + '-400))'">
                      <i [ngClass]="channel.icon"></i>
                    </span>
                    <span class="min-w-0">
                      <span class="block text-[10px] uppercase tracking-wider text-slate-500">{{ channel.label }}</span>
                      <span class="block text-xs font-semibold text-slate-200 truncate">{{ channel.value }}</span>
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="rule-gold my-10 sm:my-12"></div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p class="text-xs text-slate-600">
              &copy; 2026 GETO Project LLC. {{ translationService.isGeorgian() ? 'ყველა უფლება დაცულია.' : 'All rights reserved.' }}
            </p>

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

  channels = [
    {
      label: 'WhatsApp',
      value: '+995 577 54 75 77',
      href: 'https://wa.me/995577547577',
      icon: 'fa-brands fa-whatsapp',
      accent: 'sage',
      external: true
    },
    {
      label: 'Facebook',
      value: '@Getoproject2020',
      href: 'https://www.facebook.com/Getoproject2020',
      icon: 'fa-brands fa-facebook-f',
      accent: 'clay',
      external: true
    },
    {
      label: 'Phone',
      value: '577 54 75 77',
      href: 'tel:+995577547577',
      icon: 'fa-solid fa-phone',
      accent: 'honey',
      external: false
    },
    {
      label: 'Email',
      value: 'getogeto2020@gmail.com',
      href: 'mailto:getogeto2020@gmail.com',
      icon: 'fa-solid fa-envelope',
      accent: 'plum',
      external: false
    }
  ];

  openModal() {
    this.showModal = true;
  }

  onPolicyAgreed() {
    this.showModal = false;
  }
}
