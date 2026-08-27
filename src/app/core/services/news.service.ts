import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import { NewsDto, CreateNewsDto } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/News`;

  getAllNews(): Observable<ApiResponse<NewsDto[]>> {
    return this.http.get<ApiResponse<NewsDto[]>>(this.baseUrl);
  }

  createNews(dto: CreateNewsDto): Observable<ApiResponse<NewsDto>> {
    return this.http.post<ApiResponse<NewsDto>>(this.baseUrl, dto);
  }

  updateNews(id: number, dto: CreateNewsDto): Observable<ApiResponse<NewsDto>> {
    return this.http.put<ApiResponse<NewsDto>>(`${this.baseUrl}/${id}`, dto);
  }

  deleteNews(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/${id}`);
  }
}
