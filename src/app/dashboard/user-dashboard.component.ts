import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { DocumentService } from '../core/services/document.service';
import { NotificationService } from '../core/services/notification.service';
import { TranslationService } from '../core/services/translation.service';
import { DocumentDto } from '../core/models/document.model';
import { StatusLabelPipe } from '../shared/pipes/status-label.pipe';
import { PhaseLabelPipe } from '../shared/pipes/phase-label.pipe';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { PrivacyPolicyModalComponent } from '../shared/components/privacy-policy-modal/privacy-policy-modal.component';
import { WebPushService } from '../core/services/web-push.service';
import { PollNotificationService } from '../core/services/poll-notification.service';

interface StaticTemplateItem {
  id: string;
  phase: number; // -1 for Universal / All Phases
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isExternalLink?: boolean;
  descriptionKa: string;
  descriptionEn: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    StatusLabelPipe, 
    PhaseLabelPipe, 
    FileSizePipe, 
    TranslatePipe,
    ConfirmDialogComponent,
    PrivacyPolicyModalComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in w-full overflow-hidden">
      
      <!-- Personal Cabinet Header -->
      <div class="glass-card p-4 sm:p-6 border-slate-700/50 relative overflow-hidden">
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div class="flex items-center gap-3 sm:gap-5 w-full md:w-auto relative z-10">
            <div class="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] blob blob-morph grid place-items-center
                        text-xl sm:text-2xl font-bold font-heading shrink-0 text-blue-300 border border-blue-500/30"
              style="background: rgb(var(--c-clay-500) / .2)">
              {{ getUserInitials() }}
            </div>
            <div class="overflow-hidden">
              <p class="eyebrow mb-1">{{ 'dash.cabinet' | translate }}</p>
              <h1 class="font-heading font-extrabold text-white text-2xl sm:text-3xl leading-tight truncate">
                {{ currentUser?.name || 'User' }}
              </h1>
              <p class="text-xs sm:text-sm text-slate-400 mt-1 truncate">
                <i class="fa-solid fa-envelope mr-1 text-slate-500"></i> {{ currentUser?.email }}
              </p>
            </div>
          </div>

          <!-- Phase & Status Indicators -->
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap w-full md:w-auto">
            <div class="glass-card px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900/60 border-slate-700/60 flex-1 md:flex-initial">
              <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 sm:mb-1">{{ 'dash.phase' | translate }}</div>
              <span class="badge badge-phase text-xs">
                <i class="fa-solid fa-layer-group text-xs"></i>
                {{ userPhase | phaseLabel }}
              </span>
            </div>

            <div class="glass-card px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900/60 border-slate-700/60 flex-1 md:flex-initial">
              <div class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 sm:mb-1">{{ 'dash.status' | translate }}</div>
              <span class="badge text-xs" [ngClass]="getStatusBadgeClass(userStatus)">
                <i class="fa-solid" [ngClass]="getStatusIcon(userStatus)"></i>
                {{ userStatus | statusLabel }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Quick Steps Banner -->
      <div class="glass-card p-4 sm:p-6 border-blue-500/30 bg-gradient-to-r from-blue-950/40 to-slate-900/60 space-y-4">
        <div class="flex flex-col sm:flex-row items-start gap-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex-shrink-0 flex items-center justify-center text-lg sm:text-xl border border-blue-500/30">
            <i class="fa-solid fa-compass-drafting"></i>
          </div>
          <div class="space-y-3 flex-1 w-full">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3 class="text-base sm:text-lg font-bold text-white font-heading">
                {{ getPhaseInstructionTitle() }}
              </h3>
              <span class="text-[10px] sm:text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 font-semibold">
                Phase {{ userPhase + 1 }} Progress
              </span>
            </div>

            <!-- Steps Progress list -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-2.5 sm:p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span class="text-xs text-slate-300 font-medium">Download Phase Template</span>
              </div>
              <div class="p-2.5 sm:p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span class="text-xs text-slate-300 font-medium">Fill & Sign Form</span>
              </div>
              <div class="p-2.5 sm:p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span class="text-xs text-slate-300 font-medium">Upload Document</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        <!-- Left Column: Upload Dropzone & Required Templates -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- Document Upload Box -->
          <div class="glass-card p-4 sm:p-6 border-slate-700/50 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
                <i class="fa-solid fa-cloud-arrow-up text-blue-400"></i>
                {{ 'dash.uploadTitle' | translate }}
              </h3>
              <span class="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-white/5">Max 10MB</span>
            </div>

            <!-- Drag & Drop Zone -->
            <div 
              class="dropzone group"
              [class.active]="isDragging"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">
              
              <input 
                #fileInput
                type="file" 
                class="hidden" 
                accept=".pdf,.docx,.doc"
                (change)="onFileSelected($event)">

              <div class="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-file-arrow-up"></i>
              </div>

              <div class="text-sm font-semibold text-slate-200">
                {{ 'dash.dragDrop' | translate }}
              </div>
              <div class="text-xs text-slate-400 mt-1">
                or <span class="text-blue-400 underline cursor-pointer">{{ 'dash.browse' | translate }}</span>
              </div>
              <div class="text-[11px] text-slate-500 mt-3 pt-3 border-t border-white/5">
                Allowed formats: <strong class="text-slate-400">PDF, DOCX, DOC</strong>
              </div>
            </div>

            <!-- Selected File Preview & Upload Action -->
            <div *ngIf="selectedFile" class="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div class="flex items-center gap-3 overflow-hidden">
                <i class="fa-solid fa-file-lines text-blue-400 text-lg"></i>
                <div class="truncate">
                  <div class="text-xs font-bold text-slate-200 truncate">{{ selectedFile.name }}</div>
                  <div class="text-[10px] text-slate-400">{{ selectedFile.size | fileSize }}</div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  (click)="selectedFile = null" 
                  class="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove file">
                  <i class="fa-solid fa-xmark"></i>
                </button>
                <button 
                  (click)="uploadFile()" 
                  [disabled]="isUploading"
                  class="btn btn-primary btn-sm">
                  <span *ngIf="!isUploading"><i class="fa-solid fa-upload"></i> Upload</span>
                  <span *ngIf="isUploading"><i class="fa-solid fa-spinner fa-spin"></i></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Template Documents Section (Phase Specific Downloadable Forms) -->
          <div class="glass-card p-4 sm:p-6 border-slate-700/50 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white font-heading flex items-center gap-2">
                <i class="fa-solid fa-file-signature text-emerald-400"></i>
                {{ 'dash.templatesTitle' | translate }}
              </h3>
              <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Required</span>
            </div>

            <p class="text-xs text-slate-400">
              {{ translationService.isGeorgian() ? 'ადმინისტრაციის მიერ გამოგზავნილი ოფიციალური დოკუმენტები თქვენი მიმდინარე ეტაპისთვის (' + (userPhase | phaseLabel) + ').' : 'Official documents issued by administration for your current phase (' + (userPhase | phaseLabel) + ').' }}
            </p>

            <!-- Combined List: Backend Issued Documents -->
            <div class="space-y-3">
              
              <!-- Frontend Phase Templates & External Links -->
              <div 
                *ngFor="let tpl of getActivePhaseTemplates()" 
                class="p-3 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center justify-between transition-colors gap-2">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base shrink-0">
                    <i class="fa-solid" [ngClass]="tpl.isExternalLink ? 'fa-link text-blue-400' : 'fa-file-pdf'"></i>
                  </div>
                  <div class="truncate">
                    <div class="text-xs font-semibold text-slate-200 truncate">{{ tpl.fileName }}</div>
                    <div class="text-[10px] text-slate-400 truncate">{{ translationService.isGeorgian() ? tpl.descriptionKa : tpl.descriptionEn }}</div>
                  </div>
                </div>

                <a 
                  [href]="tpl.fileUrl" 
                  [target]="tpl.isExternalLink ? '_blank' : '_self'"
                  [download]="tpl.isExternalLink ? null : tpl.fileName"
                  class="btn btn-secondary btn-sm text-xs px-2.5 py-1 flex items-center gap-1 shrink-0">
                  <i class="fa-solid" [ngClass]="tpl.isExternalLink ? 'fa-up-right-from-square' : 'fa-download'"></i>
                  <span>{{ tpl.isExternalLink ? 'Open Link' : 'Download' }}</span>
                </a>
              </div>

              <!-- Backend Issued Admin Documents -->
              <div 
                *ngFor="let doc of getAdminSentDocuments()" 
                class="p-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition-colors gap-2">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-base shrink-0">
                    <i class="fa-solid fa-file-contract"></i>
                  </div>
                  <div class="truncate">
                    <div class="text-xs font-semibold text-slate-200 truncate">{{ doc.fileName }}</div>
                    <div class="text-[10px] text-slate-500">{{ doc.fileSize | fileSize }}</div>
                  </div>
                </div>

                <button 
                  (click)="downloadAdminDoc(doc)" 
                  class="btn btn-secondary btn-sm text-xs px-2.5 py-1">
                  <i class="fa-solid fa-download"></i> Download
                </button>
              </div>

              <!-- Friendly Notice When No Extra Backend Documents Exist -->
              <div 
                *ngIf="getActivePhaseTemplates().length === 0 && getAdminSentDocuments().length === 0" 
                class="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center space-y-1">
                <div class="text-xs text-slate-300 font-semibold">
                  {{ translationService.isGeorgian() ? 'ამ ეტაპისთვის დოკუმენტები ჯერ არ არის გამოგზავნილი' : 'No documents issued for this phase yet' }}
                </div>
                <div class="text-[10px] text-slate-500">
                  {{ translationService.isGeorgian() ? 'ადმინისტრაციის მიერ გამოგზავნილი დოკუმენტები გამოჩნდება აქ' : 'Documents sent by administration will appear here' }}
                </div>
              </div>

            </div>
          </div>

          <!-- Universal Static General Documents (From public/templates/general) -->
          <div *ngIf="getGeneralTemplates().length > 0" class="glass-card p-4 sm:p-6 border-slate-700/50 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white font-heading flex items-center gap-2">
                <i class="fa-solid fa-book-open text-purple-400"></i>
                {{ translationService.isGeorgian() ? 'ზოგადი დოკუმენტები' : 'Universal Company Guides' }}
              </h3>
              <span class="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">All Phases</span>
            </div>

            <p class="text-xs text-slate-400">
              General company information documents, certificates, and bank details available to all students.
            </p>

            <div class="space-y-3">
              <div 
                *ngFor="let gen of getGeneralTemplates()" 
                class="p-3 bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-xl flex items-center justify-between transition-colors gap-2">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-base shrink-0">
                    <i class="fa-solid fa-file-pdf"></i>
                  </div>
                  <div class="truncate">
                    <div class="text-xs font-semibold text-slate-200 truncate">{{ gen.fileName }}</div>
                    <div class="text-[10px] text-slate-400 truncate">{{ translationService.isGeorgian() ? gen.descriptionKa : gen.descriptionEn }}</div>
                  </div>
                </div>

                <a 
                  [href]="gen.fileUrl" 
                  [download]="gen.fileName"
                  class="btn btn-secondary btn-sm text-xs px-2.5 py-1 flex items-center gap-1 shrink-0">
                  <i class="fa-solid fa-download"></i> Download
                </a>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: My Uploaded Documents Table & Phase Instruction Details Card -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- My Uploaded Documents Table Card -->
          <div class="glass-card p-4 sm:p-6 border-slate-700/50 space-y-6">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 class="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <i class="fa-solid fa-folder-closed text-blue-400"></i>
                  {{ 'dash.myDocsTitle' | translate }}
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Manage and track your submitted files</p>
              </div>

              <button (click)="loadUserDocuments(); loadUserProfile();" class="btn btn-secondary btn-sm text-xs">
                <i class="fa-solid fa-rotate-right" [class.fa-spin]="isLoadingUserDocs"></i> {{ 'dash.refresh' | translate }}
              </button>
            </div>

            <!-- Documents Table -->
            <div class="overflow-x-auto w-full">
              <table *ngIf="userDocuments.length > 0" class="custom-table w-full">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Uploaded Date</th>
                    <th>Size</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let doc of getMyUploadedDocuments()">
                    <td>
                      <div class="flex items-center gap-3 min-w-[160px]">
                        <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                          <i class="fa-solid" [ngClass]="getFileIcon(doc.fileName)"></i>
                        </div>
                        <div class="truncate">
                          <div class="font-semibold text-slate-200 text-sm truncate flex items-center gap-2">
                            <span>{{ doc.fileName }}</span>
                          </div>
                          <div class="text-[10px] text-slate-500 truncate">{{ doc.contentType }}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Uploaded" class="text-slate-400 text-xs whitespace-nowrap">
                      {{ doc.uploadedAt | date:'mediumDate' }}
                    </td>
                    <td data-label="Size" class="text-slate-400 text-xs whitespace-nowrap">
                      {{ doc.fileSize | fileSize }}
                    </td>
                    <td class="text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-2 max-md:justify-start">
                        <button 
                          (click)="downloadDoc(doc)" 
                          class="btn btn-secondary btn-sm"
                          title="Download file">
                          <i class="fa-solid fa-download"></i>
                        </button>
                        <button 
                          (click)="promptDeleteDoc(doc)" 
                          class="btn btn-danger btn-sm"
                          title="Delete file">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div *ngIf="!isLoadingUserDocs && userDocuments.length === 0" class="py-12 text-center text-slate-400 space-y-3">
                <div class="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-600 text-2xl">
                  <i class="fa-solid fa-folder-open"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-300">No documents uploaded yet</h4>
                  <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Upload your completed phase forms using the upload box on the left.
                  </p>
                </div>
              </div>

              <!-- Loading Skeleton -->
              <div *ngIf="isLoadingUserDocs" class="py-12 text-center text-slate-500">
                <i class="fa-solid fa-circle-notch fa-spin text-2xl text-blue-500 mb-2"></i>
                <div class="text-xs">Fetching your documents...</div>
              </div>
            </div>
          </div>

          <!-- Phase Detailed Instruction Card (In Lower Empty Space) -->
          <div class="glass-card p-4 sm:p-6 border-slate-700/50 space-y-5">
            <div class="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg border border-blue-500/20 shrink-0">
                  <i class="fa-solid fa-scroll"></i>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white font-heading">
                    {{ getPhaseInstructionTitle() }}
                  </h3>
                  <p class="text-xs text-slate-400">
                    {{ translationService.isGeorgian() ? 'ეტაპის დეტალური ინსტრუქცია და მოთხოვნილი დოკუმენტები' : 'Detailed phase guidelines & required checklist' }}
                  </p>
                </div>
              </div>

              <span class="text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 font-bold">
                Phase {{ userPhase + 1 }} Official Guidelines
              </span>
            </div>

            <!-- Phase 1 Detailed Instructions & Fee Alert -->
            <div *ngIf="userPhase === 0" class="space-y-4 text-xs sm:text-sm text-slate-200">
              <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div class="font-bold text-white text-sm flex items-center gap-2">
                  <i class="fa-solid fa-file-export text-blue-400"></i>
                  <span>I ეტაპი — რეგისტრაცია</span>
                </div>
                <p class="leading-relaxed text-slate-300 text-xs sm:text-sm">
                  რეგისტრაციის პირველ ეტაპზე აუცილებელია:
                </p>
                <ul class="space-y-1.5 text-xs sm:text-sm text-slate-200">
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 mt-1 flex-shrink-0"></i>
                    <span>რეზიუმეს (CV) ატვირთვა/გამოგზავნა</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 mt-1 flex-shrink-0"></i>
                    <span>გადახდის დამადასტურებელი დოკუმენტის ატვირთვა — საბანკო ამონაწერი ან ბანკის მიერ გაცემული გადახდის დამადასტურებელი PDF ფაილი.</span>
                  </li>
                </ul>
                <p class="leading-relaxed text-xs text-slate-300 pt-1">
                  გთხოვთ, გადახდის შემდეგ 24 საათის განმავლობაში ატვირთოთ გადახდის დამადასტურებელი დოკუმენტი თქვენს პირად გვერდზე.
                </p>
              </div>

              <div class="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-2 text-amber-200">
                <div class="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  <span>მნიშვნელოვანი</span>
                </div>
                <p class="leading-relaxed text-xs text-slate-200">
                  თუ აღნიშნული დოკუმენტები 24 საათის განმავლობაში არ იქნება წარმოდგენილი, რეგისტრაციის პროცესი ავტომატურად შეწყდება და შექმნილი ანგარიში გაუქმდება.
                </p>
                <p class="leading-relaxed text-xs text-amber-300 font-semibold pt-2 border-t border-amber-500/20">
                  გთხოვთ, ყურადღებით გაიაროთ რეგისტრაციის ყველა ეტაპი და დროულად წარმოადგინოთ მოთხოვნილი ინფორმაცია და დოკუმენტები.
                </p>
              </div>
            </div>

            <!-- Phase 2 Detailed Instructions & Required Document Checklist -->
            <div *ngIf="userPhase === 1" class="space-y-4 text-xs sm:text-sm text-slate-200">
              <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div class="font-bold text-white text-sm flex items-center gap-2">
                  <i class="fa-solid fa-signature text-blue-400"></i>
                  <span>{{ translationService.isGeorgian() ? 'II ეტაპი — ხელშეკრულება და დოკუმენტაცია' : 'Phase 2 — Contract & Documentation' }}</span>
                </div>
                <p class="leading-relaxed text-slate-200">
                  {{ translationService.isGeorgian()
                    ? 'გთხოვთ, ხელშეკრულება ჩამოტვირთოთ, სრულად შეავსოთ და ხელი მოაწეროთ. ხელმოწერილი დოკუმენტი გთხოვთ, PDF ფორმატში ატვირთოთ/გამოგვიგზავნოთ შესაბამის ველში.'
                    : 'Please download the contract below, fill it out completely, and sign it. Please upload your signed document in PDF format using the upload box.'
                  }}
                </p>
                <p class="leading-relaxed font-semibold text-blue-300 bg-blue-950/40 p-3 rounded-lg border border-blue-500/20">
                  {{ translationService.isGeorgian()
                    ? 'გთხოვთ, გადაამოწმოთ, რომ ყველა საჭირო ველი სრულად არის შევსებული და ხელმოწერა მკაფიოდ იკითხება.'
                    : 'Please double check that all required fields are filled out and your signature is clearly legible.'
                  }}
                </p>
              </div>

              <!-- II Phase Required Documents Checklist Box -->
              <div class="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-500/30 rounded-xl space-y-3">
                <div class="flex items-center gap-2 text-blue-400 font-bold text-sm border-b border-white/10 pb-2">
                  <i class="fa-solid fa-list-check text-base"></i>
                  <span>{{ translationService.isGeorgian() ? 'II ეტაპზე წარმოსადგენი დოკუმენტები' : 'Documents Required for Phase II' }}</span>
                </div>

                <ul class="space-y-2 text-xs sm:text-sm text-slate-200">
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 mt-1 flex-shrink-0"></i>
                    <span><strong>ბიომეტრიული პასპორტი</strong> — Biometrischer Reisepass</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 mt-1 flex-shrink-0"></i>
                    <span><strong>სტუდენტის სტატუსის დამადასტურებელი ცნობა</strong></span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 mt-1 flex-shrink-0"></i>
                    <span><strong>Immatrikulationsbescheinigung</strong> — უნივერსიტეტში ჩარიცხვის დამადასტურებელი დოკუმენტი</span>
                  </li>
                  <li class="flex items-start gap-2.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 mt-1 flex-shrink-0"></i>
                    <span><strong>ფსიქიატრიული ცნობა</strong></span>
                  </li>
                </ul>


              </div>

              <!-- Official Form External Link Card -->
              <div class="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-2xl text-rose-400 shrink-0"></i>
                  <div class="overflow-hidden">
                    <div class="font-bold text-white text-xs truncate">Arbeitsagentur Immatrikulationsbescheinigung</div>
                    <div class="text-[10px] text-slate-400 truncate">https://www.arbeitsagentur.de/datei/b-immatrikulation-en_ba015238.pdf</div>
                  </div>
                </div>

                <a 
                  href="https://www.arbeitsagentur.de/datei/b-immatrikulation-en_ba015238.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 shrink-0">
                  <span>{{ translationService.isGeorgian() ? 'გახსენი PDF ბმული' : 'Open PDF Link' }}</span>
                  <i class="fa-solid fa-up-right-from-square"></i>
                </a>
              </div>
            </div>

            <!-- Phase 3 Detailed Instructions -->
            <div *ngIf="userPhase === 2" class="space-y-4 text-xs sm:text-sm text-slate-200">
              <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                <div class="font-bold text-white text-sm flex items-center gap-2">
                  <i class="fa-solid fa-plane-departure text-emerald-400"></i>
                  <span>III ეტაპი – სამუშაო ნებართვა და გამგზავრება</span>
                </div>
                <p class="leading-relaxed text-slate-200 text-sm font-medium">
                  {{ translationService.isGeorgian()
                    ? 'III ეტაპზე სტუდენტს გადაეცემა გერმანიის შესაბამისი უწყებიდან გამოგზავნილი სამუშაო ნებართვა, რის შემდეგაც ხდება გამგზავრებისთვის საჭირო პროცედურების დაგეგმვა და სტუდენტის გერმანიაში გამგზავრების ორგანიზება.'
                    : 'In Phase 3, the student receives the official work permit issued by the relevant German authority, after which departure procedures and travel to Germany are organized.'
                  }}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Delete Document Confirmation Modal -->
      <app-confirm-dialog
        [isOpen]="showDeleteModal"
        title="Delete Document"
        [message]="'Are you sure you want to delete ' + (selectedDocToDelete?.fileName || 'this document') + '? This action cannot be undone.'"
        confirmText="Delete File"
        (confirmed)="confirmDeleteDoc()"
        (cancelled)="showDeleteModal = false">
      </app-confirm-dialog>

      <!-- Privacy Terms Modal for User Review -->
      <app-privacy-policy-modal
        [isOpen]="showTermsModal"
        [canCloseWithoutAgree]="true"
        (agreed)="onTermsAgreed()"
        (cancelled)="showTermsModal = false">
      </app-privacy-policy-modal>
    </div>
  `
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  documentService = inject(DocumentService);
  notificationService = inject(NotificationService);
  translationService = inject(TranslationService);
  webPushService = inject(WebPushService);
  pollNotificationService = inject(PollNotificationService);

  currentUser = this.authService.currentUserSignal();
  
  userStatus = 0; // Default Pending
  userPhase = 0; // Default Phase One

  userDocuments: DocumentDto[] = [];
  adminPhaseDocuments: DocumentDto[] = [];

  isLoadingUserDocs = false;
  isLoadingAdminDocs = false;
  isUploading = false;
  isDragging = false;

  selectedFile: File | null = null;
  selectedDocToDelete: DocumentDto | null = null;
  showDeleteModal = false;
  showTermsModal = false;

  staticTemplates: StaticTemplateItem[] = [];

  generalStaticTemplates: StaticTemplateItem[] = [];

  getMyUploadedDocuments(): DocumentDto[] {
    return this.userDocuments.filter(d => !d.isAdminUploaded);
  }

  getAdminSentDocuments(): DocumentDto[] {
    const fromUserDocs = this.userDocuments.filter(d => d.isAdminUploaded);
    const combined = [...fromUserDocs];
    for (const doc of this.adminPhaseDocuments) {
      if (!combined.some(d => d.id === doc.id)) {
        combined.push(doc);
      }
    }
    return combined;
  }

  ngOnInit() {
    this.checkPrivacyPolicyStatus();
    this.loadUserProfile();
    this.loadUserDocuments();
    this.loadAdminPhaseDocuments();
    // Register push notifications & poll fallback (works across all browsers)
    this.webPushService.init();
    this.pollNotificationService.init();
  }

  ngOnDestroy() {
    // nothing to clean — push is handled by service worker
  }

  getDisabledTemplateIds(): string[] {
    try {
      const raw = localStorage.getItem('geto_disabled_templates');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getActivePhaseTemplates(): StaticTemplateItem[] {
    const disabledIds = this.getDisabledTemplateIds();
    return this.staticTemplates.filter(t => t.phase === this.userPhase && !disabledIds.includes(t.id));
  }

  getGeneralTemplates(): StaticTemplateItem[] {
    const disabledIds = this.getDisabledTemplateIds();
    return this.generalStaticTemplates.filter(t => !disabledIds.includes(t.id));
  }

  getPhaseInstructionTitle(): string {
    const isKa = this.translationService.isGeorgian();
    switch (this.userPhase) {
      case 0:
        return isKa ? 'I ეტაპი — რეგისტრაცია' : 'Phase 1 — Registration';
      case 1:
        return isKa ? 'II ეტაპი — ხელშეკრულება და დოკუმენტაცია' : 'Phase 2 — Contract & Documentation';
      case 2:
        return isKa ? 'III ეტაპი – სამუშაო ნებართვა და გამგზავრება' : 'Phase 3 — Work Permit & Departure';
      default:
        return isKa ? 'ეტაპის ინსტრუქცია' : 'Phase Instructions';
    }
  }

  checkPrivacyPolicyStatus() {
    const userId = this.currentUser?.userId;
    if (userId) {
      const agreed = localStorage.getItem(`geto_terms_agreed_${userId}`);
      if (!agreed) {
        this.showTermsModal = true;
      }
    }
  }

  onTermsAgreed() {
    const userId = this.currentUser?.userId;
    if (userId) {
      localStorage.setItem(`geto_terms_agreed_${userId}`, 'true');
    }
    this.showTermsModal = false;
    this.notificationService.success('Privacy policy terms confirmed.', 'Accepted');
  }

  getUserInitials(): string {
    const name = this.currentUser?.name || 'User';
    return name.substring(0, 2).toUpperCase();
  }

  loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.userStatus = Number(res.data.status);
          this.userPhase = Number(res.data.userPhase);
          this.loadAdminPhaseDocuments();
        }
      }
    });
  }

  loadUserDocuments() {
    this.isLoadingUserDocs = true;
    this.documentService.getUserDocuments().subscribe({
      next: (res) => {
        this.isLoadingUserDocs = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.userDocuments = res.data;
        }
      },
      error: () => {
        this.isLoadingUserDocs = false;
      }
    });
  }

  loadAdminPhaseDocuments() {
    this.isLoadingAdminDocs = true;
    this.documentService.getAdminDocumentsByPhase().subscribe({
      next: (res) => {
        this.isLoadingAdminDocs = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.adminPhaseDocuments = res.data;
        } else {
          this.adminPhaseDocuments = [];
        }
      },
      error: () => {
        this.isLoadingAdminDocs = false;
        this.adminPhaseDocuments = [];
      }
    });
  }

  // File Upload Handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFile(event.target.files[0]);
    }
  }

  handleFile(file: File) {
    // Validate File Size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.notificationService.error('File size exceeds maximum limit of 10MB.', 'File Too Large');
      return;
    }

    // Validate Extension (.pdf, .docx, .doc)
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      this.notificationService.error('Only .pdf, .docx, and .doc files are allowed.', 'Invalid File Type');
      return;
    }

    this.selectedFile = file;
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.documentService.uploadDocument(this.selectedFile).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.statusCode === 200) {
          this.notificationService.success('Document uploaded successfully!', 'Upload Success');
          this.selectedFile = null;
          this.loadUserDocuments();
        } else {
          this.notificationService.error(res.message || 'Failed to upload document', 'Upload Failed');
        }
      },
      error: () => {
        this.isUploading = false;
      }
    });
  }

  // Document Download & Deletion
  downloadDoc(doc: DocumentDto) {
    this.documentService.downloadDocument(doc.id, doc.fileName).subscribe({
      next: () => {
        this.notificationService.info(`Downloading ${doc.fileName}...`, 'Download Started');
      }
    });
  }

  downloadAdminDoc(doc: DocumentDto) {
    this.documentService.downloadAdminPhaseDocument(doc.id, doc.fileName).subscribe({
      next: () => {
        this.notificationService.info(`Downloading template ${doc.fileName}...`, 'Download Started');
      }
    });
  }

  promptDeleteDoc(doc: DocumentDto) {
    this.selectedDocToDelete = doc;
    this.showDeleteModal = true;
  }

  confirmDeleteDoc() {
    if (!this.selectedDocToDelete) return;
    const docId = this.selectedDocToDelete.id;

    this.documentService.deleteDocument(docId).subscribe({
      next: (res) => {
        this.showDeleteModal = false;
        this.selectedDocToDelete = null;
        if (res.statusCode === 200) {
          this.notificationService.success('Document deleted successfully.', 'Deleted');
          this.loadUserDocuments();
        } else {
          this.notificationService.error(res.message || 'Failed to delete document', 'Error');
        }
      }
    });
  }

  // UI Helper functions
  getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'fa-file-pdf text-rose-400';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word text-blue-400';
    return 'fa-file-lines text-slate-400';
  }

  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 2: return 'badge-approved';
      case 0: return 'badge-pending';
      case 1: return 'badge-rejected';
      case 3: return 'badge-resubmission';
      default: return 'badge-pending';
    }
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case 2: return 'fa-circle-check';
      case 0: return 'fa-clock';
      case 1: return 'fa-circle-xmark';
      case 3: return 'fa-rotate-left';
      default: return 'fa-circle';
    }
  }
}
