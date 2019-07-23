import { Component, OnInit, Input } from '@angular/core';
import { DataService, RoomStatus } from 'src/app/services/data/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router'

@Component({
  selector: 'app-book-page',
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.scss']
})
export class BookPageComponent implements OnInit {

  //Todo: Get rid of all repeated code

  status: RoomStatus;

  day: Date = new Date();
  @Input() room: string;
  unoccupied: boolean = true;

  constructor(private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dataService: DataService,
    private router: Router) {
    this.matIconRegistry.addSvgIcon(
      "BackArrow",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/baseline-arrow_back-24px.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "SaveTray",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/baseline-save_alt-24px.svg")
    );
    this.matIconRegistry.addSvgIcon(
      "Cancel",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/baseline-cancel-24px.svg")
    );
  }

  ngOnInit() {
    this.status = this.dataService.getRoomStatus();
  }

  routeToMain(): void {
    this.router.navigate(['/']);
  }

}
