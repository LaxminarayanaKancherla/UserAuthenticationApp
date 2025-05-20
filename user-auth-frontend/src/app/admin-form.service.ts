import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminFormService {
  private formStateSubject = new BehaviorSubject<string | null>(null);
  formState$ = this.formStateSubject.asObservable();

  showAddRoleForm(): void {
    this.formStateSubject.next('addRole');
  }

  showAddUserForm(): void {
    this.formStateSubject.next('addUser');
  }

  hideForm(): void {
    this.formStateSubject.next(null);
  }
}