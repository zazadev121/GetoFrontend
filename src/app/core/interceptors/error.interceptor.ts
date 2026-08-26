import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'object') {
        // Backend JSON error response
        if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.title) {
          errorMessage = error.error.title;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }

      // Silence 404 notification popups for document list checks
      const isSilentListQuery = (req.url.includes('admin-phase/list') || req.url.includes('Document/list')) && error.status === 404;

      if (error.status === 401) {
        notificationService.error('Session expired or unauthorized. Please log in again.', 'Unauthorized');
        authService.logout();
      } else if (error.status === 403) {
        notificationService.error('Access denied. You do not have permission for this resource.', 'Forbidden');
      } else if (!isSilentListQuery) {
        notificationService.error(errorMessage, `Error (${error.status || 'Network'})`);
      }

      return throwError(() => error);
    })
  );
};
