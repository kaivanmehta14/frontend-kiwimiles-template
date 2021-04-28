import { Component, OnInit } from '@angular/core'; 
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ROWS_PER_PAGE_OPTIONS } from 'src/app/constants/pagination.constant';
import { RoleService } from 'src/app/services/roles.service';
@Component({
  selector: 'app-role-details',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.css']
})
export class RoleDetailsComponent implements OnInit {

  private roleId: number;
  private roleName: string;
  private selectAll: boolean = false;
  private isGrantAllPermissions: boolean = false;
  private scopes: {id: number, name: string, privileges: string, isGiven: boolean}[];
  private permittedScopes: {id: number, name: string, privileges: string, isGiven: boolean}[];
  private permittedScopesToDisplay: {id: number, name: string, privileges: string, isGiven: boolean}[];
  private error: string;
  private totalRecords: number;
  private numberOfRowsPerPageOptions: {rows: number}[] = ROWS_PER_PAGE_OPTIONS;
  private numberOfRowsPerPage: number = 5;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly roleService: RoleService,
    private readonly messageService: MessageService,
  ) {

    this.activatedRoute.params.subscribe((params:{roleId:string}) => {
      this.roleId = +params.roleId;
      this.roleService.getRoleDetails(this.roleId).subscribe((role: { name: string }) => {
        this.roleName = role.name;
      })
    })

   }

  async ngOnInit(): Promise<void> {
    await this.getScopes();
  }

  private async getScopes(): Promise<void> {
    const scopeInformationData: {scopes: {id: number, name: string, privileges: string}[], length: number} = 
      await this.roleService.getAllScopes()
      .toPromise()
      .catch(error => {
        this.showError("could not get scopes: " + error.statusText)
      });
    const scopeInformation = scopeInformationData.scopes;
    if (scopeInformation && scopeInformation.length > 0) {
      this.scopes = [];
      scopeInformation.forEach((scope) => {
        this.scopes.push({id: scope.id, name: scope.name, privileges: scope.privileges, isGiven: false});
      });
    }
    const allotedScopesData: {scopes: {id: number, name: string, privileges: string}[]
      , length: number} =
     await this.roleService.getRoleScopes(this.roleId).toPromise()
     .catch(error => {
      this.showError("could not get role scopes: " + error.statusText)
    });
    const allotedScopes = allotedScopesData.scopes;
    this.totalRecords = allotedScopesData.length;

    if(allotedScopes && allotedScopes.length > 0 ) {
      allotedScopes.forEach((allotedScope) => {
        const index: number = this.scopes.findIndex(scope => scope.id == allotedScope?.id);
        if(index > -1){
          this.scopes[index].isGiven = true;
        }
      }); 
    }
    this.permittedScopes = this.scopes.filter(scope => scope.isGiven);
  }

  private updateRoleScopes(): void {
    const scopes: {name: string}[] = this.scopes.map((scope) => {
      if(scope.isGiven) { return {name: scope.name}; }
    }).filter(value=> value);

    this.roleService.updateRoleScopes(this.roleId, scopes).subscribe(async ()=>{
      this.showSuccess("scopes updated!")
      await this.getScopes();
      this.permittedScopesToDisplay = this.permittedScopes.slice(0, this.numberOfRowsPerPage);
      this.selectAll = false;
    },
    error => {
      this.showError("scopes could not be updated: " + error.statusText)
    })
  }

  private selectAllPermissions() {
    if(this.isGrantAllPermissions) this.scopes.forEach(scope => scope.isGiven = true); 
    else this.scopes.forEach(scope => scope.isGiven = false);
  }

  private async loadScopes(tableElement){
    const skip: number = tableElement._first;
    const take: number = this.numberOfRowsPerPage;
    if(!this.permittedScopes) await this.getScopes();
    this.permittedScopesToDisplay = this.permittedScopes.slice(skip, skip + take);
  }

  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }
}
