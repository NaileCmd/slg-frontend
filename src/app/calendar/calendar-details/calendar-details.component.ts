import { Component, Input } from '@angular/core';
import { CalendarDay } from '../../model/calendar/calendar.model';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-details',
  standalone: true,
  imports: [
    MatAccordion, MatExpansionModule,
    NgIf, NgFor, CommonModule,
    MatCardModule, DateFormatPipe,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './calendar-details.component.html',
  styleUrl: './calendar-details.component.css'
})

export class CalendarDetailsComponent {
  @Input() selectedDay: CalendarDay | null = null;  
  
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onAddEvent(): void {
    this.router.navigate(['/calendar-event-create']);
  }
  
  isMember(): boolean {
    return this.authService.hasRole('ROLE_MEMBER');
  }

}
