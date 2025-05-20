
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import { RoleResponse } from '../role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

interface FocusedFields {
  [key: string]: { add: boolean; edit: boolean };
}

@Component({
  selector: 'app-rolemaster-dashboard',
  templateUrl: './rolemaster-dashboard.component.html',
  styleUrls: ['./rolemaster-dashboard.component.css']
})
export class RolemasterDashboardComponent implements OnInit {
  users: User[] = [];
  roles: string[] = [];
  addUserForm: FormGroup;
  editUserForm: FormGroup;
  selectedUser: User | null = null;
  errorMessage: string | null = null;
  selectedFile: File | null = null;
  showAddForm = false;
  focusedFields: FocusedFields = {
    email: { add: false, edit: false },
    username: { add: false, edit: false },
    phone: { add: false, edit: false },
    age: { add: false, edit: false },
    password: { add: false, edit: false },
    role: { add: false, edit: false },
    image: { add: false, edit: false }
  };

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      age: ['', [Validators.required, Validators.min(18)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });

    this.editUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      age: ['', [Validators.required, Validators.min(18)]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchRoles();
  }

  fetchUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users.filter(user => user.role.toUpperCase() !== 'ADMIN' && user.role.toUpperCase() !== 'ROLEMASTER');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error.message || 'Failed to fetch users';
        this.snackBar.open(this.errorMessage || 'Error occurred', 'Close', { duration: 3000 });
      }
    });
  }

  fetchRoles(): void {
    this.authService.getAllRoles().subscribe({
      next: (roles: RoleResponse[]) => {
        this.roles = roles
          .filter(role => role.name.toUpperCase() !== 'ADMIN')
          .map(role => role.name);
        if (this.roles.length > 0) {
          this.addUserForm.patchValue({ role: this.roles[0] });
          this.editUserForm.patchValue({ role: this.roles[0] });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error.message || 'Failed to fetch roles';
        this.snackBar.open(this.errorMessage || 'Error occurred', 'Close', { duration: 3000 });
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.selectedFile = null;
    this.addUserForm.reset();
    if (this.roles.length > 0) {
      this.addUserForm.patchValue({ role: this.roles[0] });
    }
  }

  toggleEditUserForm(user: User | null): void {
    if (!user) {
      this.selectedUser = null;
      this.showAddForm = false;
      this.editUserForm.reset();
      return;
    }
    this.selectedUser = user;
    this.showAddForm = true;
    this.selectedFile = null;
    this.editUserForm.patchValue({
      email: user.email,
      username: user.username,
      phone: user.phone,
      age: user.age,
      role: user.role
    });
  }

  onFocus(field: string, isAddForm: boolean): void {
    this.focusedFields[field][isAddForm ? 'add' : 'edit'] = true;
  }

  onBlur(field: string, isAddForm: boolean): void {
    this.focusedFields[field][isAddForm ? 'add' : 'edit'] = false;
  }

  onFileChange(event: Event, isAddForm: boolean): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      if (file.size < 150 * 1024 || file.size > 200 * 1024) {
        this.snackBar.open('Image size must be between 150KB and 200KB', 'Close', { duration: 3000 });
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        this.snackBar.open('Only PNG or JPEG images are allowed', 'Close', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
    }
  }

  addUser(): void {
    if (this.addUserForm.valid) {
      const user: User & { password?: string } = {
        email: this.addUserForm.value.email,
        username: this.addUserForm.value.username,
        phone: this.addUserForm.value.phone,
        age: this.addUserForm.value.age,
        role: this.addUserForm.value.role,
        image: undefined,
        password: this.addUserForm.value.password
      };
      this.authService.addUser(user, this.selectedFile).subscribe({
        next: () => {
          this.snackBar.open('User added successfully', 'Close', { duration: 3000 });
          this.fetchUsers();
          this.toggleAddForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error.message || 'Failed to add user';
          this.snackBar.open(this.errorMessage || 'Error occurred', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  updateUser(): void {
    if (this.editUserForm.valid && this.selectedUser && this.selectedUser.email) {
      const user: User = {
        email: this.editUserForm.value.email,
        username: this.editUserForm.value.username,
        phone: this.editUserForm.value.phone,
        age: this.editUserForm.value.age,
        role: this.editUserForm.value.role,
        image: undefined
      };
      this.authService.updateUser(this.selectedUser.email, user, this.selectedFile).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.fetchUsers();
          this.toggleEditUserForm(null);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error.message || 'Failed to update user';
          this.snackBar.open(this.errorMessage || 'Error occurred', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  editUser(user: User): void {
    this.toggleEditUserForm(user);
  }

  cancelEdit(): void {
    this.toggleEditUserForm(null);
  }

  deleteUser(email: string): void {
    if (email && confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(email).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.fetchUsers();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error.message || 'Failed to delete user';
          this.snackBar.open(this.errorMessage || 'Error occurred', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Invalid user email', 'Close', { duration: 3000 });
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }
}