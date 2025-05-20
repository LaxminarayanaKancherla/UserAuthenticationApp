import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User = { email: '', username: '', phone: '', age: 0, role: '' };
  selectedFile: File | null = null;
  showEditForm = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.user = {
          ...user,
          image: user.image || '/assets/images/default-profile.jpg'
        };
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to fetch profile', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadImage();
    }
  }

  uploadImage(): void {
    if (this.selectedFile && this.user.email) {
      this.authService.uploadImage(this.user.email, this.selectedFile).subscribe({
        next: () => {
          this.snackBar.open('Image uploaded successfully', 'Close', { duration: 3000 });
          this.selectedFile = null;
          // Refresh user profile to update image
          this.authService.getUserProfile().subscribe({
            next: (user) => {
              this.user = {
                ...user,
                image: user.image || '/assets/images/default-profile.jpg'
              };
            }
          });
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to upload image', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateProfile(): void {
    this.authService.updateUser(this.user.email, this.user, null).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.showEditForm = false; // Return to card view after update
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to update profile', 'Close', { duration: 3000 });
      }
    });
  }

  toggleEditForm(): void {
    this.showEditForm = !this.showEditForm;
  }

  goBack(): void {
    this.router.navigate(['/welcome']);
  }
}