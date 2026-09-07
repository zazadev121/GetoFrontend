import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VacancyService } from '../../core/services/vacancy.service';
import { TranslationService } from '../../core/services/translation.service';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { VacancyDto } from '../../core/models/vacancy.model';

@Component({
  selector: 'app-vacancy-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FileSizePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">

      <a routerLink="/vacancies"
        class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors group no-underline">
        <i class="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
        <span>{{ translationService.isGeorgian() ? 'ვაკანსიებზე დაბრუნება' : 'Back to vacancies' }}</span>
      </a>

      <!-- Loading -->
      <div *ngIf="isLoading" class="py-20 text-center space-y-3 text-slate-400">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
        <div class="text-sm font-medium">{{ translationService.isGeorgian() ? 'იტვირთება...' : 'Loading...' }}</div>
      </div>

      <!-- Not found -->
      <div *ngIf="!isLoading && !vacancy" class="paper-card p-12 text-center space-y-4">
        <div class="w-16 h-16 squircle bg-slate-900 border border-slate-800 text-slate-500 mx-auto grid place-items-center text-2xl">
          <i class="fa-solid fa-briefcase"></i>
        </div>
        <h2 class="font-heading text-white">
          {{ translationService.isGeorgian() ? 'ვაკანსია ვერ მოიძებნა' : 'Vacancy not found' }}
        </h2>
        <a routerLink="/vacancies" class="btn btn-secondary btn-sm inline-flex">
          <i class="fa-solid fa-arrow-left"></i>
          {{ translationService.isGeorgian() ? 'ვაკანსიების სიაზე დაბრუნება' : 'Return to the list' }}
        </a>
      </div>

      <div *ngIf="!isLoading && vacancy" class="space-y-6">

        <!-- Main card -->
        <div class="paper-card p-6 sm:p-10 relative overflow-hidden space-y-6">
          <div class="wash w-72 h-72 -top-24 -right-24" style="background: rgb(var(--c-clay-500) / .16)"></div>

          <div class="relative z-10 space-y-4 border-b border-slate-700/50 pb-6">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="w-11 h-11 squircle bg-blue-500/10 border border-blue-500/20 text-blue-400 grid place-items-center text-lg shrink-0">
                <i class="fa-solid fa-briefcase"></i>
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20
                           text-blue-400 text-xs font-bold uppercase tracking-wider">
                {{ translationService.isGeorgian() ? 'ვაკანსია' : 'Vacancy' }}
              </span>
              <span *ngIf="translationService.currentLang() === 'en' && !vacancy.titleEn"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20
                       text-amber-400 text-[10px] font-bold uppercase tracking-wider"
                title="No English translation available — showing Georgian">
                <i class="fa-solid fa-language"></i> GE
              </span>
            </div>

            <h1 class="font-heading text-white leading-snug">{{ getTitle() }}</h1>

            <div class="flex items-center gap-3 flex-wrap">
              <span class="inline-flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-950/60
                           px-3 py-1.5 rounded-lg border border-slate-700/50">
                <i class="fa-regular fa-calendar-check text-blue-400"></i>
                {{ vacancy.dateCreated | date:'longDate' }}
              </span>

              <span *ngIf="vacancy.salary"
                class="inline-flex items-center gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-400
                       px-3 py-1.5 rounded-lg border border-emerald-500/25">
                <i class="fa-solid fa-sack-dollar"></i>
                {{ vacancy.salary }}
              </span>
            </div>
          </div>

          <div class="relative z-10 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {{ getText() }}
          </div>

          <!-- Links -->
          <div *ngIf="vacancy.links && vacancy.links.length > 0" class="relative z-10 pt-4 border-t border-slate-700/50 space-y-3">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-link text-blue-400"></i>
              <span>{{ translationService.isGeorgian() ? 'ბმულები' : 'Links' }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <a *ngFor="let link of vacancy.links"
                [href]="link.url" target="_blank" rel="noopener noreferrer"
                class="btn btn-secondary btn-sm">
                <i class="fa-solid fa-up-right-from-square text-[10px]"></i>
                <span>{{ link.label }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div *ngIf="vacancy.attachments && vacancy.attachments.length > 0" class="paper-card p-6 sm:p-8 space-y-4">
          <div class="flex items-center gap-3 border-b border-slate-700/50 pb-4 relative z-10">
            <span class="w-10 h-10 squircle bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 grid place-items-center text-lg shrink-0">
              <i class="fa-solid fa-paperclip"></i>
            </span>
            <div>
              <div class="font-bold text-white text-sm font-heading">
                {{ translationService.isGeorgian() ? 'მიმაგრებული ფაილები' : 'Attachments' }}
              </div>
              <div class="text-[11px] text-slate-400">
                {{ vacancy.attachments.length }}
                {{ translationService.isGeorgian() ? 'ფაილი ჩამოსატვირთი' : (vacancy.attachments.length === 1 ? 'file available' : 'files available') }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
            <div *ngFor="let att of vacancy.attachments"
              class="p-4 bg-slate-950/50 border border-slate-700/50 hover:border-emerald-500/40 rounded-2xl
                     flex items-center justify-between transition-all gap-3 group/att">
              <div class="flex items-center gap-3 overflow-hidden">
                <span class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 grid place-items-center text-base shrink-0">
                  <i class="fa-solid" [ngClass]="getFileIcon(att.fileName)"></i>
                </span>
                <div class="truncate">
                  <div class="text-xs font-semibold text-slate-200 truncate" [title]="att.fileName">{{ att.fileName }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ att.fileSize | fileSize }}</div>
                </div>
              </div>

              <a [href]="vacancyService.getAttachmentDownloadUrl(att.id)"
                target="_blank" [download]="att.fileName"
                class="btn btn-secondary btn-sm shrink-0">
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
export class VacancyDetailComponent implements OnInit {
  vacancyService = inject(VacancyService);
  translationService = inject(TranslationService);
  route = inject(ActivatedRoute);

  vacancy: VacancyDto | null = null;
  isLoading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.isLoading = false;
      return;
    }
    this.vacancyService.getAllVacancies().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.vacancy = res.data.find(v => v.id === id) ?? null;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getTitle(): string {
    if (this.translationService.currentLang() === 'en' && this.vacancy?.titleEn) {
      return this.vacancy.titleEn;
    }
    return this.vacancy?.title ?? '';
  }

  getText(): string {
    if (this.translationService.currentLang() === 'en' && this.vacancy?.textEn) {
      return this.vacancy.textEn;
    }
    return this.vacancy?.text ?? '';
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
