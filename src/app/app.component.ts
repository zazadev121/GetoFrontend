import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

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
}
