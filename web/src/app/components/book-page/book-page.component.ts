import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { DataService, RoomStatus, ScheduledEvent } from 'src/app/services/data/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserIdleService } from 'angular-user-idle';
import { SelectTime, BookService } from 'src/app/services/book/book.service';
import { MatBottomSheet } from '@angular/material';
import { KeyboardSheetComponent } from '../keyboard-sheet/keyboard-sheet.component';

@Component({
  selector: 'app-book-page',
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.scss']
})
export class BookPageComponent implements OnInit {
  @ViewChild('eventTitle', { static: false }) inputTitle: ElementRef;
  @ViewChild('eventStart', { static: false }) inputStartTime: ElementRef;
  @ViewChild('eventEnd', { static: false }) inputEndTime: ElementRef;

  newBookingEvent: ScheduledEvent;
  timeIncrements: SelectTime[];

  status: RoomStatus;
  day: Date = new Date();
  eventTitleValue: string = "";

  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dataService: DataService,
    private router: Router,
    private usrIdle: UserIdleService,
    private bookService: BookService,
    private bottomSheet: MatBottomSheet) {

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
    this.usrIdle.onTimerStart().subscribe();
    this.usrIdle.onTimeout().subscribe(() => {
      console.log('Page timeout. Redirecting to main...');
      this.usrIdle.stopWatching();
      this.routeToMain();
    });
  }

  ngOnInit() {
    this.status = this.dataService.getRoomStatus();
    this.newBookingEvent = new ScheduledEvent();
    this.timeIncrements = this.bookService.getTimeIncrements();
  }

  showKeyboard(): void {
    this.inputTitle.nativeElement.blur();
    this.bottomSheet.open(KeyboardSheetComponent).afterDismissed().subscribe((result) => { this.eventTitleValue = result as string; });
  }

  routeToMain(): void {
    this.router.navigate(['/']);
  }

  saveEventData(): void {
    let bookEvent = this.getEventData();
    if (bookEvent != null) {
      console.log(bookEvent.startTime.toString());
      console.log(bookEvent.endTime.toString());
      console.log(bookEvent.title);
      //Call data service - submit event
      // this.dataService.submitNewEvent(bookEvent);
      this.routeToMain();
    } else {
      console.log("Null event");
      //Display alert? --- complete the form
    }
  }

  getEventData(): ScheduledEvent {
    if (this.inputTitle.nativeElement.value == "") {
      this.newBookingEvent.title = "Event Title";
    } else {
      this.newBookingEvent.title = this.inputTitle.nativeElement.value;
      // console.log(this.inputTitle.nativeElement.value);
    }
    if (this.newBookingEvent.startTime != null && this.newBookingEvent.endTime != null) {
      return this.newBookingEvent;
    }
    return null;
  }

  startSelected(selectEvent): void {
    // console.log(selectEvent.value);
    let startTime = new Date();
    const timeString = this.timeIncrements[selectEvent.value.id].value;
    startTime.setHours(parseInt(timeString.substr(0, 2)), parseInt(timeString.substr(3, 2)), 0, 0);
    this.newBookingEvent.startTime = startTime;
    // //If end is not a reasonable end, set it to time increment after
    // console.log(this.inputEndTime.nativeElement);
    // var endId: number;
    // if (this.inputEndTime.nativeElement == undefined) {
    //   endId = this.checkEndTime(selectEvent.value.id, null);
    // } else {
    //   endId = this.checkEndTime(selectEvent.value.id, this.inputEndTime.nativeElement.value.id);
    // }
    // console.log(this.timeIncrements[endId]);
    // this.inputEndTime.nativeElement = this.timeIncrements[endId];
  }

  checkEndTime(startId: number, endId: number): number {
    if (endId == null) return (startId + 1);
    if (startId >= endId) return (startId + 1);
    for (let i = startId + 1; i < endId; i++) {
      if (!this.timeIncrements[i].validEnd) return (startId + 1);
    }
    return endId;
  }

  endSelected(selectEvent): void {
    // console.log(selectEvent.value);
    let endTime = new Date();
    const timeString = this.timeIncrements[selectEvent.value.id].value;
    endTime.setHours(parseInt(timeString.substr(0, 2)), parseInt(timeString.substr(3, 2)), 0, 0);
    this.newBookingEvent.endTime = endTime;
    // //If start is not a reasonable start, set it to time increment before
    // var startId: number;
    // if (this.inputEndTime.nativeElement == null) {
    //   startId = this.checkStartTime(selectEvent.value.id, null);
    // } else {
    //   startId = this.checkStartTime(selectEvent.value.id, this.inputStartTime.nativeElement.value.id);
    // }
    // this.inputStartTime.nativeElement.value = this.timeIncrements[startId];
  }

  checkStartTime(startId: number, endId: number): number {
    if (startId == null) return (endId - 1);
    if (startId >= endId) return (endId - 1);
    for (let i = startId + 1; i < endId; i++) {
      if (!this.timeIncrements[i].validStart) return (endId - 1);
    }
    return startId;
  }

}