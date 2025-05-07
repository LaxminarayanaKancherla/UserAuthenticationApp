import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const userRole = this.authService.getUserRole();
        this.router.navigate([userRole === 'ADMIN' ? '/admin' : '/profile']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Invalid email or password';
      }
    });
  }
}