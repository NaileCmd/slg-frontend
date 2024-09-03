import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
    console.log('AuthInterceptor constructed');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('HTTP Interceptor triggered for:', req.url);

    // Check if the request is to retrieve authentication
    if (req.url.endsWith('/api/authenticate/guest') || req.url.endsWith('/api/authenticate')) {
      console.log('Interceptor will not attach any token');
      return next.handle(req);
    } else {
      let token;
      if (req.url.endsWith('/api/authenticate/refresh')) {
        // Get the idToken from the AuthService
        console.log('Interceptor will attach id-token');
        token = this.authService.getIdToken();
      } else {
        // Get the token from the AuthService        
        console.log('Interceptor will attach guest-token');
        token = this.authService.getToken();
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Attached Header:', token);

      // Handle request and catch errors
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 403) {
            console.log('403 Forbidden response detected');
            // Perform your action here, such as refreshing the token or redirecting
            this.handle403Error(authReq, next);
          }
          return throwError(error); // Re-throw the error so it can be handled elsewhere if needed
        })
      );
    }
  }

  private handle403Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log('Handling 403 Forbidden error');
    this.authService.clearTokens();

    // Clone the failed request with the new token and retry
    const newToken = this.authService.getToken();
    const newAuthReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${newToken}`
      }
    });

    return next.handle(newAuthReq);

  }
}
