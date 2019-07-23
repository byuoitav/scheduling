import { Component, OnInit, Input } from '@angular/core';
import { ScheduledEvent, DataService } from 'src/app/services/data/data.service';

import * as moment from 'moment/moment';

export interface SelectTime {
  value: string;
  viewValue: string;
  valid: boolean;
}

@Component({
  selector: 'app-book-window',
  templateUrl: './book-window.component.html',
  styleUrls: ['./book-window.component.scss']
})
export class BookWindowComponent implements OnInit {
  startTime: string;
  endTime: string;
  currentEvents: ScheduledEvent[];
  timeIncrements: SelectTime[];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.currentEvents = this.dataService.getSchedule();
    this.calculateTimeIncrements();
    this.disableInvalidTimeIncrements();
  }

  getEventData(): ScheduledEvent {


    return null;
  }

  startSelected(event): void {
    console.log(event.value);
  }

  endSelected(event): void {
    console.log(event.value);
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
      this.timeIncrements.push({ value: value, viewValue: viewValue, valid: true });
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
      time.setHours(parseInt(this.timeIncrements[i].value.substr(0, 2)));
      time.setMinutes(parseInt(this.timeIncrements[i].value.substr(3, 2)));
      for (let j = 0; j < this.currentEvents.length; j++) {
        if ((time.getTime() >= this.currentEvents[j].startTime.getTime()) && (time.getTime() <= this.currentEvents[j].endTime.getTime())) {
          this.timeIncrements[i].valid = false;
          if (!this.timeIncrements[i].viewValue.includes("[Busy]")) {
            this.timeIncrements[i].viewValue += " [Busy]";
          }
        }
      }
    }
  }

}
