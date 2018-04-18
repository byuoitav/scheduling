import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule, ProgressBarModule, GrowlModule } from 'primeng/primeng';
import { MatInputModule, MatSelectModule } from '@angular/material';
//import { MdKeyboardModule } from '@ngx-material-keyboard/core';

import { AppComponent } from './app.component';
import { AppState, InternalStateType } from './app.service';
import { ValueService, AuthProvider } from './auth';
import { SimpleTimer } from 'ng2-simple-timer';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//import { NgVirtualKeyboardModule } from '@protacon/ng-virtual-keyboard';

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

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
//    MdKeyboardModule,
  ],
  providers: [SimpleTimer,AuthProvider,ValueService,AppState],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){}
 }
