import { Component, OnInit } from '@angular/core';
import { DropdownDTO } from 'src/app/dto/dropdown.dto';
import { SettingsDTO,  UpdatedSettingsDTO } from 'src/app/dto/settings.dto';
import { SettingsService } from 'src/app/services/administration-settings.service';
import { Sorting } from 'src/app/helpers/sorting';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css'],
})
export class AdminSettingsComponent implements OnInit {

  private settings: SettingsDTO[];
  private options: DropdownDTO[];
  private updatedSettings: UpdatedSettingsDTO[] = [];
  constructor(
    private readonly settingsService: SettingsService,
    private readonly messageService: MessageService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getSettings();
  }

  async getSettings(): Promise<void>{
    const settingsData:{name: string, time: string}[] = await this.settingsService.getAutomatedTasks().toPromise();
    const optionsData: string[] = await this.settingsService.getAvailableTimingOpions().toPromise();
    if(settingsData){
      this.settings = [];
      settingsData.forEach(setting => {
        const dto: SettingsDTO = {
          name: setting.name,
          scheduledTime: setting.time,
          displayTime: setting.time.replace(/_/g, ' '),
        }
        this.settings.push(dto);
      })
    }
    if(optionsData){
      this.options = [];
      optionsData.forEach(value => {
        const dto: DropdownDTO = {
          name: value.replace(/_/g, ' '),
          code: value
        }
        this.options.push(dto)
      })
    }
    this.settings = Sorting.dataSorting(this.settings, [{field: 'name', order: 'ASC'}] );
  }

  changedSettings(name) {
    const findElement: UpdatedSettingsDTO = this.updatedSettings.find(updatedSetting => updatedSetting.taskName == name);
    if(findElement) {
      findElement.timing = this.settings.find(setting => setting.name == name).scheduledTime
    }
    else {
      this.updatedSettings.push({
        taskName: name,
        timing: this.settings.find(setting => setting.name == name).scheduledTime
      })
    }
  }

  async update(): Promise<void>{
    if(this.updatedSettings && this.updatedSettings.length>0){
      await this.settingsService.updateTimingOpions(this.updatedSettings)
      .toPromise()
      .then(async () => {
        await this.getSettings();
        this.updatedSettings = [];
        this.showSuccess('Settings Updated Successfully');
      })
      .catch(error => {
        this.showError("Could not update settings: " + error.statusText);
      });
    }
    else{
      this.showInfo("Nothing to update");
    }
  }

  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }

  private showInfo(message: string) {
    this.messageService.add({severity:'info', summary: 'Info', detail: message});
  }
}
