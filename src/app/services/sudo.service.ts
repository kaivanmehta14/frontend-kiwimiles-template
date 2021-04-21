import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { UpdateUserDTO, UserDTO } from '../dto/user.dto';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root'
})
export class SudoService extends BaseService {

    // users
    public getUsers(skip?: number, take?: number, where?: string, 
        dateRange?: {start: string, end: string}, orderBy?: string)
        : Observable<any> {
        var uri = `/users?`;
        if(!isNaN(skip) && !isNaN(take)){
            uri += `skip=${skip}&take=${take}&`; 
        }
        if(where) {
            uri += `where=${where}&`;
        }
        if(dateRange) {
            uri += `startDate=${dateRange.start}&endDate=${dateRange.end}&`;
        }
        if(orderBy) {
            uri += `orderBy=${orderBy}`;
        }
        if(uri[uri.length-1]=='&') uri = uri.slice(0,uri.length-1);
        uri = uri.trim();
        return this.http.get(this.API_URL + uri, this.getHttpOptions());
    }

    public updateUser(userId: number, updateUserObject: UpdateUserDTO): Observable<any> {

        return this.http.patch(this.API_URL + `/users/${userId}`, updateUserObject, this.getHttpOptions());
    }

    public deleteUser(userId: number): Observable<any> {

        return this.http.delete(this.API_URL + `/users/${userId}`, this.getHttpOptions());
    }

    public getUserProfile(userId: number): Observable<any> {

        return this.http.get(this.API_URL + `/users/${userId}`, this.getHttpOptions());
    }

    public getuserEmailId(userId: number): Observable<any> {

        return this.http.get(this.API_URL + `/users/${userId}/emails`, this.getHttpOptions());
    }

    //teams

    public getAllAvailableTeams(skip?: number, take?: number, where?: string,
         dateRange?: {start: string, end: string}, orderBy?: string): Observable<any> {

        var uri = `/groups?`;
        if(!isNaN(skip) && !isNaN(take)){
            uri += `skip=${skip}&take=${take}&`; 
        }
        if(where) {
            uri += `where=${where}&`;
        }
        if(dateRange) {
            uri += `startDate=${dateRange.start}&endDate=${dateRange.end}&`;
        }
        if(orderBy) {
            uri += `orderBy=${orderBy}`;
        }
        if(uri[uri.length-1]=='&') uri = uri.slice(0,uri.length-1);
        uri = uri.trim();
        return this.http.get(this.API_URL + uri, this.getHttpOptions());
    }

    public getAllParentTeams(): Observable<object> {
       var uri = `/groups/parents`;
       return this.http.get(this.API_URL + uri, this.getHttpOptions());
    }

    private getHttpOptions(): { headers: HttpHeaders } {
        
        const token: string = localStorage.getItem('token');
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
                .set('authorization', 'Bearer ' + token)
        };
        return httpOptions;
    }

}
