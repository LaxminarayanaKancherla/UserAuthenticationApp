import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  addUserForm: FormGroup;
  editUserForm: FormGroup;
  errorMessage = '';
  showAddUserForm = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      age: ['', [Validators.required, Validators.min(0)]],
      role: ['USER', Validators.required]
    });

    this.editUserForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.minLength(6)], // Optional password update
      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      age: ['', [Validators.required, Validators.min(0)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('http://localhost:8080/api/auth/admin/users', {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch users';
        console.error(err);
      }
    });
  }

  toggleAddUserForm() {
    this.showAddUserForm = !this.showAddUserForm;
    if (!this.showAddUserForm) {
      this.addUserForm.reset({ role: 'USER' });
      this.errorMessage = '';
    }
  }

  addUser() {
    if (this.addUserForm.invalid) {
      this.errorMessage = 'Please correct the form errors';
      this.addUserForm.markAllAsTouched();
      return;
    }

    this.http.post('http://localhost:8080/api/auth/admin/user', this.addUserForm.value, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).pipe(
      catchError(err => {
        this.errorMessage = err.error.message || 'Failed to add user';
        return throwError(() => err);
      })
    ).subscribe(() => {
      this.fetchUsers();
      this.addUserForm.reset({ role: 'USER' });
      this.showAddUserForm = false;
      this.errorMessage = '';
    });
  }

  startEdit(user: any) {
    this.editUserForm.patchValue({
      email: user.email,
      username: user.username,
      phone: user.phone,
      age: user.age,
      role: user.role,
      password: ''
    });
  }

  updateUser() {
    if (this.editUserForm.invalid) {
      this.errorMessage = 'Please correct the form errors';
      this.editUserForm.markAllAsTouched();
      return;
    }

    const updateData = {
      email: this.editUserForm.get('email')?.value,
      username: this.editUserForm.get('username')?.value,
      phone: this.editUserForm.get('phone')?.value,
      age: this.editUserForm.get('age')?.value,
      role: this.editUserForm.get('role')?.value,
      password: this.editUserForm.get('password')?.value || undefined
    };

    this.http.put(`http://localhost:8080/api/auth/admin/user/${updateData.email}`, updateData, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).pipe(
      catchError(err => {
        this.errorMessage = err.error.message || 'Failed to update user';
        return throwError(() => err);
      })
    ).subscribe(() => {
      this.fetchUsers();
      this.editUserForm.reset();
      this.errorMessage = '';
    });
  }

  deleteUser(email: string) {
    this.http.delete(`http://localhost:8080/api/auth/admin/user/${email}`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    }).pipe(
      catchError(err => {
        this.errorMessage = err.error.message || 'Failed to delete user';
        return throwError(() => err);
      })
    ).subscribe(() => {
      this.fetchUsers();
      this.errorMessage = '';
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('#home');
  }

  goBack() {
    this.router.navigateByUrl('#home');
  }
}