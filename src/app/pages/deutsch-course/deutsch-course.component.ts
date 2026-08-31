import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

@Component({
  selector: 'app-deutsch-course',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PageHeroComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-14">

      <app-page-hero
        [title]="'deutsch.title' | translate"
        icon="fa-language"
        accent="honey"
        sealText="GETO PROJECT · DEUTSCH · A1 A2 B1 · "
        sealIcon="fa-graduation-cap">
      </app-page-hero>

      <div class="reveal space-y-6 text-center">
        <!-- Announcement -->
        <div class="paper-card max-w-3xl mx-auto p-6 sm:p-8 border-amber-500/30 space-y-3 text-left sm:text-center">
          <p class="text-base sm:text-xl font-extrabold text-white leading-snug">
            {{ 'deutsch.announcementTitle' | translate }}
          </p>
          <p class="text-sm sm:text-base text-amber-300 font-semibold leading-relaxed">
            {{ 'deutsch.announcementSub' | translate }}
          </p>
          <p class="text-xs sm:text-sm text-slate-300">
            {{ 'deutsch.announcementNote' | translate }}
          </p>
        </div>

        <!-- Google Form Registration Single CTA Button -->
        <div class="flex items-center justify-center">
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSdUdp9H8Vp1qVAF0ke3pF3dEJkW95ns2IN8HjL4E9JhbgxTiA/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-primary px-8 py-3.5 text-base font-bold shadow-xl shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center gap-3">
            <i class="fa-solid fa-pen-to-square text-lg"></i>
            <span>{{ 'deutsch.registerFormBtn' | translate }}</span>
            <i class="fa-solid fa-up-right-from-square text-sm"></i>
          </a>
        </div>
      </div>

      <!-- Single Official German Course Agreement Document Card -->
      <div class="glass-card p-6 border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <i class="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white font-heading">
              {{ 'deutsch.agreementCardTitle' | translate }}
            </h3>
            <p class="text-xs text-slate-400 mt-1">
              {{ 'deutsch.agreementCardSub' | translate }}
            </p>
          </div>
        </div>

        <a 
          href="/templates/Deutch course/ურთიერთშეთანხმების აქტი მომსახურებაზე „გერმანული ენის კურსი&quot;.docx.pdf" 
          download="ურთიერთშეთანხმების აქტი მომსახურებაზე „გერმანული ენის კურსი&quot;.docx.pdf"
          class="btn btn-secondary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 shrink-0">
          <i class="fa-solid fa-download"></i>
          <span>{{ 'deutsch.downloadDocBtn' | translate }}</span>
        </a>
      </div>

      <!-- Feature Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 border-slate-700/50 space-y-3 hover:border-amber-500/40 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-comments"></i>
          </div>
          <h3 class="text-lg font-bold text-white font-heading">
            {{ 'deutsch.feature1Title' | translate }}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            {{ 'deutsch.feature1Sub' | translate }}
          </p>
        </div>

        <div class="glass-card p-6 border-slate-700/50 space-y-3 hover:border-blue-500/40 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-handshake-angle"></i>
          </div>
          <h3 class="text-lg font-bold text-white font-heading">
            {{ 'deutsch.feature2Title' | translate }}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            {{ 'deutsch.feature2Sub' | translate }}
          </p>
        </div>

        <div class="glass-card p-6 border-slate-700/50 space-y-3 hover:border-emerald-500/40 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-award"></i>
          </div>
          <h3 class="text-lg font-bold text-white font-heading">
            {{ 'deutsch.feature3Title' | translate }}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            {{ 'deutsch.feature3Sub' | translate }}
          </p>
        </div>
      </div>

      <!-- Level Track Cards -->
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-white font-heading text-center">
          {{ 'deutsch.modulesTitle' | translate }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card p-6 border-slate-700/50 text-center space-y-3">
            <div class="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 font-extrabold mx-auto flex items-center justify-center text-lg">A1</div>
            <h4 class="font-bold text-white">{{ 'deutsch.a1Title' | translate }}</h4>
            <p class="text-xs text-slate-400">{{ 'deutsch.a1Sub' | translate }}</p>
          </div>

          <div class="glass-card p-6 border-slate-700/50 text-center space-y-3">
            <div class="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 font-extrabold mx-auto flex items-center justify-center text-lg">A2</div>
            <h4 class="font-bold text-white">{{ 'deutsch.a2Title' | translate }}</h4>
            <p class="text-xs text-slate-400">{{ 'deutsch.a2Sub' | translate }}</p>
          </div>

          <div class="glass-card p-6 border-slate-700/50 text-center space-y-3">
            <div class="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 font-extrabold mx-auto flex items-center justify-center text-lg">B1</div>
            <h4 class="font-bold text-white">{{ 'deutsch.b1Title' | translate }}</h4>
            <p class="text-xs text-slate-400">{{ 'deutsch.b1Sub' | translate }}</p>
          </div>

          <div class="glass-card p-6 border-slate-700/50 text-center space-y-3">
            <div class="w-10 h-10 rounded-full bg-amber-600/20 text-amber-400 font-extrabold mx-auto flex items-center justify-center text-lg">B2</div>
            <h4 class="font-bold text-white">{{ 'deutsch.b2Title' | translate }}</h4>
            <p class="text-xs text-slate-400">{{ 'deutsch.b2Sub' | translate }}</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DeutschCourseComponent {
  translationService = inject(TranslationService);
}
