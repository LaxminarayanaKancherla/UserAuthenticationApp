import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private isSignupButtonNavigation = new BehaviorSubject<boolean>(false);

  setSignupButtonNavigation(value: boolean) {
    this.isSignupButtonNavigation.next(value);
  }

  isSignupButtonNavigation$ = this.isSignupButtonNavigation.asObservable();
}
