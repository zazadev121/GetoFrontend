import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { TranslationService } from '../core/services/translation.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      <!-- Hero Banner -->
      <div class="glass-card p-8 sm:p-12 border-slate-700/50 relative overflow-hidden text-center">
        <!-- Background Ambient Glow -->
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl mx-auto space-y-4">
          <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border border-blue-500/30 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 transform hover:scale-105 transition-transform p-1">
            <img src="/recommendations/Geto Logo.jpg" alt="GETO Logo" class="w-full h-full object-cover rounded-xl">
          </div>

          <h1 class="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
            {{ 'about.title' | translate }}
          </h1>

          <p class="text-base sm:text-lg text-blue-400 font-semibold max-w-2xl mx-auto">
            {{ 'about.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Main Text Card Section -->
      <div class="glass-card p-8 border-slate-700/50 relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-start gap-6">
          <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex-shrink-0 flex items-center justify-center text-2xl border border-blue-500/20">
            <i class="fa-solid fa-handshake"></i>
          </div>

          <div class="space-y-4 flex-1">
            <h2 class="text-xl font-bold text-white font-heading">
              {{ 'about.title' | translate }} — Geto Project
            </h2>

            <p class="text-slate-200 text-base sm:text-lg leading-relaxed font-normal bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              {{ 'about.body' | translate }}
            </p>
          </div>
        </div>
      </div>

      <!-- Feature Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 border-slate-700/50 space-y-3 hover:border-blue-500/40 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-calendar-check"></i>
          </div>
          <h3 class="text-lg font-bold text-white font-heading">
            {{ 'about.stat1.title' | translate }}
          </h3>
          <p class="text-xs text-slate-400">
            {{ 'about.stat1.sub' | translate }}
          </p>
        </div>

        <div class="glass-card p-6 border-slate-700/50 space-y-3 hover:border-emerald-500/40 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-plane-departure"></i>
          </div>
          <h3 class="text-lg font-bold text-white font-heading">
            {{ 'about.stat2.title' | translate }}
          </h3>
          <p class="text-xs text-slate-400">
            {{ 'about.stat2.sub' | translate }}
          </p>
        </div>

        <div class="glass-card p-6 border-slate-700/50 space-y-3 hover:border-purple-500/40 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl">
            <i class="fa-solid fa-file-contract"></i>
          </div>
          <h3 class="text-lg font-bold text-white font-heading">
            {{ 'about.stat3.title' | translate }}
          </h3>
          <p class="text-xs text-slate-400">
            {{ 'about.stat3.sub' | translate }}
          </p>
        </div>
      </div>

      <!-- Action Callout Card -->
      <div class="glass-card p-8 border-slate-700/50 text-center space-y-4">
        <h3 class="text-xl font-bold text-white font-heading">
          {{ authService.isLoggedIn() ? 'Welcome to your portal' : 'Ready to start your process?' }}
        </h3>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <!-- Shown ONLY when NOT logged in -->
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/auth/register" class="btn btn-primary px-6 py-3 font-bold text-sm">
              <i class="fa-solid fa-user-plus"></i> {{ 'nav.register' | translate }}
            </a>
            <a routerLink="/auth/login" class="btn btn-secondary px-6 py-3 font-bold text-sm">
              <i class="fa-solid fa-right-to-bracket"></i> {{ 'nav.login' | translate }}
            </a>
          </ng-container>

          <!-- Shown when user IS logged in -->
          <ng-container *ngIf="authService.isLoggedIn()">
            <a routerLink="/dashboard" class="btn btn-primary px-6 py-3 font-bold text-sm">
              <i class="fa-solid fa-user-gear"></i> {{ 'nav.cabinet' | translate }}
            </a>
          </ng-container>
        </div>
      </div>

      <!-- LAST SECTION BEFORE FOOTER: Full-Width Responsive Business Partners Showcase -->
      <div class="space-y-4 pt-4 border-t border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg border border-indigo-500/20">
            <i class="fa-solid fa-building-columns font-bold"></i>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-extrabold text-white font-heading">
              {{ translationService.isGeorgian() ? 'ჩვენი პარტნიორები' : 'Our Business Partners' }}
            </h2>
            <p class="text-xs text-slate-400">German employers & educational partner network</p>
          </div>
        </div>

        <!-- Full-Size Responsive Image Display (no horizontal scrollbar, max-w bounded) -->
        <div class="w-full overflow-hidden rounded-2xl border border-slate-700/60 shadow-2xl bg-slate-900">
          <img 
            src="/recommendations/Partners.png" 
            alt="GETO Business Partners"
            class="w-full h-auto object-cover block rounded-2xl hover:scale-[1.01] transition-transform duration-300"
            (error)="onPartnerImgError($event)">
        </div>
      </div>

    </div>
  `
})
export class AboutUsComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);

  onPartnerImgError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80';
  }
}
