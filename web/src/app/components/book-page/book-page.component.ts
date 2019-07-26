import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService, RoomStatus } from 'src/app/services/data/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { BookWindowComponent } from '../book-window/book-window.component';

@Component({
  selector: 'app-book-page',
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.scss']
})
export class BookPageComponent implements OnInit {

  //Todo: Get rid of all repeated code

  @ViewChild(BookWindowComponent, { static: false })
  private bookWindow: BookWindowComponent;

  status: RoomStatus;

  day: Date = new Date();

  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dataService: DataService,
    private router: Router,
    private usrIdle: UserIdleService) {

    this.matIconRegistry.addSvgIcon(
      "BackArrow",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/BackArrow.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "SaveTray",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/SaveTray.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "Cancel",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/Cancel.svg")
    );

    this.usrIdle.startWatching();
    this.usrIdle.onTimerStart().subscribe((count) => console.log(count));
    this.usrIdle.onTimeout().subscribe(() => {
      console.log('Page timeout. Redirecting to main...');
      this.routeToMain();
    });
  }

  ngOnInit() {
    this.status = this.dataService.getRoomStatus();
  }

  routeToMain(): void {
    this.usrIdle.stopWatching();
    this.router.navigate(['/']);
  }

  saveEventData(): void {
    let bookEvent = this.bookWindow.getEventData();
    if (bookEvent != null) {
      console.log(bookEvent.startTime.toString());
      console.log(bookEvent.endTime.toString());
      console.log(bookEvent.title);
      //Call data service - submit event
    } else {
      console.log("Null event");
      //Display alert? --- complete the form
    }
  }

}
