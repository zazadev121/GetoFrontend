import { Component, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { NotificationPromptComponent } from './shared/components/notification-prompt/notification-prompt.component';
import { AuthService } from './core/services/auth.service';
import { WebPushService } from './core/services/web-push.service';
import { PollNotificationService } from './core/services/poll-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent,
    NotificationPromptComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col font-sans">
      <!-- scroll-linked, driven by --scroll-progress from main.ts -->
      <div class="scroll-progress" aria-hidden="true"></div>

      <app-navbar></app-navbar>

      <main class="flex-1 relative">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <app-toast-container></app-toast-container>
      <app-notification-prompt></app-notification-prompt>
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
          // reset() also clears the stored baseline, so the next account signing
          // in on this browser doesn't inherit the previous user's state.
          this.pollNotificationService.reset();
        }
      });
    });
  }
}
