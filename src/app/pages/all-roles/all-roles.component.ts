import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RoleDTO } from 'src/app/dto/role.dto';
import { GenericEntityComponent, GET_CONFIGURATION_DTO } from 'src/app/generics/generic-entity';
import { RoleService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-all-roles',
  templateUrl: './all-roles.component.html',
  styleUrls: ['./all-roles.component.css'],
})
export class AllRolesComponent extends GenericEntityComponent implements OnInit {

  /* component specific variables */
  private createRoleName: string;
  private roles: RoleDTO[];

  /* server side filtering variables */
  private where: string = null;
  private nameFilterInput: string;

  /* configurations */
  private pageConfigs: GET_CONFIGURATION_DTO = {
    isLazy : true
  };

  constructor(
    private readonly roleService: RoleService,
    private readonly router: Router,
    protected messageService: MessageService
  ) {
    super(messageService);
   }

  async ngOnInit(): Promise<void> {
    if(!this.pageConfigs.isLazy){
      await this.getAllRoles();
    }
  }

  private addRole(): void {
    if (!this.createRoleName) {
      this.error = "Role name is required";
      return;
    }
    this.error = null;
    this.roleService.addRole({name: this.createRoleName}).subscribe(async ()=>{
      this.showSuccess("Role added successfully!")
      if (this.pageConfigs.isLazy) {
        await this.loadRoles(null);
      }
      else {
        await this.getAllRoles(); 
      }
      this.getAllRoles();
    },
    error => {
      this.showError("Could not add role: "+ error.statusText);
    });
  }

  private async getAllRoles(): Promise<void> {
    const roleData: {roles: any[], length: number} =
     await this.roleService
     .getAllRoles(this.skip, this.take, this.where, this.orderBy)
     .toPromise();
    this.roles = [];
    const roleInformation = roleData.roles;
    this.totalRecords = roleData.length;
    if (roleInformation && roleInformation.length > 0) {
      roleInformation.forEach((role) => {
        const roleObject: RoleDTO = { 
          id: role.id,
          name: role.name, 
          isUpdatable: true,
          isAllocated: false,
          isDefault: role.isDefault,
          createdAt: role.createdAt
        }
        this.roles.push(roleObject);
      });
      if(!this.pageConfigs.isLazy){
        this.roles = this.preSort(this.roles, [
          {field: "createdAt", order: "DESC"},
          {field: "isDefault", order: "DESC"},
        ]);
      }
    } 
  }

  private getAllPermissions(roleId: number): void {
    this.router.navigate([`/admin/roles/${roleId}`])
  }

  private deleteRole(roleId: number): void {
    this.roleService.deleteRole(roleId).subscribe(async ()=>{
      this.showSuccess("Role deleted!")
      if(this.pageConfigs.isLazy) {
        await this.loadRoles(null);
      }
      else {
        await this.getAllRoles(); 
      }
      this.getAllRoles();
    },
    error => {
      this.showError("Could not delete role: "+ error.statusText);
    });
  }

  /**
   * server side pagination
   */

  private async loadRoles(tableElement){
    this.setPagination(tableElement);
    await this.getAllRoles();
  }

  /**
   * server side filtering
   */

   private async applyFilter() {
    if(this.nameFilterInput && this.nameFilterInput.length>0) {
      this.where = `name:contains ${this.nameFilterInput}`;
    }
    else {
      this.where = null;
    }
    await this.loadRoles(null);
  }

  /**
   * server side sorting
   */

  private async applyServerSideSorting(fieldName: string) {
    this.orderBy = `${fieldName}:${this.order}`;
    this.order = this.order == 'asc' ? 'desc' : 'asc';
    await this.loadRoles(null);
  }

}
