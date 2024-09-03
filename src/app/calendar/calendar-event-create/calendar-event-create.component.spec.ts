import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEventCreateComponent } from './calendar-event-create.component';

describe('CalendarEventCreateComponent', () => {
  let component: CalendarEventCreateComponent;
  let fixture: ComponentFixture<CalendarEventCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarEventCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarEventCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
