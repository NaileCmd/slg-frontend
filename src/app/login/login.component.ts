import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; 
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [     
    RouterOutlet, RouterLink, 
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule  
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  private spinnerRef: any;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.spinnerRef = this.dialog.open(LoadingSpinnerComponent, {
        data: { message: 'Login läuft, bitte warten...' },
        disableClose: true 
      });

      this.authService.loginUser(username, password).subscribe(httpStatusCode => {
        this.spinnerRef.close();
        if (httpStatusCode === 200) {
          this.router.navigate(['/user-details']);
        } else {        
          this.handleError(httpStatusCode);
        }
      });
    }
  }

  private handleError(statusCode: number): void {
    console.error('Login failed: ', statusCode);
    let title = 'Login Fehler';
    let message = 'Verbindung zum Server ist leider nicht möglich. Bitte später erneut versuchen!';
    if (statusCode === 401 || statusCode === 403) {
      message = 'Invalid username or password.';
    }
    this.dialog.open(MessageDialogComponent, {
      data: { title, message }
    });
  }
}
