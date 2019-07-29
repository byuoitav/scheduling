import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Event } from "../../model/o365.model";

export class ENV {
  allowBookNow: boolean;
  showHelp: boolean;
  displayName: string;
  timeZone: string;
}

export class RoomStatus {
  roomName: string;
  unoccupied: boolean;
  emptySchedule: boolean;
}

export class ScheduledEvent {
  title: string;
  startTime: Date;
  endTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  url: string;
  config: ENV = {       //TEST
    allowBookNow: true,
    showHelp: false,
    displayName: "ITB 1004",
    timeZone: "Zone"
  };
  status: RoomStatus;

  currentSchedule: ScheduledEvent[] = [       //TEST
    { title: 'My meeting', startTime: new Date("July 29, 2019 09:30:00"), endTime: new Date("July 29, 2019 10:30:00") },
    { title: 'My even better meeting', startTime: new Date("July 29, 2019 10:30:00"), endTime: new Date("July 29, 2019 11:30:00") },
    { title: 'My really really really really really really really really really really really long meeting title', startTime: new Date("July 29, 2019 11:30:00"), endTime: new Date("July 29, 2019 12:30:00") },
    { title: 'My worst meeting', startTime: new Date("July 29, 2019 12:30:00"), endTime: new Date("July 29, 2019 13:30:00") },
    { title: 'My slightly better meeting', startTime: new Date("July 29, 2019 13:30:00"), endTime: new Date("July 29, 2019 14:30:00") },
    { title: 'My most worstest meeting', startTime: new Date("July 29, 2019 16:30:00"), endTime: new Date("July 29, 2019 17:15:00") }
  ];

  constructor(private http: HttpClient) {
    const base = location.origin.split(":");
    this.url = base[0] + ":" + base[1];
    console.log(this.url);

    // this.getConfig();
    this.status = {
      roomName: this.config.displayName,
      unoccupied: true,
      emptySchedule: false
    }

    // this.getScheduleData();
  }

  getBackground(): string {
    return "assets/YMountain.png";
  }

  getRoomStatus(): RoomStatus {
    return this.status;
  }

  getSchedule(): ScheduledEvent[] {
    return this.currentSchedule;
  }

  getCurrentEvent(): ScheduledEvent {
    for (let i = 0; i < this.currentSchedule.length; i++) {
      let time = new Date();
      if ((time.getTime() >= this.currentSchedule[i].startTime.getTime()) && (time.getTime() < this.currentSchedule[i].endTime.getTime())) {
        this.status.unoccupied = false;
        return this.currentSchedule[i];
      }
    }
    this.status.unoccupied = true;
    return null;
  }

  getConfig(): void {
    console.log("Getting config...");

    this.http.get<ENV>(this.url + ":5000/config").subscribe(
      data => {
        this.config = data;
        console.log("Config", this.config);
      },
      err => {
        console.log("Failed to get config; trying again in 5 seconds");
        setTimeout(() => this.getConfig(), 5000);
      }
    );
  }

  getScheduleData(): void {
    const url = this.url + ":5000/v1.0/exchange/calendar/events";
    // console.log("refreshing event data from", url);

    this.http.get<Event[]>(url).subscribe(
      data => {
        console.log("events response", data);
        const newEvents: ScheduledEvent[] = [];

        // create all the events
        for (const event of data) {
          const e = new ScheduledEvent();
          e.title = event.subject;
          e.startTime = new Date(event.start);
          e.endTime = new Date(event.end);

          newEvents.push(e);
        }

        // sort events
        newEvents.sort((a, b) => {
          if (a.startTime < b.startTime) {
            return -1;
          } else if (a.startTime > b.startTime) {
            return 1;
          }
          return 0;
        });

        // replace events
        this.currentSchedule = newEvents;
        this.status.emptySchedule = !(this.currentSchedule.length > 0);

        // console.log("updated events", this.currentSchedule);
        // this.getCurrentEvent();
      },
      err => {
        console.log("error getting events", err);
      }
    );
  }

  submitNewEvent(event: ScheduledEvent): void {
    const req = new Event();
    const today = new Date();
    const M = today.getMonth(); // month is zero-indexed
    const d = today.getDate();
    const y = today.getFullYear();
    const tzoffset = today.getTimezoneOffset();

    req.subject = event.title;
    req.start = new Date(event.startTime.getTime() - tzoffset * 60000);
    req.end = new Date(event.endTime.getTime() - tzoffset * 60000);

    /////////
    ///  SUBMIT
    ///////
    const url = this.url + ":5000/v1.0/exchange/calendar/events";
    console.log("posting", req, "to", url);

    const resp = this.http
      .post(url, JSON.stringify(req), {
        headers: new HttpHeaders().set("Content-Type", "application/json")
      })
      .subscribe(
        response => {
          console.log("successfully posted event. response: ", response);
          this.getScheduleData();
          location.reload();
        },
        err => {
          console.log("error posting event: ", err);
        }
      );

    setTimeout(() => {
      location.reload();
    }, 10000);
  }
}
