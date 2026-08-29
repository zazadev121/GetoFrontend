import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';

@Component({
  selector: 'app-steuer',
  standalone: true,
  imports: [CommonModule, PageHeroComponent],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-14 w-full overflow-hidden">

      <app-page-hero
        [title]="translationService.isGeorgian() ? '„შტოიერის“ დაბრუნება' : 'German Tax Refund'"
        [lead]="translationService.isGeorgian()
          ? 'გერმანიაში დასაქმებისას გადახდილი გადასახადის ნაწილის დაბრუნება, ე.წ. „შტოიერის“ დაბრუნება, შესაძლებელია შესაბამისი პირობების დაკმაყოფილების შემთხვევაში.'
          : 'Tax refund for taxes paid while working in Germany (the so-called Steuer refund) is possible upon satisfying eligibility requirements.'"
        icon="fa-receipt"
        accent="sage"
        sealText="GETO PROJECT · STEUER · TAX REFUND · "
        sealIcon="fa-coins">
      </app-page-hero>

      <div class="reveal reveal-scale w-full">
        <!-- Main Download Agreement CTA -->
        <div class="flex justify-center w-full">
          <a 
            href="/templates/steuer/STEUER-ის დაბრუნების მომსახურების ხელშეკრულება.docx (1).pdf" 
            download="STEUER_Service_Agreement.pdf"
            class="btn btn-primary px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-base font-bold shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 max-w-full text-center">
            <i class="fa-solid fa-file-pdf text-base sm:text-lg shrink-0"></i>
            <span class="break-words">{{ translationService.isGeorgian() ? 'შტოიერის ხელშეკრულების გადმოწერა (PDF)' : 'Download Steuer Service Agreement (PDF)' }}</span>
          </a>
        </div>
      </div>

      <!-- Email Document Submission Announcement Card -->
      <div class="glass-card p-6 sm:p-8 border-teal-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 space-y-3 w-full">
        <div class="flex items-center gap-3 text-teal-400 font-bold text-base sm:text-lg">
          <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl shrink-0">
            <i class="fa-solid fa-envelope-circle-check"></i>
          </div>
          <span>{{ translationService.isGeorgian() ? 'დოკუმენტების გაგზავნის ინსტრუქცია' : 'Document Submission Email Notice' }}</span>
        </div>

        <p class="text-sm sm:text-base text-slate-200 leading-relaxed break-words">
          {{ translationService.isGeorgian() 
            ? 'სტუდენტებმა, ვისაც სურთ „შტოიერის“ (საგადასახადო დაბრუნების) მომსახურებით სარგებლობა, 4-ვე ქვემოთ ჩამოთვლილი მოთხოვნილი დოკუმენტი გთხოვთ გამოგზავნოთ ოფიციალურ ელ-ფოსტაზე:' 
            : 'Students who wish to use the Steuer tax refund service, please send all 4 required documents listed below to our official email address:' 
          }}
        </p>

        <div class="p-4 bg-slate-950/80 rounded-xl border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3 overflow-hidden">
            <i class="fa-solid fa-at text-teal-400 text-xl shrink-0"></i>
            <span class="text-base sm:text-lg font-extrabold text-white font-mono truncate">getogeto2020&#64;gmail.com</span>
          </div>

          <a 
            href="mailto:getogeto2020@gmail.com" 
            class="btn btn-secondary btn-sm text-xs px-4 py-2 text-teal-300 border-teal-500/40 hover:bg-teal-500/10 shrink-0">
            <i class="fa-solid fa-paper-plane"></i>
            <span>{{ translationService.isGeorgian() ? 'ფოსტის გაგზავნა' : 'Send Email' }}</span>
          </a>
        </div>
      </div>

      <!-- Required Documents Section -->
      <div class="glass-card p-6 sm:p-8 border-slate-700/50 space-y-6 w-full">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-lg sm:text-xl border border-teal-500/20 shrink-0">
            <i class="fa-solid fa-folder-tree"></i>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-white font-heading break-words">
              {{ translationService.isGeorgian() ? 'საჭირო დოკუმენტები (4 დოკუმენტი)' : 'Required Documents (4 Documents)' }}
            </h2>
            <p class="text-xs text-slate-400 break-words">List of 4 documents required to initiate your German tax refund process</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          <!-- Doc 1 -->
          <div class="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 overflow-hidden">
            <div class="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <span class="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs shrink-0">1</span>
              <span class="break-all">Lohnsteuerbescheinigung</span>
            </div>
            <p class="text-xs text-slate-300 break-words leading-relaxed">
              {{ translationService.isGeorgian() ? 'წლიური საშემოსავლო გადასახადის ცნობა.' : 'Annual income tax certificate issued by your German employer.' }}
            </p>
          </div>

          <!-- Doc 2 -->
          <div class="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 overflow-hidden">
            <div class="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <span class="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs shrink-0">2</span>
              <span class="break-words">{{ translationService.isGeorgian() ? 'პასპორტის ასლი' : 'Passport Copy' }}</span>
            </div>
            <p class="text-xs text-slate-300 break-words leading-relaxed">
              {{ translationService.isGeorgian() ? 'მოქმედი საზღვარგარეთის პასპორტის ასლი.' : 'Copy of your valid international passport.' }}
            </p>
          </div>

          <!-- Doc 3 -->
          <div class="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 overflow-hidden">
            <div class="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <span class="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs shrink-0">3</span>
              <span class="break-words">{{ translationService.isGeorgian() ? 'საბანკო ანგარიშის მონაცემები' : 'Bank Account Details' }}</span>
            </div>
            <p class="text-xs text-slate-300 break-words leading-relaxed">
              {{ translationService.isGeorgian() ? 'საბანკო ანგარიში, სადაც გსურთ თანხის მიღება.' : 'Bank details (IBAN) where you wish to receive the refunded amount.' }}
            </p>
          </div>

          <!-- Doc 4 -->
          <div class="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2 overflow-hidden">
            <div class="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <span class="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-xs shrink-0">4</span>
              <span class="break-words">{{ translationService.isGeorgian() ? 'შემოსავლის დამადასტურებელი ცნობა' : 'Income Proof Certificate (RS.GE)' }}</span>
            </div>
            <p class="text-xs text-slate-300 break-words leading-relaxed">
              {{ translationService.isGeorgian() 
                ? 'სტუდენტი აღნიშნულ ცნობას ონლაინ იღებს საქართველოს შემოსავლების სამსახურის ელექტრონული პორტალიდან (rs.ge). მიღებული დოკუმენტი უნდა ითარგმნოს გერმანულ ენაზე და ნოტარიულად დამოწმდეს.' 
                : 'Obtained online from the Revenue Service portal of Georgia (rs.ge). The document must be translated into German and notarized.' 
              }}
            </p>
          </div>

        </div>
      </div>

      <!-- RS.GE Instruction Banner -->
      <div class="glass-card p-4 sm:p-6 border-blue-500/30 bg-blue-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg shrink-0">
            <i class="fa-solid fa-link"></i>
          </div>
          <div class="overflow-hidden">
            <h4 class="font-bold text-white text-xs sm:text-sm break-words">
              {{ translationService.isGeorgian() ? 'ინსტრუქცია — შემოსავლების ცნობის აღება (rs.ge)' : 'Instruction Guide — Obtaining Income Certificate (rs.ge)' }}
            </h4>
            <p class="text-xs text-slate-400 truncate">Official Revenue Service of Georgia Guide</p>
          </div>
        </div>

        <a 
          href="https://rs.ge/ServicesCatalog?informationabouttheincomeofnaturalpersonguide" 
          target="_blank" 
          rel="noopener noreferrer"
          class="btn btn-secondary btn-sm text-xs flex items-center gap-1.5 shrink-0 max-w-full">
          <span>Open Guide (rs.ge)</span>
          <i class="fa-solid fa-up-right-from-square"></i>
        </a>
      </div>

    </div>
  `
})
export class SteuerComponent {
  translationService = inject(TranslationService);
}
