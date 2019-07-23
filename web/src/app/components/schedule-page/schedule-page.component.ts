import { Component, OnInit } from '@angular/core';
import { DataService, RoomStatus, ScheduledEvent } from 'src/app/services/data/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router'

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.scss']
})
export class SchedulePageComponent implements OnInit {

  status: RoomStatus;
  eventList: ScheduledEvent[];

  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dataService: DataService,
    private router: Router) {
    this.matIconRegistry.addSvgIcon(
      "BackArrow",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/baseline-arrow_back-24px.svg")
    );
  }

  ngOnInit() {
    this.status = this.dataService.getRoomStatus();
    this.eventList = this.dataService.getSchedule();
  }

  routeToMain(): void {
    this.router.navigate(['/']);
  }

}
