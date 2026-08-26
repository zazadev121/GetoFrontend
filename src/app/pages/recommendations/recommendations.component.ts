import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface PhotoItem {
  id: number;
  imageUrl: string;
  captionKa: string;
  captionEn: string;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      <!-- Hero Section -->
      <div class="glass-card p-8 sm:p-12 border-slate-700/50 relative overflow-hidden text-center space-y-4">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-transform p-1">
          <img src="/recommendations/Geto Logo.jpg" alt="GETO Logo" class="w-full h-full object-cover rounded-xl">
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          {{ 'recom.title' | translate }}
        </h1>

        <p class="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">
          {{ 'recom.subtitle' | translate }}
        </p>
      </div>

      <!-- Recommendation Photos Showcase Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          *ngFor="let photo of photoList" 
          (click)="selectedImage = photo.imageUrl"
          class="glass-card p-4 border-slate-700/50 space-y-3 hover:border-emerald-500/40 transition-all cursor-pointer group">
          
          <div class="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] flex items-center justify-center">
            <img 
              [src]="photo.imageUrl" 
              alt="Recommendation Document"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold gap-2">
              <i class="fa-solid fa-magnifying-glass-plus text-lg"></i>
              <span>Click to view full photo</span>
            </div>
          </div>

          <div class="text-xs text-slate-400 font-medium px-2 text-center">
            {{ translationService.isGeorgian() ? photo.captionKa : photo.captionEn }}
          </div>
        </div>
      </div>

      <!-- Professional Recommendation Story Text Card -->
      <div class="glass-card p-8 border-slate-700/50 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/20">
            <i class="fa-solid fa-certificate"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white font-heading">
              {{ translationService.isGeorgian() ? 'სტუდენტების გამოცდილება და შედეგები' : 'Student Experience & Accomplishments' }}
            </h3>
            <p class="text-xs text-slate-400">GETO Project Official Partnership & Advisory Guidance</p>
          </div>
        </div>

        <p class="text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          {{ translationService.isGeorgian() 
            ? 'GETO Project-ის გუნდი 2020 წლიდან აქტიურად ეხმარება სტუდენტებს გერმანიაში დასაქმებისა და სწავლის პროცესში. ჩვენი მონაწილეების კმაყოფილება, გამართული დოკუმენტაცია და მიღწეული შედეგები ჩვენი მთავარი პრიორიტეტია. ზემოთ წარმოდგენილი ოფიციალური სარეკომენდაციო ფოტოები ასახავს ჩვენი პარტნიორების კმაყოფილებასა და ერთობლივ წარმატებას.'
            : 'Since 2020, the GETO Project team has been actively guiding students through their employment and education journey in Germany. The satisfaction of our participants, flawless documentation support, and achieved results remain our top priority. The official recommendation photos displayed above reflect the trust and shared success of our partner organizations.'
          }}
        </p>
      </div>

      <!-- Lightbox Modal for Full Image Viewing (Full Viewport Coverage) -->
      <div *ngIf="selectedImage" (click)="selectedImage = null" class="fixed inset-0 z-[9999] w-screen h-screen min-h-screen bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in">
        <div class="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" (click)="$event.stopPropagation()">
          <button (click)="selectedImage = null" class="absolute -top-10 right-0 text-white hover:text-rose-400 text-xs sm:text-sm font-bold flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-white/10 shadow-lg">
            <i class="fa-solid fa-xmark"></i> Close
          </button>
          <img [src]="selectedImage" class="w-full max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl">
        </div>
      </div>

    </div>
  `
})
export class RecommendationsComponent {
  translationService = inject(TranslationService);
  selectedImage: string | null = null;

  photoList: PhotoItem[] = [
    {
      id: 1,
      imageUrl: '/recommendations/Screenshot 2026-08-26 172314.png',
      captionKa: 'ოფიციალური სარეკომენდაციო დოკუმენტი #1',
      captionEn: 'Official Recommendation Document #1'
    },
    {
      id: 2,
      imageUrl: '/recommendations/Screenshot 2026-08-26 172335.png',
      captionKa: 'ოფიციალური სარეკომენდაციო დოკუმენტი #2',
      captionEn: 'Official Recommendation Document #2'
    }
  ];
}
