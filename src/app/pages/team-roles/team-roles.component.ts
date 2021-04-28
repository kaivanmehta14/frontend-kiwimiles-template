import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ROWS_PER_PAGE_OPTIONS } from 'src/app/constants/pagination.constant';
import { RoleDTO } from 'src/app/dto/role.dto';
import { UserService } from 'src/app/services';
import { RoleService } from 'src/app/services/roles.service';
import { PermissionService } from '../../services/permission.service';
import { TeamService } from '../../services/team.service';


@Component({
  selector: 'app-team-roles',
  templateUrl: './team-roles.component.html',
  styleUrls: ['./team-roles.component.css']
})
export class TeamRolesComponent implements OnInit {

  private userId: number;
  private teamId: number;
  private userRoleInTeam: string;
  private teamName: string;
  private createMemberName: string;
  private createMemberEmail: string;
  private createMemberRole: string;
  private memberIds: number[];
  private roles: RoleDTO[];
  private givenRoles: RoleDTO[];
  private givenRolesToDisplay: RoleDTO[];
  private selectAll:boolean = false;
  private isAllocateAllRoles: boolean = false;
  private error: string;
  private isDefaultTeam: boolean = false;
  private skip: number;
  private take: number;
  private totalRecords: number;
  private numberOfRowsPerPageOptions: {rows: number}[] = ROWS_PER_PAGE_OPTIONS;
  private numberOfRowsPerPage: number = 5;
  
  constructor(
    private readonly teamService: TeamService,
    private readonly roleService: RoleService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) {
    this.activatedRoute.params.subscribe((data: { teamId: number }) => {
      this.teamId = data.teamId
    });
   }

  async ngOnInit() {
    const user: {id: number} = await this.userService.getUserProfile().toPromise();
    this.userId = user.id;
    this.teamService.getTeamDetails(this.teamId).subscribe((team: { name: string, isDefault: boolean }) => {
      this.teamName = team.name;
      this.isDefaultTeam = team.isDefault;
    })
    this.getAllRoles();
  }

  private async getAllRoles(): Promise<void> {
    const roleInformationData: {roles: any[], length: number} = await this.roleService.getAllRoles()
    .toPromise()
    .catch(error => {
      this.showError("Could not find roles: " + error.statusText);
    });
    const roleInformation = roleInformationData.roles;
    if (roleInformation && roleInformation.length > 0) {
      this.roles = [];
      roleInformation.forEach((role) => {
        const roleObject: RoleDTO = { 
          id: role.id,
          name: role.name, 
          isUpdatable: true,
          isAllocated: false
        }
        this.roles.push(roleObject);
      });
      const allotedRolesData: {roles: any[], length: number} = 
        await this.roleService.getTeamRoles(this.teamId)
        .toPromise()
        .catch(error=>{
          this.showError("Could not find team roles: " + error.statusText);
        });
      const allotedRoles = allotedRolesData.roles;
      this.totalRecords = allotedRolesData.length;
      if(allotedRoles && allotedRoles.length > 0 ) {
        allotedRoles.forEach((allotedRole) => {
          const index: number = this.roles.findIndex(role => role.id == allotedRole?.id);
          if(index > -1){
            this.roles[index].isAllocated = true;
          }
        });
      } 
      this.givenRoles = this.roles.filter(role => role.isAllocated);
    } 
  }

  private updateTeamRoles(): void {
    const roles: {name: string}[] = this.roles.map((role) => {
      if(role.isAllocated) { return {name: role.name}; }
    }).filter(value=> value);

    this.roleService.updateTeamRoles(this.teamId, roles).subscribe(async ()=>{
      this.showSuccess("Roles updated!");
      await this.getAllRoles();
      this.givenRolesToDisplay = this.givenRoles.slice(0, this.numberOfRowsPerPage);
      this.selectAll = false;
    },
    error => {
      this.showError("Roles could not be updated: " + error.statusText);
    })
  }

  private getAllPermissions(roleId: number): void {
    this.router.navigate([`/admin/roles/${roleId}`])
  }

  private selectAllRoles() {
    if(this.isAllocateAllRoles) this.roles.forEach(role => role.isAllocated = true); 
    else this.roles.forEach(role => role.isAllocated = false);
  }

  private async loadTeamRoles(tableElement) {
    const skip = tableElement._first;
    const take = this.numberOfRowsPerPage;
    if(!this.givenRoles) await this.getAllRoles();
    this.givenRolesToDisplay = this.givenRoles.slice(skip, skip + take);
  }

  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }
}
