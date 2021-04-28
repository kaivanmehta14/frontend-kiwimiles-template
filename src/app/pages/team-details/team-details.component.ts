import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from 'src/app/services';
import { InviteDialogComponent } from '../../components/invite-dialog/invite-dialog.component';
import { DropdownDTO } from '../../dto/dropdown.dto';
import { MemberDTO } from '../../dto/member.dto';
import { PermissionService } from '../../services/permission.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.css'],
  providers: [DialogService]
})
export class TeamDetailsComponent implements OnInit {

  private userId: number;
  private teamId: number;
  private userRoleInTeam: string;
  private teamName: string;
  private createMemberName: string;
  private createMemberEmail: string;
  private createMemberRole: string;
  private memberIds: number[];
  private members: MemberDTO[];
  private roles: DropdownDTO[];
  private error: string;
  constructor(
    private dialogService: DialogService,
    private readonly teamService: TeamService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly permissionService: PermissionService,
    private readonly userService: UserService,
    private readonly messageService: MessageService
  ) {

    this.activatedRoute.params.subscribe((data: { teamId: number, role: string }) => {
      this.teamId = data.teamId;
      this.userRoleInTeam = data.role;
    });
  }

  async ngOnInit() {
    const user: {id: number} = await this.userService.getUserProfile().toPromise();
    this.userId = user.id;
    this.teamService.getTeamDetails(this.teamId).subscribe((team: { name: string }) => {
      this.teamName = team.name;
    },
    error => { 
      this.showError("could not load teams: " + error.statusText)
    })
    this.getAllMembers();
    this.setStaticRoles();
  }

  hasPermission(operation: string): boolean {
    return this.permissionService.hasPermission(this.userRoleInTeam, operation);
  }

  setStaticRoles() {
    this.roles = [
      {
        name: "Team owner",
        code: "OWNER"
      },
      {
        name: "Administrator",
        code: "ADMIN"
      },
      {
        name: "Member",
        code: "MEMBER"
      },

    ]
  }

  rolePrecedence(role1: string, role2: string): number {
    const type1: string = "OWNER";
    const type2: string = "ADMIN";
    const type3: string = "MEMBER";

    const case1: boolean = (role1 == type1) && (role2 == type2 || role2 == type3);
    const case2: boolean = (role1 == type2) && (role2 == type3);

    return ((role1 == role2) ? 0 : ((case1 || case2) ? 1 : -1));
  }

  addMember(): void {
    const ref = this.dialogService.open(InviteDialogComponent, {
      data: {
        teamId: this.teamId
      },
      header: 'Invite Member',
      width: '20%',
    });

    ref.onClose.subscribe(async (success: boolean) => {
      if(!success){
        this.showError("could not add member: ");
      }
      else {
        this.showSuccess("Member added successfully!");
      }
      this.getAllMembers();
    });
  }

  getAllMembers(): void {

    this.teamService.getAllMembers(this.teamId).subscribe((membersInformation: any[]) => {
      if (membersInformation && membersInformation.length > 0) {
        this.members = [];
        this.memberIds = [];
        membersInformation.forEach((membership) => {
          const member: any = membership.user;
          if (member) {
            if (this.memberIds.indexOf(member.id) < 0) {
              const memberObject: MemberDTO = {
                id: membership.id,
                userId: member.id,
                name: member.name,
                gender: member.gender,
                profilePictureUrl: member.profilePictureUrl,
                role: membership.role,
                since: this.dateToString(membership.createdAt),
                badgeEnabled: (member.id == this.userId),
                updatable: false
              }

              this.memberIds.push(member.id);
              this.members.push(memberObject);
            }
            else {
              const currentRole: string = this.members.find(mem => mem.userId == member.id).role;
              if (this.rolePrecedence(currentRole, membership.role) == -1) {
                const index: number = this.members.findIndex(mem => mem.userId == member.id);
                this.members[index].id = membership.id;
                this.members[index].role = membership.role;
                this.members[index].since = this.dateToString(membership.createdAt);
              }
            }
          }
        })

      }
    })
  }

  editMember(memberId: number): void {
    const index: number = this.members.findIndex(member => member.id == memberId);
    this.members[index].updatable = true;
  }

  updateMember(memberId: number): void {
    const index: number = this.members.findIndex(member => member.id == memberId);
    this.teamService.updateMember(this.teamId, memberId, this.members[index].role).subscribe((memberDetails) => {
      this.getAllMembers();
      this.showSuccess("Member updated!");
    },
    error => { 
      this.showError("Could not update member: " + error.statusText)
    });
  }

  closeEditMember(memberId: number): void {
    const index: number = this.members.findIndex(member => member.id == memberId);
    this.members[index].updatable = false;
    this.getAllMembers();
  }

  deleteMember(memberId: number): void {

    this.teamService.deleteMember(memberId, this.teamId)
      .subscribe(() => { 
        this.showSuccess("Member Deleted!");
        this.getAllMembers() ;
      },
      error => { 
        this.showError("Member could not be deleted: " + error.statusText);
      });
  }

  private goBack(){
    history.back();
  }

  private dateToString(dateObj: string): string {
    var dateString: string;
    var date: string = dateObj.split('T')[0];
    var time: string = dateObj.split('T')[1];
    time = time.split('.')[0];
    dateString = date + '  ' + time + '  UTC'
    return dateString;
  }

  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }
}

