import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../core/services/news.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { NewsDto } from '../../core/models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FileSizePipe],
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
                {{ getTitle(news) }}
              </h2>
            </div>

            <div class="flex items-center gap-2 flex-wrap justify-end">
              <!-- Georgian fallback badge when English is selected but no English translation exists -->
              <span 
                *ngIf="isEnglish() && !news.titleEn"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider"
                title="No English translation available — showing Georgian">
                <i class="fa-solid fa-language"></i> GE
              </span>

              <div class="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0 self-start sm:self-auto bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <i class="fa-regular fa-calendar-check text-blue-400"></i>
                <span>{{ news.dateCreated | date:'mediumDate' }}</span>
                <span class="text-slate-600">&bull;</span>
                <span>{{ news.dateCreated | date:'shortTime' }}</span>
              </div>
            </div>
          </div>

          <div class="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line pt-2">
            {{ getText(news) }}
          </div>

          <!-- Interactive Links Section -->
          <div *ngIf="news.links && news.links.length > 0" class="pt-3 border-t border-slate-800/80 space-y-2">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-link text-blue-400"></i>
              <span>{{ translationService.isGeorgian() ? 'ბმულები' : 'Links' }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <a 
                *ngFor="let link of news.links" 
                [href]="link.url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn btn-secondary text-xs py-1.5 px-3 bg-blue-950/40 border-blue-500/30 text-blue-300 hover:bg-blue-900/60 hover:text-white flex items-center gap-1.5 transition-colors">
                <i class="fa-solid fa-up-right-from-square text-[10px]"></i>
                <span>{{ link.label }}</span>
              </a>
            </div>
          </div>

          <!-- Downloadable File Attachments Section -->
          <div *ngIf="news.attachments && news.attachments.length > 0" class="pt-3 border-t border-slate-800/80 space-y-2">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-paperclip text-emerald-400"></i>
              <span>{{ translationService.isGeorgian() ? 'მიმაგრებული ფაილები' : 'Attachments' }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div 
                *ngFor="let att of news.attachments" 
                class="p-3 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between transition-all gap-2 group/att">
                <div class="flex items-center gap-2.5 overflow-hidden">
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm shrink-0">
                    <i class="fa-solid" [ngClass]="getFileIcon(att.fileName)"></i>
                  </div>
                  <div class="truncate">
                    <div class="text-xs font-semibold text-slate-200 truncate group-hover/att:text-white transition-colors" [title]="att.fileName">{{ att.fileName }}</div>
                    <div class="text-[10px] text-slate-400">{{ att.fileSize | fileSize }}</div>
                  </div>
                </div>

                <a 
                  [href]="newsService.getAttachmentDownloadUrl(att.id)" 
                  target="_blank"
                  [download]="att.fileName"
                  class="btn btn-secondary btn-sm text-xs px-2.5 py-1 flex items-center gap-1 shrink-0 bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors">
                  <i class="fa-solid fa-download text-[10px]"></i>
                  <span>{{ translationService.isGeorgian() ? 'ჩამოტვირთვა' : 'Download' }}</span>
                </a>
              </div>
            </div>
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

  isEnglish(): boolean {
    return this.translationService.currentLang() === 'en';
  }

  getTitle(news: NewsDto): string {
    if (this.isEnglish() && news.titleEn) {
      return news.titleEn;
    }
    return news.title;
  }

  getText(news: NewsDto): string {
    if (this.isEnglish() && news.textEn) {
      return news.textEn;
    }
    return news.text;
  }

  getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'fa-file-pdf text-rose-400';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word text-blue-400';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'fa-file-image text-purple-400';
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'fa-file-zipper text-amber-400';
    return 'fa-file-lines text-emerald-400';
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
