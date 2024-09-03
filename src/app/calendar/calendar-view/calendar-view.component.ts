import { Component, inject } from '@angular/core';
import { NgFor, NgIf, NgClass, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CalendarWeek, CalendarEvent, CellData, CalendarDay } from '../../model/calendar/calendar.model';
import { CalendarDetailsComponent } from '../calendar-details/calendar-details.component';
import { CalendarService } from '../../services/calendar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [MatCardModule, MatTableModule,
    NgFor, NgIf, NgClass, MatIconModule,
    CommonModule, MatButtonModule,
    CalendarDetailsComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})

export class CalendarViewComponent {
  calendarService = inject(CalendarService);
  displayedColumns: string[] = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
  dataSource: CalendarWeek[] = [];
  eventsMap: Map<string, Set<string>> = new Map();
  currentMonth: Date = new Date();
  selectedDay: CalendarDay | null = null;

  constructor() { }

  ngOnInit(): void {
    this.createCalendarData(new Date());
    this.initializeEventsMap();
  }

  initializeEventsMap(): void {

    const weekDays: (keyof CalendarWeek)[] = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];

    this.dataSource.forEach(week => {
      weekDays.forEach(day => {

        week[day].dayEvents.forEach(event => {
          let eventTypes = new Set<string>();
          switch (event.eventType) {
            case 'TRAINING': eventTypes.add('T'); break;
            case 'COMPETITION': eventTypes.add('W'); break;
            case 'EDUCATION': eventTypes.add('L'); break;
            default: eventTypes.add('S'); break;
          }
          this.eventsMap.set(week[day].day, eventTypes);
        });

      })
    });
  }

  goToPreviousMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.updateCalendar(this.currentMonth);
  }

  goToNextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.updateCalendar(this.currentMonth);
  }

  updateCalendar(currentMonth: Date) {
    this.createCalendarData(currentMonth);
  }

  getEvent(dayData: CalendarDay): CellData {
    let cellData: CellData = {
      dayNumber: null,
      eventSet: new Set()
    };
    if (!(dayData.day === '')) {
      let dayNumber = dayData.day;
      cellData.dayNumber = dayNumber;
      let events = dayData.dayEvents;
      events?.forEach(event => {
        switch (event.eventType) {
          case 'TRAINING': cellData.eventSet.add('T'); break;
          case 'COMPETITION': cellData.eventSet.add('W'); break;
          case 'EDUCATION': cellData.eventSet.add('L'); break;
          default: cellData.eventSet.add('S'); break;
        }
      });
    }
    return cellData;
  }

  onCellClick(dayData: CalendarDay): void {
    console.log(dayData);
    if (dayData !== null && dayData.day !== '') {
      this.selectedDay = dayData;
    }
  }

  getEventClass(eventDetail: string): string {
    switch (eventDetail) {
      case 'T': return 'training-event';  // Training
      case 'W': return 'competition-event';   // Competition
      case 'L': return 'education-event'; // Education
      default: return 'default-event';   // Other or default
    }
  }

  getDayNumber(givenDate: string | null): string | null {
    if (givenDate == null) {
      return null;
    }
    if (givenDate.charAt(0) === '0') {
      return givenDate.substring(1, 2);
    }
    return givenDate.substring(0, 2);
  }

  createCalendarData(date: Date): void {

    let dataSource: CalendarWeek[] = [];

    let calendarWeek: CalendarWeek = {
      mo: { day: '', dayEvents: [] },
      tu: { day: '', dayEvents: [] },
      we: { day: '', dayEvents: [] },
      th: { day: '', dayEvents: [] },
      fr: { day: '', dayEvents: [] },
      sa: { day: '', dayEvents: [] },
      su: { day: '', dayEvents: [] }
    };

    let actualDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    let today = new Date();

    let calendarEventList: CalendarEvent[];

    // Calculate the first day of the current month
    const startTime = actualDay.toISOString().split('T')[0] + 'T00:00:00';
    
    // Calculate the last day of the current month
    const endTime = lastDay.toISOString().split('T')[0] + 'T23:59:59';
    
    // Parameters object
    const params = {
      startTime: startTime,
      endTime: endTime
    };

    this.getCalendarEvents(params).subscribe({
      next: (events: CalendarEvent[]) => {
        calendarEventList = events;
      },
      error: (error) => {
        console.error('Error fetching calendar events', error);
      },
      complete: () => {
        calendarEventList = calendarEventList.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        console.log('Calendar events fetching completed: ', calendarEventList);        

        while (actualDay <= lastDay) {
          let keyDate = String(actualDay.getDate()).padStart(2, '0') +
            String(actualDay.getMonth() + 1).padStart(2, '0') +
            date.getFullYear();
          let dayOfWeek = actualDay.getDay();
          let dayName: keyof CalendarWeek;
          switch (dayOfWeek) {
            case 0: dayName = 'su'; break;
            case 1: dayName = 'mo'; break;
            case 2: dayName = 'tu'; break;
            case 3: dayName = 'we'; break;
            case 4: dayName = 'th'; break;
            case 5: dayName = 'fr'; break;
            case 6: dayName = 'sa'; break;
            default: throw new Error('Invalid day');
          }

          calendarWeek[dayName].day = keyDate;

          calendarEventList
            .filter(event => this.isDateWithinRange(actualDay, event.startTime, event.endTime))
            .forEach(event => {
              calendarWeek[dayName].dayEvents.push(event);
            });

          if (dayOfWeek === 0 || actualDay.getDate() === lastDay.getDate()) {
            dataSource.push({ ...calendarWeek });
            calendarWeek =
            {
              mo: { day: '', dayEvents: [] },
              tu: { day: '', dayEvents: [] },
              we: { day: '', dayEvents: [] },
              th: { day: '', dayEvents: [] },
              fr: { day: '', dayEvents: [] },
              sa: { day: '', dayEvents: [] },
              su: { day: '', dayEvents: [] }
            };
            if (actualDay.getDate() === lastDay.getDate() && dataSource.length < 6) {
              dataSource.push({ ...calendarWeek });
            }
          }

          if (
            actualDay.getDate() === today.getDate() &&
            actualDay.getMonth() === today.getMonth() &&
            actualDay.getFullYear() === today.getFullYear()
          ) {
            this.selectedDay = calendarWeek[dayName];
          }

          actualDay.setDate(actualDay.getDate() + 1);
        }
        this.dataSource = dataSource;
      }
    });

  }


  isDateWithinRange(date: Date, startTime: Date, endTime: Date): boolean {

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfEvent = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
    const endOfEvent = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());

    return startOfDay >= startOfEvent && startOfDay <= endOfEvent;
  }

  isToday(dayNumber: string | null): boolean {
    const today = new Date();
    const todayString = this.formatDate(today);
    return dayNumber === todayString;
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  }

  getCalendarEvents(params: { startTime: string, endTime: string }): Observable<CalendarEvent[]> {
    return this.calendarService.listQuestions(params);
  }


}
