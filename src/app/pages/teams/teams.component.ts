import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MembershipDTO } from '../../dto/membership.dto';
import { AuthenticationService, UserService } from '../../services';
import { PermissionService } from '../../services/permission.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {

  private userName: string;
  private hasReadPermission: boolean = false;
  private hasWritePermission: boolean = false;
  memberships: MembershipDTO[];
  createTeamName: string;
  error: string;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UserService,
    private readonly teamService: TeamService,
    private readonly permissionService: PermissionService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) {
    this.userService.getUserProfile().subscribe((user) => {
      this.userName = user.name;
    },
      (error) => {
        this.showError("Fail to get user profile: " + error.statusText);
      }
    );
  }

  ngOnInit() {
    this.checkPermission();
    this.getAllMemberships();
  }

  private hasPermission(role: string, operation: string): boolean {
    return this.permissionService.hasPermission(role, operation);
  }

  private createTeam(): void {
    if (!this.createTeamName) {
      this.error = "Team name is required";
      return;
    }
    this.error = null;
    this.teamService.createTeam(this.createTeamName).subscribe((teamDetails) => {
      this.showSuccess("team created");
      this.getAllMemberships();
    },
    error =>{
      this.showError("team could not be created: " + error.statusText);
    });
    this.authenticationService.refreshAccessToken().subscribe((data) => {
      history.go(0);
    });
  }

  private editTeam(teamId: number): void {
    const index: number = this.memberships.findIndex(membership => membership.group.id == teamId);
    this.memberships[index].group.updatable = true;
  }

  private updateTeam(teamId: number): void {
    const index: number = this.memberships.findIndex(membership => membership.group.id == teamId);
    this.teamService.updateTeam(teamId, this.memberships[index].group.name).subscribe(() => {
      this.showSuccess("team updated");
      this.getAllMemberships();
    },
    error =>{
      this.showError("team could not be updated: " + error.statusText);
    });
  }

  private closeEditTeam(teamId: number): void {
    const index: number = this.memberships.findIndex(membership => membership.group.id == teamId);
    this.memberships[index].group.updatable = false;
    this.getAllMemberships();
  }

  private getAllMemberships(): void {
    if(this.hasReadPermission) {
      this.teamService.getAllMemberships().subscribe((membershipInformation: any[]) => {
        this.memberships = [];
        if (membershipInformation && membershipInformation.length > 0) {
          membershipInformation.forEach((membership) => {
            const membershipObject: MembershipDTO = {
              group: {
                id: membership?.group?.id,
                name: membership?.group?.name,
                groupPictureUrl: membership?.group?.profilePictureUrl
              },
              role: membership.role ?? null,
              since: this.dateToString(membership.createdAt)
            }
            this.memberships.push(membershipObject);
          })
        }
      })
    }
  }

  private teamDetails(teamId: number, role: string): void {
    this.router.navigate([`/admin/teams/${role}/${teamId}`]);
  }

  private deleteTeam(teamId: number): void {
    this.teamService.deleteTeam(teamId).subscribe((teamDetails) => {
      this.showSuccess("team deleted");
      this.getAllMemberships();
    },
    error =>{
      this.showError("team could not be deleted: " + error.statusText);
    });
  }

  private dateToString(dateObj: string): string {
    var dateString: string;
    var date: string = dateObj.split('T')[0];
    var time: string = dateObj.split('T')[1];
    time = time.split('.')[0];
    dateString = date + '  ' + time + '  UTC'
    return dateString;
  }

  private checkPermission(): void {
    this.hasReadPermission = this.permissionService.checkPermission("Read groups");
  }

  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }
}

