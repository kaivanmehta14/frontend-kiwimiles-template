import { Routes } from '@angular/router';
import { AdminSettingsComponent } from 'src/app/pages/admin-settings/admin-settings.component';
import { AllRolesComponent } from 'src/app/pages/all-roles/all-roles.component';
import { RoleDetailsComponent } from 'src/app/pages/role-details/role-details.component';
import { TeamRolesComponent } from 'src/app/pages/team-roles/team-roles.component';
import { AllTeamsComponent } from '../../pages/all-teams/all-teams.component';
import { UsersComponent } from '../../pages/all-users/users.component';
import { ChangePasswordComponent } from '../../pages/changepassword/changepassword.component';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { PeekUserComponent } from '../../pages/peek-user/peek-user.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { TeamDetailsComponent } from '../../pages/team-details/team-details.component';
import { TeamsComponent } from '../../pages/teams/teams.component';
//import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';


export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'users', component: UsersComponent },
  { path: 'users/:userId', component: PeekUserComponent },
  { path: 'tables', component: TablesComponent },
  { path: 'icons', component: IconsComponent },
  { path: 'password-settings', component: ChangePasswordComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'teams/:role/:teamId', component: TeamDetailsComponent },
  { path: 'team-roles/:teamId', component: TeamRolesComponent },
  { path: 'roles/:roleId', component: RoleDetailsComponent },
  { path: 'all-teams', component: AllTeamsComponent },
  { path: 'all-roles', component: AllRolesComponent},
  { path: 'admin-settings', component: AdminSettingsComponent}
  
  //{ path: 'maps', component: MapsComponent }
];
