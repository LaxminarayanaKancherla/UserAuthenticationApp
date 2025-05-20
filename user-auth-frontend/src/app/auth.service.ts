import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from './user.model';
import { RoleResponse } from './role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  public isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkLoginStatus();
  }

  private checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    this.isLoggedInSubject.next(!!token);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(email: string, password: string): Observable<{ token: string; user: User }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, { email, password }, { headers }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isLoggedInSubject.next(true);
        this.router.navigate(['/welcome']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login failed', error);
        return throwError(() => new Error(error.error?.message || 'Invalid credentials'));
      })
    );
  }

  register(user: User & { password?: string }, image: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    return this.http.post(`${this.apiUrl}/register`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Registration failed', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getUserProfile(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<User>(`${this.apiUrl}/user`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to fetch user profile', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch user profile'));
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to fetch users', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch users'));
      })
    );
  }

  addUser(user: User & { password?: string }, image: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(`${this.apiUrl}/admin/user`, formData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to add user', error);
        return throwError(() => new Error(error.error?.message || 'Failed to add user'));
      })
    );
  }

  updateUser(email: string, user: User, image: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.put(`${this.apiUrl}/admin/user/${email}`, formData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to update user', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update user'));
      })
    );
  }

  deleteUser(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.delete(`${this.apiUrl}/admin/user/${email}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to delete user', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete user'));
      })
    );
  }

  getAllRoles(): Observable<RoleResponse[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<RoleResponse[]>(`${this.apiUrl}/admin/roles`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to fetch roles', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch roles'));
      })
    );
  }

  createRole(roleName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/admin/role`, { name: roleName }, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to create role', error);
        return throwError(() => new Error(error.error?.message || 'Failed to create role'));
      })
    );
  }

  uploadImage(email: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('image', image);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(`${this.apiUrl}/image`, formData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to upload image', error);
        return throwError(() => new Error(error.error?.message || 'Failed to upload image'));
      })
    );
  }

  updateRole(oldName: string, newName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/admin/role/${oldName}`, { name: newName }, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to update role', error);
        return throwError(() => new Error(error.error?.message || 'Failed to update role'));
      })
    );
  }

  deleteRole(name: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.delete(`${this.apiUrl}/admin/role/${name}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to delete role', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete role'));
      })
    );
  }
}