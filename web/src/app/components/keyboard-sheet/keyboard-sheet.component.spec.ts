import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardSheetComponent } from './keyboard-sheet.component';

describe('KeyboardSheetComponent', () => {
  let component: KeyboardSheetComponent;
  let fixture: ComponentFixture<KeyboardSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyboardSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
