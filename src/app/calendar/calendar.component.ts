import { Component } from '@angular/core';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { CalendarDetailsComponent } from './calendar-details/calendar-details.component';
import { CalendarDay } from '../model/calendar/calendar.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CalendarViewComponent, CalendarDetailsComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  dayData: CalendarDay = { day: '', dayEvents: [] };

  onCalendarDay(dayData: CalendarDay): void {
    this.dayData = dayData;
  }
}
