import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showLogin = false;
  loginData = { email: '', password: '' };
  loginError = '';

  constructor(private authService: AuthService) {}

  showLoginModal() {
    this.showLogin = true;
  }

  closeLoginModal() {
    this.showLogin = false;
    this.loginError = '';
    this.loginData = { email: '', password: '' };
  }

  login() {
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.closeLoginModal();
      },
      error: (err) => {
        this.loginError = err.error.message || 'Login failed';
      }
    });
  }
}

