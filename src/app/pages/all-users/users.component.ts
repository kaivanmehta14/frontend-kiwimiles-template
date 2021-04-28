import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { USER_GENDERS, USER_GENDERS_FILTER_OPTIONS, USER_TYPES, USER_TYPE_FILTER_OPTIONS } from 'src/app/constants/user.constant';
import { GenericEntityComponent, GET_CONFIGURATION_DTO } from 'src/app/generics/generic-entity';
import { DateFormatting } from 'src/app/helpers/date-formatting';
import { SudoService } from 'src/app/services/sudo.service';
import { DropdownDTO } from '../../dto/dropdown.dto';
import { DisplayUserDTO, UpdateUserDTO } from '../../dto/user.dto';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent extends GenericEntityComponent implements OnInit {

  /* component specific variables */
  private users: DisplayUserDTO[];
  private userRoles: DropdownDTO[] =  USER_TYPES;
  private genders: DropdownDTO[] = USER_GENDERS;

  /* server side filtering variables */
  private where: string = null;
  private whereName: string = null;
  private whereGender: string = null;
  private whereType: string = null;
  private whereActive: string = null;
  private nameFilterInput: string;
  private genderFilterInputOptions: DropdownDTO[] = USER_GENDERS_FILTER_OPTIONS;
  private genderFilterInput: string = null;
  private typeFilterInputOptions: DropdownDTO[] = USER_TYPE_FILTER_OPTIONS;
  private typeFilterInput: string = null;
  private isOnlyActive: boolean = false;

  /* configurations */
  private pageConfigs: GET_CONFIGURATION_DTO = {
    isLazy : true
  };

  constructor(
    private readonly sudoService: SudoService,
    private readonly router: Router,
    protected messageService: MessageService
  ) {
    super(messageService);
  }

  async ngOnInit() {
    if(!this.pageConfigs.isLazy){
      await this.getAllUsers();
    }
  }

  private async getAllUsers(): Promise<void> {

    const UserInformationData: {users: any[], length: number} =
     await this.sudoService
     .getUsers(this.skip, this.take, this.where, this.dateRange, this.orderBy)
     .toPromise();
    this.users = [];
    const UserInformation = UserInformationData.users;
    this.totalRecords = UserInformationData.length;
    if (UserInformation && UserInformation.length > 0) {
      UserInformation.forEach((user) => {
        const userObject: DisplayUserDTO = {
          id: user.id,
          name: user.name,
          profilePictureUrl: user.profilePictureUrl,
          contactNo: user.twoFactorPhone,
          gender: user.gender,
          role: user.role,
          status: user.active == true ? 'Active' : 'Inactive',
          createdOn: DateFormatting.utcDateToString(user.createdAt),
          displayTime: DateFormatting.getLocalDateTime12H(user.createdAt),
          updatable: false
        }
        this.users.push(userObject);
      })
    }
    // this.users = this.sortUsers(this.users);
    if(!this.pageConfigs.isLazy){
      this.users = this.preSort(this.users, [
        {field: "createdOn", order: "DESC"},
      ]);
    }
  }

  private userDetails(userId: number): void {
    this.router.navigate([`/admin/users/${userId}`]);
  }

  private editUser(userId: number): void {
    const index: number = this.users.findIndex(user => user.id == userId);
    this.users[index].updatable = true;
  }

  private closeEditUser(userId: number): void {
    const index: number = this.users.findIndex(user => user.id == userId);
    this.users[index].updatable = false;
    this.getAllUsers();
  }

  private updateUser(user: DisplayUserDTO): void {
    const updateUserObject: UpdateUserDTO = {
      name: user.name,
      role: user.role,
      gender: user.gender
    }
    this.sudoService.updateUser(user.id, updateUserObject).subscribe(async () => {
      this.showSuccess("User successfully Updated!");
      if(this.pageConfigs.isLazy) {
        await this.loadUsers(null);
      }
      else {
        await this.getAllUsers(); 
      }
    },
    error => {
      this.showError("User Could not be Updated: " + error.statusText);
    });
  }

  private deleteUser(userId: number): void {
    this.sudoService.deleteUser(userId).subscribe(async () => {
      this.showSuccess("User successfully Deleted!");
      if(this.pageConfigs.isLazy) {
        await this.loadUsers(null);
      }
      else {
        await this.getAllUsers(); 
      }
    },
    error => {
      this.showError("User could not be Deleted!" + error.statusText);
    });
  }

  /**
   * server side pagination
   */

  private async loadUsers(tableElement) {
    this.setPagination(tableElement);
    await this.getAllUsers();
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
    await this.loadUsers(null);
  }

  private async applyGenderFilter(gender: string) {
    if(gender) {
      this.whereGender = `gender:equals ${gender}`;
    }
    else {
      this.whereGender = null;
    }
    this.getWhereQuery();
    await this.loadUsers(null);
  }

  private async applyTypeFilter(type: string) {
    if(type) {
      this.whereType = `role:equals ${type}`;
    }
    else {
      this.whereType = null;
    }
    this.getWhereQuery();
    await this.loadUsers(null);
  }

  private async applyStatusFilter() {
    if(this.isOnlyActive) this.whereActive = `active:boolean(${true})`;
    else this.whereActive = null;
    this.getWhereQuery();
    await this.loadUsers(null);
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
    await this.loadUsers(null);
  }

  private async removeDateFilter() {
    this.startDateFilterInput = null;
    this.endDateFilterInput = DateFormatting.dateStringToUTC(new Date());
    this.displayCalendar = false;
    this.dateRange = null;
    await this.loadUsers(null);
  }

  private async removeAllFilters() {
    this.nameFilterInput = null;
    this.typeFilterInput = null;
    this.genderFilterInput = null;
    this.whereName = null;
    this.whereGender = null;
    this.whereType = null;
    this.where = null;
    this.removeDateFilter();
    await this.loadUsers(null);
  }
  
  private getWhereQuery(){
    this.where = 
      (this.whereName ? this.whereName + ',': '') +
      (this.whereGender ? this.whereGender + ',':'') +
      (this.whereActive ? this.whereActive + ',':'') +
      (this.whereType ? this.whereType:'');
  }


  /**
   * server side sorting
   */

   private async applyServerSideSorting(fieldName: string) {
    this.orderBy = `${fieldName}:${this.order}`;
    this.order = this.order == 'asc' ? 'desc' : 'asc';
    await this.loadUsers(null);
  }
}

