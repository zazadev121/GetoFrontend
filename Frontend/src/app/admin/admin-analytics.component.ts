import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { API_CONFIG } from '../core/config/api.config';
import { TranslationService } from '../core/services/translation.service';

interface VisitRow {
  timestamp?: string;
  requestPath?: string;
  pageviews: number;
  visitors: number;
}

interface AnalyticsSummary {
  configured: boolean;
  pageviews?: number;
  visitors?: number;
  daily?: VisitRow[];
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/80 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/20 space-y-5" aria-labelledby="analytics-heading">
      
      <!-- Ambient decorative glow -->
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header row -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-blue-500/10 border border-blue-400/25 text-blue-300 mb-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            {{ language.isGeorgian() ? 'Vercel Analytics · ბოლო 15 დღე' : 'Vercel Analytics · Last 15 Days' }}
          </div>
          <h2 id="analytics-heading" class="font-heading text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <i class="fa-solid fa-chart-simple text-blue-400 text-base"></i>
            {{ language.isGeorgian() ? 'საიტის სტატისტიკა (15 დღე)' : 'Site Statistics (15 Days)' }}
          </h2>
        </div>

        <button
          type="button"
          (click)="load()"
          [disabled]="loading"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fa-solid fa-rotate-right text-xs" [class.fa-spin]="loading"></i>
          <span>{{ language.isGeorgian() ? 'განახლება' : 'Refresh' }}</span>
        </button>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="h-32 rounded-2xl border border-white/5 bg-slate-800/40 animate-pulse p-5">
          <div class="h-4 w-28 bg-white/10 rounded mb-4"></div>
          <div class="h-10 w-36 bg-white/15 rounded"></div>
        </div>
        <div class="h-32 rounded-2xl border border-white/5 bg-slate-800/40 animate-pulse p-5">
          <div class="h-4 w-28 bg-white/10 rounded mb-4"></div>
          <div class="h-10 w-36 bg-white/15 rounded"></div>
        </div>
      </div>

      <!-- Not Configured Notice -->
      <div *ngIf="!loading && !summary?.configured && !error" class="relative z-10 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 sm:p-5 flex items-start gap-3.5 text-xs text-slate-200 leading-relaxed">
        <div class="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
          <i class="fa-solid fa-circle-info text-sm"></i>
        </div>
        <div class="flex-1">
          <p class="font-semibold text-white mb-0.5">
            {{ language.isGeorgian() ? 'სტატისტიკა ჯერ არ არის დაკავშირებული' : 'Analytics not connected yet' }}
          </p>
          <p class="text-slate-300">
            {{ language.isGeorgian()
              ? 'სტატისტიკის საჩვენებლად backend-ის გარემოს ცვლადებში დაამატეთ VERCEL_ANALYTICS_TOKEN. Vercel-ში Web Analytics-იც ჩართეთ.'
              : 'To show statistics here, add VERCEL_ANALYTICS_TOKEN to the backend environment and enable Web Analytics in Vercel.' }}
          </p>
        </div>
      </div>

      <!-- Error Notice -->
      <div *ngIf="!loading && error" class="relative z-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:p-5 flex items-start justify-between gap-3 text-xs text-red-200" role="alert">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-300 shrink-0">
            <i class="fa-solid fa-triangle-exclamation text-sm"></i>
          </div>
          <div>
            <p class="font-semibold text-white mb-0.5">
              {{ language.isGeorgian() ? 'მონაცემები ვერ ჩაიტვირთა' : 'Could not load data' }}
            </p>
            <p class="text-red-200/90">
              {{ language.isGeorgian()
                ? 'შეამოწმეთ Vercel-ის ტოკენი, პროექტზე წვდომა და Web Analytics.'
                : 'Check the Vercel token, project access, and Web Analytics setting.' }}
            </p>
          </div>
        </div>
        <button type="button" (click)="load()" class="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-medium transition-colors text-xs shrink-0">
          {{ language.isGeorgian() ? 'ხელახლა ცდა' : 'Retry' }}
        </button>
      </div>

      <!-- Configured Stats Display (15 Days Total Views & Visitors) -->
      <ng-container *ngIf="!loading && summary?.configured">
        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          <!-- Total Views Card (15 Days) -->
          <div class="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 via-slate-900/80 to-slate-900/90 p-5 sm:p-6 transition-all duration-300 hover:border-blue-400/50 hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]">
            <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl group-hover:bg-blue-500/25 transition-all"></div>
            
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-blue-300">
                {{ language.isGeorgian() ? 'ნახვები · 15 დღე' : 'Page Views · 15 Days' }}
              </span>
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 text-sm shadow-inner group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-eye"></i>
              </div>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
                {{ totalViews | number }}
              </span>
            </div>

            <div class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <i class="fa-solid fa-arrow-trend-up text-blue-400"></i>
              <span>{{ language.isGeorgian() ? 'ბოლო 15 დღის ჯამური ნახვები' : 'Total page views across last 15 days' }}</span>
            </div>
          </div>

          <!-- Total Visitors Card (15 Days) -->
          <div class="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/15 via-slate-900/80 to-slate-900/90 p-5 sm:p-6 transition-all duration-300 hover:border-emerald-400/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]">
            <div class="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all"></div>
            
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {{ language.isGeorgian() ? 'ვიზიტორები · 15 დღე' : 'Visitors · 15 Days' }}
              </span>
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-sm shadow-inner group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-users"></i>
              </div>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
                {{ totalVisitors | number }}
              </span>
            </div>

            <div class="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
              <i class="fa-solid fa-user-check text-emerald-400"></i>
              <span>{{ language.isGeorgian() ? 'ბოლო 15 დღის უნიკალური ვიზიტორი' : 'Unique active visitors in last 15 days' }}</span>
            </div>
          </div>

        </div>

        <!-- 15-Day Activity Trend Bar Strip -->
        <div *ngIf="last15Days.length > 0" class="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-white flex items-center gap-1.5">
              <i class="fa-solid fa-chart-column text-blue-400"></i>
              {{ language.isGeorgian() ? 'დღიური აქტივობა (ბოლო 15 დღე)' : 'Daily Traffic Trend (Last 15 Days)' }}
            </span>
            <span class="text-[11px] text-slate-400">
              {{ language.isGeorgian() ? '15 დღის დინამიკა' : '15-day dynamic progression' }}
            </span>
          </div>

          <div class="h-24 flex items-end justify-between gap-1 sm:gap-2 pt-5 px-1">
            <div
              *ngFor="let day of last15Days"
              class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar relative">
              
              <!-- Hover tooltip -->
              <div class="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-slate-950 border border-white/15 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                {{ day.timestamp | date:'MMM d' }}: {{ day.pageviews | number }} {{ language.isGeorgian() ? 'ნახვა' : 'views' }}
              </div>

              <!-- Bar -->
              <div
                class="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-cyan-400 group-hover/bar:from-blue-400 group-hover/bar:to-cyan-200 transition-all shadow-[0_0_8px_rgba(59,130,246,0.25)]"
                [style.height.%]="barHeight(day.pageviews)">
              </div>

              <!-- Date label -->
              <span class="text-[9px] text-slate-400 font-mono">
                {{ day.timestamp | date:'d' }}
              </span>
            </div>
          </div>
        </div>
      </ng-container>

    </section>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  private http = inject(HttpClient);
  language = inject(TranslationService);
  loading = false;
  error = false;
  summary: AnalyticsSummary | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.http.get<AnalyticsSummary>(`${API_CONFIG.baseUrl}/admin/analytics`).subscribe({
      next: summary => {
        this.summary = summary;
        this.loading = false;
      },
      error: () => {
        this.summary = null;
        this.error = true;
        this.loading = false;
      }
    });
  }

  get last15Days(): VisitRow[] {
    return (this.summary?.daily ?? []).slice(-15);
  }

  get totalViews(): number {
    if (this.summary?.pageviews !== undefined) {
      return this.summary.pageviews;
    }
    return this.last15Days.reduce((acc, d) => acc + (d.pageviews || 0), 0);
  }

  get totalVisitors(): number {
    if (this.summary?.visitors !== undefined) {
      return this.summary.visitors;
    }
    return this.last15Days.reduce((acc, d) => acc + (d.visitors || 0), 0);
  }

  get peakPageviews(): number {
    return Math.max(1, ...this.last15Days.map(d => d.pageviews || 0));
  }

  barHeight(views: number): number {
    return Math.max(views > 0 ? 8 : 4, Math.round((views / this.peakPageviews) * 100));
  }
}


