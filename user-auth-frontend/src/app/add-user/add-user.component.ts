import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { RoleResponse } from '../role.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  addUserForm: FormGroup;
  roles: RoleResponse[] = [];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.addUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      age: ['', [Validators.required, Validators.min(18)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.authService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to load roles', 'Close', { duration: 3000 });
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  addUser(): void {
    if (this.addUserForm.valid) {
      const user = {
        email: this.addUserForm.get('email')?.value,
        username: this.addUserForm.get('username')?.value,
        phone: this.addUserForm.get('phone')?.value,
        age: this.addUserForm.get('age')?.value,
        role: this.addUserForm.get('role')?.value,
        password: this.addUserForm.get('password')?.value
      };
      this.authService.addUser(user, this.selectedFile).subscribe({
        next: () => {
          this.snackBar.open('User added successfully', 'Close', { duration: 3000 });
          this.addUserForm.reset();
          this.selectedFile = null;
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to add user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onFocus(field: string): void {
    this.addUserForm.get(field)?.markAsTouched();
  }

  onBlur(field: string): void {
    if (!this.addUserForm.get(field)?.value) {
      this.addUserForm.get(field)?.markAsUntouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}