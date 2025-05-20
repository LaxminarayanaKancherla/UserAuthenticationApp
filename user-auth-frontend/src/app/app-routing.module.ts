import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { RolemasterDashboardComponent } from './rolemaster-dashboard/rolemaster-dashboard.component';
import { AddRoleComponent } from './add-role/add-role.component';
import { AddUserComponent } from './add-user/add-user.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { WelcomeComponent } from './welcome/welcome.component';
const routes: Routes = [
  { path: '',component: HomeComponent, pathMatch: 'full' },
  {path:'welcome',component:WelcomeComponent,canActivate:[AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard], data: { role: ''} },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'admin/add-role', component: AddRoleComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'admin/add-user', component: AddUserComponent, canActivate: [AuthGuard], data: { role: 'ADMIN' } },
  { path: 'rolemaster', component: RolemasterDashboardComponent, canActivate: [AuthGuard], data: { role: 'ROLEMASTER' } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }