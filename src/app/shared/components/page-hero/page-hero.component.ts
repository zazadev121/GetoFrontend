import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SealBadgeComponent } from '../seal-badge/seal-badge.component';

/**
 * The shared editorial page opener: eyebrow, oversized display headline, a
 * short lead, and an arched colour panel carrying the section icon and seal.
 * Every public page uses it, which is what makes the site read as one thing.
 */
@Component({
  selector: 'app-page-hero',
  standalone: true,
  imports: [CommonModule, SealBadgeComponent],
  template: `
    <header class="relative overflow-hidden pt-8 sm:pt-14 pb-2">
      <!-- ambient washes -->
      <div class="wash w-[26rem] h-[26rem] -top-40 -left-24 opacity-60"
        [style.background]="'rgb(var(--c-' + accent + '-500) / .22)'"></div>
      <div class="wash w-[20rem] h-[20rem] top-10 right-0 opacity-50"
        style="background: rgb(var(--c-honey-500) / .16)"></div>

      <div class="relative z-10 grid lg:grid-cols-[1.25fr_.75fr] gap-8 lg:gap-12 items-center">
        <div class="space-y-5">
          <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>

          <h1 class="display-xl text-white">{{ title }}</h1>

          <p *ngIf="lead" class="display-lead text-slate-300 max-w-2xl">{{ lead }}</p>

          <div *ngIf="tags?.length" class="pill-stack pt-2">
            <span *ngFor="let tag of tags; let i = index" class="pill-tag"
              [ngClass]="pillClass(i)">{{ tag }}</span>
          </div>

          <ng-content select="[hero-actions]"></ng-content>
        </div>

        <!-- Arched panel: the reference's dome-topped image, rebuilt as a
             colour panel so it works without stock photography. -->
        <div class="relative justify-self-center lg:justify-self-end w-full max-w-[13rem] sm:max-w-[16rem] lg:max-w-[19rem]">
          <div class="arch aspect-[3/4] w-full grid place-items-center relative border shadow-[var(--shadow-lifted)]"
            [style.background]="'linear-gradient(165deg, rgb(var(--c-' + accent + '-800)), rgb(var(--c-' + accent + '-900)))'"
            [style.border-color]="'rgb(var(--c-' + accent + '-700) / .5)'">
            <!-- inner glow gives the dome some depth instead of a flat fill -->
            <div class="wash w-56 h-56 blob-morph opacity-80"
              [style.background]="'rgb(var(--c-' + accent + '-500) / .45)'"></div>
            <div class="absolute inset-0 pointer-events-none"
              style="background: linear-gradient(180deg, rgb(255 255 255 / .28), transparent 40%, rgb(0 0 0 / .12))"></div>
            <img *ngIf="image" [src]="image" [alt]="title"
              class="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-70">
            <i class="fa-solid relative z-10 text-[3.5rem] sm:text-[4.5rem] animate-floaty drop-shadow"
              [ngClass]="icon"
              [style.color]="'rgb(var(--c-' + accent + '-200))'"></i>
          </div>

          <div class="absolute -bottom-5 -left-2 sm:-bottom-6 sm:-left-8">
            <app-seal-badge [text]="sealText" [icon]="sealIcon"></app-seal-badge>
          </div>
        </div>
      </div>
    </header>
  `
})
export class PageHeroComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() lead = '';
  @Input() icon = 'fa-star';
  /** Any ramp name from styles.css: clay | sage | honey | teal | plum | blush | berry */
  @Input() accent: 'clay' | 'sage' | 'honey' | 'teal' | 'plum' | 'blush' | 'berry' = 'clay';
  @Input() tags: string[] = [];
  @Input() image = '';
  @Input() sealText = 'GETO PROJECT · SINCE 2020 · ';
  @Input() sealIcon = 'fa-seedling';

  private pillVariants = ['pill-tag--clay', 'pill-tag--sage', '', 'pill-tag--honey'];

  pillClass(index: number): string {
    return this.pillVariants[index % this.pillVariants.length];
  }
}
