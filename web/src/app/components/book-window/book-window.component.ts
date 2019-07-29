import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ScheduledEvent } from 'src/app/services/data/data.service';

import { BookService, SelectTime } from 'src/app/services/book/book.service';



@Component({
  selector: 'app-book-window',
  templateUrl: './book-window.component.html',
  styleUrls: ['./book-window.component.scss']
})
export class BookWindowComponent implements OnInit {
  @ViewChild('eventTitle', { static: false }) inputTitle: ElementRef;
  @ViewChild('eventStart', { static: false }) inputStartTime: ElementRef;
  @ViewChild('eventEnd', { static: false }) inputEndTime: ElementRef;
  newBookingEvent: ScheduledEvent;
  timeIncrements: SelectTime[];

  constructor(private bookService: BookService) { }

  ngOnInit() {
    this.newBookingEvent = new ScheduledEvent();
    this.timeIncrements = this.bookService.getTimeIncrements();
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
    const timeString = this.timeIncrements[selectEvent.value.id].value;
    startTime.setHours(parseInt(timeString.substr(0, 2)), parseInt(timeString.substr(3, 2)), 0, 0);
    this.newBookingEvent.startTime = startTime;
    //If end is not a reasonable end, set it to time increment after
    console.log(this.inputEndTime.nativeElement);
    var endId: number;
    if (this.inputEndTime.nativeElement == undefined) {
      endId = this.checkEndTime(selectEvent.value.id, null);
    } else {
      endId = this.checkEndTime(selectEvent.value.id, this.inputEndTime.nativeElement.value.id);
    }
    console.log(this.timeIncrements[endId]);
    this.inputEndTime.nativeElement = this.timeIncrements[endId];
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
    console.log(selectEvent.value);
    let endTime = new Date();
    const timeString = this.timeIncrements[selectEvent.value.id].value;
    endTime.setHours(parseInt(timeString.substr(0, 2)), parseInt(timeString.substr(3, 2)), 0, 0);
    this.newBookingEvent.endTime = endTime;
    //If start is not a reasonable start, set it to time increment before
    var startId: number;
    if (this.inputEndTime.nativeElement == null) {
      startId = this.checkStartTime(selectEvent.value.id, null);
    } else {
      startId = this.checkStartTime(selectEvent.value.id, this.inputStartTime.nativeElement.value.id);
    }
    this.inputStartTime.nativeElement.value = this.timeIncrements[startId];
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
