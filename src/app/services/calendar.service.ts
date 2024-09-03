import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../model/calendar/calendar.model';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private baseUrl = environment.calendarApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  // GET /api/calendar
  listQuestions(params?: any): Observable<CalendarEvent[]> {
    let queryParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        queryParams = queryParams.set(key, params[key]);
      });
    }
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}`, { params: queryParams })
      .pipe(map(events => events.map(event => ({
        ...event,
        startTime: new Date(event.startTime), 
        endTime: new Date(event.endTime)      
      }))));
  }

}
