import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from './calendar/calendar.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'calendar',
        component: CalendarComponent
    },
    {
        path: 'education',
        loadComponent: () => import('./education/education.component')
            .then(c => c.EducationComponent)
    },
    {
        path: 'train',
        loadComponent: () => import('./train/train.component')
            .then(c => c.TrainComponent)
    },
    {
        path: 'testresult',
        loadComponent: () => import('./testresult/testresult.component')
            .then(c => c.TestResultComponent)
    },
    {
        path: 'user',
        loadComponent: () => import('./user/user.component')
            .then(c => c.UserComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.component')
            .then(c => c.LoginComponent)
    },
    {
        path: 'user-details', 
        loadComponent: () => import('./user-details/user-details.component')
        .then(c => c.UserDetailsComponent)
    },
    {
        path: 'user-create', 
        loadComponent: () => import('./user-create/user-create.component')
        .then(c => c.UserCreateComponent)
    },
    {
        path: 'calendar-event-create', 
        loadComponent: () => import('./calendar/calendar-event-create/calendar-event-create.component')
        .then(c => c.CalendarEventCreateComponent)
    }
];
