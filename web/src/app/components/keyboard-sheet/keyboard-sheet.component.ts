import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';
import Keyboard from 'simple-keyboard';

@Component({
  selector: 'app-keyboard-sheet',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './keyboard-sheet.component.html',
  styleUrls: [
    './keyboard-sheet.component.scss',
    '../../../../node_modules/simple-keyboard/build/css/index.css'
  ]
})
export class KeyboardSheetComponent implements OnInit {
  @ViewChild("eventInput", { static: false }) eventTitle: ElementRef;

  private keyboard: Keyboard;
  eventTitleValue: string = "";

  constructor(private bottomSheetRef: MatBottomSheetRef<KeyboardSheetComponent>) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
      // layout: {
      //   default: [
      //     "1 2 3 4 5 6 7 8 9 0 {bksp}",
      //     "q w e r t y u i o p",
      //     "a s d f g h j k l",
      //     "z x c v {space} b n m {enter}"
      //   ]
      // },
      // mergeDisplay: true,
      // display: {
      //   "{bksp}": "⌫",
      //   "{space}": "space"
      // },
      // buttonTheme: [
      //   {
      //     class: "keyboard-tall-button",
      //     buttons:
      //       "1 2 3 4 5 6 7 8 9 0 q w e r t y u i o p a s d f g h j k l z x c v b n m {bksp} {space} {enter}"
      //   }
      // ]
    });
  }

  onChange = (input: string) => {
    this.eventTitleValue = input;
    // console.log("key was pressed", this.eventTitleValue);
  };

  onKeyPress = (button: string) => {
    this.eventTitle.nativeElement.focus();
    // console.log("Button pressed: ", button);
    if (button == "{enter}") {
      this.bottomSheetRef.dismiss(this.eventTitleValue);
    }
  };

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss(this.eventTitleValue);
    event.preventDefault();
  }

}

