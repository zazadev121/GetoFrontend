import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiChatService, ChatMessage } from '../../../core/services/ai-chat.service';
import { TranslationService } from '../../../core/services/translation.service';
import { formatChatReply } from './chat-reply-format';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Floating Launcher & Chat Window -->
    <div class="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">

      <!-- Chat Window -->
      <div
        *ngIf="isOpen()"
        class="w-[340px] sm:w-[410px] h-[560px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden border border-white/15 bg-[#090d16]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_50px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-label="GetAI Assistant">

        <!-- Ambient header lighting -->
        <div class="absolute -top-16 -left-16 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -top-16 -right-16 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Chat Header -->
        <div class="relative z-10 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Glowing Avatar -->
            <div class="relative shrink-0">
              <img
                src="/images/getai-assistant.png"
                alt="GetAI assistant"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#090d16]"></span>
            </div>
            
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-white text-base tracking-tight font-heading">GetAI</span>
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  AI ASSISTANT
                </span>
              </div>
              <div class="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ translationService.isGeorgian() ? 'ონლაინ • მზადაა დასახმარებლად' : 'Online • Ready to help' }}</span>
              </div>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center gap-1 shrink-0">
            <!-- Clear Chat Button -->
            <button
              *ngIf="messages().length > 0"
              (click)="clearChat()"
              type="button"
              [title]="translationService.isGeorgian() ? 'ჩატის გასუფთავება' : 'Clear chat'"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center text-xs active:scale-95">
              <i class="fa-solid fa-rotate-left"></i>
            </button>

            <!-- Close Button -->
            <button
              (click)="close()"
              type="button"
              aria-label="Close"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center text-xs active:scale-95">
              <i class="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Messages Container -->
        <div #messagesContainer class="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">

          <!-- Welcome Hero / Empty State (Pre-made questions removed) -->
          <div *ngIf="messages().length === 0" class="flex flex-col items-center justify-center h-full min-h-[260px] text-center p-5 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/15 mb-3.5">
              <i class="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
            </div>
            <h3 class="text-base font-bold text-white font-heading">
              {{ translationService.isGeorgian() ? 'რით შემიძლია დაგეხმაროთ?' : 'How can I assist you today?' }}
            </h3>
            <p class="text-xs text-slate-300 mt-2 leading-relaxed max-w-[280px]">
              {{ welcomeMessage() }}
            </p>
          </div>

          <!-- Message Bubbles -->
          <div *ngFor="let msg of messages()" class="flex items-start gap-2.5 animate-in fade-in duration-200" [class.flex-row-reverse]="msg.role === 'user'">
            
            <!-- Bot Avatar -->
            <img
              *ngIf="msg.role === 'assistant'"
              src="/images/getai-assistant.png"
              alt="GetAI"
              class="w-7 h-7 rounded-full object-cover ring-1 ring-blue-400/40 shadow-sm shrink-0 mt-0.5">

            <!-- Message Body -->
            <div
              class="text-xs leading-relaxed max-w-[84%] whitespace-pre-wrap transition-all shadow-md"
              [ngClass]="msg.role === 'user'
                ? 'rounded-2xl rounded-tr-xs px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-blue-600/20'
                : 'rounded-2xl rounded-tl-xs px-4 py-3 bg-slate-900/90 border border-white/10 text-slate-100 backdrop-blur-sm'">
              
              <span>{{ msg.content }}</span>

              <!-- Action Link Chips -->
              <div *ngIf="msg.links && msg.links.length > 0" class="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                <a
                  *ngFor="let link of msg.links"
                  [routerLink]="link.path"
                  (click)="close()"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-300 hover:text-white font-semibold text-[11px] transition-all">
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                  <span>{{ link.label }}</span>
                </a>
              </div>
            </div>

          </div>

          <!-- Typing Indicator -->
          <div *ngIf="isLoading()" class="flex items-start gap-2.5 animate-in fade-in duration-150">
            <img
              src="/images/getai-assistant.png"
              alt="GetAI"
              class="w-7 h-7 rounded-full object-cover ring-1 ring-blue-400/40 shadow-sm shrink-0">
            <div class="rounded-2xl rounded-tl-xs px-4 py-3 bg-slate-900/90 border border-white/10 text-slate-300 shadow-md">
              <div class="flex items-center gap-1.5 h-3">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style="animation-delay:300ms"></span>
                <span class="text-[10px] text-slate-400 ml-1.5 font-medium">
                  {{ translationService.isGeorgian() ? 'ფიქრობს...' : 'Thinking...' }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Input Area / Bottom Dock -->
        <div class="relative z-10 px-3.5 py-3 border-t border-white/10 bg-slate-950/90 backdrop-blur-md">
          <div class="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 p-1.5 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
            <input
              #inputField
              type="text"
              [(ngModel)]="userInput"
              (keydown.enter)="send()"
              [disabled]="isLoading()"
              [placeholder]="translationService.isGeorgian() ? 'დასვით კითხვა...' : 'Ask a question...'"
              class="flex-1 bg-transparent px-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none min-w-0">
            
            <button
              (click)="send()"
              [disabled]="isLoading() || !userInput.trim()"
              type="button"
              [title]="translationService.isGeorgian() ? 'გაგზავნა' : 'Send message'"
              class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/25 active:scale-95 shrink-0">
              <i class="fa-solid fa-paper-plane text-[11px]"></i>
            </button>
          </div>

          <div class="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <i class="fa-solid fa-sparkles text-[9px] text-blue-400"></i>
            <span>{{ translationService.isGeorgian() ? 'GetAI · აღჭურვილი ხელოვნური ინტელექტით' : 'Powered by GETO Intelligence' }}</span>
          </div>
        </div>

      </div>

      <!-- Floating Trigger Button -->
      <button
        (click)="toggle()"
        type="button"
        [attr.aria-expanded]="isOpen()"
        class="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style="background: linear-gradient(135deg, #2563eb, #6366f1, #7c3aed); box-shadow: 0 0 35px rgba(99,102,241,0.5);">

        <!-- Pulsing ring when closed -->
        <span *ngIf="!isOpen()" class="absolute inset-0 rounded-full bg-blue-500/40 animate-ping"></span>

        <!-- Bot Face when closed -->
        <img
          *ngIf="!isOpen()"
          src="/images/getai-assistant.png"
          alt="GetAI assistant"
          class="absolute inset-0 w-full h-full rounded-full object-cover border-2 border-blue-300/60 shadow-inner">
        
        <!-- X Icon when open -->
        <i *ngIf="isOpen()" class="fa-solid fa-xmark text-white text-xl"></i>

        <!-- Tooltip -->
        <span
          *ngIf="!isOpen()"
          class="absolute right-16 bg-slate-900/95 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl pointer-events-none">
          {{ translationService.isGeorgian() ? 'GetAI · AI ასისტენტი' : 'GetAI · AI Assistant' }}
        </span>
      </button>

    </div>
  `,
  styles: [`
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.25) transparent;
    }
    .scrollbar-thin::-webkit-scrollbar { width: 5px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.25);
      border-radius: 9999px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.45);
    }
  `]
})
export class ChatbotComponent implements AfterViewChecked {
  aiChatService = inject(AiChatService);
  translationService = inject(TranslationService);

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('inputField') inputField?: ElementRef<HTMLInputElement>;

  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = '';

  welcomeMessage(): string {
    return this.translationService.isGeorgian()
      ? 'გამარჯობა! მე ვარ GetAI. დაგეხმარებით რეგისტრაციის, საჭირო დოკუმენტებისა და პროგრამის შესახებ ნებისმიერ შეკითხვაზე.'
      : "Hello! I'm GetAI. I can help you with registration, required documents, and any questions about our program.";
  }

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => this.inputField?.nativeElement.focus(), 120);
    }
  }

  close(): void {
    this.isOpen.set(false);
  }

  clearChat(): void {
    this.messages.set([]);
  }

  send(): void {
    const msg = this.userInput.trim();
    if (!msg || this.isLoading()) return;

    this.userInput = '';
    const currentHistory = this.messages();
    this.messages.update(m => [...m, { role: 'user', content: msg }]);
    this.isLoading.set(true);

    this.aiChatService.sendMessage(msg, currentHistory, this.translationService.currentLang()).subscribe({
      next: (res) => {
        const formatted = formatChatReply(res.reply, this.translationService.currentLang());
        this.messages.update(m => [...m, { role: 'assistant', ...formatted, rawContent: res.reply }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, {
          role: 'assistant',
          content: this.translationService.isGeorgian()
            ? 'ბოდიში, პასუხის გაცემა ვერ მოხერხდა. სცადეთ თავიდან.'
            : 'Sorry, I could not respond. Please try again.'
        }]);
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}

