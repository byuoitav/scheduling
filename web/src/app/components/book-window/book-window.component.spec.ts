import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookWindowComponent } from './book-window.component';

describe('BookWindowComponent', () => {
  let component: BookWindowComponent;
  let fixture: ComponentFixture<BookWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
