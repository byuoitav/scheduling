import { Component } from '@angular/core';
import { DataService } from './services/data/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Room Scheduler';
  backgroundImageURL: string;

  constructor(private dataService: DataService) {
    this.backgroundImageURL = this.dataService.getBackground();
  }
}
