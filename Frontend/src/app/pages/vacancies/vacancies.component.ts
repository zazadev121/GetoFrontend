import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VacancyService } from '../../core/services/vacancy.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { VacancyDto } from '../../core/models/vacancy.model';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PageHeroComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-14">

      <app-page-hero
        [title]="'vacancy.title' | translate"
        [lead]="'vacancy.subtitle' | translate"
        icon="fa-briefcase"
        accent="clay"
        sealText="GETO PROJECT · VACANCIES · VAKANSIEBI · "
        sealIcon="fa-briefcase">
      </app-page-hero>

      <!-- Loading -->
      <div *ngIf="isLoading" class="py-16 text-center text-slate-400 space-y-3">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
        <div class="text-sm font-medium">{{ 'vacancy.loading' | translate }}</div>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && vacancies.length === 0"
        class="paper-card p-12 text-center space-y-4 max-w-2xl mx-auto">
        <div class="w-16 h-16 squircle bg-slate-900 border border-slate-800 text-slate-500 mx-auto grid place-items-center text-2xl">
          <i class="fa-solid fa-briefcase"></i>
        </div>
        <h3 class="font-heading text-white">{{ 'vacancy.emptyTitle' | translate }}</h3>
        <p class="text-sm text-slate-400 leading-relaxed">{{ 'vacancy.emptyDesc' | translate }}</p>
      </div>

      <!-- Feed -->
      <div *ngIf="!isLoading && vacancies.length > 0" class="stagger space-y-4">
        <a *ngFor="let vacancy of vacancies"
          [href]="'/vacancies/' + vacancy.id"
          class="paper-card glass-card-interactive p-5 sm:p-7 flex items-center justify-between gap-4 group no-underline block">

          <div class="flex items-center gap-4 overflow-hidden relative z-10">
            <span class="w-11 h-11 squircle bg-blue-500/10 border border-blue-500/20 text-blue-400
                         grid place-items-center shrink-0 text-lg group-hover:bg-blue-500/20 transition-colors">
              <i class="fa-solid fa-briefcase"></i>
            </span>

            <div class="overflow-hidden">
              <span *ngIf="isEnglish() && !vacancy.titleEn"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20
                       text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1"
                title="No English translation — showing Georgian">
                <i class="fa-solid fa-language"></i> GE
              </span>

              <div class="text-base sm:text-lg font-bold text-white font-heading leading-snug truncate
                          group-hover:text-blue-400 transition-colors">
                {{ getTitle(vacancy) }}
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium flex-wrap">
                <i class="fa-regular fa-calendar-check text-slate-600"></i>
                <span>{{ vacancy.dateCreated | date:'mediumDate' }}</span>

                <ng-container *ngIf="vacancy.salary">
                  <span class="text-slate-700">&bull;</span>
                  <span class="inline-flex items-center gap-1 font-semibold text-emerald-400">
                    <i class="fa-solid fa-sack-dollar text-[10px]"></i>{{ vacancy.salary }}
                  </span>
                </ng-container>

                <span *ngIf="vacancy.attachments?.length" class="inline-flex items-center gap-1 text-emerald-500 ml-1">
                  <i class="fa-solid fa-paperclip text-[10px]"></i> {{ vacancy.attachments?.length }}
                </span>
                <span *ngIf="vacancy.links?.length" class="inline-flex items-center gap-1 text-blue-500 ml-1">
                  <i class="fa-solid fa-link text-[10px]"></i> {{ vacancy.links?.length }}
                </span>
              </div>
            </div>
          </div>

          <span class="relative z-10 shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-400
                       group-hover:text-blue-400 group-hover:border-blue-500/40 grid place-items-center text-sm transition-all">
            <i class="fa-solid fa-chevron-right group-hover:translate-x-0.5 transition-transform"></i>
          </span>
        </a>
      </div>

    </div>
  `
})
export class VacanciesComponent implements OnInit {
  vacancyService = inject(VacancyService);
  translationService = inject(TranslationService);

  vacancies: VacancyDto[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadVacancies();
  }

  isEnglish(): boolean {
    return this.translationService.currentLang() === 'en';
  }

  getTitle(vacancy: VacancyDto): string {
    return this.isEnglish() && vacancy.titleEn ? vacancy.titleEn : vacancy.title;
  }

  loadVacancies() {
    this.isLoading = true;
    this.vacancyService.getAllVacancies().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.vacancies = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
