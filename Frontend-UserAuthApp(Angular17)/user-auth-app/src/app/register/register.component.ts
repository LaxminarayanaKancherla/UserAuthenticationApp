import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      age: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    }
  }

  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please correct the form errors';
      return;
    }

    const user = this.registerForm.value;
    this.authService.register(user).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Registration failed';
        this.successMessage = '';
      }
    });
  }
}