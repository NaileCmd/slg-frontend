import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

  title = 'Slg 96';
  public headerText = 'Home';
  isExam: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { isExam: boolean };
    this.isExam = state?.isExam ?? false;
    this.authService.retrieveGuestToken();
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { isExam: boolean };
        this.isExam = state?.isExam ?? false;
        this.updateHeaderTextBasedOnUrl(event.urlAfterRedirects);
      }
    });
  }

  private updateHeaderTextBasedOnUrl(url: string): void {
    switch (url) {
      case '/calendar':
        this.headerText = 'Termine';
        break;
      case '/calendar-event-create':
          this.headerText = 'neuer Termin';
          break;        
      case '/home':
        this.headerText = 'Home';
        break;
      case '/education':
        this.headerText = 'Sachkunde';
        break;
      case '/testresult':
        this.headerText = 'Test Ergebnis';
        break;
      case '/login':
        this.headerText = 'User Login';
        break;
      case '/user-details':
        this.headerText = 'User Daten';
        break;
      case '/train':
        if (this.isExam) {
          this.headerText = 'Prüfungs Modus';
        } else {
          this.headerText = 'Übungs Modus';
        }
        break;
      default:
        this.headerText = 'Home';
        break;
    }
  }

}
