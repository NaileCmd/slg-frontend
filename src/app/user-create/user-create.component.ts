import { Component, OnInit } from '@angular/core';
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
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validator function to check if passwords match
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [     
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule  
  ],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'] // Corrected property name from `styleUrl` to `styleUrls`
})
export class UserCreateComponent implements OnInit {
  createUserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.createUserForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator }); 
  }

  ngOnInit(): void {
    // Initialization logic if any
  }

  onSubmit(): void {
    if (this.createUserForm.valid) {
      const { username, email, password } = this.createUserForm.getRawValue(); // Use `getRawValue` to get form values
      
      this.authService.registerUser(username, password).subscribe(
        (statusCode) => {
          // Handle successful registration
          if (statusCode === 200) {
            this.dialog.open(MessageDialogComponent, {
              data: { title: 'Registrierung Erfolgreich', message: 'Bitte überprüfe dein eMail-Postfach und bestätige die Aktivierung. Nach erfolgter Bestätigung wird der User sofort freigeschalten.' }
            });
            this.router.navigate(['/login']);
          } else {
            this.handleRegistrationError(statusCode);
          }
        },
        (error) => {
          // Handle unexpected errors
          console.error('Registrierung fehlgeschlagen: ', error);
          this.dialog.open(MessageDialogComponent, {
            data: { title: 'Registrierungsfehler', message: 'Ein unerwarteter Fehler ist aufgetreten, bitte später erneut versuchen.' }
          });
        }
      );
    }
  }

  private handleRegistrationError(statusCode: number): void {
    let title = 'Registration Error';
    let message = 'Could not create user. Please try again.';
  
    if (statusCode === 400) {
      message = 'Invalid input. Please check the form fields and try again.';
    } else if (statusCode === 409) {
      message = 'User already exists. Please use a different username or email.';
    }
  
    this.dialog.open(MessageDialogComponent, {
      data: { title, message }
    });
  }
}
