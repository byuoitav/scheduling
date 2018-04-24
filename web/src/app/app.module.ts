import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule, ProgressBarModule, GrowlModule } from 'primeng/primeng';
import { MatInputModule, MatSelectModule } from '@angular/material';

import { AppComponent } from './app.component';
// import { AppState, InternalStateType } from './app.service';
// import { ValueService, AuthProvider } from './auth';
import { SimpleTimer } from 'ng2-simple-timer';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/*
type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};
*/

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MomentModule,
    HttpClientModule,
    HttpModule,

    NgbModule.forRoot(),
    InputTextModule,
    ProgressBarModule,
    GrowlModule,

    MatInputModule,
    MatSelectModule,
  ],
  providers: [
      SimpleTimer,
//      AuthProvider,
//      ValueService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){}
 }
