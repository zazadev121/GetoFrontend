import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiChatService, ChatMessage } from '../../../core/services/ai-chat.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Floating Blob Button -->
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      <!-- Chat Window -->
      <div
        *ngIf="isOpen()"
        class="w-[340px] sm:w-[380px] h-[500px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0d1117] animate-fade-in"
        style="box-shadow: 0 0 40px rgba(59,130,246,0.15), 0 20px 60px rgba(0,0,0,0.5);">

        <!-- Header -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-white/10"
          style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);">
          <div class="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-robot text-blue-400 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-white text-sm font-heading">GETO Assistant</div>
            <div class="text-[10px] text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              {{ translationService.isGeorgian() ? 'ონლაინ' : 'Online' }}
            </div>
          </div>
          <button (click)="close()" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center">
            <i class="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>

        <!-- Messages -->
        <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">

          <!-- Welcome message -->
          <div *ngIf="messages().length === 0" class="space-y-3">
            <div class="flex items-start gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <i class="fa-solid fa-robot text-blue-400 text-[11px]"></i>
              </div>
              <div class="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-200 leading-relaxed max-w-[85%]">
                {{ welcomeMessage() }}
              </div>
            </div>

            <!-- Quick prompts -->
            <div class="flex flex-wrap gap-1.5 pl-9">
              <button
                *ngFor="let prompt of quickPrompts()"
                (click)="sendQuickPrompt(prompt)"
                class="text-[10px] px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-white transition-all cursor-pointer">
                {{ prompt }}
              </button>
            </div>
          </div>

          <!-- Chat messages -->
          <div *ngFor="let msg of messages()" class="flex items-start gap-2.5" [class.flex-row-reverse]="msg.role === 'user'">
            <div
              *ngIf="msg.role === 'assistant'"
              class="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-robot text-blue-400 text-[11px]"></i>
            </div>
            <div
              class="rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed max-w-[82%] whitespace-pre-wrap"
              [ngClass]="msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/10'">
              {{ msg.content }}
              <a *ngIf="msg.role === 'assistant' && msg.content.includes('/vacancies')"
                routerLink="/vacancies"
                class="block mt-2 font-semibold text-blue-300 hover:text-blue-200 underline">
                {{ translationService.isGeorgian() ? 'ვაკანსიების ნახვა' : 'View vacancies' }}
              </a>
              <a *ngIf="msg.role === 'assistant' && msg.content.includes('/news')"
                routerLink="/news"
                class="block mt-2 font-semibold text-blue-300 hover:text-blue-200 underline">
                {{ translationService.isGeorgian() ? 'სიახლეების ნახვა' : 'View news' }}
              </a>
            </div>
          </div>

          <!-- Typing indicator -->
          <div *ngIf="isLoading()" class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-robot text-blue-400 text-[11px]"></i>
            </div>
            <div class="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <div class="flex gap-1 items-center h-3">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="px-3 py-3 border-t border-white/10 bg-slate-900/80">
          <div class="flex items-center gap-2">
            <input
              #inputField
              type="text"
              [(ngModel)]="userInput"
              (keydown.enter)="send()"
              [disabled]="isLoading()"
              [placeholder]="translationService.isGeorgian() ? 'დასვით კითხვა...' : 'Ask a question...'"
              class="flex-1 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors min-w-0">
            <button
              (click)="send()"
              [disabled]="isLoading() || !userInput.trim()"
              class="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0">
              <i class="fa-solid fa-paper-plane text-[11px]"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Blob Toggle Button -->
      <button
        (click)="toggle()"
        class="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style="background: linear-gradient(135deg, #2563eb, #7c3aed); box-shadow: 0 0 30px rgba(99,102,241,0.5);">

        <!-- Pulse ring -->
        <span *ngIf="!isOpen()" class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></span>

        <i class="fa-solid transition-all duration-300 text-white text-lg"
          [class.fa-robot]="!isOpen()"
          [class.fa-xmark]="isOpen()">
        </i>

        <!-- Tooltip -->
        <span *ngIf="!isOpen()"
          class="absolute right-16 bg-slate-900 border border-white/10 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {{ translationService.isGeorgian() ? 'GETO ასისტენტი' : 'GETO Assistant' }}
        </span>
      </button>

    </div>
  `,
  styles: [`
    .scrollbar-thin {
      scrollbar-width: thin;
      scrollbar-color: rgba(100,116,139,0.3) transparent;
    }
    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 9999px; }
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
      ? 'გამარჯობა! მე ვარ GETO-ს ასისტენტი. დაგეხმარებათ სარეგისტრაციო პროცესში, საჭირო დოკუმენტებისა და პროგრამის შესახებ კითხვებზე. ✋'
      : "Hello! I'm GETO's AI assistant. I can help you with registration, required documents, and program questions. ✋";
  }

  quickPrompts() {
    return this.translationService.isGeorgian()
      ? ['რა დოკუმენტები მჭირდება?', 'როგორ ავტვირთო ფაილი?', 'პასპორტის სკანი?', 'რეგისტრაციის გადახდა?']
      : ['What documents do I need?', 'How do I upload a file?', 'Passport scan info?', 'Registration payment?'];
  }

  toggle() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => this.inputField?.nativeElement.focus(), 100);
    }
  }

  close() { this.isOpen.set(false); }

  sendQuickPrompt(prompt: string) {
    this.userInput = prompt;
    this.send();
  }

  send() {
    const msg = this.userInput.trim();
    if (!msg || this.isLoading()) return;

    this.userInput = '';
    const currentHistory = this.messages();
    this.messages.update(m => [...m, { role: 'user', content: msg }]);
    this.isLoading.set(true);

    this.aiChatService.sendMessage(msg, currentHistory, this.translationService.currentLang()).subscribe({
      next: (res) => {
        this.messages.update(m => [...m, { role: 'assistant', content: res.reply }]);
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

  ngAfterViewChecked() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
