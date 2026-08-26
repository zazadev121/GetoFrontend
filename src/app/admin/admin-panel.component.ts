import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../core/services/admin.service';
import { NotificationService } from '../core/services/notification.service';
import { TranslationService } from '../core/services/translation.service';
import { UserWithDocumentsDto } from '../core/models/user.model';
import { DocumentDto } from '../core/models/document.model';
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

    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  adminService = inject(AdminService);
  notificationService = inject(NotificationService);
  translationService = inject(TranslationService);

  users: UserWithDocumentsDto[] = [];
  isLoadingUsers = false;
  searchQuery = '';

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

  bulkPhase: number = 0;
  bulkFile: File | null = null;
  isUploadingBulk = false;

  managedTemplates: ManagedTemplateItem[] = [
    {
      id: 'p1_resume',
      phaseName: 'Phase 1',
      fileName: 'Resume_template.docx',
      fileUrl: '/templates/phase1/Resume_template.docx',
      fileSize: 27016,
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

  // Update Status & Phase Handlers
  onUpdateStatus(user: UserWithDocumentsDto, newStatus: number) {
    const statusNum = Number(newStatus);
    this.adminService.updateUserStatus(user.id, statusNum).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          user.status = statusNum;
          this.notificationService.success(`Status for ${user.name} updated to status ${statusNum}`, 'Status Updated');
        } else {
          this.notificationService.error(res.message || 'Failed to update status', 'Error');
        }
      }
    });
  }

  onUpdatePhase(user: UserWithDocumentsDto, newPhase: number) {
    const phaseNum = Number(newPhase);
    this.adminService.updateUserPhase(user.id, phaseNum).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          user.userPhase = phaseNum;
          this.notificationService.success(`Phase for ${user.name} updated to phase ${phaseNum}`, 'Phase Updated');
        } else {
          this.notificationService.error(res.message || 'Failed to update phase', 'Error');
        }
      }
    });
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
}
