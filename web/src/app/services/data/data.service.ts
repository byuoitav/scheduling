import { Injectable } from '@angular/core';

export class RoomStatus {
  roomName: string;
  unoccupied: boolean;
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
  status: RoomStatus = {
    roomName: "MyRoom",
    unoccupied: false
  }

  currentSchedule: ScheduledEvent[] = [
    { title: 'My meeting', startTime: new Date("July 23, 2019 09:30:00"), endTime: new Date("July 23, 2019 10:30:00") },
    { title: 'My even better meeting', startTime: new Date("July 23, 2019 10:30:00"), endTime: new Date("July 23, 2019 11:30:00") },
    { title: 'My really really really really really really really really really really really long meeting title', startTime: new Date("July 23, 2019 11:30:00"), endTime: new Date("July 23, 2019 12:30:00") },
    { title: 'My worst meeting', startTime: new Date("July 23, 2019 12:30:00"), endTime: new Date("July 23, 2019 13:30:00") },
    { title: 'My slightly better meeting', startTime: new Date("July 23, 2019 13:30:00"), endTime: new Date("July 23, 2019 14:30:00") },
    { title: 'My most worstest meeting', startTime: new Date("July 23, 2019 16:30:00"), endTime: new Date("July 23, 2019 17:30:00") }
  ];

  constructor() { }

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
}
