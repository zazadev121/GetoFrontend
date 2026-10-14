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
  topPages?: VisitRow[];
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="glass-card p-4 sm:p-6 space-y-4" aria-labelledby="analytics-heading">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="eyebrow mb-1">Vercel Analytics</p>
          <h2 id="analytics-heading" class="font-heading text-lg sm:text-xl font-bold text-white">
            {{ language.isGeorgian() ? 'საიტის სტატისტიკა' : 'Site analytics' }}
          </h2>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" (click)="load()" [disabled]="loading">
          <i class="fa-solid fa-rotate-right" [class.fa-spin]="loading"></i>
          {{ language.isGeorgian() ? 'განახლება' : 'Refresh' }}
        </button>
      </div>

      <p *ngIf="loading" class="text-sm text-slate-400" role="status">
        {{ language.isGeorgian() ? 'იტვირთება...' : 'Loading analytics...' }}
      </p>

      <div *ngIf="!loading && !summary?.configured && !error" class="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-slate-200">
        {{ language.isGeorgian()
          ? 'სტატისტიკის საჩვენებლად backend-ის გარემოს ცვლადებში დაამატეთ VERCEL_ANALYTICS_TOKEN. Vercel-ში Web Analytics-იც ჩართეთ.'
          : 'To show statistics here, add VERCEL_ANALYTICS_TOKEN to the backend environment and enable Web Analytics in Vercel.' }}
      </div>

      <p *ngIf="!loading && error" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
        {{ language.isGeorgian()
          ? 'სტატისტიკა ვერ ჩაიტვირთა. შეამოწმეთ Vercel-ის ტოკენი, პროექტზე წვდომა და Web Analytics.'
          : 'Could not load analytics. Check the Vercel token, project access, and Web Analytics setting.' }}
      </p>

      <ng-container *ngIf="!loading && summary?.configured">
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <p class="text-xs text-slate-400">{{ language.isGeorgian() ? 'სულ ნახვები' : 'Total page views' }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ summary?.pageviews | number }}</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <p class="text-xs text-slate-400">{{ language.isGeorgian() ? 'სულ ვიზიტორები' : 'Total visitors' }}</p>
            <p class="text-2xl font-bold text-white mt-1">{{ summary?.visitors | number }}</p>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-4">
          <div class="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
            <h3 class="text-sm font-semibold text-white">{{ language.isGeorgian() ? 'ბოლო 30 დღე' : 'Last 30 days' }}</h3>
            <p *ngIf="!summary?.daily?.length" class="text-xs text-slate-400">{{ language.isGeorgian() ? 'მონაცემები ჯერ არ არის' : 'No data yet' }}</p>
            <div *ngFor="let day of summary?.daily" class="flex items-center gap-2 text-xs">
              <time class="text-slate-400 w-20 shrink-0">{{ day.timestamp | date:'MMM d' }}</time>
              <div class="h-2 rounded-full bg-slate-800 flex-1 overflow-hidden">
                <div class="h-full rounded-full bg-blue-500" [style.width.%]="barWidth(day.pageviews)"></div>
              </div>
              <span class="text-slate-200 w-10 text-right">{{ day.pageviews | number }}</span>
            </div>
          </div>
          <div class="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-3">
            <h3 class="text-sm font-semibold text-white">{{ language.isGeorgian() ? 'ყველაზე პოპულარული გვერდები · 30 დღე' : 'Top pages · 30 days' }}</h3>
            <p *ngIf="!summary?.topPages?.length" class="text-xs text-slate-400">{{ language.isGeorgian() ? 'მონაცემები ჯერ არ არის' : 'No data yet' }}</p>
            <div *ngFor="let page of summary?.topPages" class="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-xs">
              <span class="text-slate-200 truncate" [title]="page.requestPath">{{ page.requestPath || '/' }}</span>
              <span class="text-blue-300 font-semibold shrink-0">{{ page.pageviews | number }}</span>
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

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = false;
    this.http.get<AnalyticsSummary>(`${API_CONFIG.baseUrl}/admin/analytics`).subscribe({
      next: summary => { this.summary = summary; this.loading = false; },
      error: () => { this.summary = null; this.error = true; this.loading = false; }
    });
  }

  barWidth(value: number): number {
    const peak = Math.max(1, ...(this.summary?.daily ?? []).map(day => day.pageviews));
    return Math.max(value > 0 ? 3 : 0, value / peak * 100);
  }
}
