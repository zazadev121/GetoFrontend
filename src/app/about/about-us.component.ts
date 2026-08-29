import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { TranslationService } from '../core/services/translation.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { PageHeroComponent } from '../shared/components/page-hero/page-hero.component';
import { SealBadgeComponent } from '../shared/components/seal-badge/seal-badge.component';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, PageHeroComponent, SealBadgeComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16 sm:space-y-24">

      <app-page-hero
        [title]="'about.title' | translate"
        [lead]="'about.subtitle' | translate"
        icon="fa-handshake"
        accent="clay"
        [tags]="heroTags()">
        <div hero-actions class="flex flex-wrap gap-3 pt-4">
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/auth/register" class="btn btn-primary">
              <i class="fa-solid fa-user-plus"></i> {{ 'nav.register' | translate }}
            </a>
            <a routerLink="/auth/login" class="btn btn-secondary">
              <i class="fa-solid fa-right-to-bracket"></i> {{ 'nav.login' | translate }}
            </a>
          </ng-container>
          <a *ngIf="authService.isLoggedIn()" routerLink="/dashboard" class="btn btn-primary">
            <i class="fa-solid fa-user-gear"></i> {{ 'nav.cabinet' | translate }}
          </a>
        </div>
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

      <!-- Call to action, built as a raised slab -->
      <section class="raised reveal reveal-scale sheen relative overflow-hidden p-8 sm:p-12 text-center">
        <div class="wash w-96 h-96 -top-40 left-1/2 -translate-x-1/2"
          style="background: rgb(var(--c-clay-500) / .25)"></div>

        <div class="relative z-10 space-y-5 max-w-2xl mx-auto">
          <app-seal-badge class="inline-block"
            [text]="'GETO PROJECT · GERMANY · KARTULI · '"
            icon="fa-passport"></app-seal-badge>

          <h2 class="font-heading text-white">
            {{ authService.isLoggedIn()
              ? (translationService.isGeorgian() ? 'კეთილი იყოს თქვენი დაბრუნება' : 'Welcome back to your portal')
              : (translationService.isGeorgian() ? 'მზად ხართ დასაწყებად?' : 'Ready to start your process?') }}
          </h2>

          <div class="flex items-center justify-center gap-3 flex-wrap pt-1">
            <ng-container *ngIf="!authService.isLoggedIn()">
              <a routerLink="/auth/register" class="btn btn-primary">
                <i class="fa-solid fa-user-plus"></i> {{ 'nav.register' | translate }}
              </a>
              <a routerLink="/auth/login" class="btn btn-secondary">
                <i class="fa-solid fa-right-to-bracket"></i> {{ 'nav.login' | translate }}
              </a>
            </ng-container>
            <a *ngIf="authService.isLoggedIn()" routerLink="/dashboard" class="btn btn-primary">
              <i class="fa-solid fa-user-gear"></i> {{ 'nav.cabinet' | translate }}
            </a>
          </div>
        </div>
      </section>

      <!-- Partners -->
      <section class="reveal reveal-left space-y-5">
        <div class="flex items-center gap-4">
          <span class="w-12 h-12 blob grid place-items-center text-lg shrink-0"
            style="background: rgb(var(--c-teal-500) / .16); color: rgb(var(--c-teal-400))">
            <i class="fa-solid fa-building-columns"></i>
          </span>
          <div>
            <p class="eyebrow">{{ translationService.isGeorgian() ? 'ქსელი' : 'Network' }}</p>
            <h2 class="font-heading text-white">
              {{ translationService.isGeorgian() ? 'ჩვენი პარტნიორები' : 'Our Business Partners' }}
            </h2>
          </div>
        </div>

        <div class="paper-card overflow-hidden p-2 sm:p-3">
          <img
            src="/recommendations/Partners.png"
            alt="GETO Business Partners"
            loading="lazy"
            class="w-full h-auto object-cover block rounded-2xl hover:scale-[1.01] transition-transform duration-500"
            (error)="onPartnerImgError($event)">
        </div>
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
      ? ['სრული თანხლება', 'გერმანული ენა', 'დოკუმენტაცია', 'სამუშაო ნებართვა']
      : ['End-to-end support', 'German language', 'Documentation', 'Work permit'];
  }

  onPartnerImgError(event: any) {
    event.target.style.display = 'none';
  }
}
