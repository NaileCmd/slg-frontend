import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [         
    MatDialogModule,
    MatButtonModule  
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
    <button mat-stroked-button class="start_button" mat-dialog-close>
      <div>Schließen</div>
    </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./message-dialog.component.css'],
  encapsulation: ViewEncapsulation.None 
})
export class MessageDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title:string, message: string }) {}
}
