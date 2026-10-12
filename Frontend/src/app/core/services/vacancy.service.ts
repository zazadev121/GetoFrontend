import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { VacancyDto, CreateVacancyDto, VacancyAttachmentDto } from '../models/vacancy.model';

@Injectable({
  providedIn: 'root'
})
export class VacancyService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/Vacancy`;

  getAllVacancies(): Observable<ApiResponse<VacancyDto[]>> {
    return this.http.get<ApiResponse<VacancyDto[]>>(this.baseUrl);
  }

  createVacancy(dto: CreateVacancyDto): Observable<ApiResponse<VacancyDto>> {
    return this.http.post<ApiResponse<VacancyDto>>(this.baseUrl, dto);
  }

  updateVacancy(id: number, dto: CreateVacancyDto): Observable<ApiResponse<VacancyDto>> {
    return this.http.put<ApiResponse<VacancyDto>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteVacancy(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/${id}`);
  }

  uploadAttachment(vacancyId: number, file: File): Observable<ApiResponse<VacancyAttachmentDto>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<VacancyAttachmentDto>>(`${this.baseUrl}/${vacancyId}/attachments`, formData);
  }

  deleteAttachment(attachmentId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/attachments/${attachmentId}`);
  }

  getAttachmentDownloadUrl(attachmentId: number): string {
    return `${this.baseUrl}/attachments/${attachmentId}/download`;
  }

  downloadAttachment(attachmentId: number, defaultFileName: string = 'attachment'): Observable<void> {
    const url = this.getAttachmentDownloadUrl(attachmentId);
    return this.http.get(url, {
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

        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      })
    );
  }
}
