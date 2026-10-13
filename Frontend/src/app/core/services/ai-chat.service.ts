import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  rawContent?: string;
  links?: { path: string; label: string }[];
}

export interface ChatResponse {
  reply: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/Ai`;

  sendMessage(message: string, history: ChatMessage[], language: 'ka' | 'en'): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, {
      message,
      language,
      history: history.map(h => ({ role: h.role, content: h.rawContent ?? h.content }))
    });
  }
}
