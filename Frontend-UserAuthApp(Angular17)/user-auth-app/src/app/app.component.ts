import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showLoginSlider = false;
  showProfileDropdown = false;
  isLoggedIn$!: Observable<boolean>;
  loginData = { email: '', password: '' };
  loginError = '';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.authService.checkInitialLoginState();
  }

  showLogin() {
    this.showLoginSlider = true;
  }

  closeLogin() {
    this.showLoginSlider = false;
    this.loginError = '';
    this.loginData = { email: '', password: '' };
  }

  login() {
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: () => {
        this.closeLogin();
        this.showProfileDropdown = false;
        const role = this.authService.getUserRole();
        this.router.navigate([role === 'ADMIN' ? '/admin' : '/profile']);
      },
      error: (err) => {
        this.loginError = err.error.message || 'Login failed';
      }
    });
  }

  toggleProfileDropdown() {
    if (this.authService.isLoggedIn()) {
      this.showProfileDropdown = !this.showProfileDropdown;
    } else {
      this.showLogin();
    }
  }

  navigateToProfile() {
    this.showProfileDropdown = false;
    this.router.navigateByUrl('/profile');
  }

  navigateToDashboard() {
    this.showProfileDropdown = false;
    this.router.navigateByUrl('/admin');
  }

  logout() {
    this.authService.logout();
    this.showProfileDropdown = false;
    this.router.navigateByUrl('#home');
  }

  closeLoginOnOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showLoginSlider && !target.closest('.w-96.bg-white.shadow-xl')) {
      this.closeLogin();
    }
  }
}