import { Component, OnInit } from '@angular/core';
import { UserDTO } from '../../dto/user.dto';
import { ActivatedRoute } from '@angular/router';
import { SudoService } from 'src/app/services/sudo.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-peek-user',
  templateUrl: './peek-user.component.html',
  styleUrls: ['./peek-user.component.scss']
})
export class PeekUserComponent implements OnInit {

  userId: number;
  user: UserDTO;

  constructor(
    private readonly sudoService: SudoService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly messageService: MessageService
  ) {
    this.activatedRoute.params.subscribe((data: { userId: number }) => {
      this.userId = data.userId;
    })
  }

  async ngOnInit() {
    await this.getUserProfile();
    await this.getUserEmailId();
  }

  async getUserEmailId() {
    if (this.userId) {
      const emailData: { email: string }[] = await this.sudoService.getuserEmailId(this.userId).toPromise();
      if (emailData.length > 0) {
        this.user.email = emailData[0].email;
      }
      else {
        this.showError('No emails found');
      }
    }
    else {
      this.showError('user id not found');
    }
  }

  async getUserProfile() {
    const userDetails = await this.sudoService.getUserProfile(this.userId).toPromise();
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
  private showSuccess(message: string): void {
    this.messageService.add({severity:'success', summary: 'Success', detail: message});
  }

  private showError(message: string) {
    this.messageService.add({severity:'error', summary: 'Error', detail: message});
  }
}
