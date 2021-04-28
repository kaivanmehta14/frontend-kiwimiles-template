import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpdatedSettingsDTO } from '../dto/settings.dto';
import { BaseService } from './base.service';

@Injectable({
    providedIn: 'root'
})
export class SettingsService extends BaseService {

    // tasks settings
    public getAutomatedTasks()
        : Observable<any> {
        var uri = `/tasks`;
        return this.http.get(this.API_URL + uri, this.getHttpOptions());
    }

    public getAvailableTimingOpions()
        : Observable<any> {
        var uri = `/tasks/timing-options`;
        return this.http.get(this.API_URL + uri, this.getHttpOptions());
    }

    public updateTimingOpions(updateTimingOpions: UpdatedSettingsDTO[])
        : Observable<any> {
        var uri = `/tasks`;
        return this.http.post(
            this.API_URL + uri, updateTimingOpions, this.getHttpOptions());
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
