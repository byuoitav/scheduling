import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'app-keyboard-sheet',
  templateUrl: './keyboard-sheet.component.html',
  styleUrls: ['./keyboard-sheet.component.scss']
})
export class KeyboardSheetComponent {

  constructor(private bottomSheetRef: MatBottomSheetRef<KeyboardSheetComponent>) { }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
