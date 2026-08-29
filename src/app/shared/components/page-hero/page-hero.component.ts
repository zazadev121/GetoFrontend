import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SealBadgeComponent } from '../seal-badge/seal-badge.component';

/**
 * The shared page opener.
 *
 * Deliberately typographic: an empty coloured dome reads as a missing image,
 * so the composition carries itself on type, rule work and a single small seal
 * instead. The section icon appears as a quiet marker, not a decorative blob.
 */
@Component({
  selector: 'app-page-hero',
  standalone: true,
  imports: [CommonModule, SealBadgeComponent],
  template: `
    <header class="relative pt-10 sm:pt-16 lg:pt-20 pb-8 sm:pb-10">
      <!-- one soft wash, parallaxed by the page scroll -->
      <div class="wash hero-wash w-[34rem] h-[34rem] -top-52 -left-40"
        [style.background]="'rgb(var(--c-' + accent + '-500) / .16)'"></div>

      <div class="relative z-10">
        <!-- Eyebrow row: marker, label, hairline -->
        <div class="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in">
          <span class="w-9 h-9 sm:w-10 sm:h-10 rounded-full grid place-items-center text-xs shrink-0 border"
            [style.color]="'rgb(var(--c-' + accent + '-400))'"
            [style.border-color]="'rgb(var(--c-' + accent + '-400) / .35)'"
            [style.background]="'rgb(var(--c-' + accent + '-500) / .1)'">
            <i class="fa-solid" [ngClass]="icon"></i>
          </span>

          <p class="eyebrow whitespace-nowrap" *ngIf="eyebrow">{{ eyebrow }}</p>

          <span class="h-px flex-1 min-w-4"
            [style.background]="'linear-gradient(90deg, rgb(var(--c-' + accent + '-400) / .45), transparent)'"></span>

          <app-seal-badge class="hidden sm:block shrink-0 scale-[.62] origin-right -my-4"
            [text]="sealText" [icon]="sealIcon"></app-seal-badge>
        </div>

        <div class="max-w-4xl space-y-5 sm:space-y-6">
          <h1 class="display-xl text-white animate-rise">{{ title }}</h1>

          <p *ngIf="lead" class="display-lead text-slate-300 max-w-2xl animate-rise delay-2">{{ lead }}</p>

          <div *ngIf="tags?.length" class="pill-stack pt-1 animate-rise delay-3">
            <span *ngFor="let tag of tags; let i = index" class="pill-tag"
              [ngClass]="pillClass(i)">{{ tag }}</span>
          </div>

          <div class="animate-rise delay-4">
            <ng-content select="[hero-actions]"></ng-content>
          </div>
        </div>
      </div>

      <!-- closing rule, so the hero hands off to the page instead of stopping dead -->
      <div class="mt-10 sm:mt-14 h-px"
        style="background: linear-gradient(90deg, rgb(var(--c-n-700) / .9), rgb(var(--c-n-700) / .15) 60%, transparent)"></div>
    </header>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class PageHeroComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() lead = '';
  @Input() icon = 'fa-star';
  /** Any ramp name from styles.css: clay | sage | gold | teal | plum | blush | berry */
  @Input() accent: 'clay' | 'sage' | 'honey' | 'teal' | 'plum' | 'blush' | 'berry' = 'clay';
  @Input() tags: string[] = [];
  @Input() sealText = 'GETO PROJECT · SINCE 2020 · ';
  @Input() sealIcon = 'fa-seedling';

  private pillVariants = ['pill-tag--clay', 'pill-tag--sage', '', 'pill-tag--honey'];

  pillClass(index: number): string {
    return this.pillVariants[index % this.pillVariants.length];
  }
}
