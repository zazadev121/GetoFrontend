import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  notificationService.warning('Admin access required for this page.', 'Access Blocked');
  return router.createUrlTree(['/dashboard']);
};
