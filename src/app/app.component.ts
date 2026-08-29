import { Component, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthService } from './core/services/auth.service';
import { WebPushService } from './core/services/web-push.service';
import { PollNotificationService } from './core/services/poll-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <app-navbar></app-navbar>
      
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <app-toast-container></app-toast-container>
    </div>
  `
})
export class AppComponent {
  title = 'Geto Project Frontend';

  private authService = inject(AuthService);
  private webPushService = inject(WebPushService);
  private pollNotificationService = inject(PollNotificationService);

  constructor() {
    this.webPushService.registerWorker();

    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      untracked(() => {
        if (loggedIn) {
          this.webPushService.init();
          this.pollNotificationService.init();
        } else {
          this.pollNotificationService.destroy();
        }
      });
    });
  }
}
