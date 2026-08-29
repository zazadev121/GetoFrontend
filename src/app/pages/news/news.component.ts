import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../core/services/news.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { NewsDto } from '../../core/models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, TranslatePipe, PageHeroComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-14">

      <app-page-hero
        [eyebrow]="'news.badge' | translate"
        [title]="'news.title' | translate"
        [lead]="'news.subtitle' | translate"
        icon="fa-newspaper"
        accent="teal"
        sealText="GETO PROJECT · NEWS · SIAKHLEEBI · "
        sealIcon="fa-bullhorn">
      </app-page-hero>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="py-16 text-center text-slate-400 space-y-3">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
        <div class="text-sm font-medium">{{ 'news.loading' | translate }}</div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && newsList.length === 0" class="glass-card p-12 text-center border-slate-700/50 space-y-4 max-w-2xl mx-auto">
        <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center text-2xl">
          <i class="fa-solid fa-newspaper"></i>
        </div>
        <h3 class="text-xl font-bold text-white font-heading">{{ 'news.noNewsTitle' | translate }}</h3>
        <p class="text-sm text-slate-400 leading-relaxed">{{ 'news.noNewsDesc' | translate }}</p>
      </div>

      <!-- News Feed — Title Cards Only, each is a full clickable <a> -->
      <div *ngIf="!isLoading && newsList.length > 0" class="stagger space-y-4">
        <a
          *ngFor="let news of newsList"
          [href]="'/news/' + news.id"
          class="glass-card p-5 sm:p-7 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer no-underline block">

          <div class="flex items-center gap-4 overflow-hidden">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-lg group-hover:bg-blue-500/20 transition-colors">
              <i class="fa-solid fa-bullhorn"></i>
            </div>
            <div class="overflow-hidden">
              <span
                *ngIf="isEnglish() && !news.titleEn"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1"
                title="No English translation — showing Georgian">
                <i class="fa-solid fa-language"></i> GE
              </span>
              <div class="text-base sm:text-lg font-bold text-white font-heading tracking-tight leading-snug group-hover:text-blue-300 transition-colors truncate">
                {{ getTitle(news) }}
              </div>
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium flex-wrap">
                <i class="fa-regular fa-calendar-check text-slate-600"></i>
                <span>{{ news.dateCreated | date:'mediumDate' }}</span>
                <span class="text-slate-700">&bull;</span>
                <span>{{ news.dateCreated | date:'shortTime' }}</span>
                <span *ngIf="news.attachments && news.attachments.length > 0" class="inline-flex items-center gap-1 text-emerald-500 ml-2">
                  <i class="fa-solid fa-paperclip text-[10px]"></i> {{ news.attachments.length }}
                </span>
                <span *ngIf="news.links && news.links.length > 0" class="inline-flex items-center gap-1 text-blue-500 ml-1">
                  <i class="fa-solid fa-link text-[10px]"></i> {{ news.links.length }}
                </span>
              </div>
            </div>
          </div>

          <div class="shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/40 flex items-center justify-center text-sm transition-all">
            <i class="fa-solid fa-chevron-right group-hover:translate-x-0.5 transition-transform"></i>
          </div>
        </a>
      </div>

    </div>
  `
})
export class NewsComponent implements OnInit {
  newsService = inject(NewsService);
  translationService = inject(TranslationService);

  newsList: NewsDto[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadNews();
  }

  isEnglish(): boolean {
    return this.translationService.currentLang() === 'en';
  }

  getTitle(news: NewsDto): string {
    if (this.isEnglish() && news.titleEn) {
      return news.titleEn;
    }
    return news.title;
  }

  loadNews() {
    this.isLoading = true;
    this.newsService.getAllNews().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.newsList = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
