import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ScheduledEvent, DataService } from 'src/app/services/data/data.service';

import * as moment from 'moment/moment';

export interface SelectTime {
  value: string;
  viewValue: string;
  validStart: boolean;
  validEnd: boolean;
}

@Component({
  selector: 'app-book-window',
  templateUrl: './book-window.component.html',
  styleUrls: ['./book-window.component.scss']
})
export class BookWindowComponent implements OnInit {
  @ViewChild('eventTitle', { static: false }) inputTitle: ElementRef;
  newBookingEvent: ScheduledEvent;
  currentEvents: ScheduledEvent[];
  timeIncrements: SelectTime[];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.newBookingEvent = new ScheduledEvent();
    this.currentEvents = this.dataService.getSchedule();
    this.calculateTimeIncrements();
    this.disableInvalidTimeIncrements();
  }

  getEventData(): ScheduledEvent {
    if (this.inputTitle.nativeElement.value == "") {
      this.newBookingEvent.title = "Event Title";
    } else {
      this.newBookingEvent.title = this.inputTitle.nativeElement.value;
    }
    if (this.newBookingEvent.startTime != null && this.newBookingEvent.endTime != null && this.newBookingEvent.title != null) {
      return this.newBookingEvent;
    }
    return null;
  }

  startSelected(selectEvent): void {
    console.log(selectEvent.value);
    let startTime = new Date();
    startTime.setHours(parseInt(selectEvent.value.substr(0, 2)), parseInt(selectEvent.value.substr(3, 2)), 0, 0);
    this.newBookingEvent.startTime = startTime;
  }

  endSelected(selectEvent): void {
    console.log(selectEvent.value);
    let endTime = new Date();
    endTime.setHours(parseInt(selectEvent.value.substr(0, 2)), parseInt(selectEvent.value.substr(3, 2)), 0, 0);
    this.newBookingEvent.endTime = endTime;
  }

  calculateTimeIncrements(): void {
    this.timeIncrements = [];
    let currTime = new Date();
    if (currTime.getMinutes() >= 30) {
      currTime.setMinutes(30);
    } else {
      currTime.setMinutes(0);
    }

    let lastTime = new Date();
    lastTime.setHours(23);
    lastTime.setMinutes(30);

    while (currTime.getTime() <= lastTime.getTime()) {
      //Add to time increments
      let value = moment(currTime).format("HH mm");
      let viewValue = moment(currTime).format('h:mm a');
      this.timeIncrements.push({ value: value, viewValue: viewValue, validStart: true, validEnd: true });
      //Increase by 30 min
      if (currTime.getMinutes() >= 30) {
        currTime.setMinutes(0);
        currTime.setHours(currTime.getHours() + 1);
      } else {
        currTime.setMinutes(30);
      }
    }
  }

  disableInvalidTimeIncrements(): void {
    for (let i = 0; i < this.timeIncrements.length; i++) {
      let time = new Date();
      time.setHours(parseInt(this.timeIncrements[i].value.substr(0, 2)), parseInt(this.timeIncrements[i].value.substr(3, 2)), 0, 0);
      for (let j = 0; j < this.currentEvents.length; j++) {
        if ((time.getTime() >= this.currentEvents[j].startTime.getTime()) && (time.getTime() <= this.currentEvents[j].endTime.getTime())) {
          this.timeIncrements[i].validStart = false;
          this.timeIncrements[i].validEnd = false;
          if ((time.getTime() == this.currentEvents[j].startTime.getTime()) && i != 0 && this.timeIncrements[i - 1].validStart) {
            this.timeIncrements[i].validEnd = true;
          } else if (time.getTime() == this.currentEvents[j].endTime.getTime()) {
            this.timeIncrements[i].validStart = true;
          }
        }
      }
    }
  }

}
