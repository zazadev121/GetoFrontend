import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { 
  RegisterRequest, 
  LoginRequest, 
  VerifyEmailRequest, 
  ResetPasswordRequest, 
  UserClaims 
} from '../models/auth.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'geto_auth_token';
  private readonly baseUrl = `${API_CONFIG.baseUrl}/User`;

  tokenSignal = signal<string | null>(this.getStoredToken());
  currentUserSignal = signal<UserClaims | null>(this.decodeClaims(this.getStoredToken()));

  isLoggedIn = computed(() => !!this.tokenSignal());
  isAdmin = computed(() => {
    const claims = this.currentUserSignal();
    if (!claims) return false;
    // Role can be 1, '1', 'Admin', or '0' depending on enum serialization
    return claims.role === 1 || claims.role === '1' || claims.role === 'Admin';
  });

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.tokenSignal.set(token);
    this.currentUserSignal.set(this.decodeClaims(token));
  }

  public getToken(): string | null {
    return this.tokenSignal();
  }

  private decodeClaims(token: string | null): UserClaims | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload['role'] || payload['Role'];
      const nameClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['name'] || payload['Name'] || '';
      const emailClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload['email'] || payload['Email'] || '';
      const subClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload['sub'] || payload['UserId'] || 0;

      return {
        userId: Number(subClaim),
        email: emailClaim,
        name: nameClaim,
        role: roleClaim
      };
    } catch (e) {
      console.error('Error decoding JWT token claims', e);
      return null;
    }
  }

  register(req: RegisterRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.baseUrl}/Register`, req);
  }

  login(req: LoginRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/Login`, req).pipe(
      tap(res => {
        if (res.statusCode === 200 && res.data) {
          this.setToken(res.data);
        }
      })
    );
  }

  verifyEmail(req: VerifyEmailRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/VerifyEmail`, req).pipe(
      tap(res => {
        if (res.statusCode === 200 && res.data) {
          this.setToken(res.data);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ForgotPassword/${encodeURIComponent(email)}`, {});
  }

  resetPassword(req: ResetPasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/ResetPassword`, req);
  }

  getProfile(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/me`);
  }

  logout() {
    this.setToken(null);
    this.router.navigate(['/auth/login']);
  }
}
