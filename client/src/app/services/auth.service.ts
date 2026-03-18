import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    private tokenKey = 'astra_token';
    private userKey = 'astra_user';

    private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
            tap((res: any) => {
                localStorage.setItem(this.tokenKey, res.token);
                localStorage.setItem(this.userKey, JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, { username, email, password }).pipe(
            tap((res: any) => {
                localStorage.setItem(this.tokenKey, res.token);
                localStorage.setItem(this.userKey, JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        const user = this.getStoredUser();
        return user?.role === 'admin';
    }

    getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    private getStoredUser(): any {
        const data = localStorage.getItem(this.userKey);
        return data ? JSON.parse(data) : null;
    }

    // Admin endpoints
    getAdminStats(): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/stats`, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
        });
    }

    getAllUsers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/users`, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
        });
    }

    getActivityLog(): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/activity`, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
        });
    }

    toggleFeature(feature: string, status: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/feature-toggle`, { feature, status }, {
            headers: { Authorization: `Bearer ${this.getToken()}` }
        });
    }
}
