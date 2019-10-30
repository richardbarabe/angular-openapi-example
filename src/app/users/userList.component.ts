import { Component, OnInit, Input } from '@angular/core';
import { User, UserService } from 'user-api';

@Component({
  selector: 'user-list',
  templateUrl: './userList.component.html',
  styleUrls: ['./userList.component.css']
})
export class UserListComponent implements OnInit {
  private users: User[]=[];
  private basePath:string;
  private apiAccessError:boolean = false;
  private serverError:Error;
  
  constructor(private userService:UserService) {}

  ngOnInit(): void {
    this.basePath=this.userService.configuration.basePath;
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.userService.getusers().toPromise()
    .then((users) => {
      alert('users fetched successfully');
      this.users = users;
    })
    .catch((error) => {
      console.log('Failed to call user API', error);
      this.serverError = error;
      this.apiAccessError= true;
      this.userService.configuration.basePath
    })
  }

}
