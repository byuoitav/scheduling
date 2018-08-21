import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  LOCALE_ID,
  OnInit
} from "@angular/core";
import { DOCUMENT } from "@angular/platform-browser";
import {
  HttpClient,
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders
} from "@angular/common/http";
import { SimpleTimer } from "ng2-simple-timer";

import { Event, Timeslot } from "./model/o365.model";

export class Resource {
  id: string;
  busy: boolean;
  name: string;
  o365Name: string;
}

export class TimeIncrement {
  id: number;
  value: Date;
  validStart: boolean;
  validEnd: boolean;
}

export class ENV {
  allowbooknow: boolean;
  showhelp: boolean;
  hostname: string;
  timezone: string;

  building: string;
  room: string;
}

const NOEVENTS_MESSAGES: string[] = [
  "No Events Today",
  "My schedule is clear",
  "My schedule is wide open"
];

declare var timeoutID: number;
declare var timeoutTTL: number;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  // new env vars
  env: ENV;
  url: string;

  lastTouch: Date;

  transitionTimer: SimpleTimer;
  controller = this.controller;
  bookEvent: boolean;
  calendarWorkdayEndHour: number;
  calendarWorkdayStartHour: number;
  cancellation: boolean;
  currentEvent: Event;
  currentTimeout: any;
  currentTimeoutTTL = 0;
  eventData: string;
  timePeriod: Timeslot;
  date: Date;
  dayMillis: number;
  timeOptions = {
    hour: "2-digit",
    minute: "2-digit"
  };
  events: Event[] = [];
  helpRequested: boolean;
  helpInformation: boolean;
  helpPressed: boolean;
  LOCALE = "en-us";
  modalTransitionTimerCounter = 0;
  modalTransitionTimerID = "modalTransitionTimer";
  modalTimeout = 2;
  newEvent: Event;
  newEventTitle = "Book Now Meeting";
  newEventEnd: TimeIncrement;
  newEventStart: TimeIncrement;
  noEvents: boolean;
  noEvents_message = "No Events Today";
  numTimeslots = 0;
  occupied: boolean;
  refHours: string[] = [];
  restartRequested: boolean;
  showAgenda: boolean;
  showWaitSpinner: boolean;
  selectedEvent: Event;
  selectedStartValue: number;
  timeIncrement = 30; // minutes to increment select boxes by
  timeSlots: Timeslot[] = [];
  title = "Room Scheduler";
  schedulingWindow = 5; // minutes after a time window start time when the resource still be scheduled
  unoccupied: boolean;
  validTimeIncrements: TimeIncrement[] = [];
  percentOfDayExpended: number;

  darkTheme: boolean;

  duration: number;

  hasAction: boolean;

  isDebug: boolean;

  defaultLocale: string;

  constructor(private http: HttpClient) {
    const base = location.origin.split(":");
    this.url = base[0] + ":" + base[1];

    this.getConfig();
  }

  getConfig() {
    console.log("getting env...");

    this.http.get<ENV>(this.url + ":5000/config").subscribe(
      data => {
        this.env = data;
        const split = this.env.hostname.split("-");

        this.env.building = split[0];
        this.env.room = split[1];

        console.log("env", this.env);
      },
      err => {
        console.log("failed to get env; trying again in 5 seconds");
        setTimeout(() => this.getConfig(), 5000);
      }
    );
  }

  ngOnInit(): void {
    this.noEvents = true;
    this.defaultLocale = `${this.LOCALE}`.slice(1);

    this.utcTime();

    this.transitionTimer = new SimpleTimer();

    this.bookEvent = false;
    this.cancellation = false;
    this.calendarWorkdayEndHour = 17;
    this.calendarWorkdayStartHour = 8;
    this.currentEvent = this.events[1];
    this.helpRequested = false;
    this.helpPressed = false;
    this.helpInformation = false;
    this.restartRequested = false;
    this.showWaitSpinner = false;
    this.newEvent = null;
    if (this.currentEvent != null) {
      this.occupied = true;
    } else {
      this.occupied = false;
    }
    this.showAgenda = false;
    this.selectedEvent = null;
    this.selectedStartValue = 0;
    this.unoccupied = !this.occupied;

    this.refreshData();
    setInterval(() => {
      if (!this.bookEvent && !this.showAgenda) {
        this.refreshData();
      }
    }, 20000);

    // wait for timeout, reset the screens if that happens
    this.lastTouch = new Date();
    setInterval(() => {
      const curTime = new Date();
      const diff = curTime.getTime() - this.lastTouch.getTime();
      const minDiff = diff / 1000 / 60;

      console.log("time since last touch", minDiff, "seconds.");
      if (minDiff > 0.5) {
        console.log("resetting from timeout...");
        this.reset();
      }
    }, 20000);
  }

  calcTimeslots(): void {
    this.numTimeslots =
      (this.calendarWorkdayEndHour - this.calendarWorkdayStartHour) *
      (60 / this.timeIncrement);
    this.populateRefHours();
    this.populateTimeslots();
  }

  populateRefHours(): void {
    this.refHours = [];
    for (
      let i = this.calendarWorkdayStartHour;
      i < this.calendarWorkdayEndHour;
      i++
    ) {
      this.refHours.push(i.toString());
    }
  }

  // populate timeslots from now until 23:30 PM
  populateTimeslots(): void {
    this.validTimeIncrements = [];

    // create first time
    const first = new Date();
    if (first.getMinutes() >= 30) {
      first.setMinutes(30);
    } else {
      first.setMinutes(0);
    }

    // create end time
    const last = new Date();
    last.setHours(23);
    last.setMinutes(30);

    // remove seconds/milliseconds from time
    first.setSeconds(0);
    first.setMilliseconds(0);
    last.setSeconds(0);
    last.setMilliseconds(0);

    // create intervals
    const times: Date[] = [];
    const curr = first;

    while (curr.getTime() !== last.getTime()) {
      const time = new Date(curr.getTime());
      times.push(time);

      if (curr.getMinutes() >= 30) {
        curr.setHours(curr.getHours() + 1);
        curr.setMinutes(0);
      } else {
        curr.setMinutes(30);
      }
    }

    times.push(last);

    // turn times readable format
    for (let i = 0; i < times.length; i++) {
      // figure out if this time is free or not
      const timePlusFive = new Date(times[i].getTime() + 5 * 60000); // add 5 minutes

      let validStart = true;
      let validEnd = true;

      for (const event of this.events) {
        if (i + 1 === times.length) {
          validStart = false;
          break;
        }

        // decide if it's a valid start time
        if (event.start < timePlusFive && event.end > timePlusFive) {
          validStart = false;
          break;
        }
      }

      // decide if it's a valid end time increment
      if (i === 0 || !this.validTimeIncrements[i - 1].validStart) {
        validEnd = false;
      }

      this.validTimeIncrements.push({
        id: i,
        value: times[i],
        validStart: validStart,
        validEnd: validEnd
      });
    }
  }

  availabilityClass(e: Event): string {
    if (e.subject.toString() === "Available") {
      return "agenda-view-row-available";
    } else {
      return "agenda-view-row-unavailable";
    }
  }

  bookNow(): void {
    this.reset();
    this.startScreenResetTimeout(70);
    this.bookEvent = true;
    this.calcTimeslots();
  }
  cancelEvent(event: Event): void {
    this.reset();
    this.cancellation = true;
  }

  cancelPage_no(): void {
    this.reset();
  }
  cancelPage_yes(): void {
    this.reset();
  }
  consolidate_events(): void {
    let consolidate = true;
    let i = this.events.length - 1;
    while (consolidate) {
      if (i > 0) {
        if (this.events[i].subject === this.events[i - 1].subject) {
          this.events[i - 1].end = new Date(this.events[i].end.getDate());
          this.events.pop();
          i = this.events.length - 1;
        } else {
          i--;
        }
        if (i === 0) {
          consolidate = false;
          break;
        }
      } else {
        break;
      }
    }
  }

  currentMeeting() {
    const now = new Date();

    for (let i = 0; i < this.events.length; i++) {
      if (
        new Date(this.events[i].start) <= now &&
        new Date(this.events[i].end) >= now
      ) {
        this.currentEvent = this.events[i];
        return;
      }
    }

    this.currentEvent = null;
  }

  currentTimePeriod(): number {
    // Return time period (0<x<96) for current time
    const now = new Date();
    const msIn15Min = 900000;
    const secondsInADay: number = 24 * 60 * 60;
    const hours: number = now.getHours() * 60 * 60;
    const minutes: number = now.getMinutes() * 60;
    const seconds: number = now.getSeconds();
    const ms: number = (hours + minutes + seconds) * 1000;
    const t1: number = now.getTime();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    const t2 = now.getTime();
    let ret = 0;
    ret = Math.floor((t1 - t2) / msIn15Min);
    return ret;
  }

  durationString(selectedEvent): string {
    let duration = "";
    const Date_Start = new Date(selectedEvent.start);
    const Date_End = new Date(selectedEvent.end);
    const Difference = Date_End.valueOf() - Date_Start.valueOf();
    const diffDays = Math.floor(Difference / 86400000); // days
    const diffHrs = Math.floor((Difference % 86400000) / 3600000); // hours
    const diffMins = Math.round(((Difference % 86400000) % 3600000) / 60000); // minutes
    if (diffMins > 0) {
      duration = diffMins.toString() + " Minutes";
    }
    if (diffHrs > 0) {
      duration = diffHrs + " Hours " + duration;
    }
    return duration;
  }
  evalTime(): void {
    if (this.currentEvent != null) {
      this.occupied = true;
    } else {
      this.occupied = false;
    }

    this.unoccupied = !this.occupied;
  }
  getSelectedText(elementId, index): string {
    const elem = document
      .getElementById(elementId)
      .getElementsByTagName("option")[index];
    return elem.text;
  }
  helpClick(): void {
    this.helpPressed = true;
    this.startScreenResetTimeout(10);
  }
  helpInformationRequest(): void {
    this.helpPressed = false;
    this.helpInformation = true;
    // this.resetModal();
    // show information;
  }
  helpRequest(): void {
    this.helpPressed = false;
    this.helpRequested = true;
    // var resp = this.http.post(environment.slack_webhook_url, "{\"text\":\"Help request from " + this.resource.name + "\"}").subscribe();
    this.startScreenResetTimeout(3);
  }
  modalTimerCallback(): void {
    if (this.modalTransitionTimerCounter <= this.modalTimeout) {
      this.modalTransitionTimerCounter++;
    } else {
      this.subscribeHelpTimer();
      this.resetModal();
    }
  }
  onSelect(event: Event): void {
    this.selectedEvent = event;
  }

  onStartChange(selected: TimeIncrement): void {
    if (this.newEventEnd == null || selected.id >= this.newEventEnd.id) {
      this.newEventEnd = this.validTimeIncrements[selected.id + 1];
    }

    // check and make sure it doesn't span a bad option
    for (let i = this.newEventStart.id + 1; i <= this.newEventEnd.id; i++) {
      if (!this.validTimeIncrements[i].validEnd) {
        this.newEventEnd = this.validTimeIncrements[selected.id + 1];
        break;
      }
    }
  }

  onEndChange(selected: TimeIncrement): void {
    if (this.newEventStart == null || selected.id <= this.newEventStart.id) {
      this.newEventStart = this.validTimeIncrements[selected.id - 1];
    }

    // check and make sure it doesn't span a bad option
    for (let i = this.newEventStart.id; i < this.newEventEnd.id; i++) {
      if (!this.validTimeIncrements[i].validStart) {
        this.newEventStart = this.validTimeIncrements[selected.id - 1];
        break;
      }
    }
  }

  percent(): void {
    const secondsInADay = 24 * 60 * 60;
    const now = new Date();
    const hours = now.getHours() * 60 * 60;
    const minutes = now.getMinutes() * 60;
    const seconds = now.getSeconds();
    const totalSeconds = hours + minutes + seconds;
    const percentSeconds = (100 * totalSeconds) / secondsInADay;
    this.percentOfDayExpended = percentSeconds;
  }

  refreshData(): void {
    this.populateRefHours();

    const url = this.url + ":5000/v1.0/exchange/calendar/events";
    console.log("refreshing event data from", url);

    this.http.get<Event[]>(url).subscribe(
      data => {
        console.log("events response", data);
        const newEvents: Event[] = [];

        // create all the events
        for (const event of data) {
          const e = new Event();
          e.subject = event.subject;
          e.start = new Date(event.start);
          e.end = new Date(event.end);

          newEvents.push(e);
        }

        // sort events
        newEvents.sort((a, b) => {
          if (a.start < b.start) {
            return -1;
          } else if (a.start > b.start) {
            return 1;
          }
          return 0;
        });

        // replace events
        this.events = newEvents;
        this.noEvents = !(this.events.length > 0);

        console.log("updated events", this.events);
        this.currentMeeting();
      },
      err => {
        console.log("error getting events", err);
      }
    );
  }

  reset(): void {
    console.log("resetting data");

    this.bookEvent = false;
    this.cancellation = false;
    this.helpInformation = false;
    this.helpPressed = false;
    this.helpRequested = false;
    this.restartRequested = false;
    this.showAgenda = false;
    this.showWaitSpinner = false;
    this.newEventStart = null;
    this.newEventEnd = null;

    this.validTimeIncrements = [];
  }

  resetTimeout() {
    this.lastTouch = new Date();
  }

  resetModal(): void {
    this.helpPressed = false;
    this.helpRequested = false;
    // let m = document.getElementsByClassName("modalContent");
    /*
    for (var mChild in m) {
      setTimeout(function() {
        let m = document.getElementsByClassName("modal")[0];
        m.classList.add("hidden");
      }, 2000,this);
    }
   */
  }
  resetTransitionTimer(): void {
    this.transitionTimer.delTimer("modalTransition");
  }
  restartBrowser(): void {
    this.helpInformation = false;
    this.restartRequested = true;
    this.startScreenResetTimeout(3);
    this.refreshData();
    window.location.reload(false);
  }
  resetTimeouts(): void {
    this.startScreenResetTimeout(this.currentTimeoutTTL);
  }
  scheduleEvent(): void {
    this.reset();
    this.startScreenResetTimeout(10);
    // this.refreshData();
    this.showAgenda = true;
  }
  scrollReferenceEvent(elem): void {
    const a = document.getElementById("agenda");
    const t = document.getElementById("current-time-bar-wrapper");
    a.scrollTop = elem.scrollTop;
    t.scrollTop = elem.scrollTop;
  }
  selectByClass(selector: string): HTMLCollectionOf<Element> {
    const elements = document.getElementsByClassName(selector);
    return elements;
  }
  selectById(selector: string): HTMLElement {
    const element = document.getElementById(selector);
    return element;
  }

  startScreenResetTimeout(ttl): void {
    // ttl in s
    const t = ttl * 1000; // convert s to ms
    this.currentTimeoutTTL = t;
    this.stopScreenResetTimeout();
  }

  stopScreenResetTimeout(): void {
    if (this.currentTimeout != null) {
      clearTimeout(this.currentTimeout);
    }
  }

  submitEventForm(): void {
    this.showWaitSpinner = true;

    const s = this.newEventStart.value;
    const e = this.newEventEnd.value;

    console.log("startTime", s, "sendTime", e);
    this.submitEvent(this.newEventTitle, s, e);
  }

  submitEvent(tmpSubject: string, startTime: Date, endTime: Date): void {
    const req = new Event();
    const today = new Date();
    const M = today.getMonth(); // month is zero-indexed
    const d = today.getDate();
    const y = today.getFullYear();
    const tzoffset = today.getTimezoneOffset();

    req.subject = tmpSubject;
    req.start = new Date(startTime.getTime() - tzoffset * 60000);
    req.end = new Date(endTime.getTime() - tzoffset * 60000);

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
          this.refreshData();
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

  subscribeHelpTimer(): void {
    if (this.modalTransitionTimerID) {
      // Unsubscribe if timer Id is defined
      this.transitionTimer.unsubscribe(this.modalTransitionTimerID);
      this.modalTransitionTimerCounter = 0;
    } else {
      // Subscribe if timer Id is undefined
      this.modalTransitionTimerID = this.transitionTimer.subscribe(
        "modalTransition",
        () => this.modalTimerCallback()
      );
    }
  }

  utcTime(): void {
    setInterval(() => {
      this.date = new Date();
      this.timePeriod = this.timeSlots[this.currentTimePeriod()];
      this.percent();
      this.currentMeeting();
      this.evalTime();
    }, 1000);
  }

  wait(): void {
    this.showWaitSpinner = true;
  }
}
