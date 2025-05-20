import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class LoginComponent {
  email = '';
  password = '';
  showLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.authService.getUserProfile().subscribe({
          next: (user) => {
            const role = user.role.toUpperCase();
            if (role === 'USER') {
              this.router.navigate(['/profile']);
            } else if (role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (role === 'ROLEMASTER') {
              this.router.navigate(['/rolemaster']);
            } else {
              this.router.navigate(['/']);
            }
            this.showLogin = false;
          },
          error: (err: any) => {
            this.snackBar.open(err.message || 'Failed to fetch user profile', 'Close', { duration: 3000 });
          }
        });
      },
      error: (err: any) => {
        this.snackBar.open(err.message || 'Login failed', 'Close', { duration: 3000 });
      }
    });
  }

  toggleLogin(): void {
    this.showLogin = !this.showLogin;
  }

  closeLogin(): void {
    this.showLogin = false;
    this.router.navigate(['/']);
  }
}

