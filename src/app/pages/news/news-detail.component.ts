import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewsService } from '../../core/services/news.service';
import { TranslationService } from '../../core/services/translation.service';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { NewsDto } from '../../core/models/news.model';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FileSizePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">

      <!-- Back Button -->
      <a
        routerLink="/news"
        class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
        <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
        <span>{{ translationService.isGeorgian() ? 'სიახლეებზე დაბრუნება' : 'Back to News' }}</span>
      </a>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="py-20 text-center space-y-3 text-slate-400">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
        <div class="text-sm font-medium">{{ translationService.isGeorgian() ? 'იტვირთება...' : 'Loading...' }}</div>
      </div>

      <!-- Not Found -->
      <div *ngIf="!isLoading && !news" class="glass-card p-12 text-center border-slate-700/50 space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center text-2xl">
          <i class="fa-solid fa-newspaper"></i>
        </div>
        <h2 class="text-xl font-bold text-white font-heading">{{ translationService.isGeorgian() ? 'სიახლე ვერ მოიძებნა' : 'News Not Found' }}</h2>
        <a routerLink="/news" class="btn btn-secondary text-xs inline-flex items-center gap-2">
          <i class="fa-solid fa-arrow-left"></i>
          {{ translationService.isGeorgian() ? 'სიახლეების სიაზე დაბრუნება' : 'Return to news list' }}
        </a>
      </div>

      <!-- News Detail Card -->
      <div *ngIf="!isLoading && news" class="space-y-6">

        <!-- Main News Card -->
        <div class="glass-card p-6 sm:p-10 border-slate-700/50 relative overflow-hidden space-y-6">
          <div class="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header -->
          <div class="space-y-4 border-b border-slate-800 pb-6">
            <div class="flex items-center gap-3 flex-wrap">
              <div class="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg shrink-0">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <i class="fa-solid fa-newspaper text-[10px]"></i>
                {{ translationService.isGeorgian() ? 'სიახლე' : 'News' }}
              </div>
              <!-- Georgian fallback badge -->
              <span
                *ngIf="translationService.currentLang() === 'en' && !news.titleEn"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider"
                title="No English translation available — showing Georgian">
                <i class="fa-solid fa-language"></i> GE
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight leading-snug">
              {{ getTitle() }}
            </h1>

            <div class="flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
              <i class="fa-regular fa-calendar-check text-blue-400"></i>
              <span>{{ news.dateCreated | date:'longDate' }}</span>
              <span class="text-slate-600">&bull;</span>
              <span>{{ news.dateCreated | date:'shortTime' }}</span>
            </div>
          </div>

          <!-- Body Text -->
          <div class="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {{ getText() }}
          </div>

          <!-- Links Section -->
          <div *ngIf="news.links && news.links.length > 0" class="pt-4 border-t border-slate-800/80 space-y-3">
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
        </div>

        <!-- Downloadable Attachments Card (separate card) -->
        <div *ngIf="news.attachments && news.attachments.length > 0" class="glass-card p-6 sm:p-8 border-emerald-500/20 space-y-4">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
              <i class="fa-solid fa-paperclip"></i>
            </div>
            <div>
              <div class="font-bold text-white text-sm font-heading">
                {{ translationService.isGeorgian() ? 'მიმაგრებული ფაილები' : 'Downloadable Attachments' }}
              </div>
              <div class="text-[11px] text-slate-400">
                {{ news.attachments.length }} {{ translationService.isGeorgian() ? 'ფაილი ჩამოსატვირთი' : (news.attachments.length === 1 ? 'file available' : 'files available') }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              *ngFor="let att of news.attachments"
              class="p-4 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between transition-all gap-3 group/att">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base shrink-0">
                  <i class="fa-solid" [ngClass]="getFileIcon(att.fileName)"></i>
                </div>
                <div class="truncate">
                  <div class="text-xs font-semibold text-slate-200 truncate group-hover/att:text-white transition-colors" [title]="att.fileName">{{ att.fileName }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ att.fileSize | fileSize }}</div>
                </div>
              </div>

              <a
                [href]="newsService.getAttachmentDownloadUrl(att.id)"
                target="_blank"
                [download]="att.fileName"
                class="btn btn-secondary btn-sm text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors">
                <i class="fa-solid fa-download text-[10px]"></i>
                <span>{{ translationService.isGeorgian() ? 'ჩამოტვირთვა' : 'Download' }}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class NewsDetailComponent implements OnInit {
  newsService = inject(NewsService);
  translationService = inject(TranslationService);
  route = inject(ActivatedRoute);

  news: NewsDto | null = null;
  isLoading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.isLoading = false;
      return;
    }
    this.newsService.getAllNews().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.news = res.data.find(n => n.id === id) ?? null;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getTitle(): string {
    if (this.translationService.currentLang() === 'en' && this.news?.titleEn) {
      return this.news.titleEn;
    }
    return this.news?.title ?? '';
  }

  getText(): string {
    if (this.translationService.currentLang() === 'en' && this.news?.textEn) {
      return this.news.textEn;
    }
    return this.news?.text ?? '';
  }

  getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'fa-file-pdf text-rose-400';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word text-blue-400';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'fa-file-image text-purple-400';
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'fa-file-zipper text-amber-400';
    return 'fa-file-lines text-emerald-400';
  }
}
