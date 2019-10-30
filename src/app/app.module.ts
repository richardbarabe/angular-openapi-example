import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { UserListComponent } from './users/userList.component';
import { ApiModule, Configuration } from 'user-api';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ApiModule.forRoot(() => {
      return new Configuration({
        basePath: `${environment.USER_API_BASEPATH}`,
      });
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
