import { Component } from '@angular/core';

@Component({
  selector: 'app-alert',
  template: `
    <div *ngIf="message" class="alert alert-danger alert-dismissible fade show fixed-top mx-auto mt-4 w-50" role="alert">
      {{ message }}
      <button type="button" class="btn-close" (click)="message = null" aria-label="Close"></button>
    </div>
  `,
  styles: []
})
export class AlertComponent {
  message: string | null = null;

  // Placeholder for future alert service integration
  constructor() {}
}