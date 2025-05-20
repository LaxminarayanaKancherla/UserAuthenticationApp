import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { RoleResponse } from '../role.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.css']
})
export class AddRoleComponent implements OnInit {
  newRoleName: string = '';
  roles: RoleResponse[] = [];
  editRole: { oldName: string, newName: string } | null = null;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.authService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load roles';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  createRole(): void {
    if (!this.newRoleName.trim()) {
      this.errorMessage = 'Role name is required';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      return;
    }
    this.authService.createRole(this.newRoleName).subscribe({
      next: () => {
        this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
        this.newRoleName = '';
        this.errorMessage = '';
        this.loadRoles();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to create role';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  startEdit(role: RoleResponse): void {
    this.editRole = { oldName: role.name, newName: role.name };
  }

  updateRole(): void {
    if (!this.editRole || !this.editRole.newName.trim()) {
      this.errorMessage = 'New role name is required';
      this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      return;
    }
    this.authService.updateRole(this.editRole.oldName, this.editRole.newName).subscribe({
      next: () => {
        this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
        this.editRole = null;
        this.errorMessage = '';
        this.loadRoles();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to update role';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  cancelEdit(): void {
    this.editRole = null;
    this.errorMessage = '';
  }

  deleteRole(name: string): void {
    if (confirm(`Are you sure you want to delete the role "${name}"?`)) {
      this.authService.deleteRole(name).subscribe({
        next: () => {
          this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
          this.errorMessage = '';
          this.loadRoles();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to delete role';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}