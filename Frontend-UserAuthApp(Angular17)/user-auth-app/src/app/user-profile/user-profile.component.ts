import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../auth.service';

interface User {
  email: string;
  username: string;
  phone: string;
  age: number;
  role: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  error: string | null = null;
  @Output() close = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.fetchUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        this.error = 'Failed to fetch user data';
        console.error('Error fetching user:', err);
        this.authService.logout();
        this.close.emit();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.close.emit();
  }
}