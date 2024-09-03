import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter} from '@angular/material/core';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CalendarEvent } from '../../model/calendar/calendar.model';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-calendar-event-create',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    NgFor, NgIf, NgClass,
    MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, 
    MatSelectModule, MatButtonModule, MatCheckboxModule, MatButtonToggleModule
  ],
  templateUrl: './calendar-event-create.component.html',
  styleUrl: './calendar-event-create.component.css'
})

export class CalendarEventCreateComponent {
  eventForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      startDate: ['', Validators.required],  
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],    
      endTime: ['', Validators.required],
      eventType: ['TRAINING', Validators.required], 
      location: ['', Validators.required],
      shootingRanges: [[]],
      description: [''],
      members: [[]],
      disciplines: [[]],
    });
  }

  ngOnInit() {
    // Listen for changes on startDate
    this.eventForm.get('startDate')?.valueChanges.subscribe((startDateValue) => {
      const endDateControl = this.eventForm.get('endDate');
      if (!endDateControl?.value && startDateValue) {
        endDateControl?.setValue(startDateValue);
      }
    });
  }

  onSubmit() {
    if (this.eventForm.valid) {
      const formValues = this.eventForm.value;

      const startDateTime = this.combineDateAndTime(formValues.startDate, formValues.startTime);
      const endDateTime = this.combineDateAndTime(formValues.endDate, formValues.endTime);

      const newEvent: CalendarEvent = {
        id: '',
        title: formValues.title,
        startTime: startDateTime,
        endTime: endDateTime,
        eventType: formValues.eventType,
        location: formValues.location,
        shootingRanges: formValues.shootingRanges,
        description: formValues.description,
        members: formValues.members,
        disciplines: formValues.disciplines
      };

      console.log('New Event:', newEvent);
      // Add logic to handle form submission, like sending data to the backend
    } else {
      console.error('Form is invalid');
    }
  }

  private combineDateAndTime(date: string, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes);
    return combinedDate;
  }
}
