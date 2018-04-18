import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'; // <-- NgModel lives here
import { MomentModule } from 'angular2-moment';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule, ProgressBarModule, GrowlModule } from 'primeng/primeng';
import { MdInputModule } from '@angular/material';
import { MdKeyboardModule } from '@ngx-material-keyboard/core';

import { AppComponent } from './app.component';
import { AppState, InternalStateType } from './app.service';
import { ValueService, AuthProvider } from './auth';
import { SimpleTimer } from 'ng2-simple-timer';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
//import { HelpModal } from './helpModal';

//import { NgVirtualKeyboardModule } from '@protacon/ng-virtual-keyboard';

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

@NgModule({
  declarations: [
    AppComponent
    //HelpModal
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

    MdInputModule,
    MdKeyboardModule,
    //NgVirtualKeyboardModule
  ],
  providers: [SimpleTimer,AuthProvider,ValueService,AppState],
  bootstrap: [AppComponent]
})
export class AppModule {
/*  constructor(public appRef: ApplicationRef, public appState: AppState) { }


  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }*/
  constructor(){}
 }
