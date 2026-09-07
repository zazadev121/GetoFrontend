import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { DocumentDto } from '../models/document.model';

import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/Document`;

  uploadDocument(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/upload`, formData);
  }

  getUserDocuments(): Observable<ApiResponse<DocumentDto[]>> {
    return this.http.get<ApiResponse<DocumentDto[]>>(`${this.baseUrl}/list`);
  }

  downloadDocument(documentId: number, defaultFileName: string = 'document'): Observable<void> {
    return this.http.get(`${this.baseUrl}/download/${documentId}`, {
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

  deleteDocument(documentId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/delete/${documentId}`);
  }

  getAdminDocumentsByPhase(): Observable<ApiResponse<DocumentDto[]>> {
    return this.http.get<ApiResponse<DocumentDto[]>>(`${this.baseUrl}/admin-phase/list`);
  }

  downloadAdminPhaseDocument(documentId: number, defaultFileName: string = 'template-document'): Observable<void> {
    return this.http.get(`${this.baseUrl}/admin-phase/download/${documentId}`, {
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
}
