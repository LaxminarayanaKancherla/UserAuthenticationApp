import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import { RoleResponse } from '../role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  users: User[] = [];
  roles: RoleResponse[] = [];
  editUserForm: FormGroup;
  editUserId: string | null = null;
  selectedEditFile: File | null = null;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.editUserForm = this.fb.group({
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(18)]],
      role: ['', Validators.required],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  ngOnDestroy(): void {}

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.snackBar.open(err.message, 'Close', { duration: 3000 });
      }
    });
  }

  loadRoles(): void {
    this.authService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.snackBar.open(err.message, 'Close', { duration: 3000 });
      }
    });
  }

  onFileChange(event: Event, formType: 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedEditFile = input.files[0];
    }
  }

  editUser(user: User): void {
    this.editUserId = user.email;
    this.editUserForm.patchValue({
      email: user.email,
      phone: user.phone,
      username: user.username,
      age: user.age,
      role: user.role
    });
  }

  updateUser(): void {
    if (this.editUserForm.valid && this.editUserId) {
      const user: User = {
        email: this.editUserId,
        username: this.editUserForm.get('username')?.value,
        phone: this.editUserForm.get('phone')?.value,
        age: this.editUserForm.get('age')?.value,
        role: this.editUserForm.get('role')?.value
      };
      this.authService.updateUser(this.editUserId, user, this.selectedEditFile).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.loadUsers();
          this.cancelEdit();
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.snackBar.open(err.message, 'Close', { duration: 3000 });
        }
      });
    }
  }

  cancelEdit(): void {
    this.editUserId = null;
    this.editUserForm.reset();
    this.selectedEditFile = null;
  }

  deleteUser(email: string): void {
    this.authService.deleteUser(email).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.snackBar.open(err.message, 'Close', { duration: 3000 });
      }
    });
  }

  onFocus(field: string): void {
    this.editUserForm.get(field)?.markAsTouched();
  }

  onBlur(field: string): void {
    if (!this.editUserForm.get(field)?.value) {
      this.editUserForm.get(field)?.markAsUntouched();
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }
}