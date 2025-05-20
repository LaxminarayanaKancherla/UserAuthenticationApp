import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from './auth.service';
import { AdminFormService } from './admin-form.service';
import { User } from './user.model';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ]),
    trigger('dropdown', [
      state('open', style({ opacity: 1, transform: 'scaleY(1)' })),
      state('closed', style({ opacity: 0, transform: 'scaleY(0)', transformOrigin: 'top' })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ])
  ]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isLoggedIn = false;
  showDropdown = false;
  showAccountsDropdown = false;
  showLoginCard = false;
  showPrivilegesDropdown = false;
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private adminFormService: AdminFormService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showLoginCard = false;
        this.showDropdown = false;
        this.showAccountsDropdown = false;
        this.showPrivilegesDropdown = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.getUserProfile().subscribe({
          next: (user: User) => {
            this.currentUser = {
              ...user,
              image: user.image || '/assets/images/default-profile.jpg'
            };
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to fetch user profile:', err);
            this.currentUser = null;
            this.isLoggedIn = false;
            localStorage.removeItem('token');
            this.authService.isLoggedInSubject.next(false);
            this.snackBar.open('Session expired. Please log in again.', 'Close', { duration: 3000 });
            this.router.navigate(['/login']);
            this.cdr.detectChanges();
          }
        });
      } else {
        this.currentUser = null;
        this.cdr.detectChanges();
      }
    });
  }

  getDashboardRoute(): string {
    if (!this.currentUser || !this.currentUser.role) return '/login';
    const role = this.currentUser.role.toUpperCase();
    if (role === 'USER') return '/profile';
    if (role === 'ADMIN') return '/admin';
    if (role === 'ROLEMASTER') return '/rolemaster';
    return '/login';
  }

  toggleDropdown(): void {
    if (this.isLoggedIn) {
      this.showDropdown = !this.showDropdown;
      this.showAccountsDropdown = false;
      this.showLoginCard = false;
      this.showPrivilegesDropdown = false;
      this.cdr.detectChanges();
    } else {
      this.snackBar.open('Please log in to access profile options', 'Close', { duration: 3000 });
    }
  }

  toggleAccountsDropdown(): void {
    this.showAccountsDropdown = !this.showAccountsDropdown;
    this.showDropdown = false;
    this.showLoginCard = false;
    this.showPrivilegesDropdown = false;
    this.cdr.detectChanges();
  }

  togglePrivilegesDropdown(): void {
    this.showPrivilegesDropdown = !this.showPrivilegesDropdown;
    this.showDropdown = false;
    this.showAccountsDropdown = false;
    this.showLoginCard = false;
    this.cdr.detectChanges();
  }

  openAddRoleForm(): void {
    this.showPrivilegesDropdown = false;
    this.adminFormService.showAddRoleForm();
    this.router.navigate(['admin/add-role']);
    this.cdr.detectChanges();
  }

  openAddUserForm(): void {
    this.showPrivilegesDropdown = false;
    this.adminFormService.showAddUserForm();
    this.router.navigate(['admin/add-user']);
    this.cdr.detectChanges();
  }

  closeAccountsDropdown(): void {
    this.showAccountsDropdown = false;
    this.cdr.detectChanges();
  }

  openLoginCard(): void {
    this.showLoginCard = true;
    this.showAccountsDropdown = false;
    this.email = '';
    this.password = '';
    this.cdr.detectChanges();
  }

  closeLoginCard(): void {
    this.showLoginCard = false;
    this.cdr.detectChanges();
  }

  login(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.showLoginCard = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.snackBar.open(err.message || 'Login failed', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  navigateToDashboard(): void {
    this.router.navigate([this.getDashboardRoute()]);
    this.showDropdown = false;
    this.cdr.detectChanges();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.showDropdown = false;
    this.showAccountsDropdown = false;
    this.isLoggedIn = false;
    this.currentUser = null;
    this.cdr.detectChanges();
  }

  onLoginFocus(field: string): void {
    // No need to mark as touched for ngModel-based form
  }

  onLoginBlur(field: string): void {
    // Labels stay focused if field has value, handled by [ngClass]="{'focused': email}"
  }
}