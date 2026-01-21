import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // Portfolio Routes
  generatePortfolio(userData: any, templateName: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/portfolio/generate`, { userData, templateName }, {
      responseType: 'blob'
    });
  }

  // Resume Routes
  saveResume(userId: number, resumeContent: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/resume/save`, { userId, resumeContent });
  }

  getResume(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resume/${userId}`);
  }

  // ATS Routes
  checkAtsScore(resumeText: string, jobDescription: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ats/check`, { resumeText, jobDescription });
  }

  // Export Routes
  exportToPdf(resumeContent: any, template: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/resume/export/pdf`, { resumeContent, template }, {
      responseType: 'blob'
    });
  }

  exportToWord(resumeContent: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/resume/export/word`, { resumeContent }, {
      responseType: 'blob'
    });
  }
}
