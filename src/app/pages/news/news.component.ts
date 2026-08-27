import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../core/services/news.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { NewsDto } from '../../core/models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      <!-- Hero Header Section -->
      <div class="glass-card p-8 sm:p-12 border-slate-700/50 relative overflow-hidden text-center space-y-4">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-blue-500/30 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 transform hover:scale-105 transition-transform p-1">
          <img src="/recommendations/Geto Logo.jpg" alt="GETO Logo" class="w-full h-full object-cover rounded-xl">
        </div>

        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <i class="fa-solid fa-newspaper"></i> {{ 'news.badge' | translate }}
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          {{ 'news.title' | translate }}
        </h1>

        <p class="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
          {{ 'news.subtitle' | translate }}
        </p>
      </div>

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

      <!-- News Feed Grid -->
      <div *ngIf="!isLoading && newsList.length > 0" class="space-y-6">
        <div 
          *ngFor="let news of newsList" 
          class="glass-card p-6 sm:p-8 border-slate-700/50 hover:border-blue-500/40 transition-all duration-300 space-y-4 relative group">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-lg">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight leading-snug">
                {{ news.title }}
              </h2>
            </div>

            <div class="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0 self-start sm:self-auto bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <i class="fa-regular fa-calendar-check text-blue-400"></i>
              <span>{{ news.dateCreated | date:'mediumDate' }}</span>
              <span class="text-slate-600">&bull;</span>
              <span>{{ news.dateCreated | date:'shortTime' }}</span>
            </div>
          </div>

          <div class="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line pt-2">
            {{ news.text }}
          </div>
        </div>
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
