import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Public Pages
  {
    path: 'about',
    loadComponent: () => import('./about/about-us.component').then(m => m.AboutUsComponent)
  },
  {
    path: 'recommendations',
    loadComponent: () => import('./pages/recommendations/recommendations.component').then(m => m.RecommendationsComponent)
  },
  {
    path: 'german-course',
    loadComponent: () => import('./pages/deutsch-course/deutsch-course.component').then(m => m.DeutschCourseComponent)
  },
  {
    path: 'steuer',
    loadComponent: () => import('./pages/steuer/steuer.component').then(m => m.SteuerComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },

  // Auth Routes
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // User Cabinet Route
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    canActivate: [authGuard]
  },

  // Admin Panel Route
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [authGuard, adminGuard]
  },

  { path: '**', redirectTo: 'dashboard' }
];
