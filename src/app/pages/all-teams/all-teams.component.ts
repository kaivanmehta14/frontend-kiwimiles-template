import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { GenericEntityComponent, GET_CONFIGURATION_DTO } from 'src/app/generics/generic-entity';
import { DateFormatting } from 'src/app/helpers/date-formatting';
import { SudoService } from 'src/app/services/sudo.service';
import { DropdownDTO } from '../../dto/dropdown.dto';
import { GroupDTO } from '../../dto/group.dto';
import { AuthenticationService } from '../../services';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-all-teams',
  templateUrl: './all-teams.component.html',
  styleUrls: ['./all-teams.component.css']
})
export class AllTeamsComponent extends GenericEntityComponent implements OnInit {

  /* component specific variables */
  private teams: GroupDTO[];
  private userRoles: DropdownDTO[];
  private genders: DropdownDTO[];
  private parentTeamOptions: DropdownDTO[];
  private selectedParent: DropdownDTO = {name: "None", code: null};
  private createTeamName: string;

  /* server side filtering variables */
  private where: string = null;
  private whereName: string = null;
  private whereParent: string = null;
  private nameFilterInput: string;
  private parentTeamFilterOptions: DropdownDTO[];
  private selectedParentFilter: string = 'All'

  /* configurations */
  private pageConfigs: GET_CONFIGURATION_DTO = {
    isLazy : false
  };

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly teamService: TeamService,
    private readonly sudoService: SudoService,
    private readonly router: Router,
    protected messageService: MessageService
  ) {
    super(messageService);
  }

  async ngOnInit() {
    await this.getAllParents();
    if(!this.pageConfigs.isLazy){
      await this.getAllTeams();
    }
  }

  /**
   * CRUD operations
   */

  private createTeam(): void {
    if (!this.createTeamName) { 
      this.error = "Team name is required";
      return;
    }
    this.error = null;
    const parentId: number = this.selectedParent.code ? +this.selectedParent.code : null;
    this.teamService.createTeam(this.createTeamName, parentId).subscribe(async () => {
      this.showSuccess("Team created successfully!");
      if (this.pageConfigs.isLazy) {
        await this.loadTeams(null);
        await this.getAllParents();
      }
      else {
        await this.getAllTeams(); 
      }
      this.selectedParent.code = null;
    },
    error => {
      this.showError("Team could not be created: "+ error.statusText);
    });
    this.authenticationService.refreshAccessToken().subscribe();
  }
  
  private async getAllTeams(): Promise<void> {
    const teamInformationData: {groups: any[], length: number} =
      await this.sudoService
      .getAllAvailableTeams(this.skip, this.take, this.where, this.dateRange, this.orderBy)
      .toPromise();
    this.teams = [];
    this.parentTeamOptions = [{name: "None", code: null}];
    const teamInformation = teamInformationData.groups;
    this.totalRecords = teamInformationData.length;
    if (teamInformation && teamInformation.length > 0) {
      teamInformation.forEach((team) => {
        const membershipObject: GroupDTO = {
          id: team.id,
          name: team.name,
          parentTeam: team.parent?.name ?? null,
          groupPictureUrl: team.groupPictureUrl,
          createdOn: DateFormatting.utcDateToString(team.createdAt),
          displayTime: DateFormatting.getLocalDateTime12H(team.createdAt),
          isDefault: team.isDefault
        }
        this.teams.push(membershipObject);
        this.parentTeamOptions.push({name: team.name, code: (team.id).toString()})
      })
    }
    if(!this.pageConfigs.isLazy){
      this.teams = this.preSort(this.teams, [
        {field: "createdOn", order: "DESC"},
        {field: "isDefault", order: "DESC"},
      ]);
    }
  }

  private editTeam(teamId: number): void {
    const index: number = this.teams.findIndex(team => team.id == teamId);
    this.teams[index].updatable = true;
  }

  private updateTeam(team: GroupDTO): void {
    this.teamService.updateTeam(team.id, team.name).subscribe(async () => {
      this.showSuccess("Team updated successfully!");
      if (this.pageConfigs.isLazy) {
        await this.loadTeams(null);
      }
      else {
        await this.getAllTeams(); 
      }
    },
    error => {
      this.showError("Team could not be updated: " + error.statusText);
    });
  }

  private closeEditTeam(teamId: number): void {
    const index: number = this.teams.findIndex(team => team.id == teamId);
    this.teams[index].updatable = false;
    this.getAllTeams();
  }

  private teamDetails(teamId: number): void {
    this.router.navigate([`/admin/teams/SUDO/${teamId}`]);
  }
  
  private teamRoleDetails(teamId: number): void {
    this.router.navigate([`/admin/team-roles/${teamId}`]);
  }

  private deleteTeam(teamId: number): void {
    this.teamService.deleteTeam(teamId).subscribe(async () => {
      this.showSuccess("Team deleted successfully!");
      if(this.pageConfigs.isLazy) {
        await this.loadTeams(null);
        await this.getAllParents();
      }
      else {
        await this.getAllTeams(); 
      }
    },
    error => {
      this.showError("Team could not be deleted: " + error.statusText);
    });
  }


  /**
   * server side pagination
   */

  private async loadTeams(tableElement) {
    this.setPagination(tableElement);
    await this.getAllTeams();
  }

  /**
   * server side filtering
   */

  private async applyNameFilter() {
    if(this.nameFilterInput && this.nameFilterInput.length>0) {
      this.whereName = `name:contains ${this.nameFilterInput}`;
    }
    else {
      this.whereName = null;
    }
    this.getWhereQuery();
    await this.loadTeams(null);
  }

  private async getAllParents(): Promise<void> {
    const ParentInformationData: any = await this.sudoService.getAllParentTeams().toPromise();
    this.parentTeamFilterOptions = [{name: "All", code: null}];
    if(ParentInformationData && ParentInformationData.length > 0){
      ParentInformationData.forEach(parent => {
        this.parentTeamFilterOptions.push({name: parent.name, code: parent.id});
      })
    }
  }

  private async applyParentFilter() {
    if(this.selectedParentFilter){
      this.whereParent = `parentId: int(+${this.selectedParentFilter})`
    }
    else{
      this.whereParent = null;
    }
    this.getWhereQuery();
    await this.loadTeams(null);
  }

  private async applyDateFilter() {
    if(this.startDateFilterInput && this.endDateFilterInput) {
      this.displayCalendar = false;
      this.dateRange = {
        start : this.startDateFilterInput + ':00.000Z',
        end : this.endDateFilterInput + ':00.000Z',
      }
    }
    else {
      this.dateRange = null;
    }
    await this.loadTeams(null);
  }

  private async removeDateFilter() {
    this.startDateFilterInput = null;
    this.endDateFilterInput = DateFormatting.dateStringToUTC(new Date());
    this.displayCalendar = false;
    this.dateRange = null;
    await this.loadTeams(null);
  }

  private async removeAllFilters() {
    this.nameFilterInput = null;
    this.selectedParentFilter = 'All';
    this.whereName = null;
    this.whereParent = null;
    this.where = null;
    this.removeDateFilter();
    await this.loadTeams(null);
  }

  private getWhereQuery(){
    this.where = 
      (this.whereName ? this.whereName + ',': '') + (this.whereParent ? this.whereParent: '');
  }


  /**
   * server side sorting
   */

  private async applyServerSideSorting(fieldName: string) {
    this.orderBy = `${fieldName}:${this.order}`;
    this.order = this.order == 'asc' ? 'desc' : 'asc';
    await this.loadTeams(null);
  }
    
}

