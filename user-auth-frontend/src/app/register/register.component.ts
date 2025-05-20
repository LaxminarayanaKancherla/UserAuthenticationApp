import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

interface FocusedFields {
  email: boolean;
  username: boolean;
  password: boolean;
  phone: boolean;
  age: boolean;
  image: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  registerError: string | null = null;
  focusedFields: FocusedFields = {
    email: false,
    username: false,
    password: false,
    phone: false,
    age: false,
    image: true // Always focused for image to keep label on top
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      age: ['', [Validators.required, Validators.min(18), this.noSymbolsValidator()]],
      image: [null]
    });

    // Listen for age input changes to handle symbols
    this.registerForm.get('age')?.valueChanges.subscribe(value => {
      if (value && this.containsSymbols(value.toString())) {
        this.registerForm.get('age')?.setValue(1, { emitEvent: false });
        this.snackBar.open('Invalid age input. Set to 1.', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnInit(): void {}

  // Custom validator to detect symbols
  noSymbolsValidator() {
    return (control: any) => {
      if (control.value && this.containsSymbols(control.value.toString())) {
        return { invalidSymbols: true };
      }
      return null;
    };
  }

  // Check if input contains symbols
  containsSymbols(value: string): boolean {
    const symbolRegex = /[-+=\\/?.,!@#$%^&*()_'"`~;]/;
    return symbolRegex.test(value);
  }

  onFocus(field: keyof FocusedFields): void {
    this.focusedFields[field] = true;
  }

  onBlur(field: keyof FocusedFields): void {
    if (!this.registerForm.get(field)?.value && this.registerForm.get(field)?.value !== 0) {
      this.focusedFields[field] = false;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      if (file.size > 200 * 1024) {
        this.snackBar.open('Image size must be below 200KB', 'Close', { duration: 3000 });
        return;
      }
      this.registerForm.patchValue({ image: file });
      this.focusedFields.image = true;
    }
  }

  register(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const user = {
        email: formValue.email,
        username: formValue.username,
        password: formValue.password,
        phone: formValue.phone,
        age: formValue.age,
        role: 'USER'
      };
      this.authService.register(user, formValue.image).subscribe({
        next: () => {
          this.snackBar.open('Registration successful', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          this.registerError = err.message || 'Registration failed';
          this.snackBar.open(this.registerError || 'Registration failed', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}