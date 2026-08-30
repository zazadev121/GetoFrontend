import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { TranslationService } from '../core/services/translation.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { PageHeroComponent } from '../shared/components/page-hero/page-hero.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PageHeroComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16 sm:space-y-24">

      <app-page-hero
        [title]="'about.title' | translate"
        [lead]="'about.subtitle' | translate"
        icon="fa-handshake"
        accent="clay"
        [tags]="heroTags()">
      </app-page-hero>

      <!-- The story, set as an editorial pull-quote block -->
      <section class="reveal reveal-blur relative grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start">
        <div class="w-16 h-16 sm:w-20 sm:h-20 blob blob-morph grid place-items-center text-2xl sm:text-3xl shrink-0
                    text-blue-300 border border-blue-500/30"
          style="background: rgb(var(--c-clay-500) / .18)">
          <i class="fa-solid fa-quote-left"></i>
        </div>

        <div class="space-y-5">
          <h2 class="font-heading text-white">
            {{ 'about.title' | translate }} <span class="text-blue-400">— Geto Project</span>
          </h2>
          <p class="text-base sm:text-lg leading-relaxed text-slate-300">
            {{ 'about.body' | translate }}
          </p>
        </div>
      </section>

      <!-- Three pillars -->
      <section class="stagger grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <article *ngFor="let pillar of pillars; let i = index"
          class="paper-card glass-card-interactive p-6 sm:p-7 space-y-4 overflow-hidden">
          <div class="relative z-10 flex items-center justify-between">
            <span class="w-14 h-14 squircle grid place-items-center text-xl"
              [style.background]="'rgb(var(--c-' + pillar.accent + '-500) / .16)'"
              [style.color]="'rgb(var(--c-' + pillar.accent + '-400))'">
              <i class="fa-solid" [ngClass]="pillar.icon"></i>
            </span>
            <span class="font-heading text-4xl font-extrabold leading-none opacity-25"
              [style.color]="'rgb(var(--c-' + pillar.accent + '-400))'">
              {{ '0' + (i + 1) }}
            </span>
          </div>

          <h3 class="relative z-10 font-heading text-white">{{ pillar.titleKey | translate }}</h3>
          <p class="relative z-10 text-sm leading-relaxed text-slate-400">{{ pillar.subKey | translate }}</p>
        </article>
      </section>

    </div>
  `
})
export class AboutUsComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);

  pillars = [
    { icon: 'fa-handshake-angle', accent: 'clay', titleKey: 'about.stat1.title', subKey: 'about.stat1.sub' },
    { icon: 'fa-comments', accent: 'sage', titleKey: 'about.stat2.title', subKey: 'about.stat2.sub' },
    { icon: 'fa-file-signature', accent: 'plum', titleKey: 'about.stat3.title', subKey: 'about.stat3.sub' }
  ];

  heroTags(): string[] {
    return this.translationService.isGeorgian()
      ? ['სრული საორგანიზაციო მომსახურება', 'გერმანული ენა', 'დოკუმენტაცია', 'სამუშაო ნებართვა']
      : ['Full organisational service', 'German language', 'Documentation', 'Work permit'];
  }

}
