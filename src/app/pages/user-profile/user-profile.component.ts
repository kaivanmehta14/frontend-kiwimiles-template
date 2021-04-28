import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PermissionService } from 'src/app/services/permission.service';
import { UserDTO } from '../../dto/user.dto';
import { UserService } from '../../services';

interface GenderDTO {
  label: string,
  type: string
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  private user: UserDTO;
  private editable: boolean = false;
  private hasEmailReadPermission: boolean = false;
  private hasProfileWritePermission: boolean = false;
  private hasEmailWritePermission: boolean = false;
  private error: string;
  private genders: GenderDTO[] = [
    { label: 'Male', type: 'MALE' },
    { label: 'Female', type: 'FEMALE' },
    { label: 'Transgender', type: 'NON BINARY' },
    { label: 'Prefer Not to say', type: 'UNKNOWN' },
  ];

  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly messageService: MessageService
  ) { }

  async ngOnInit() {
    this.checkPermissions();
    await this.getUserProfile();
    await this.getUserEmailId();
  }

  private async getUserEmailId() {
    if(this.permissionService.checkPermission("Read user email")) {
      const emailData: { email: string }[] = await this.userService.getuserEmailId().toPromise();
      if (emailData.length > 0) {
        this.user.email = emailData[0].email;
      }
      else {
        this.showError("Email could not be found!");
      }
    }
    else {

    }
  }

  private async getUserProfile() {
    const userDetails = await this.userService.getUserProfile().toPromise();
    if (!userDetails) {
      this.showError('user details not found!');
    }
    else {
      this.user = {
        name: userDetails.name,
        email: null,
        profilePictureUrl: userDetails.profilePictureUrl,
        role: userDetails.role,
        gender: userDetails.gender,
        mfaMethod: userDetails.twoFactorMethod,
        contactNo: userDetails.twoFactorPhone,
        country: userDetails.countryCode,
        isDetectLocationOnLogin: userDetails.checkLocationOnLogin,
        isMFA: userDetails.twoFactorMethod == 'NONE' ? false : true,
        isNotifications: userDetails.notificationEmail == 'NONE' ? false : true,
        ispasswordLess: false
      }
    }
  }

  private async stopEditing() {
    await this.getUserProfile();
    await this.getUserEmailId();
    this.editable = false;
  }

  private updateUser() {
    this.userService.updateUserProfile(this.user).subscribe(
      () => {
        this.editable = false;
        this.showSuccess("Profile updated!");
      },
      error => {
        this.showError("Profile could not be updated: " + error.statusText);
      }
    )
  }

  private checkPermissions(){
    this.hasEmailReadPermission = this.permissionService.checkPermission("Read user email");
    this.hasProfileWritePermission = this.permissionService.checkPermission("Write user details");
  }

  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }
}
