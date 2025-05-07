import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<any>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkInitialLoginState();
  }

  checkInitialLoginState() {
    const token = this.getToken();
    if (token) {
      this.fetchUser().subscribe({
        next: (user) => {
          if (user) {
            this.userSubject.next(user);
            this.isLoggedInSubject.next(true);
          } else {
            this.clearAuthState();
          }
        },
        error: () => {
          this.clearAuthState();
        }
      });
    } else {
      this.clearAuthState();
    }
  }

  private clearAuthState() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigateByUrl('#home');
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        this.isLoggedInSubject.next(true);
        this.fetchUser().subscribe();
      }),
      catchError(err => {
        this.clearAuthState();
        throw err;
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout() {
    this.clearAuthState();
    localStorage.clear();
  }

  fetchUser(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      this.clearAuthState();
      return of(null);
    }
    return this.http.get<any>(`${this.apiUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => {
        if (user) {
          this.userSubject.next(user);
        } else {
          this.clearAuthState();
        }
      }),
      catchError(err => {
        console.error('Failed to fetch user:', err);
        this.clearAuthState();
        return of(null);
      })
    );
  }

  getUser() {
    return this.userSubject.value;
  }

  getUserRole(): string | null {
    return this.getUser()?.role || null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}