import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const userRole = this.authService.getUserRole();

    // Check if user is logged in
    if (!isLoggedIn) {
      this.router.navigate(['#home']);
      return false;
    }

    // Block logged-in non-admin users from accessing /register
    if (route.routeConfig?.path === 'register' && userRole !== 'ADMIN') {
      this.router.navigate(['/profile']);
      return false;
    }

    // Check role-based access for protected routes
    const requiredRole = route.data['role'];
    if (requiredRole && userRole !== requiredRole) {
      this.router.navigate(['/profile']); // Redirect non-admins to /profile
      return false;
    }

    return true;
  }
}