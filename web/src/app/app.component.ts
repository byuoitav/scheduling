import { Component, ElementRef, HostListener, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { HttpClient, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders } from '@angular/common/http';
import { SimpleTimer } from 'ng2-simple-timer';

import { Event, Timeslot } from './model/o365.model';

export class Resource {
  id: string;
  busy: boolean;
  name: string;
  o365Name: string;
}

export class TimeIncrement {
  id: number;
  value: string;
  dateTimeValue: Date;
}

export class ENV {
    allowbooknow: boolean;
    hostname: string;
    timezone: string;

    building: string;
    room: string;
}

const NOEVENTS_MESSAGES: string[] = ["No Events Today", "My schedule is clear", "My schedule is wide open"]

declare var timeoutID: number;
declare var timeoutTTL: number;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css',]
})

export class AppComponent implements OnInit {
  // new env vars
  env: ENV;
  url: string;

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
    hour: "2-digit", minute: "2-digit"
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
  //newEventTitle: string;
  newEventTitle = "Ad-hoc Meeting";
  newEventEndTimeId: number;
  newEventEndTimeValue: string;
  newEventStartTimeId: number;
  newEventStartTimeValue: string;
  noEvents: boolean;
  noEvents_message = "No Events Today";
  numTimeslots: number = 0;
  occupied: boolean;
  refHours: string[] = [];
  restartRequested: boolean;
  showAgenda: boolean;
//  showHelpButton = environment.showHelpButton;
  showWaitSpinner: boolean;
  selectedEvent: Event;
  selectedStartValue: number;
  timeIncrement = 30; // minutes to increment select boxes by
  timeSlots: Timeslot[] = [];
  title = 'Room Scheduler';
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
    let base = location.origin.split(':');
    this.url = base[0] + ':' + base[1];

    this.getEnv();
    /*
    this.http.get<ENV>(this.url + ":5000/env").subscribe(data => {
        this.env = data;
        let split = this.env.hostname.split('-')

        this.env.building = split[0];
        this.env.room = split[1];

        console.log("env", this.env)
    });
   */
  }

  getEnv() {
    console.log("getting env...")

    this.http.get<ENV>(this.url + ":5000/env").subscribe(data => {
      this.env = data;
      let split = this.env.hostname.split('-')

      this.env.building = split[0];
      this.env.room = split[1];

      console.log("env", this.env)
    }, err => {
        console.log("failed to get env; trying again in 5 seconds")
        setTimeout(() => this.getEnv(), 5000)
    });
  }

  ngOnInit(): void {
      /*
    window.addEventListener('load', function(){
      document.addEventListener('touchstart', function(e){
        if (timeoutID != null && timeoutID > 0){
          window.clearTimeout(timeoutID);
          timeoutID = window.setTimeout(timeoutTTL);
        }
          e.preventDefault()
      }, false)

    }, false)
   */

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
    }
    else {
      this.occupied = false;
    }
    this.showAgenda = false;
    this.selectedEvent = null;
    this.selectedStartValue = 0;
    this.unoccupied = !(this.occupied);

    /*for (var i = this.calendarWorkdayStartHour; i <= this.calendarWorkdayEndHour; i++) {

      if (i > 12) {
        var iNum = +i;
        var nNum = iNum - 12;

        this.refHours.push(nNum.toString());
      }
      else {
        this.refHours.push(i.toString());
      }
      var newDate = new Date()
      newDate.setHours(i);
    }*/

    this.refreshData();
    setInterval(() => {
        this.refreshData();
    }, 20000)
  }

  calcTimeslots(): void {
    this.numTimeslots = ( this.calendarWorkdayEndHour - this.calendarWorkdayStartHour ) * (60 / this.timeIncrement);

    this.populateRefHours();
    this.populateTimeslots();
  }

  populateRefHours(): void {
    this.refHours = [];
    for (let i=this.calendarWorkdayStartHour; i < this.calendarWorkdayEndHour; i++ ){
      this.refHours.push(i.toString());
    }
  }

  populateTimeslots(): void {

        // Populate valid time scheduling window
        let d = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(d.getDate() + 1);
        tomorrow.setTime(0);

        let minutes = d.getMinutes();
        //var hours = d.getHours();
        let m = 0;
        if (this.timeIncrement == 15) {
          m = (((minutes + 7.5) / 15 | 0) * 15) % 60; // Nearest 15 minute interval, rounded down
        }
        else {
          m = (((minutes + 15) / 30 | 0) * 30) % 60;
          //m = (Math.round(minutes/30) * 30) % 60;
        }
        //    var h = ((((minutes/105) + .5) | 0) + hours) % 24;  // Not quite right.
        d.setMinutes(m);
        d.setSeconds(0);

        for (let i = 0; i < this.numTimeslots; i++) {
          let amPm = "AM";
          let mins = d.getMinutes();
          let hours = d.getHours();
          if (hours > 12) {
            amPm = "PM";
            hours = hours - 12;
          }
          if ((new Date).getDay() == d.getDay()) {
            this.validTimeIncrements.push({
              id: i,
              dateTimeValue: d,
              value: d.toLocaleTimeString(this.LOCALE, this.timeOptions)
              //value: hours.toString() + ":" + mins.toString() + " " + amPm
            });
          }
          d.setMinutes(mins + this.timeIncrement);
        }

        //Populate timeslots
        for (let j = 0; j < 96; j++) {
          let tmpTime1 = new Date();
          let tmpTime2 = new Date(tmpTime1.valueOf());
          let t2 = 0;

          let t = new Timeslot();
          tmpTime1.setMinutes(j * 15);

          t.Start = tmpTime1;
          if (j < 96) {
            t2 = j + 1;
          }
          else {
            t2 = j;
          }
          tmpTime2.setMinutes((j + 1) * 15);
          t.End = tmpTime2;

          this.timeSlots.push(t);
          /*var h = t.Start.getHours();
          if (t.Start.getHours() > 12) {
            h = +(t.Start.getHours()) - 12;
          }


          if (this.refHours.length <= 0) {
            this.refHours.push(h.toPrecision(1).toString());
          }
          else {
            if (this.refHours[-1].valueOf() != h.toPrecision(1).toString()) {
              this.refHours.push(h.toPrecision(1).toString());
            }
          }*/
          tmpTime1 = null;
          tmpTime2 = null;
        }
  }

  /*
  openKeyboard(locale = this.defaultLocale) {
    this._keyboardRef = this._keyboardService.open(locale, {
      //darkTheme: this.darkTheme,
      //darkTheme: true,
      darkTheme:false,
      duration: this.duration,
      hasAction: this.hasAction,
      isDebug: this.isDebug
    });
  }

  closeCurrentKeyboard() {
    if (this._keyboardRef) {
      this._keyboardRef.dismiss();
    }
  }
  toggleDarkTheme(dark: boolean) {
    this.darkTheme = dark;
    this._keyboardRef.darkTheme = dark;
  }
 */

  availabilityClass(e: Event): string {
    if (e.subject.toString() == 'Available') {
      return "agenda-view-row-available";
    }
    else {
      return "agenda-view-row-unavailable";
    }
  }


  bookNewEvent(): void {
    /*//this.reset();
    var d = new Date();
    this.bookEvent = true;
    this.newEvent = new Event();
    var year = d.getFullYear().toString();
    var month = d.getMonth().toString();
    var day = d.getDay().toString();
    var s = "" + year + "-" + month + "-" + day + "T";
    var e = "" + year + "-" + month + "-" + day + "T";
    var sH = "";
    var eH = "";
    if (this.newEventStartAmPm === "AM") {
      sH = (this.newEventStartHour).toString();
    }
    else {
      var sI = +(this.newEventStartHour);
      sH = (sI + 12).toString();
    }
    if (this.newEventEndAmPm === "AM") {
      eH = (this.newEventEndHour).toString();
    }
    else {
      var eI = +(this.newEventEndHour);
      eH = (eI + 12).toString();
    }

    s += sH + ":" + this.newEventStartMinute + ":000";
    e += eH + ":" + this.newEventEndMinute + ":000";*/
    this.reset();
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
        }
        else {
          i--;
        }
        if (i == 0) {
          consolidate = false;
          break;
        }
      }
      else {
        break;
      }
    }
  }
  currentMeeting() {
    let now = new Date();
    for (let i = 0; i < this.events.length; i++) {
      if ((new Date(this.events[i].start) <= now) && (new Date(this.events[i].end) >= now)) {
        this.currentEvent = this.events[i];
        //console.log(this.currentEvent);
        return;
      }
    }
    this.currentEvent = null;
    //console.log(this.currentEvent);
  }
  /*getTimePeriod(d:Date): number {
    var t = new Date(d.getDate());
    var msIn15Min: number = 900000;
    var secondsInADay: number = 24 * 60 * 60;
    var hours: number = t.getHours() * 60 * 60;
    var minutes: number = t.getMinutes() * 60;
    var seconds: number = t.getSeconds();
    var ms: number = (hours + minutes + seconds) * 1000;
    var t1: number = t.getTime();
    t.setHours(0);
    t.setMinutes(0);
    t.setSeconds(0);
    var t2 = t.getTime();
    var ret = 0;
    ret = Math.floor((t1 - t2) / msIn15Min);
    return ret;
  }*/
  currentTimePeriod(): number { // Return time period (0<x<96) for current time
    let now = new Date();
    let msIn15Min: number = 900000;
    let secondsInADay: number = 24 * 60 * 60;
    let hours: number = now.getHours() * 60 * 60;
    let minutes: number = now.getMinutes() * 60;
    let seconds: number = now.getSeconds();
    let ms: number = (hours + minutes + seconds) * 1000;
    let t1: number = now.getTime();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    let t2 = now.getTime();
    let ret = 0;
    ret = Math.floor((t1 - t2) / msIn15Min);
    return ret;
  }

  /*
  deriveVariablesFromHostname(res: Resource): void {
    var buildingAndRoom = hostname.split(" ", 2);
    var building = buildingAndRoom[0];
    var room = buildingAndRoom[1];

    res.id = building + "-" + room;
    res.busy = false;
    res.name = building + " " + room;
    res.o365Name = res.id;
  }
  */
  durationString(selectedEvent): string {
    let duration = "";
    let Date_Start = new Date(selectedEvent.start);
    let Date_End = new Date(selectedEvent.end);
    let Difference = Date_End.valueOf() - Date_Start.valueOf();
    let diffDays = Math.floor(Difference / 86400000); // days
    let diffHrs = Math.floor((Difference % 86400000) / 3600000); // hours
    let diffMins = Math.round(((Difference % 86400000) % 3600000) / 60000); // minutes
    if (diffMins > 0) {
      duration = diffMins.toString() + " Minutes"
    }
    if (diffHrs > 0) {
      duration = diffHrs + " Hours " + duration;
    }
    return (duration);
  }
  evalTime(): void {
    if (this.currentEvent != null) {
      this.occupied = true;
    }
    else {
      this.occupied = false;
    }

    this.unoccupied = !(this.occupied);
  }
  getSelectedText(elementId,index): string {
    let elem = document.getElementById(elementId).getElementsByTagName( 'option' )[index];
    return elem.text;
  }
  helpClick(): void {
    this.helpPressed = true;
    this.startScreenResetTimeout(10);
  }
  helpInformationRequest(): void {
    this.helpPressed = false;
    this.helpInformation = true;
    //this.resetModal();
    // show information;
  }
  helpRequest(): void {
    this.helpPressed = false;
    this.helpRequested = true;
//    var resp = this.http.post(environment.slack_webhook_url, "{\"text\":\"Help request from " + this.resource.name + "\"}").subscribe();
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
  onStartChange(selectedStartOption): void {
    this.newEventEndTimeId = selectedStartOption + 1;
  }
  onEndChange(selectedID): void {
      if (this.newEventStartTimeId == null || selectedID <= this.newEventStartTimeId) {
          this.newEventStartTimeId = selectedID - 1;
      }
  }
  percent(): void {
    setInterval(function() {
      let secondsInADay = 24 * 60 * 60;
      let now = new Date();
      let hours = now.getHours() * 60 * 60;
      let minutes = now.getMinutes() * 60;
      let seconds = now.getSeconds();
      let totalSeconds = hours + minutes + seconds;
      let percentSeconds = 100 * totalSeconds / secondsInADay;
      this.percentOfDayExpended = percentSeconds;
    }, 1000);
  }
  refreshData(): void {
    this.populateRefHours();
    this.events = [];
    this.noEvents = true;

    let url = this.url + ":5000/v1.0/exchange/calendar/events";
    console.log("refreshing event data from", url)
    
    this.http.get<Event[]>(url).subscribe(data => {
        console.log("events", data);

        for (let event of data) {
            let e = new Event();
            e.subject = event.subject;
            e.start = event.start;
            e.end = event.end;

            this.events.push(e);
            this.noEvents = false;
        }

        this.events.sort((a,b) => {
            if (a.start < b.start) {
                return -1;
            } else if (a.start > b.start) {
                return 1;
            }
            return 0;
        });

       this.currentMeeting();
    }, err => {
        console.log("error getting events", err)
    });
  }
  reset(): void {
    //this.refreshData();
    this.bookEvent = false;
    this.cancellation = false;
    this.helpInformation = false;
    this.helpPressed = false;
    this.helpRequested = false;
    this.newEventEndTimeId = null;
    this.newEventStartTimeId = null;
    this.restartRequested = false;
    this.showAgenda = false;
    this.showWaitSpinner = false;

    this.validTimeIncrements = [];
  }
  resetModal(): void {
    this.helpPressed = false;
    this.helpRequested = false;
    //let m = document.getElementsByClassName("modalContent");
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
    this.transitionTimer.delTimer('modalTransition');
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
    //this.refreshData();
    this.showAgenda = true;
  }
  scrollReferenceEvent(elem): void {
    let a = document.getElementById("agenda");
    let t = document.getElementById("current-time-bar-wrapper");
    a.scrollTop = elem.scrollTop;
    t.scrollTop = elem.scrollTop;
  }
  selectByClass(selector: string): HTMLCollectionOf<Element> {
    let elements = document.getElementsByClassName(selector);
    return elements;
  }
  selectById(selector: string): HTMLElement {
    let element = document.getElementById(selector);
    return element;
  }
  startScreenResetTimeout(ttl): void { //ttl in s
    let t = ttl * 1000; //convert s to ms
    this.currentTimeoutTTL = t;
    this.stopScreenResetTimeout();
    /*
    this.currentTimeout = setTimeout(function(){
      that.reset();
      that.closeCurrentKeyboard();
    },t);
   */
  }
  stopScreenResetTimeout(): void {
    if (this.currentTimeout != null) {
      clearTimeout(this.currentTimeout);
    }
  }
  submitEventForm(): void {
    this.showWaitSpinner=true;
    let s = this.validTimeIncrements[this.newEventStartTimeId].value;
    let e = this.validTimeIncrements[this.newEventEndTimeId].value;

    console.log("startTime", s, "sendTime", e)
    this.submitEvent("Ad-hoc Meeting", s, e);
  }
  submitEvent(tmpSubject: string, tmpStartTime: string, tmpEndTime: string): void {
    let req = new Event();
    let today = new Date();
    let M = today.getMonth(); //month is zero-indexed
    let d = today.getDate();
    let y = today.getFullYear();
    let tzoffset = today.getTimezoneOffset();

    let sH = 0;
    let sM = 0;
    let eH = 0;
    let eM = 0;
    const [starttime, startmodifier] = tmpStartTime.split(' ');
    let [starthours, startminutes] = starttime.split(':');
    if (starthours === '12') {
      starthours = '00';
    }
    if (startmodifier === 'PM') {
      sH = parseInt(starthours, 10) + 12;
    }
    else {
      sH = parseInt(starthours)
    }
    sM = parseInt(startminutes);

    const [endtime, endmodifier] = tmpEndTime.split(' ');
    let [endhours, endminutes] = endtime.split(':');
    if (endhours === '12') {
      endhours = '00';
    }
    if (endmodifier === 'PM') {
      eH = parseInt(endhours, 10) + 12;
    }
    else{
      eH = parseInt(endhours)
    }
    eM = parseInt(endminutes);

    //new Date(year, month, day, hours, minutes, seconds, milliseconds);
    let startTime = new Date(y,M,d,sH,sM,0);
    let endTime = new Date(y,M,d,eH,eM,0);

    req.subject = tmpSubject;
    req.start = new Date(startTime.getTime() - tzoffset*60000);
    req.end = new Date(endTime.getTime() - tzoffset*60000);

    /////////
    ///  SUBMIT
    ///////
    let url = this.url + ":5000/v1.0/exchange/calendar/events";
    console.log("posting", req, "to", url);

    let resp = this.http.post(url,JSON.stringify(req),{headers: new HttpHeaders().set('Content-Type', 'application/json')}).subscribe(resp => {
        console.log("successfully posted event. response: ", resp);
        this.refreshData();
        location.reload()
    }, err => {
        console.log("error posting event: ", err)
    });
  }

  subscribeHelpTimer(): void {
    if (this.modalTransitionTimerID) {
      // Unsubscribe if timer Id is defined
      this.transitionTimer.unsubscribe(this.modalTransitionTimerID);
      this.modalTransitionTimerCounter = 0;
    } else {
      // Subscribe if timer Id is undefined
      this.modalTransitionTimerID = this.transitionTimer.subscribe('modalTransition', () => this.modalTimerCallback());
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
