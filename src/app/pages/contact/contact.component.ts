import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12 animate-fade-in w-full overflow-hidden">
      
      <!-- Hero Header -->
      <div class="glass-card p-6 sm:p-12 border-slate-700/50 relative overflow-hidden text-center space-y-4">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/30 transform hover:scale-105 transition-transform shrink-0">
          <i class="fa-solid fa-headset"></i>
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          {{ translationService.isGeorgian() ? 'დაგვიკავშირდით' : 'Contact Us' }}
        </h1>

        <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {{ translationService.isGeorgian() 
            ? 'გაქვთ შეკითხვები გერმანიაში დასაქმებასთან, გერმანული ენის კურსებთან ან „შტოიერის“ დაბრუნებასთან დაკავშირებით? დაგვიკავშირდით ნებისმიერ დროს!' 
            : 'Have questions regarding employment in Germany, German language courses, or Steuer tax refund? Contact us anytime!' 
          }}
        </p>
      </div>

      <!-- Main Contact Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- WhatsApp Direct Contact Card -->
        <div class="glass-card p-6 border-slate-700/50 space-y-4 hover:border-emerald-500/50 transition-all flex flex-col justify-between text-center group">
          <div class="space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i class="fa-brands fa-whatsapp"></i>
            </div>
            <h3 class="text-lg font-bold text-white font-heading">WhatsApp</h3>
            <p class="text-xs text-slate-400">
              {{ translationService.isGeorgian() ? 'მოგვწერეთ პირდაპირ WhatsApp-ზე' : 'Message us directly on WhatsApp' }}
            </p>
            <div class="text-sm font-bold text-emerald-400 font-mono">+995 577 54 75 77</div>
          </div>

          <a 
            href="https://wa.me/995577547577" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-primary bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs py-2.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
            <i class="fa-brands fa-whatsapp text-base"></i>
            <span>{{ translationService.isGeorgian() ? 'WhatsApp-ზე გადასვლა' : 'Open WhatsApp' }}</span>
            <i class="fa-solid fa-up-right-from-square text-xs"></i>
          </a>
        </div>

        <!-- Facebook Official Page Card -->
        <div class="glass-card p-6 border-slate-700/50 space-y-4 hover:border-blue-500/50 transition-all flex flex-col justify-between text-center group">
          <div class="space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i class="fa-brands fa-facebook"></i>
            </div>
            <h3 class="text-lg font-bold text-white font-heading">Facebook</h3>
            <p class="text-xs text-slate-400">
              {{ translationService.isGeorgian() ? 'ეწვიეთ ჩვენს ოფიციალურ Facebook გვერდს' : 'Visit our official Facebook page' }}
            </p>
            <div class="text-xs font-bold text-blue-400 truncate">&#64;Getoproject2020</div>
          </div>

          <a 
            href="https://www.facebook.com/Getoproject2020" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs py-2.5 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
            <i class="fa-brands fa-facebook text-base"></i>
            <span>{{ translationService.isGeorgian() ? 'Facebook გვერდზე გადასვლა' : 'Open Facebook' }}</span>
            <i class="fa-solid fa-up-right-from-square text-xs"></i>
          </a>
        </div>

        <!-- Direct Phone Call Card -->
        <div class="glass-card p-6 border-slate-700/50 space-y-4 hover:border-amber-500/50 transition-all flex flex-col justify-between text-center group">
          <div class="space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i class="fa-solid fa-phone"></i>
            </div>
            <h3 class="text-lg font-bold text-white font-heading">Phone Call</h3>
            <p class="text-xs text-slate-400">
              {{ translationService.isGeorgian() ? 'დარეკეთ სატელეფონო ნომერზე' : 'Call us on mobile number' }}
            </p>
            <div class="text-sm font-bold text-amber-400 font-mono">577 54 75 77</div>
          </div>

          <a 
            href="tel:+995577547577" 
            class="btn btn-secondary text-xs py-2.5 flex items-center justify-center gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
            <i class="fa-solid fa-phone text-base"></i>
            <span>{{ translationService.isGeorgian() ? 'დარეკვა (577 54 75 77)' : 'Call Number' }}</span>
          </a>
        </div>

        <!-- Official Email Support Card -->
        <div class="glass-card p-6 border-slate-700/50 space-y-4 hover:border-purple-500/50 transition-all flex flex-col justify-between text-center group">
          <div class="space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 mx-auto flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <h3 class="text-lg font-bold text-white font-heading">Email Support</h3>
            <p class="text-xs text-slate-400">
              {{ translationService.isGeorgian() ? 'გამოგვიგზავნეთ ელ-ფოსტა' : 'Send us an official email' }}
            </p>
            <div class="text-xs font-bold text-purple-300 truncate">getogeto2020&#64;gmail.com</div>
          </div>

          <a 
            href="mailto:getogeto2020@gmail.com" 
            class="btn btn-secondary text-xs py-2.5 flex items-center justify-center gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
            <i class="fa-solid fa-paper-plane text-base"></i>
            <span>{{ translationService.isGeorgian() ? 'წერილის გაგზავნა' : 'Send Email' }}</span>
          </a>
        </div>

      </div>

      <!-- Quick Summary Card -->
      <div class="glass-card p-8 border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 space-y-4 text-center">
        <h3 class="text-xl font-bold text-white font-heading">
          {{ translationService.isGeorgian() ? 'შპს გეთო ფროჯექთი (GETO Project LLC)' : 'GETO Project LLC Official Support' }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {{ translationService.isGeorgian() 
            ? 'ჩვენი გუნდი მზად არის დაგეხმაროთ ყოველ სამუშაო დღეს. დოკუმენტაციის გაგზავნისთვის ან კონსულტაციისთვის გამოიყენეთ ზემოთ მოცემული საკონტაქტო არხები.' 
            : 'Our support team is ready to assist you every working day. Please use the contact channels above for document submissions or consultation.' 
          }}
        </p>
      </div>

    </div>
  `
})
export class ContactComponent {
  translationService = inject(TranslationService);
  notificationService = inject(NotificationService);
}
