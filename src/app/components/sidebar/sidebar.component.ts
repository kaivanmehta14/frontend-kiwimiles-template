import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/services/permission.service';
import { AuthenticationService, UserService } from '../../services';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const SUDO_ROUTES: RouteInfo[] = [
  //{ path: '/admin/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '' },
  { path: '/admin/users', title: 'All Users', icon: 'pi pi-users text-indigo font-weight-bold', class: '' },    
  { path: '/admin/all-teams', title: 'All Teams', icon: 'fa fa-users text-green', class: '' },
  { path: '/admin/all-roles', title: 'All Roles', icon: 'fa fa-tasks text-orange', class: '' },
  { path: '/admin/admin-settings', title: 'Settings', icon: 'fa fa-cog', class: '' },
];

export const ROUTES: RouteInfo[] = [
  { path: '/admin/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private permissionService: PermissionService
  ) { }

  async ngOnInit() {
    if(this.permissionService.checkPermission("Read user details")) {
      const userDetails = await this.userService.getUserProfile().toPromise();
      if (userDetails.role == 'SUDO') {
        this.menuItems = SUDO_ROUTES.filter(menuItem => menuItem);
        this.router.events.subscribe((event) => {
          this.isCollapsed = true;
        });
      }
      else if (userDetails.role == 'USER') {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
        this.router.events.subscribe((event) => {
          this.isCollapsed = true;
        });
      }
    }
    else {
      this.menuItems = ROUTES.filter(menuItem => menuItem);
      this.router.events.subscribe((event) => {
        this.isCollapsed = true;
      });
    } 
  }

  async logout() {
    await this.authenticationService.logout().toPromise();
    this.router.navigate(['/login']);
  }
}
