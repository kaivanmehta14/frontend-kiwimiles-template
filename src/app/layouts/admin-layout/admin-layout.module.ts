import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table'
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { AuthLayoutModule } from '../auth-layout/auth-layout.module';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DropdownModule } from 'primeng/dropdown';
import {ToastModule} from 'primeng/toast';
import { TeamsComponent } from '../../pages/teams/teams.component';
import { TeamDetailsComponent } from '../../pages/team-details/team-details.component';
import { BadgeModule } from 'primeng/badge';
import {TooltipModule} from 'primeng/tooltip';
import { InviteDialogComponent } from '../../components/invite-dialog/invite-dialog.component';
import { UsersComponent } from '../../pages/all-users/users.component';
import { PeekUserComponent } from '../../pages/peek-user/peek-user.component';
import { AllTeamsComponent } from '../../pages/all-teams/all-teams.component';
import { TeamRolesComponent } from 'src/app/pages/team-roles/team-roles.component';
import { RoleDetailsComponent } from 'src/app/pages/role-details/role-details.component';
import { AllRolesComponent } from 'src/app/pages/all-roles/all-roles.component';
import { CalendarModule } from 'primeng/calendar';
import { AdminSettingsComponent } from 'src/app/pages/admin-settings/admin-settings.component';
import { MessageService } from 'primeng/api';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    AuthLayoutModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    CheckboxModule,
    DropdownModule,
    TableModule,
    BadgeModule,
    TooltipModule,
    CalendarModule,
    ToastModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TablesComponent,
    IconsComponent,
    AllTeamsComponent,
    TeamsComponent,
    TeamDetailsComponent,
    InviteDialogComponent,
    UsersComponent,
    PeekUserComponent,
    TeamRolesComponent,
    RoleDetailsComponent,
    AllRolesComponent,
    AdminSettingsComponent
  ],
  providers:[MessageService]
})

export class AdminLayoutModule {}
