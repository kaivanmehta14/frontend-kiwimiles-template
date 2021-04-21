import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {

  public getAllRoles(skip?: number, take?: number, where?: string, orderBy?: string): Observable<any> {
    var uri = this.API_URL + `/roles?`;
    if(!isNaN(skip) && !isNaN(take)) {
      uri += `skip=${skip}&take=${take}&`;
    }
    if(where) {
      uri += `where=${where}&`;
    }
    if(orderBy) {
        uri += `orderBy=${orderBy}`;
    }
    console.log(uri);
    if(uri[uri.length-1]=='&') uri = uri.slice(0,uri.length-1);
    uri = uri.trim();
    return this.http.get(uri, this.getHttpOptions());
  }

  public getRoleDetails(roleId:number): Observable<any> {

    return this.http.get(this.API_URL + `/roles/${roleId}`, this.getHttpOptions());
  }

  public addRole(newRole: {name: string}): Observable<any> {

    return this.http.post(this.API_URL + `/roles/`, newRole, this.getHttpOptions());
  }

  public getTeamRoles(teamId: number): Observable<any> {
    
    return this.http.get(this.API_URL + `/roles/group/${teamId}`, this.getHttpOptions());
  }

  public updateTeamRoles(teamId: number, roles: {name: string}[]): Observable<any> {

    return this.http.put(this.API_URL + `/roles/group/${teamId}`, roles ,this.getHttpOptions());
  }

  public getRoleScopes(roleId:number, skip?: number, take?:number): Observable<any> {

    if(isNaN(skip) || isNaN(take)) {
      return this.http.get(this.API_URL + `/roles/${roleId}/scopes`, this.getHttpOptions());
    }
    return this.http.get(this.API_URL + `/roles/${roleId}/scopes?skip=${skip}&take=${take}`,
     this.getHttpOptions());
  }

  public updateRoleScopes(roleId: number, scopes: {name: string}[]): Observable<any> {

    return this.http.put(this.API_URL + `/roles/${roleId}`, scopes ,this.getHttpOptions());
  }

  public getAllScopes(): Observable<any> {
    
    return this.http.get(this.API_URL + `/scopes/`, this.getHttpOptions());
  }

  public deleteRole(roleId: number): Observable<any> {

    return this.http.delete(this.API_URL + `/roles/${roleId}`, this.getHttpOptions());
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    const token: string = localStorage.getItem('token');
    if (!token) {
      history.go(0);
    }
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        .set('authorization', 'Bearer ' + token)
    };
    return httpOptions;
  }

}
