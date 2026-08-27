import { Injectable, signal, computed } from '@angular/core';

export type Language = 'ka' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly LANG_KEY = 'geto_lang';
  
  currentLang = signal<Language>(this.getInitialLang());

  isGeorgian = computed(() => this.currentLang() === 'ka');

  private getInitialLang(): Language {
    const saved = localStorage.getItem(this.LANG_KEY) as Language;
    return saved === 'en' ? 'en' : 'ka'; // Default Georgian
  }

  setLanguage(lang: Language) {
    localStorage.setItem(this.LANG_KEY, lang);
    this.currentLang.set(lang);
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang() === 'ka' ? 'en' : 'ka');
  }

  private translations: Record<Language, Record<string, any>> = {
    ka: {
      // Navbar & General
      'nav.brand': 'GETO Portal',
      'nav.about': 'ჩვენ შესახებ',
      'nav.news': 'სიახლეები',
      'nav.deutschCourse': 'გერმანული ენის კურსი',
      'nav.cabinet': 'პირადი კაბინეტი',
      'nav.admin': 'ადმინ პანელი',
      'nav.login': 'შესვლა',
      'nav.register': 'რეგისტრაცია',
      'nav.logout': 'გამოსვლა',
      'nav.terms': 'წესები & კონფიდენციალურობა',

      // About Us Page
      'about.title': 'ჩვენ შესახებ',
      'about.subtitle': 'სტუდენტთა მხარდაჭერა და საკონსულტაციო მომსახურება 2020 წლიდან',
      'about.body': '2020 წლიდან დღემდე ვეწევით სტუდენტებისთვის ადმინისტრაციულ, საშუამავლო და საკონსულტაციო მომსახურებას. ვეხმარებით მათ გერმანიაში დასაქმებასთან დაკავშირებულ პროცესებში, დოკუმენტაციის მოწესრიგებასა და საჭირო ინფორმაციის მიღებაში. ჩვენ არ ვართ დამსაქმებელი — ვმოქმედებთ როგორც სტუდენტსა და პარტნიორ ორგანიზაციებს შორის დამაკავშირებელი და საკონსულტაციო მხარე.',
      'about.stat1.title': 'სანდო შუამავლობა',
      'about.stat1.sub': 'სტუდენტებსა და პარტნიორ ორგანიზაციებს შორის მყარი და სანდო კავშირი.',
      'about.stat2.title': 'პროფესიული კონსულტაცია',
      'about.stat2.sub': 'ინდივიდუალური გზამკვლევი გერმანიაში დასაქმებისა და სწავლის პროცესში.',
      'about.stat3.title': 'ადმინისტრაციული მხარდაჭერა',
      'about.stat3.sub': 'დოკუმენტაციის სრული მოწესრიგება და პროცესების მართვა.',

      // News & Announcements Page
      'news.badge': 'სიახლეები & განცხადებები',
      'news.title': 'სიახლეები და განცხადებები',
      'news.subtitle': 'ახალი ვაკანსიები, მნიშვნელოვანი ინფორმაცია და სიახლეები გერმანიაში დასაქმების შესახებ.',
      'news.loading': 'სიახლეები იტვირთება...',
      'news.noNewsTitle': 'სიახლეები ჯერ არ არის',
      'news.noNewsDesc': 'ახალი განცხადებები და ვაკანსიები გამოქვეყნდება უახლოეს მომავალში.',
      'news.adminTitle': 'სიახლეების მართვა',
      'news.addBtn': 'სიახლის დამატება',
      'news.inputTitle': 'სათაური',
      'news.inputText': 'ტექსტი',
      'news.titlePlaceholder': 'შეიყვანეთ სიახლის სათაური...',
      'news.textPlaceholder': 'შეიყვანეთ სიახლის ან განცხადების დეტალური ტექსტი...',
      'news.deleteConfirm': 'ნამდვილად გსურთ სიახლის წაშლა?',
      'news.editBtn': 'რედაქტირება',
      'news.editTitle': 'სიახლის რედაქტირება',
      'news.saveChanges': 'ცვლილებების შენახვა',
      'news.cancelEdit': 'გაუქმება',

      // Deutsch Course Page
      'deutsch.title': 'გერმანული ენის კურსი',
      'deutsch.badge': 'გერმანული - ენის კურსი',
      'deutsch.subtitle': 'ინტენსიური მომზადება გერმანიაში დასაქმებისა და სწავლისთვის',
      'deutsch.heroText': 'ისწავლეთ გერმანული ენა A1-დან B2 დონემდე გამოცდილ პედაგოგებთან ერთად. ჩვენი კურსი სპეციალურად მორგებულია სტუდენტებზე, რომლებსაც სურთ გერმანიაში გამგზავრება.',
      'deutsch.announcementTitle': 'გსურს გერმანიაში სწავლა, მუშაობა ან საერთაშორისო გამოცდილების მიღება?',
      'deutsch.announcementSub': '📚 ისწავლე გერმანული, განავითარე საკუთარი შესაძლებლობები და შექმენი ახალი პერსპექტივები!',
      'deutsch.announcementNote': 'რეგისტრაციისა და დეტალური ინფორმაციის სანახავად ეწვიეთ ბმულს:',
      'deutsch.registerFormBtn': 'გაიარე რეგისტრაცია Google Form-ზე',
      'deutsch.agreementCardTitle': 'ურთიერთშეთანხმების აქტი (გერმანული-ენის კურსი)',
      'deutsch.agreementCardSub': 'გერმანული ენის ინტენსიური კურსის ოფიციალური ურთიერთშეთანხმების აქტი (PDF)',
      'deutsch.downloadDocBtn': 'ჩამოტვირთე დოკუმენტი',
      'deutsch.feature1Title': 'სალაპარაკო პრაქტიკა',
      'deutsch.feature1Sub': 'ყოველდღიური კომუნიკაციური სავარჯიშოები',
      'deutsch.feature2Title': 'გერმანიაში დასაქმების მხარდაჭერა',
      'deutsch.feature2Sub': 'სანდო შუამავლობა • პროფესიული კონსულტაცია • ადმინისტრაციული მხარდაჭერა',
      'deutsch.feature3Title': 'სერტიფიცირება',
      'deutsch.feature3Sub': 'მომზადება Goethe / TELC გამოცდებისთვის',
      'deutsch.enrollBtn': 'კურსზე რეგისტრაცია',
      'deutsch.modulesTitle': 'კურსის დონეების მოდულები',
      'deutsch.a1Title': 'დაწყებითი (A1)',
      'deutsch.a1Sub': 'საბაზისო ლექსიკა, ყოველდღიური დიალოგები და ფრაზები.',
      'deutsch.a2Title': 'ელემენტარული (A2)',
      'deutsch.a2Sub': 'გრამატიკის საფუძვლები, სამუშაო გარემოში კომუნიკაცია.',
      'deutsch.b1Title': 'საშუალო (B1)',
      'deutsch.b1Sub': 'თავისუფალი საუბარი, ოფიციალური დოკუმენტების გაგება.',
      'deutsch.b2Title': 'მაღალი საშუალო (B2)',
      'deutsch.b2Sub': 'Goethe / TELC გამოცდების მომზადება გერმანიის ვიზისთვის.',

      // Privacy Policy Text
      'privacy.policyTitle': 'კონფიდენციალურობის პოლიტიკა',
      'privacy.lastUpdated': 'ბოლო განახლება: 25 აგვისტო, 2026',
      'privacy.policyIntro': 'Geto Project პატივს სცემს მომხმარებელთა პირადულობას და ვალდებულია დაიცვას ვებგვერდის საშუალებით მიღებული პერსონალური მონაცემების კონფიდენციალურობა.',
      'privacy.sec1Title': '1. რა ინფორმაციას ვაგროვებთ',
      'privacy.sec1Body': 'ვებგვერდის გამოყენებისას შესაძლოა შევაგროვოთ მომხმარებლის მიერ ნებაყოფლობით მოწოდებული ინფორმაცია, მათ შორის: სახელი და გვარი, საკონტაქტო ინფორმაცია, ელფოსტა, ტელეფონის ნომერი და პროგრამებში/ვაკანსიებში მონაწილეობისათვის საჭირო სხვა მონაცემები.',
      'privacy.sec2Title': '2. მონაცემების გამოყენების მიზანი',
      'privacy.sec2Body': 'მიღებული ინფორმაცია გამოიყენება მომხმარებელთან კომუნიკაციისთვის, განაცხადების დამუშავებისთვის, მომსახურების მიწოდებისთვის, პროგრამებსა და დასაქმების შესაძლებლობებთან დაკავშირებული პროცესების მართვისთვის და კომპანიის მომსახურების გაუმჯობესებისთვის.',
      'privacy.sec3Title': '3. მონაცემების დაცვა',
      'privacy.sec3Body': 'Geto Project იღებს შესაბამის ტექნიკურ და ორგანიზაციულ ზომებს პერსონალური მონაცემების დაკარგვის, არასანქცირებული წვდომის, შეცვლის ან გამჟღავნებისგან დასაცავად.',
      'privacy.sec4Title': '4. მონაცემების მესამე პირებისთვის გადაცემა',
      'privacy.sec4Body': 'მომხმარებლის პერსონალური მონაცემები არ გაიყიდება და არ გადაეცემა მესამე პირებს უკანონოდ. იმ შემთხვევაში, თუ მომსახურების ან პროგრამის განხორციელებისთვის აუცილებელია მონაცემების გადაცემა პარტნიორი ორგანიზაციისთვის, ეს განხორციელდება მხოლოდ შესაბამისი მიზნის ფარგლებში და მოქმედი კანონმდებლობის შესაბამისად.',
      'privacy.sec5Title': '5. Cookies',
      'privacy.sec5Body': 'ვებგვერდმა შესაძლოა გამოიყენოს Cookies მომხმარებლის გამოცდილების გასაუმჯობესებლად, ვებგვერდის ფუნქციონირების უზრუნველსაყოფად და ვიზიტორთა სტატისტიკური მონაცემების ანალიზისთვის.',
      'privacy.sec6Title': '6. მომხმარებლის უფლებები',
      'privacy.sec6Body': 'მომხმარებელს უფლება აქვს მოითხოვოს მის შესახებ არსებული პერსონალური მონაცემების შესახებ ინფორმაციის მიღება, მათი შესწორება, განახლება ან კანონით გათვალისწინებულ შემთხვევებში წაშლა/დამუშავების შეზღუდვა.',
      'privacy.sec7Title': '7. პოლიტიკის ცვლილება',
      'privacy.sec7Body': 'Geto Project უფლებამოსილია პერიოდულად განაახლოს წინამდებარე კონფიდენციალურობის პოლიტიკა. განახლებული ვერსია გამოქვეყნდება ვებგვერდზე და ძალაში შევა გამოქვეყნებისთანავე. კონფიდენციალურობის პოლიტიკასთან დაკავშირებით დამატებითი ინფორმაციისთვის შეგიძლიათ დაგვიკავშირდეთ ვებგვერდზე მითითებული საკონტაქტო საშუალებების გამოყენებით.',

      // Terms of Processing & Consent
      'terms.consentTitle': 'პერსონალურ მონაცემთა დამუშავებაზე თანხმობა',
      'terms.consentIntro': 'მე, ქვემოთ ხელმომწერი პირი, ვადასტურებ, რომ გავეცანი Geto Project-ის პერსონალურ მონაცემთა დაცვისა და კონფიდენციალურობის პოლიტიკას და თანხმობას ვაცხადებ ჩემი პერსონალური მონაცემების დამუშავებაზე მოქმედი კანონმდებლობის შესაბამისად.',
      'terms.p1': 'თანხმობა მოიცავს ჩემ მიერ კომპანიისთვის მიწოდებული პერსონალური მონაცემების, მათ შორის საიდენტიფიკაციო და საკონტაქტო ინფორმაციის, პასპორტის მონაცემების, ფოტოსურათის, განათლებასთან დაკავშირებული ინფორმაციის, რეზიუმესა და პროგრამაში მონაწილეობისათვის საჭირო სხვა დოკუმენტაციის შეგროვებას, შენახვას, გამოყენებასა და დამუშავებას.',
      'terms.p2': 'მონაცემთა დამუშავების მიზანია ჩემი განაცხადის განხილვა, პროგრამაში მონაწილეობის ორგანიზება, დასაქმების შესაძლებლობების მოძიება და შესაბამის დამსაქმებლებთან/პარტნიორ ორგანიზაციებთან კომუნიკაცია, ასევე აღნიშნული პროცესების ადმინისტრაციული და სამართლებრივი უზრუნველყოფა.',
      'terms.p3': 'ვაცნობიერებ და ვეთანხმები, რომ პროგრამის განხორციელების მიზნით, საჭიროების შემთხვევაში, ჩემი პერსონალური მონაცემები შესაძლოა გადაეცეს შესაბამის დამსაქმებლებს, პარტნიორ ორგანიზაციებს, საგანმანათლებლო დაწესებულებებს, სახელმწიფო ან სხვა უფლებამოსილ უწყებებს, მხოლოდ კანონით დასაშვებ ფარგლებში და შესაბამისი მიზნის მისაღწევად.',
      'terms.p4': 'ვადასტურებ, რომ ჩემ მიერ მოწოდებული ინფორმაცია არის ზუსტი, სრული და განახლებული. ასევე, ინფორმირებული ვარ ჩემი კანონით გათვალისწინებული უფლებების შესახებ, მათ შორის მონაცემებზე წვდომის, მათი გასწორების, განახლების და კანონით გათვალისწინებულ შემთხვევებში დამუშავების შეწყვეტის ან სხვა შესაბამისი მოთხოვნის წარდგენის უფლების შესახებ.',
      'terms.p5': 'ჩემი თანხმობა გაცემულია ნებაყოფლობით, ინფორმირებულად და კონკრეტული მიზნებისთვის.',
      'terms.checkbox': 'ვეთანხმები პერსონალური მონაცემების ზემოაღნიშნული წესით დამუშავებას.',
      'terms.acceptBtn': 'თანხმობის დადასტურება',

      // Dashboard & Auth
      'dash.cabinet': 'პირადი კაბინეტი',
      'dash.phase': 'თქვენი ეტაპი',
      'dash.status': 'განაცხადის სტატუსი',
      'dash.uploadTitle': 'დოკუმენტის ატვირთვა',
      'dash.dragDrop': 'ჩააგდეთ დოკუმენტი აქ',
      'dash.browse': 'აირჩიეთ ფაილი',
      'dash.templatesTitle': 'ეტაპის შაბლონები',
      'dash.myDocsTitle': 'ჩემი ატვირთული დოკუმენტები',
      'dash.refresh': 'განახლება',

      'auth.welcome': 'მოგესალმებით',
      'auth.loginSub': 'შედით სისტემაში თქვენს GETO პორტალზე წვდომისთვის',
      'auth.loginBtn': 'შესვლა',
      'auth.registerBtn': 'რეგისტრაცია',
      'auth.email': 'ელ-ფოსტის მისამართი',
      'auth.emailPlaceholder': 'name@example.com',
      'auth.password': 'პაროლი',
      'auth.forgotPassword': 'დაგავიწყდათ პაროლი?',
      'auth.authenticating': 'მიმდინარეობს ავტორიზაცია...',
      'auth.dontHaveAccount': 'არ გაქვთ ანგარიში?',
      'auth.createAccount': 'ანგარიშის შექმნა',
      'auth.emailRequired': 'ელ-ფოსტის მისამართი სავალდებულოა',
      'auth.emailValid': 'გთხოვთ შეიყვანოთ ვალიდური ელ-ფოსტა',
      'auth.passwordRequired': 'პაროლი სავალდებულოა',
      'auth.name': 'სახელი',
      'auth.lastName': 'გვარი',
      'auth.phone': 'ტელეფონის ნომერი',

      // Status & Phase Pipe Translation
      'status.pending': 'მოლოდინში',
      'status.rejected': 'უარყოფილი',
      'status.approved': 'დამტკიცებული',
      'status.resubmission': 'ხელახლა წარდგენა',
      'status.unknown': 'უცნობი',

      'phase.phaseOne': 'I ეტაპი',
      'phase.phaseTwo': 'II ეტაპი',
      'phase.phaseThree': 'III ეტაპი',
      'phase.canceled': 'გაუქმებული',

      // Admin Panel
      'admin.title': 'ადმინ პანელი',
      'admin.sub': 'მართეთ კლიენტები, დოკუმენტები და შაბლონები',
      'admin.templates': 'შაბლონები',
      'admin.distribute': 'გავრცელება',
      'admin.refresh': 'განახლება',
      'admin.searchPlaceholder': 'ძებნა კლიენტის...',
      'admin.clientsCount': 'კლიენტი',
      'admin.id': 'ID',
      'admin.client': 'კლიენტი',
      'admin.status': 'სტატუსი',
      'admin.phase': 'ეტაპი',
      'admin.files': 'ფაილები',
      'admin.actions': 'მოქმედებები',
      'admin.view': 'ნახვა',
      'admin.clearDocs': 'ფაილების წაშლა',
      'admin.delete': 'წაშლა',
      'admin.noClients': 'კლიენტები ვერ მოიძებნა',
      'admin.loading': 'იტვირთება...',
      'admin.inspectTitle': 'კლიენტის დეტალები',
      'admin.uploadedFiles': 'კლიენტის მიერ ატვირთული ფაილები',
      'admin.close': 'დახურვა',
      'admin.bulkUploadTitle': 'შაბლონის მასობრივი ატვირთვა',
      'admin.bulkUploadSub': 'ატვირთეთ შაბლონი და გაუგზავნეთ არჩეული ეტაპის ყველა კლიენტს.',
      'admin.targetPhase': 'სამიზნე ეტაპი',
      'admin.selectFile': 'აირჩიეთ შაბლონი',
      'admin.distributeBtn': 'შაბლონის გავრცელება',
      'admin.templateManagerTitle': 'შაბლონების მენეჯერი',
      'admin.templateManagerSub': 'აქ შეგიძლიათ იხილოთ სტუდენტებისთვის გამოჩენილი ყველა შაბლონი.',
      'admin.restore': 'აღდგენა',
      'admin.download': 'ჩამოტვირთვა',
      'admin.backendFile': 'ბაზის ფაილი',
      'confirm.cancel': 'გაუქმება',
      'confirm.warning': 'მოქმედება შეუქცევადია'
    },
    en: {
      // Navbar & General
      'nav.brand': 'GETO Portal',
      'nav.about': 'About Us',
      'nav.news': 'News',
      'nav.deutschCourse': 'German Language Course',
      'nav.cabinet': 'Personal Cabinet',
      'nav.admin': 'Admin Panel',
      'nav.login': 'Sign In',
      'nav.register': 'Register',
      'nav.logout': 'Log Out',
      'nav.terms': 'Terms & Privacy Policy',

      // About Us Page
      'about.title': 'About Us',
      'about.subtitle': 'Student Administrative & Advisory Services since 2020',
      'about.body': 'Since 2020, we have been providing administrative, intermediary, and consulting services for students. We assist them in processes related to employment in Germany, organizing documentation, and obtaining necessary information. We are not an employer — we act as a connecting and advisory intermediary between students and partner organizations.',
      'about.stat1.title': 'Reliable Intermediary',
      'about.stat1.sub': 'Strong and trusted connection between students and partner organizations.',
      'about.stat2.title': 'Professional Consultation',
      'about.stat2.sub': 'Tailored guidance throughout employment and study processes in Germany.',
      'about.stat3.title': 'Administrative Support',
      'about.stat3.sub': 'Full documentation arrangement and process management.',

      // News & Announcements Page
      'news.badge': 'News & Announcements',
      'news.title': 'News & Announcements',
      'news.subtitle': 'New job openings, important announcements, and news about employment in Germany.',
      'news.loading': 'Loading news...',
      'news.noNewsTitle': 'No News Available Yet',
      'news.noNewsDesc': 'New updates and announcements will be published here shortly.',
      'news.adminTitle': 'News Management',
      'news.addBtn': 'Add News Item',
      'news.inputTitle': 'Title',
      'news.inputText': 'Text',
      'news.titlePlaceholder': 'Enter news title...',
      'news.textPlaceholder': 'Enter detailed news or announcement text...',
      'news.deleteConfirm': 'Are you sure you want to delete this news item?',
      'news.editBtn': 'Edit',
      'news.editTitle': 'Edit News Item',
      'news.saveChanges': 'Save Changes',
      'news.cancelEdit': 'Cancel Edit',

      // Deutsch Course Page
      'deutsch.title': 'German Language Course',
      'deutsch.badge': 'German - Language Course',
      'deutsch.subtitle': 'Intensive Preparation for Employment and Studies in Germany',
      'deutsch.heroText': 'Learn German from A1 to B2 level with experienced tutors. Our course is specifically tailored for students looking to move to Germany.',
      'deutsch.announcementTitle': 'Do you want to study, work, or gain international experience in Germany?',
      'deutsch.announcementSub': '📚 Learn German, develop your skills, and create new prospects!',
      'deutsch.announcementNote': 'To register and view detailed information, please visit:',
      'deutsch.registerFormBtn': 'Register on Google Form',
      'deutsch.agreementCardTitle': 'Mutual Agreement Form (German Language Course)',
      'deutsch.agreementCardSub': 'Official mutual agreement form for the intensive German language course (PDF)',
      'deutsch.downloadDocBtn': 'Download Document',
      'deutsch.feature1Title': 'Speaking Practice',
      'deutsch.feature1Sub': 'Daily interactive communication exercises',
      'deutsch.feature2Title': 'Germany Employment Support',
      'deutsch.feature2Sub': 'Reliable Intermediary • Professional Consultation • Administrative Support',
      'deutsch.feature3Title': 'Certification',
      'deutsch.feature3Sub': 'Preparation for Goethe / TELC exams',
      'deutsch.enrollBtn': 'Enroll in Course',
      'deutsch.modulesTitle': 'Course Level Modules',
      'deutsch.a1Title': 'Beginner (A1)',
      'deutsch.a1Sub': 'Basic vocabulary, daily dialogues & expressions.',
      'deutsch.a2Title': 'Elementary (A2)',
      'deutsch.a2Sub': 'Grammar essentials, work environment communication.',
      'deutsch.b1Title': 'Intermediate (B1)',
      'deutsch.b1Sub': 'Fluent conversation, official document understanding.',
      'deutsch.b2Title': 'Upper Intermediate (B2)',
      'deutsch.b2Sub': 'Goethe / TELC exam preparation for Germany work visa.',

      // Privacy Policy Text
      'privacy.policyTitle': 'Privacy Policy',
      'privacy.lastUpdated': 'Last Updated: August 25, 2026',
      'privacy.policyIntro': 'Geto Project respects user privacy and is committed to protecting the confidentiality of personal data collected through the website.',
      'privacy.sec1Title': '1. Information We Collect',
      'privacy.sec1Body': 'When using the website, we may collect voluntarily provided information, including: full name, contact information, email, phone number, and other data required for participation in programs/vacancies.',
      'privacy.sec2Title': '2. Purpose of Data Use',
      'privacy.sec2Body': 'The collected information is used to communicate with users, process applications, deliver services, manage processes related to programs and employment opportunities, and improve company services.',
      'privacy.sec3Title': '3. Data Security',
      'privacy.sec3Body': 'Geto Project takes appropriate technical and organizational measures to protect personal data against loss, unauthorized access, alteration, or disclosure.',
      'privacy.sec4Title': '4. Data Transfer to Third Parties',
      'privacy.sec4Body': 'User personal data will not be sold or unlawfully transferred to third parties. If transferring data to partner organizations is necessary for service or program delivery, it will be done solely within permissible legal scope.',
      'privacy.sec5Title': '5. Cookies',
      'privacy.sec5Body': 'The website may use Cookies to enhance user experience, ensure website functionality, and analyze visitor statistics.',
      'privacy.sec6Title': '6. User Rights',
      'privacy.sec6Body': 'Users have the right to request information regarding their personal data, correct or update data, or request deletion/restriction of processing where applicable by law.',
      'privacy.sec7Title': '7. Policy Changes',
      'privacy.sec7Body': 'Geto Project reserves the right to update this privacy policy periodically. Updated versions will be published on the website and take effect immediately. For further information, contact us via listed communication channels.',

      // Terms of Processing & Consent
      'terms.consentTitle': 'Consent to Processing of Personal Data',
      'terms.consentIntro': 'I, the undersigned, confirm that I have read the Personal Data Protection and Privacy Policy of Geto Project and agree to the processing of my personal data in accordance with applicable legislation.',
      'terms.p1': 'Consent includes the collection, storage, use, and processing of personal data provided by me to the company, including identification and contact information, passport details, photographs, education-related information, resume, and other documentation required for participation in the program.',
      'terms.p2': 'The purpose of data processing is to review my application, organize participation in the program, search for employment opportunities, communicate with relevant employers/partner organizations, as well as ensure administrative and legal support.',
      'terms.p3': 'I understand and agree that for the implementation of the program, if necessary, my personal data may be transferred to relevant employers, partner organizations, educational institutions, state or other authorized bodies, only within legally permissible limits.',
      'terms.p4': 'I confirm that the information provided by me is accurate, complete, and up to date. I am also informed of my legal rights, including access to data, correction, updating, and termination of processing in legal cases.',
      'terms.p5': 'My consent is given voluntarily, knowledgeably, and for specific purposes.',
      'terms.checkbox': 'I agree to the processing of my personal data as described above.',
      'terms.acceptBtn': 'Confirm & Proceed',

      // Dashboard & Auth
      'dash.cabinet': 'Personal Cabinet',
      'dash.phase': 'Your Phase',
      'dash.status': 'Application Status',
      'dash.uploadTitle': 'Upload Document',
      'dash.dragDrop': 'Drag & drop document here',
      'dash.browse': 'browse files',
      'dash.templatesTitle': 'Phase Template Forms',
      'dash.myDocsTitle': 'My Uploaded Documents',
      'dash.refresh': 'Refresh',

      'auth.welcome': 'Welcome Back',
      'auth.loginSub': 'Sign in to access your GETO Portal cabinet',
      'auth.loginBtn': 'Sign In',
      'auth.registerBtn': 'Register Account',
      'auth.email': 'Email Address',
      'auth.emailPlaceholder': 'name@example.com',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot password?',
      'auth.authenticating': 'Authenticating...',
      'auth.dontHaveAccount': "Don't have an account?",
      'auth.createAccount': 'Create an account',
      'auth.emailRequired': 'Email address is required',
      'auth.emailValid': 'Please enter a valid email address',
      'auth.passwordRequired': 'Password is required',
      'auth.name': 'First Name',
      'auth.lastName': 'Last Name',
      'auth.phone': 'Phone Number',

      // Status & Phase Pipe Translation
      'status.pending': 'Pending',
      'status.rejected': 'Rejected',
      'status.approved': 'Approved',
      'status.resubmission': 'Resubmission',
      'status.unknown': 'Unknown',

      'phase.phaseOne': 'Phase One',
      'phase.phaseTwo': 'Phase Two',
      'phase.phaseThree': 'Phase Three',
      'phase.canceled': 'Canceled',

      // Admin Panel
      'admin.title': 'Admin Panel',
      'admin.sub': 'Manage clients, documents, and templates',
      'admin.templates': 'Templates',
      'admin.distribute': 'Distribute',
      'admin.refresh': 'Refresh',
      'admin.searchPlaceholder': 'Search client...',
      'admin.clientsCount': 'clients',
      'admin.id': 'ID',
      'admin.client': 'Client',
      'admin.status': 'Status',
      'admin.phase': 'Phase',
      'admin.files': 'Files',
      'admin.actions': 'Actions',
      'admin.view': 'View',
      'admin.clearDocs': 'Clear Docs',
      'admin.delete': 'Delete',
      'admin.noClients': 'No clients found',
      'admin.loading': 'Loading...',
      'admin.inspectTitle': 'Client Details',
      'admin.uploadedFiles': 'Files Uploaded by Client',
      'admin.close': 'Close',
      'admin.bulkUploadTitle': 'Bulk Template Upload',
      'admin.bulkUploadSub': 'Upload a template document and assign it to all clients currently assigned to the selected Phase.',
      'admin.targetPhase': 'Target Phase',
      'admin.selectFile': 'Select Template File',
      'admin.distributeBtn': 'Distribute Template',
      'admin.templateManagerTitle': 'Templates Manager',
      'admin.templateManagerSub': 'Here you can view all template files displayed to students.',
      'admin.restore': 'Restore',
      'admin.download': 'Download',
      'admin.backendFile': 'Backend File',
      'confirm.cancel': 'Cancel',
      'confirm.warning': 'Action cannot be undone'
    }
  };

  t(key: string): string {
    const lang = this.currentLang();
    return this.translations[lang]?.[key] || this.translations['en']?.[key] || key;
  }
}
