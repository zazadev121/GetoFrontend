import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { UserWithDocumentsDto } from '../models/user.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/Admin`;

  getAllUsers(): Observable<ApiResponse<UserWithDocumentsDto[]>> {
    return this.http.get<ApiResponse<UserWithDocumentsDto[]>>(`${this.baseUrl}/users`);
  }

  searchUsers(name: string): Observable<ApiResponse<UserWithDocumentsDto[]>> {
    return this.http.get<ApiResponse<UserWithDocumentsDto[]>>(`${this.baseUrl}/users/search`, {
      params: { name }
    });
  }

  getUserById(userId: number): Observable<ApiResponse<UserWithDocumentsDto>> {
    return this.http.get<ApiResponse<UserWithDocumentsDto>>(`${this.baseUrl}/users/${userId}`);
  }

  downloadUserDocument(userId: number, documentId: number, defaultFileName: string = 'user-document'): Observable<void> {
    return this.http.get(`${this.baseUrl}/users/${userId}/documents/${documentId}/download`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        const blob = response.body as Blob;
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = defaultFileName;

        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
    );
  }

  updateUserStatus(userId: number, status: number, comment?: string): Observable<ApiResponse<any>> {
    const params: any = { status: status.toString() };
    if (comment && comment.trim()) {
      params.comment = comment.trim();
    }
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/status`, null, { params });
  }

  updateUserPhase(userId: number, phase: number, comment?: string): Observable<ApiResponse<any>> {
    const params: any = { phase: phase.toString() };
    if (comment && comment.trim()) {
      params.comment = comment.trim();
    }
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/phase`, null, { params });
  }

  deleteUser(userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${userId}`);
  }

  deleteUserDocuments(userId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${userId}/documents`);
  }

  deleteSingleDocument(documentId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/documents/${documentId}`);
  }

  deleteBulkDocumentsByFileName(fileName: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/documents/bulk`, {
      params: { fileName }
    });
  }

  bulkUploadDocument(phase: number, file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/document/add-all`, formData, {
      params: { phase: phase.toString() }
    });
  }

  sendDocumentToUser(userId: number, phase: number, file: File, note?: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    let params: any = { phase: phase.toString() };
    if (note && note.trim()) {
      params.note = note.trim();
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/document/send-to-user/${userId}`, formData, {
      params
    });
  }

  toggleDocumentAdminUploaded(documentId: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/document/${documentId}/toggle-admin-uploaded`, {});
  }
}
