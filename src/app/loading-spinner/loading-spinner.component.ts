import { Component, Inject  } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [     
    MatProgressSpinnerModule
  ],
  template: `
    <div class="spinner-container">
      <mat-spinner></mat-spinner>
      <p>{{ data.message || defaultMessage }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
    }
    mat-spinner {
      margin-bottom: 10px;
    }
  `]
})

export class LoadingSpinnerComponent {
  defaultMessage: string = 'Lade Daten, bitte warten...'; 
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}
