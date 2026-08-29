import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/services/admin.service';
import { NewsService } from '../core/services/news.service';
import { NotificationService } from '../core/services/notification.service';
import { TranslationService } from '../core/services/translation.service';
import { UserWithDocumentsDto } from '../core/models/user.model';
import { DocumentDto } from '../core/models/document.model';
import { NewsDto, NewsLinkDto, NewsAttachmentDto } from '../core/models/news.model';
import { StatusLabelPipe } from '../shared/pipes/status-label.pipe';
import { PhaseLabelPipe } from '../shared/pipes/phase-label.pipe';
import { FileSizePipe } from '../shared/pipes/file-size.pipe';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';

interface ManagedTemplateItem {
  id: string;
  phaseName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isDisabled: boolean;
  isBackendFile?: boolean;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusLabelPipe, 
    PhaseLabelPipe, 
    FileSizePipe,
    TranslatePipe,
    ConfirmDialogComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in w-full overflow-hidden">
      
      <!-- Admin Header -->
      <div class="glass-card p-5 sm:p-8 relative overflow-hidden">
        <div class="flex flex-col gap-5 relative z-10">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg shadow-pink-500/20 shrink-0">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div class="overflow-hidden">
                <h1 class="text-xl sm:text-2xl font-extrabold text-white font-heading truncate">
                  {{ 'admin.title' | translate }}
                </h1>
                <p class="text-xs text-slate-400 truncate">{{ 'admin.sub' | translate }}</p>
              </div>
            </div>

            <!-- Language Switcher in Admin Header -->
            <button 
              (click)="translationService.toggleLanguage()"
              class="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-globe text-pink-400"></i>
              {{ translationService.isGeorgian() ? 'GE' : 'EN' }}
            </button>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button 
              (click)="openNewsModal()" 
              class="btn btn-secondary text-xs">
              <i class="fa-solid fa-newspaper text-blue-400"></i>
              {{ 'news.adminTitle' | translate }}
            </button>
            <button 
              (click)="openTemplateManagerModal()" 
              class="btn btn-secondary text-xs">
              <i class="fa-solid fa-folder-tree"></i>
              {{ 'admin.templates' | translate }}
            </button>
            <button 
              (click)="openBulkUploadModal()" 
              class="btn btn-primary bg-gradient-to-r from-pink-600 to-purple-600 text-xs">
              <i class="fa-solid fa-file-circle-plus"></i>
              {{ 'admin.distribute' | translate }}
            </button>
            <button (click)="loadUsers()" class="btn btn-secondary text-xs">
              <i class="fa-solid fa-rotate-right" [class.fa-spin]="isLoadingUsers"></i>
              {{ 'admin.refresh' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Users Card -->
      <div class="glass-card p-4 sm:p-6 space-y-5 w-full">
        
        <!-- Toolbar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="relative flex-1 max-w-md w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (input)="onSearchInput()"
              [placeholder]="'admin.searchPlaceholder' | translate" 
              class="form-control pl-9 text-xs py-2 w-full">
            <button 
              *ngIf="searchQuery" 
              (click)="clearSearch()" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <span class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-xs text-slate-300 shrink-0 self-start sm:self-auto">
            {{ users.length }} {{ 'admin.clientsCount' | translate }}
          </span>
        </div>

        <!-- Desktop Table (hidden on small screens) -->
        <div class="hidden md:block overflow-x-auto w-full">
          <table *ngIf="users.length > 0" class="custom-table w-full">
            <thead>
              <tr>
                <th>{{ 'admin.id' | translate }}</th>
                <th>{{ 'admin.client' | translate }}</th>
                <th>{{ 'admin.status' | translate }}</th>
                <th>{{ 'admin.phase' | translate }}</th>
                <th>{{ 'admin.files' | translate }}</th>
                <th class="text-right">{{ 'admin.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="font-mono text-xs text-slate-500 font-bold">#{{ u.id }}</td>
                <td>
                  <div class="flex items-center gap-2.5 min-w-[150px]">
                    <div class="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold font-heading text-xs shrink-0">
                      {{ u.name.substring(0,2).toUpperCase() }}
                    </div>
                    <div class="truncate">
                      <div class="font-semibold text-slate-200 text-xs truncate">{{ u.name }} {{ u.lastName }}</div>
                      <div class="text-[10px] text-slate-400 truncate">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select 
                    [ngModel]="u.status" 
                    (ngModelChange)="onUpdateStatus(u, $event)"
                    class="form-control form-select py-1 px-2 text-xs w-32 font-semibold"
                    [ngClass]="getStatusSelectClass(u.status)">
                    <option [value]="0">{{ 'status.pending' | translate }}</option>
                    <option [value]="1">{{ 'status.rejected' | translate }}</option>
                    <option [value]="2">{{ 'status.approved' | translate }}</option>
                    <option [value]="3">{{ 'status.resubmission' | translate }}</option>
                  </select>
                </td>
                <td>
                  <select 
                    [ngModel]="u.userPhase" 
                    (ngModelChange)="onUpdatePhase(u, $event)"
                    class="form-control form-select py-1 px-2 text-xs w-32 font-semibold">
                    <option [value]="0">{{ 'phase.phaseOne' | translate }}</option>
                    <option [value]="1">{{ 'phase.phaseTwo' | translate }}</option>
                    <option [value]="2">{{ 'phase.phaseThree' | translate }}</option>
                    <option [value]="3">{{ 'phase.canceled' | translate }}</option>
                  </select>
                </td>
                <td>
                  <span class="text-xs font-semibold text-slate-300">{{ u.documents.length }} files</span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button (click)="inspectUser(u)" class="btn btn-secondary btn-sm px-2 py-1 text-xs" [title]="'admin.view' | translate">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    <button (click)="promptDeleteUserDocs(u)" class="btn btn-secondary btn-sm px-2 py-1 text-xs" [title]="'admin.clearDocs' | translate">
                      <i class="fa-solid fa-folder-minus"></i>
                    </button>
                    <button (click)="promptDeleteUser(u)" class="btn btn-danger btn-sm px-2 py-1 text-xs" [title]="'admin.delete' | translate">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card List (shown on small screens only) -->
        <div class="md:hidden space-y-3 w-full">
          <div *ngFor="let u of users" class="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <!-- Name row -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 overflow-hidden">
                <div class="w-9 h-9 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold font-heading text-xs shrink-0">
                  {{ u.name.substring(0,2).toUpperCase() }}
                </div>
                <div class="truncate">
                  <div class="font-semibold text-white text-sm truncate">{{ u.name }} {{ u.lastName }}</div>
                  <div class="text-[11px] text-slate-400 truncate">{{ u.email }}</div>
                </div>
              </div>
              <span class="text-[10px] font-mono text-slate-500">#{{ u.id }}</span>
            </div>

            <!-- Selects row -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] text-slate-500 block mb-1">{{ 'admin.status' | translate }}</label>
                <select 
                  [ngModel]="u.status" (ngModelChange)="onUpdateStatus(u, $event)"
                  class="form-control form-select py-1.5 px-2 text-xs w-full font-semibold"
                  [ngClass]="getStatusSelectClass(u.status)">
                  <option [value]="0">{{ 'status.pending' | translate }}</option>
                  <option [value]="1">{{ 'status.rejected' | translate }}</option>
                  <option [value]="2">{{ 'status.approved' | translate }}</option>
                  <option [value]="3">{{ 'status.resubmission' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] text-slate-500 block mb-1">{{ 'admin.phase' | translate }}</label>
                <select 
                  [ngModel]="u.userPhase" (ngModelChange)="onUpdatePhase(u, $event)"
                  class="form-control form-select py-1.5 px-2 text-xs w-full font-semibold">
                  <option [value]="0">{{ 'phase.phaseOne' | translate }}</option>
                  <option [value]="1">{{ 'phase.phaseTwo' | translate }}</option>
                  <option [value]="2">{{ 'phase.phaseThree' | translate }}</option>
                  <option [value]="3">{{ 'phase.canceled' | translate }}</option>
                </select>
              </div>
            </div>

            <!-- Actions row -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-800">
              <span class="text-xs text-slate-400">{{ u.documents.length }} files</span>
              <div class="flex items-center gap-1.5">
                <button (click)="inspectUser(u)" class="btn btn-secondary btn-sm text-xs px-2.5 py-1">
                  <i class="fa-solid fa-eye"></i> {{ 'admin.view' | translate }}
                </button>
                <button (click)="promptDeleteUserDocs(u)" class="btn btn-secondary btn-sm text-xs px-2 py-1">
                  <i class="fa-solid fa-folder-minus"></i>
                </button>
                <button (click)="promptDeleteUser(u)" class="btn btn-danger btn-sm text-xs px-2 py-1">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoadingUsers && users.length === 0" class="py-10 text-center text-slate-400 space-y-2">
          <i class="fa-solid fa-users-slash text-xl text-slate-600"></i>
          <div class="text-sm font-medium">{{ 'admin.noClients' | translate }}</div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoadingUsers" class="py-10 text-center text-slate-500">
          <i class="fa-solid fa-circle-notch fa-spin text-xl text-pink-500 mb-2"></i>
          <div class="text-xs">{{ 'admin.loading' | translate }}</div>
        </div>

      </div>

      <!-- Single User Detail Inspector Drawer -->
      <div *ngIf="selectedUserForInspect" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="glass-card max-w-3xl w-full p-6 border-slate-700/60 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold font-heading">
                #{{ selectedUserForInspect.id }}
              </div>
              <div>
                <h3 class="text-lg font-bold text-white font-heading">
                  {{ selectedUserForInspect.name }} {{ selectedUserForInspect.lastName }}
                </h3>
                <p class="text-xs text-slate-400">{{ selectedUserForInspect.email }} &bull; {{ selectedUserForInspect.phoneNumber }}</p>
              </div>
            </div>

            <button (click)="selectedUserForInspect = null" class="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- User Stats Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span class="text-slate-500 block mb-1">{{ 'admin.status' | translate }}</span>
              <span class="badge" [ngClass]="getStatusBadgeClass(selectedUserForInspect.status)">
                {{ selectedUserForInspect.status | statusLabel }}
              </span>
            </div>

            <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span class="text-slate-500 block mb-1">{{ 'admin.phase' | translate }}</span>
              <span class="badge badge-phase">
                {{ selectedUserForInspect.userPhase | phaseLabel }}
              </span>
            </div>

            <div class="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span class="text-slate-500 block mb-1">{{ 'admin.files' | translate }}</span>
              <span class="font-bold text-white text-sm">{{ selectedUserForInspect.documents.length }} Files</span>
            </div>
          </div>

          <!-- User Uploaded Files Section with Individual Delete Button -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-white font-heading flex items-center gap-2">
                <i class="fa-solid fa-folder-tree text-blue-400"></i>
                {{ 'admin.uploadedFiles' | translate }}
              </h4>
              <button 
                *ngIf="selectedUserForInspect.documents.length > 0"
                (click)="promptDeleteUserDocs(selectedUserForInspect)" 
                class="btn btn-danger btn-sm text-xs px-2.5 py-1">
                <i class="fa-solid fa-trash"></i> {{ 'admin.clearDocs' | translate }}
              </button>
            </div>

            <div *ngIf="selectedUserForInspect.documents.length === 0" class="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              User has not uploaded any documents yet.
            </div>

            <div *ngIf="selectedUserForInspect.documents.length > 0" class="space-y-2">
              <div 
                *ngFor="let doc of selectedUserForInspect.documents" 
                class="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                
                <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <i class="fa-solid" [ngClass]="getFileIcon(doc.fileName)"></i>
                  </div>
                  <div class="truncate">
                    <div class="text-xs font-semibold text-slate-200 truncate">{{ doc.fileName }}</div>
                    <div class="text-[10px] text-slate-500">ID: #{{ doc.id }} &bull; {{ doc.fileSize | fileSize }} &bull; {{ doc.uploadedAt | date:'shortDate' }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    (click)="downloadUserDoc(selectedUserForInspect.id, doc)" 
                    class="btn btn-secondary btn-sm text-xs px-3 py-1">
                    <i class="fa-solid fa-download"></i> {{ 'admin.download' | translate }}
                  </button>

                  <button 
                    (click)="promptDeleteSingleBackendDoc(selectedUserForInspect.id, doc)" 
                    class="btn btn-danger btn-sm text-xs px-2.5 py-1"
                    [title]="'admin.delete' | translate">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-white/10 flex justify-end">
            <button (click)="selectedUserForInspect = null" class="btn btn-secondary btn-sm">{{ 'admin.close' | translate }}</button>
          </div>
        </div>
      </div>

      <!-- Manage Template Files Modal (Delete Option for Frontend & Backend Template Files) -->
      <div *ngIf="showTemplateManagerModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="glass-card max-w-2xl w-full p-6 border-purple-500/30 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2 text-purple-400 font-bold">
              <i class="fa-solid fa-folder-tree text-lg"></i>
              <h3 class="text-lg text-white font-heading">{{ 'admin.templateManagerTitle' | translate }}</h3>
            </div>
            <button (click)="showTemplateManagerModal = false" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            {{ 'admin.templateManagerSub' | translate }}
          </p>

          <!-- Search or Filter -->
          <div class="space-y-3">
            <div 
              *ngFor="let tpl of managedTemplates" 
              class="p-4 bg-slate-900/80 border rounded-xl flex items-center justify-between transition-all"
              [ngClass]="tpl.isDisabled ? 'border-rose-900/40 opacity-60' : 'border-slate-800 hover:border-purple-500/30'">
              
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg shrink-0">
                  <i class="fa-solid" [ngClass]="tpl.isBackendFile ? 'fa-database text-pink-400' : 'fa-file-pdf'"></i>
                </div>
                <div class="truncate">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-xs text-white truncate">{{ tpl.fileName }}</span>
                    <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {{ tpl.phaseName }}
                    </span>
                    <span *ngIf="tpl.isBackendFile" class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {{ 'admin.backendFile' | translate }}
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-400 truncate mt-0.5">{{ tpl.fileUrl }}</div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <a 
                  *ngIf="!tpl.isBackendFile"
                  [href]="tpl.fileUrl" 
                  target="_blank"
                  class="btn btn-secondary btn-sm text-xs px-2.5 py-1"
                  [title]="'admin.view' | translate">
                  <i class="fa-solid fa-eye text-blue-400"></i>
                </a>

                <button 
                  (click)="promptDeleteTemplate(tpl)" 
                  class="btn btn-danger btn-sm text-xs px-2.5 py-1">
                  <i class="fa-solid" [ngClass]="tpl.isDisabled ? 'fa-rotate-left' : 'fa-trash'"></i>
                  <span>{{ tpl.isDisabled ? ('admin.restore' | translate) : ('admin.delete' | translate) }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-white/10 flex justify-end">
            <button (click)="showTemplateManagerModal = false" class="btn btn-secondary btn-sm">{{ 'admin.close' | translate }}</button>
          </div>
        </div>
      </div>

      <!-- Bulk Template Upload Modal -->
      <div *ngIf="showBulkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="glass-card max-w-md w-full p-6 border-pink-500/30 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2 text-pink-400 font-bold">
              <i class="fa-solid fa-file-circle-plus text-lg"></i>
              <h3 class="text-lg text-white font-heading">{{ 'admin.bulkUploadTitle' | translate }}</h3>
            </div>
            <button (click)="showBulkModal = false" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">
            {{ 'admin.bulkUploadSub' | translate }}
          </p>

          <!-- Phase Dropdown -->
          <div>
            <label class="form-label" for="bulk-phase">{{ 'admin.targetPhase' | translate }}</label>
            <select id="bulk-phase" [(ngModel)]="bulkPhase" class="form-control form-select">
              <option [value]="0">{{ 'phase.phaseOne' | translate }}</option>
              <option [value]="1">{{ 'phase.phaseTwo' | translate }}</option>
              <option [value]="2">{{ 'phase.phaseThree' | translate }}</option>
              <option [value]="3">{{ 'phase.canceled' | translate }}</option>
            </select>
          </div>

          <!-- File Input -->
          <div>
            <label class="form-label" for="bulk-file">{{ 'admin.selectFile' | translate }}</label>
            <input 
              id="bulk-file"
              type="file" 
              (change)="onBulkFileSelected($event)" 
              class="form-control text-xs">
          </div>

          <div *ngIf="bulkFile" class="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <span class="truncate font-mono">{{ bulkFile.name }}</span>
            <span class="text-[10px] text-slate-500">{{ bulkFile.size | fileSize }}</span>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button (click)="showBulkModal = false" class="btn btn-secondary btn-sm">Cancel</button>
            <button 
              (click)="submitBulkUpload()" 
              [disabled]="!bulkFile || isUploadingBulk" 
              class="btn btn-primary btn-sm bg-gradient-to-r from-pink-600 to-purple-600">
              <span *ngIf="!isUploadingBulk"><i class="fa-solid fa-paper-plane"></i> {{ 'admin.distributeBtn' | translate }}</span>
              <span *ngIf="isUploadingBulk"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Status / Phase Change Comment Dialog Modal -->
      <div *ngIf="showChangeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="glass-card max-w-md w-full p-6 border-blue-500/30 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2 text-blue-400 font-bold">
              <i class="fa-solid" [ngClass]="changeType === 'status' ? 'fa-user-check' : 'fa-layer-group'"></i>
              <h3 class="text-base text-white font-heading">
                {{ changeType === 'status' ? 'Update User Status' : 'Update User Phase' }}
              </h3>
            </div>
            <button (click)="cancelChangeModal()" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
            <div class="font-bold text-white">{{ targetUserForChange?.name }} {{ targetUserForChange?.lastName }}</div>
            <div class="text-slate-400 text-[11px] font-mono">{{ targetUserForChange?.email }}</div>
            <div class="pt-2 text-slate-300 flex items-center gap-2 font-medium">
              <span>Change {{ changeType === 'status' ? 'Status' : 'Phase' }}:</span>
              <span class="text-amber-400 font-bold">{{ getChangeSummaryText() }}</span>
            </div>
          </div>

          <div>
            <label class="form-label text-xs block mb-1 font-semibold text-slate-300">
              კომენტარი / მიზეზი (Comment / Reason — Optional):
            </label>
            <textarea 
              rows="3" 
              [(ngModel)]="changeComment" 
              placeholder="e.g. გაუქმების მიზეზი, დამატებითი ინსტრუქცია სტუდენტისთვის..."
              class="form-control text-xs resize-none"></textarea>
            <p class="text-[10px] text-slate-500 mt-1">This comment will be included at the end of the email notification sent to the student.</p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button (click)="cancelChangeModal()" class="btn btn-secondary btn-sm text-xs">
              Cancel
            </button>
            <button 
              (click)="confirmChangeModal()" 
              [disabled]="isSubmittingChange"
              class="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-xs">
              <span *ngIf="!isSubmittingChange"><i class="fa-solid fa-paper-plane mr-1"></i> Confirm & Send Email</span>
              <span *ngIf="isSubmittingChange"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Updating...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Modals -->
      <app-confirm-dialog
        [isOpen]="showDeleteUserModal"
        title="Delete Client Account"
        [message]="'Are you sure you want to delete client account ' + (selectedUserForDelete?.name || '') + '? All user documents and profile data will be permanently removed.'"
        confirmText="Delete Client"
        (confirmed)="confirmDeleteUser()"
        (cancelled)="showDeleteUserModal = false">
      </app-confirm-dialog>

      <app-confirm-dialog
        [isOpen]="showDeleteDocsModal"
        title="Delete All Client Documents"
        [message]="'Are you sure you want to delete ALL documents of ' + (selectedUserForDeleteDocs?.name || '') + '? This action cannot be undone.'"
        confirmText="Delete All Files"
        (confirmed)="confirmDeleteUserDocs()"
        (cancelled)="showDeleteDocsModal = false">
      </app-confirm-dialog>

      <app-confirm-dialog
        [isOpen]="showDeleteSingleDocModal"
        title="Delete Backend File"
        [message]="'Are you sure you want to delete file ' + (selectedDocToDeleteSingle?.fileName || '') + ' from the database? This action cannot be undone.'"
        confirmText="Delete File"
        (confirmed)="confirmDeleteSingleBackendDoc()"
        (cancelled)="showDeleteSingleDocModal = false">
      </app-confirm-dialog>

      <app-confirm-dialog
        [isOpen]="showDeleteTemplateModal"
        title="Delete Template Document"
        [message]="'Are you sure you want to delete template file ' + (selectedTemplateForDelete?.fileName || '') + '? It will be deleted from the database and student cabinets.'"
        confirmText="Delete Template"
        (confirmed)="confirmDeleteTemplate()"
        (cancelled)="showDeleteTemplateModal = false">
      </app-confirm-dialog>

      <!-- News Management Modal -->
      <div *ngIf="showNewsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="glass-card max-w-3xl w-full p-6 border-blue-500/30 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2 text-blue-400 font-bold">
              <i class="fa-solid fa-newspaper text-lg"></i>
              <h3 class="text-lg text-white font-heading">{{ 'news.adminTitle' | translate }}</h3>
            </div>
            <button (click)="showNewsModal = false" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Post / Edit News Form -->
          <div class="p-4 bg-slate-900/90 rounded-xl border border-blue-500/20 space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-white font-heading flex items-center gap-2">
                <i class="fa-solid" [ngClass]="editingNews ? 'fa-pen text-amber-400' : 'fa-pen-to-square text-blue-400'"></i>
                {{ editingNews ? ('news.editTitle' | translate) : ('news.addBtn' | translate) }}
              </h4>
              <button 
                *ngIf="editingNews" 
                (click)="cancelEditNews()" 
                class="btn btn-secondary btn-sm text-xs px-2 py-0.5">
                <i class="fa-solid fa-xmark"></i> {{ 'news.cancelEdit' | translate }}
              </button>
            </div>

            <!-- Language Tab Switcher -->
            <div class="flex gap-1 p-1 bg-slate-950/60 rounded-lg border border-slate-800 w-fit">
              <button
                (click)="newsFormLang = 'ka'"
                [ngClass]="newsFormLang === 'ka' ? 'bg-blue-600/80 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
                class="px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5">
                🇬🇪 {{ 'news.langTabGeo' | translate }}
              </button>
              <button
                (click)="newsFormLang = 'en'"
                [ngClass]="newsFormLang === 'en' ? 'bg-indigo-600/80 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
                class="px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5">
                🇬🇧 {{ 'news.langTabEng' | translate }}
              </button>
            </div>

            <div class="space-y-3">
              <!-- Georgian Fields -->
              <ng-container *ngIf="newsFormLang === 'ka'">
                <div>
                  <label class="form-label" for="news-title-ka">{{ 'news.inputTitle' | translate }} (ქართული) <span class="text-rose-400">*</span></label>
                  <input 
                    id="news-title-ka"
                    type="text" 
                    [(ngModel)]="newNewsTitle" 
                    [placeholder]="'news.titlePlaceholder' | translate" 
                    class="form-control text-xs">
                </div>
                <div>
                  <label class="form-label" for="news-text-ka">{{ 'news.inputText' | translate }} (ქართული) <span class="text-rose-400">*</span></label>
                  <textarea 
                    id="news-text-ka"
                    rows="4" 
                    [(ngModel)]="newNewsText" 
                    [placeholder]="'news.textPlaceholder' | translate" 
                    class="form-control text-xs resize-none"></textarea>
                </div>
              </ng-container>

              <!-- English Fields -->
              <ng-container *ngIf="newsFormLang === 'en'">
                <div>
                  <label class="form-label" for="news-title-en">
                    {{ 'news.inputTitle' | translate }} (English)
                    <span class="ml-1 text-[10px] text-slate-500 font-normal">(optional — Georgian shown as fallback)</span>
                  </label>
                  <input 
                    id="news-title-en"
                    type="text" 
                    [(ngModel)]="newNewsTitleEn" 
                    [placeholder]="'news.titleEnPlaceholder' | translate" 
                    class="form-control text-xs border-indigo-500/30 focus:border-indigo-500/60">
                </div>
                <div>
                  <label class="form-label" for="news-text-en">
                    {{ 'news.inputText' | translate }} (English)
                    <span class="ml-1 text-[10px] text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea 
                    id="news-text-en"
                    rows="4" 
                    [(ngModel)]="newNewsTextEn" 
                    [placeholder]="'news.textEnPlaceholder' | translate" 
                    class="form-control text-xs resize-none border-indigo-500/30 focus:border-indigo-500/60"></textarea>
                </div>
              </ng-container>

              <!-- Links Section -->
              <div class="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <div class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <i class="fa-solid fa-link text-blue-400"></i>
                  <span>Links / External URLs</span>
                </div>

                <!-- Active links list -->
                <div *ngIf="newsLinks.length > 0" class="space-y-1.5">
                  <div *ngFor="let link of newsLinks; let i = index" class="flex items-center justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800">
                    <div class="truncate mr-2">
                      <span class="font-semibold text-white">{{ link.label }}</span>
                      <span class="text-slate-400 text-[11px] ml-2 font-mono">({{ link.url }})</span>
                    </div>
                    <button type="button" (click)="removeNewsLink(i)" class="text-rose-400 hover:text-rose-300 px-1">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="newLinkLabel" 
                    placeholder="Link Label (e.g. Website)" 
                    class="form-control text-xs sm:col-span-2">
                  <input 
                    type="url" 
                    [(ngModel)]="newLinkUrl" 
                    placeholder="https://example.com" 
                    class="form-control text-xs sm:col-span-2">
                  <button 
                    type="button" 
                    (click)="addNewsLink()" 
                    [disabled]="!newLinkLabel.trim() || !newLinkUrl.trim()" 
                    class="btn btn-secondary btn-sm text-xs sm:col-span-1">
                    <i class="fa-solid fa-plus"></i> Add Link
                  </button>
                </div>
              </div>

              <!-- Attachments / Files Section -->
              <div class="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                <div class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <i class="fa-solid fa-paperclip text-emerald-400"></i>
                  <span>File Attachments</span>
                </div>

                <!-- Existing attachments when editing -->
                <div *ngIf="editingNews && editingNews.attachments && editingNews.attachments.length > 0" class="space-y-1.5">
                  <div *ngFor="let att of editingNews.attachments" class="flex items-center justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800">
                    <div class="flex items-center gap-2 truncate">
                      <i class="fa-solid fa-file text-blue-400"></i>
                      <span class="font-semibold text-white truncate">{{ att.fileName }}</span>
                      <span class="text-[10px] text-slate-400">({{ att.fileSize | fileSize }})</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <a [href]="newsService.getAttachmentDownloadUrl(att.id)" target="_blank" download class="btn btn-secondary btn-sm text-[10px] px-2 py-0.5">
                        <i class="fa-solid fa-download"></i>
                      </a>
                      <button type="button" (click)="deleteNewsAttachment(att.id)" class="btn btn-danger btn-sm text-[10px] px-2 py-0.5">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Selected pending files -->
                <div *ngIf="selectedNewsFiles.length > 0" class="space-y-1 text-xs">
                  <div *ngFor="let f of selectedNewsFiles; let i = index" class="flex items-center justify-between bg-slate-900/80 p-1.5 rounded border border-emerald-500/30">
                    <span class="truncate text-emerald-300"><i class="fa-solid fa-file-arrow-up mr-1"></i>{{ f.name }}</span>
                    <button type="button" (click)="removeSelectedNewsFile(i)" class="text-rose-400 hover:text-rose-300 text-xs px-1">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>

                <!-- File input -->
                <div>
                  <input 
                    type="file" 
                    multiple 
                    (change)="onNewsFileSelected($event)" 
                    class="form-control text-xs">
                  <p class="text-[10px] text-slate-500 mt-1">Select files to attach to this news post (PDF, DOCX, Images, etc.)</p>
                </div>
              </div>

              <!-- Translation Status Indicators -->
              <div class="flex items-center gap-3 text-[10px] font-semibold">
                <span class="flex items-center gap-1" [ngClass]="newNewsTitle.trim() ? 'text-emerald-400' : 'text-slate-500'">
                  <i class="fa-solid" [ngClass]="newNewsTitle.trim() ? 'fa-circle-check' : 'fa-circle'"></i> 🇬🇪 GEO
                </span>
                <span class="flex items-center gap-1" [ngClass]="newNewsTitleEn.trim() ? 'text-emerald-400' : 'text-amber-500'">
                  <i class="fa-solid" [ngClass]="newNewsTitleEn.trim() ? 'fa-circle-check' : 'fa-circle-exclamation'"></i> 🇬🇧 ENG {{ newNewsTitleEn.trim() ? '' : '(fallback)' }}
                </span>
              </div>

              <div class="flex justify-end gap-2">
                <button 
                  *ngIf="editingNews"
                  (click)="cancelEditNews()"
                  class="btn btn-secondary btn-sm text-xs">
                  {{ 'news.cancelEdit' | translate }}
                </button>

                <button 
                  *ngIf="!editingNews"
                  (click)="submitCreateNews()" 
                  [disabled]="!newNewsTitle.trim() || !newNewsText.trim() || isPostingNews"
                  class="btn btn-primary btn-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-xs">
                  <span *ngIf="!isPostingNews"><i class="fa-solid fa-paper-plane mr-1"></i> {{ 'news.addBtn' | translate }}</span>
                  <span *ngIf="isPostingNews"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Posting...</span>
                </button>

                <button 
                  *ngIf="editingNews"
                  (click)="submitUpdateNews()" 
                  [disabled]="!newNewsTitle.trim() || !newNewsText.trim() || isUpdatingNews"
                  class="btn btn-primary btn-sm bg-gradient-to-r from-amber-500 to-amber-600 text-xs text-slate-950 font-bold">
                  <span *ngIf="!isUpdatingNews"><i class="fa-solid fa-floppy-disk mr-1"></i> {{ 'news.saveChanges' | translate }}</span>
                  <span *ngIf="isUpdatingNews"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Saving...</span>
                </button>
              </div>
            </div>
          </div>

          <!-- List of Posted News Items -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-white font-heading">Posted News ({{ newsList.length }})</h4>

            <div *ngIf="isLoadingNews" class="py-6 text-center text-xs text-slate-400">
              <i class="fa-solid fa-spinner fa-spin text-lg text-blue-500 mb-1"></i>
              <div>Loading news items...</div>
            </div>

            <div *ngIf="!isLoadingNews && newsList.length === 0" class="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No news items posted yet.
            </div>

            <div *ngIf="!isLoadingNews && newsList.length > 0" class="space-y-2">
              <div 
                *ngFor="let news of newsList" 
                class="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="overflow-hidden flex-1 space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-sm text-white truncate">{{ news.title }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">({{ news.dateCreated | date:'short' }})</span>
                    <!-- Translation status badges -->
                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                      [ngClass]="news.titleEn ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
                      🇬🇧 {{ news.titleEn ? 'EN ✓' : 'EN missing' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 line-clamp-1 italic">🇬🇪 {{ news.text }}</p>
                  <p *ngIf="news.textEn" class="text-xs text-indigo-300 line-clamp-1 italic">🇬🇧 {{ news.textEn }}</p>
                </div>

                <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button 
                    (click)="startEditNews(news)" 
                    class="btn btn-secondary btn-sm text-xs px-2.5 py-1">
                    <i class="fa-solid fa-pen text-amber-400"></i> {{ 'news.editBtn' | translate }}
                  </button>

                  <button 
                    (click)="promptDeleteNews(news)" 
                    class="btn btn-danger btn-sm text-xs px-2.5 py-1">
                    <i class="fa-solid fa-trash"></i> {{ 'admin.delete' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-white/10 flex justify-end">
            <button (click)="showNewsModal = false" class="btn btn-secondary btn-sm">{{ 'admin.close' | translate }}</button>
          </div>
        </div>
      </div>

      <app-confirm-dialog
        [isOpen]="showDeleteNewsModal"
        title="Delete News Item"
        [message]="getDeleteNewsMessage()"
        confirmText="Delete News"
        (confirmed)="confirmDeleteNews()"
        (cancelled)="showDeleteNewsModal = false">
      </app-confirm-dialog>

    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  adminService = inject(AdminService);
  newsService = inject(NewsService);
  notificationService = inject(NotificationService);
  translationService = inject(TranslationService);

  users: UserWithDocumentsDto[] = [];
  isLoadingUsers = false;
  searchQuery = '';

  newsList: NewsDto[] = [];
  isLoadingNews = false;
  showNewsModal = false;
  newNewsTitle = '';
  newNewsText = '';
  newNewsTitleEn = '';
  newNewsTextEn = '';
  newsFormLang: 'ka' | 'en' = 'ka';
  newsLinks: NewsLinkDto[] = [];
  newLinkLabel = '';
  newLinkUrl = '';
  selectedNewsFiles: File[] = [];
  isPostingNews = false;
  editingNews: NewsDto | null = null;
  isUpdatingNews = false;
  selectedNewsForDelete: NewsDto | null = null;
  showDeleteNewsModal = false;

  selectedUserForInspect: UserWithDocumentsDto | null = null;
  selectedUserForDelete: UserWithDocumentsDto | null = null;
  selectedUserForDeleteDocs: UserWithDocumentsDto | null = null;
  selectedTemplateForDelete: ManagedTemplateItem | null = null;
  
  selectedDocUserIdForDelete: number | null = null;
  selectedDocToDeleteSingle: DocumentDto | null = null;

  showDeleteUserModal = false;
  showDeleteDocsModal = false;
  showDeleteSingleDocModal = false;
  showDeleteTemplateModal = false;
  showBulkModal = false;
  showTemplateManagerModal = false;

  showChangeModal = false;
  changeType: 'status' | 'phase' = 'status';
  targetUserForChange: UserWithDocumentsDto | null = null;
  targetNewValue: number = 0;
  changeComment = '';
  isSubmittingChange = false;

  bulkPhase: number = 0;
  bulkFile: File | null = null;
  isUploadingBulk = false;

  managedTemplates: ManagedTemplateItem[] = [
    {
      id: 'p1_resume',
      phaseName: 'Phase 1',
      fileName: 'Resume--.docx',
      fileUrl: '/templates/phase1/Resume--.docx',
      fileSize: 11940,
      isDisabled: false
    },
    {
      id: 'p2_contract',
      phaseName: 'Phase 2',
      fileName: 'II ეტაპი.pdf',
      fileUrl: '/templates/phase2/II ეტაპი.pdf',
      fileSize: 201883,
      isDisabled: false
    },
    {
      id: 'p3_work_permit',
      phaseName: 'Phase 3',
      fileName: 'III ეტაპი.pdf',
      fileUrl: '/templates/phase3/III ეტაპი.pdf',
      fileSize: 223400,
      isDisabled: false
    },
    {
      id: 'gen_steuer',
      phaseName: 'Steuer (All Phases)',
      fileName: 'STEUER_Service_Agreement.pdf',
      fileUrl: '/templates/steuer/STEUER-ის დაბრუნების მომსახურების ხელშეკრულება.docx (1).pdf',
      fileSize: 188085,
      isDisabled: false
    }
  ];

  ngOnInit() {
    this.loadUsers();
    this.loadDisabledTemplatesState();
  }

  loadUsers() {
    this.isLoadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.isLoadingUsers = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.users = res.data;
          this.collectBackendBulkFiles();
        }
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  collectBackendBulkFiles() {
    // Collect unique files from backend database users
    const backendFileMap = new Map<string, ManagedTemplateItem>();
    
    this.users.forEach(u => {
      u.documents.forEach(d => {
        if (!backendFileMap.has(d.fileName)) {
          backendFileMap.set(d.fileName, {
            id: `backend_${d.id}_${d.fileName}`,
            phaseName: `Phase ${d.phase + 1}`,
            fileName: d.fileName,
            fileUrl: `Backend DB (ID #${d.id})`,
            fileSize: d.fileSize,
            isDisabled: false,
            isBackendFile: true
          });
        }
      });
    });

    // Merge backend files with static templates
    const staticItems = this.managedTemplates.filter(t => !t.isBackendFile);
    const backendItems = Array.from(backendFileMap.values());
    this.managedTemplates = [...staticItems, ...backendItems];
  }

  loadDisabledTemplatesState() {
    try {
      const disabledRaw = localStorage.getItem('geto_disabled_templates');
      const disabledIds: string[] = disabledRaw ? JSON.parse(disabledRaw) : [];
      this.managedTemplates.forEach(t => {
        if (!t.isBackendFile) {
          t.isDisabled = disabledIds.includes(t.id);
        }
      });
    } catch {
      // Ignore JSON parse errors
    }
  }

  openTemplateManagerModal() {
    this.loadUsers();
    this.loadDisabledTemplatesState();
    this.showTemplateManagerModal = true;
  }

  promptDeleteTemplate(tpl: ManagedTemplateItem) {
    this.selectedTemplateForDelete = tpl;
    this.showDeleteTemplateModal = true;
  }

  confirmDeleteTemplate() {
    if (!this.selectedTemplateForDelete) return;
    const tpl = this.selectedTemplateForDelete;
    
    if (tpl.isBackendFile) {
      // Delete from backend database across users
      this.adminService.deleteBulkDocumentsByFileName(tpl.fileName).subscribe({
        next: (res) => {
          this.showDeleteTemplateModal = false;
          this.selectedTemplateForDelete = null;
          if (res.statusCode === 200) {
            this.notificationService.success(res.data || 'Backend template documents deleted', 'Deleted from Database');
            this.loadUsers();
          } else {
            this.notificationService.error(res.message || 'Failed to delete backend template', 'Error');
          }
        }
      });
    } else {
      // Frontend Static Template Toggle
      try {
        const disabledRaw = localStorage.getItem('geto_disabled_templates');
        let disabledIds: string[] = disabledRaw ? JSON.parse(disabledRaw) : [];
        
        if (tpl.isDisabled) {
          disabledIds = disabledIds.filter(id => id !== tpl.id);
          tpl.isDisabled = false;
          this.notificationService.success(`Template ${tpl.fileName} restored to student cabinets.`, 'Template Restored');
        } else {
          if (!disabledIds.includes(tpl.id)) {
            disabledIds.push(tpl.id);
          }
          tpl.isDisabled = true;
          this.notificationService.success(`Template ${tpl.fileName} removed from student cabinets.`, 'Template Deleted');
        }
        
        localStorage.setItem('geto_disabled_templates', JSON.stringify(disabledIds));
      } catch {
        this.notificationService.error('Failed to update template state', 'Error');
      }

      this.showDeleteTemplateModal = false;
      this.selectedTemplateForDelete = null;
    }
  }

  // Delete single backend document for specific user
  promptDeleteSingleBackendDoc(userId: number, doc: DocumentDto) {
    this.selectedDocUserIdForDelete = userId;
    this.selectedDocToDeleteSingle = doc;
    this.showDeleteSingleDocModal = true;
  }

  confirmDeleteSingleBackendDoc() {
    if (!this.selectedDocToDeleteSingle) return;
    const docId = this.selectedDocToDeleteSingle.id;

    this.adminService.deleteSingleDocument(docId).subscribe({
      next: (res) => {
        this.showDeleteSingleDocModal = false;
        this.selectedDocToDeleteSingle = null;
        if (res.statusCode === 200) {
          this.notificationService.success('File deleted from database.', 'Deleted');
          this.loadUsers();
          if (this.selectedUserForInspect) {
            this.inspectUser(this.selectedUserForInspect);
          }
        } else {
          this.notificationService.error(res.message || 'Failed to delete file', 'Error');
        }
      }
    });
  }

  onSearchInput() {
    if (!this.searchQuery.trim()) {
      this.loadUsers();
      return;
    }

    this.isLoadingUsers = true;
    this.adminService.searchUsers(this.searchQuery.trim()).subscribe({
      next: (res) => {
        this.isLoadingUsers = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.users = res.data;
          this.collectBackendBulkFiles();
        }
      },
      error: () => {
        this.isLoadingUsers = false;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadUsers();
  }

  // Update Status & Phase Handlers with Comment Dialog
  onUpdateStatus(user: UserWithDocumentsDto, newStatus: number) {
    const statusNum = Number(newStatus);
    if (statusNum === user.status) return;

    this.targetUserForChange = user;
    this.changeType = 'status';
    this.targetNewValue = statusNum;
    this.changeComment = '';
    this.showChangeModal = true;
  }

  onUpdatePhase(user: UserWithDocumentsDto, newPhase: number) {
    const phaseNum = Number(newPhase);
    if (phaseNum === user.userPhase) return;

    this.targetUserForChange = user;
    this.changeType = 'phase';
    this.targetNewValue = phaseNum;
    this.changeComment = '';
    this.showChangeModal = true;
  }

  cancelChangeModal() {
    this.showChangeModal = false;
    this.targetUserForChange = null;
    this.changeComment = '';
  }

  getChangeSummaryText(): string {
    if (!this.targetUserForChange) return '';
    if (this.changeType === 'status') {
      const oldLabel = this.getStatusName(this.targetUserForChange.status);
      const newLabel = this.getStatusName(this.targetNewValue);
      return `${oldLabel} ➔ ${newLabel}`;
    } else {
      const oldLabel = this.getPhaseName(this.targetUserForChange.userPhase);
      const newLabel = this.getPhaseName(this.targetNewValue);
      return `${oldLabel} ➔ ${newLabel}`;
    }
  }

  getStatusName(val: number): string {
    switch (Number(val)) {
      case 0: return 'Pending';
      case 1: return 'Rejected';
      case 2: return 'Approved';
      case 3: return 'Resubmission';
      default: return 'Unknown';
    }
  }

  getPhaseName(val: number): string {
    switch (Number(val)) {
      case 0: return 'Phase 1';
      case 1: return 'Phase 2';
      case 2: return 'Phase 3';
      case 3: return 'Canceled';
      default: return 'Unknown';
    }
  }

  confirmChangeModal() {
    if (!this.targetUserForChange) return;

    const user = this.targetUserForChange;
    this.isSubmittingChange = true;

    if (this.changeType === 'status') {
      this.adminService.updateUserStatus(user.id, this.targetNewValue, this.changeComment).subscribe({
        next: (res) => {
          this.isSubmittingChange = false;
          this.showChangeModal = false;
          if (res.statusCode === 200) {
            user.status = this.targetNewValue;
            this.notificationService.success(`Status for ${user.name} updated & email sent!`, 'Status Updated');
          } else {
            this.notificationService.error(res.message || 'Failed to update status', 'Error');
          }
        },
        error: () => {
          this.isSubmittingChange = false;
        }
      });
    } else {
      this.adminService.updateUserPhase(user.id, this.targetNewValue, this.changeComment).subscribe({
        next: (res) => {
          this.isSubmittingChange = false;
          this.showChangeModal = false;
          if (res.statusCode === 200) {
            user.userPhase = this.targetNewValue;
            this.notificationService.success(`Phase for ${user.name} updated & email sent!`, 'Phase Updated');
          } else {
            this.notificationService.error(res.message || 'Failed to update phase', 'Error');
          }
        },
        error: () => {
          this.isSubmittingChange = false;
        }
      });
    }
  }

  // Inspector & Download
  inspectUser(user: UserWithDocumentsDto) {
    this.adminService.getUserById(user.id).subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.selectedUserForInspect = res.data;
        } else {
          this.selectedUserForInspect = user;
        }
      },
      error: () => {
        this.selectedUserForInspect = user;
      }
    });
  }

  downloadUserDoc(userId: number, doc: DocumentDto) {
    this.adminService.downloadUserDocument(userId, doc.id, doc.fileName).subscribe({
      next: () => {
        this.notificationService.info(`Downloading ${doc.fileName}...`, 'Download Started');
      }
    });
  }

  // Deletion Actions
  promptDeleteUser(user: UserWithDocumentsDto) {
    this.selectedUserForDelete = user;
    this.showDeleteUserModal = true;
  }

  confirmDeleteUser() {
    if (!this.selectedUserForDelete) return;
    const userId = this.selectedUserForDelete.id;

    this.adminService.deleteUser(userId).subscribe({
      next: (res) => {
        this.showDeleteUserModal = false;
        this.selectedUserForDelete = null;
        if (res.statusCode === 200) {
          this.notificationService.success('User deleted successfully.', 'Deleted');
          this.loadUsers();
        } else {
          this.notificationService.error(res.message || 'Failed to delete user', 'Error');
        }
      }
    });
  }

  promptDeleteUserDocs(user: UserWithDocumentsDto) {
    this.selectedUserForDeleteDocs = user;
    this.showDeleteDocsModal = true;
  }

  confirmDeleteUserDocs() {
    if (!this.selectedUserForDeleteDocs) return;
    const userId = this.selectedUserForDeleteDocs.id;

    this.adminService.deleteUserDocuments(userId).subscribe({
      next: (res) => {
        this.showDeleteDocsModal = false;
        this.selectedUserForDeleteDocs = null;
        if (res.statusCode === 200) {
          this.notificationService.success('All documents for this user deleted.', 'Documents Cleared');
          this.loadUsers();
        } else {
          this.notificationService.error(res.message || 'Failed to delete documents', 'Error');
        }
      }
    });
  }

  // Bulk Upload Modal
  openBulkUploadModal() {
    this.bulkFile = null;
    this.showBulkModal = true;
  }

  onBulkFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.bulkFile = event.target.files[0];
    }
  }

  submitBulkUpload() {
    if (!this.bulkFile) return;

    this.isUploadingBulk = true;
    this.adminService.bulkUploadDocument(Number(this.bulkPhase), this.bulkFile).subscribe({
      next: (res) => {
        this.isUploadingBulk = false;
        this.showBulkModal = false;
        if (res.statusCode === 200) {
          const successCount = res.data != null ? res.data : (res.message || 'Success');
          this.notificationService.success(`Template distributed to phase! Output: ${successCount}`, 'Bulk Upload Complete');
          this.loadUsers();
        } else {
          this.notificationService.error(res.message || 'Bulk upload failed', 'Error');
        }
      },
      error: () => {
        this.isUploadingBulk = false;
      }
    });
  }

  // Helpers
  getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'fa-file-pdf text-rose-400';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word text-blue-400';
    return 'fa-file-lines text-slate-400';
  }

  getStatusBadgeClass(status: number): string {
    switch (Number(status)) {
      case 2: return 'badge-approved';
      case 0: return 'badge-pending';
      case 1: return 'badge-rejected';
      case 3: return 'badge-resubmission';
      default: return 'badge-pending';
    }
  }

  getStatusSelectClass(status: number): string {
    switch (Number(status)) {
      case 2: return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 0: return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 1: return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      case 3: return 'text-purple-400 bg-purple-950/40 border-purple-500/30';
      default: return '';
    }
  }

  // News Management Methods
  openNewsModal() {
    this.showNewsModal = true;
    this.loadNewsForAdmin();
  }

  loadNewsForAdmin() {
    this.isLoadingNews = true;
    this.newsService.getAllNews().subscribe({
      next: (res) => {
        this.isLoadingNews = false;
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          this.newsList = res.data;
        }
      },
      error: () => {
        this.isLoadingNews = false;
      }
    });
  }

  // News Links and Files methods
  addNewsLink() {
    if (!this.newLinkLabel.trim() || !this.newLinkUrl.trim()) return;
    let url = this.newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    this.newsLinks.push({ label: this.newLinkLabel.trim(), url });
    this.newLinkLabel = '';
    this.newLinkUrl = '';
  }

  removeNewsLink(index: number) {
    this.newsLinks.splice(index, 1);
  }

  onNewsFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      for (let i = 0; i < event.target.files.length; i++) {
        this.selectedNewsFiles.push(event.target.files[i]);
      }
    }
  }

  removeSelectedNewsFile(index: number) {
    this.selectedNewsFiles.splice(index, 1);
  }

  deleteNewsAttachment(attachmentId: number) {
    this.newsService.deleteAttachment(attachmentId).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.notificationService.success('Attachment deleted', 'Deleted');
          if (this.editingNews && this.editingNews.attachments) {
            this.editingNews.attachments = this.editingNews.attachments.filter(a => a.id !== attachmentId);
          }
          this.loadNewsForAdmin();
        } else {
          this.notificationService.error(res.message || 'Failed to delete attachment', 'Error');
        }
      }
    });
  }

  submitCreateNews() {
    if (!this.newNewsTitle.trim() || !this.newNewsText.trim()) return;

    this.isPostingNews = true;
    this.newsService.createNews({
      title: this.newNewsTitle.trim(),
      text: this.newNewsText.trim(),
      titleEn: this.newNewsTitleEn.trim() || undefined,
      textEn: this.newNewsTextEn.trim() || undefined,
      links: this.newsLinks.length > 0 ? this.newsLinks : undefined
    }).subscribe({
      next: (res) => {
        if (res.statusCode === 200 && res.data) {
          const createdNews = res.data;
          // Upload files if any selected
          if (this.selectedNewsFiles.length > 0) {
            let uploadedCount = 0;
            const filesToUpload = [...this.selectedNewsFiles];
            filesToUpload.forEach(file => {
              this.newsService.uploadAttachment(createdNews.id, file).subscribe({
                next: () => {
                  uploadedCount++;
                  if (uploadedCount === filesToUpload.length) {
                    this.finishCreateNews();
                  }
                },
                error: () => {
                  uploadedCount++;
                  if (uploadedCount === filesToUpload.length) {
                    this.finishCreateNews();
                  }
                }
              });
            });
          } else {
            this.finishCreateNews();
          }
        } else {
          this.isPostingNews = false;
          this.notificationService.error(res.message || 'Failed to post news item', 'Error');
        }
      },
      error: (err) => {
        this.isPostingNews = false;
        const msg = err?.error?.message || err?.message || 'Failed to post news item';
        this.notificationService.error(msg, 'Error');
      }
    });
  }

  private finishCreateNews() {
    this.isPostingNews = false;
    this.notificationService.success('News item posted successfully.', 'News Posted');
    this.resetNewsForm();
    this.loadNewsForAdmin();
  }

  private resetNewsForm() {
    this.newNewsTitle = '';
    this.newNewsText = '';
    this.newNewsTitleEn = '';
    this.newNewsTextEn = '';
    this.newsFormLang = 'ka';
    this.newsLinks = [];
    this.newLinkLabel = '';
    this.newLinkUrl = '';
    this.selectedNewsFiles = [];
    this.editingNews = null;
  }

  startEditNews(news: NewsDto) {
    this.editingNews = news;
    this.newNewsTitle = news.title;
    this.newNewsText = news.text;
    this.newNewsTitleEn = news.titleEn || '';
    this.newNewsTextEn = news.textEn || '';
    this.newsFormLang = 'ka';
    this.newsLinks = news.links ? [...news.links] : [];
    this.selectedNewsFiles = [];
  }

  cancelEditNews() {
    this.resetNewsForm();
  }

  submitUpdateNews() {
    if (!this.editingNews || !this.newNewsTitle.trim() || !this.newNewsText.trim()) return;

    this.isUpdatingNews = true;
    const newsId = this.editingNews.id;
    this.newsService.updateNews(newsId, {
      title: this.newNewsTitle.trim(),
      text: this.newNewsText.trim(),
      titleEn: this.newNewsTitleEn.trim() || undefined,
      textEn: this.newNewsTextEn.trim() || undefined,
      links: this.newsLinks.length > 0 ? this.newsLinks : undefined
    }).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          if (this.selectedNewsFiles.length > 0) {
            let uploadedCount = 0;
            const filesToUpload = [...this.selectedNewsFiles];
            filesToUpload.forEach(file => {
              this.newsService.uploadAttachment(newsId, file).subscribe({
                next: () => {
                  uploadedCount++;
                  if (uploadedCount === filesToUpload.length) {
                    this.finishUpdateNews();
                  }
                },
                error: () => {
                  uploadedCount++;
                  if (uploadedCount === filesToUpload.length) {
                    this.finishUpdateNews();
                  }
                }
              });
            });
          } else {
            this.finishUpdateNews();
          }
        } else {
          this.isUpdatingNews = false;
          this.notificationService.error(res.message || 'Failed to update news item', 'Error');
        }
      },
      error: (err) => {
        this.isUpdatingNews = false;
        const msg = err?.error?.message || err?.message || 'Failed to update news item';
        this.notificationService.error(msg, 'Error');
      }
    });
  }

  private finishUpdateNews() {
    this.isUpdatingNews = false;
    this.notificationService.success('News item updated successfully.', 'News Updated');
    this.resetNewsForm();
    this.loadNewsForAdmin();
  }

  promptDeleteNews(news: NewsDto) {
    this.selectedNewsForDelete = news;
    this.showDeleteNewsModal = true;
  }

  confirmDeleteNews() {
    if (!this.selectedNewsForDelete) return;
    const id = this.selectedNewsForDelete.id;

    this.newsService.deleteNews(id).subscribe({
      next: (res) => {
        this.showDeleteNewsModal = false;
        this.selectedNewsForDelete = null;
        if (res.statusCode === 200) {
          this.notificationService.success('News item deleted.', 'Deleted');
          this.loadNewsForAdmin();
        } else {
          this.notificationService.error(res.message || 'Failed to delete news item', 'Error');
        }
      },
      error: () => {
        this.showDeleteNewsModal = false;
        this.notificationService.error('Failed to delete news item', 'Error');
      }
    });
  }

  getDeleteNewsMessage(): string {
    const title = this.selectedNewsForDelete?.title || '';
    return `Are you sure you want to delete news item "${title}"?`;
  }
}
