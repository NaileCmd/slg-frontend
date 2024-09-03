import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, lastValueFrom } from 'rxjs';
import { map, tap, catchError, filter, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authTokenKey = 'auth_token';
  private idTokenKey = 'id_token';
  private guestTokenKey = 'guest_token';
  private tokenUrl = environment.authApiUrl;
  private registerUrl = environment.userApiUrl + '/register';
  private guestTokenUrl = environment.authApiUrl + '/guest';
  private idTokenUrl = environment.authApiUrl + '/refresh';
  private roles: string[] = [];
  constructor(private http: HttpClient) {

  }

  async retrieveGuestToken(): Promise<void> {

    if (!this.isAuthenticated()) {
      console.log("Is not authenticated")

      const response = await lastValueFrom(
        this.http.get<{ jwt: string }>(this.guestTokenUrl)
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Error obtaining guest token', error);
              return of(null);
            })
          )
      );

      if (response && response.jwt) {
        this.storeGuestToken(response.jwt);
        this.roles = this.extractRolesFromToken(response.jwt);
        console.log('Retrieved new guest token from server, with roles: ', this.roles);
      } else {
        console.log('Failed to retrieve JWT');
      }

    } else {
      console.log("Is allready authenticated")
    }
  }

  async getTokenByIdToken(): Promise<void> {

    const idToken = localStorage.getItem(this.idTokenKey);
    console.log('read lokal idToken: ' + idToken);
    if (idToken === null) {
      console.log("no id token exists, login first")
      return;
    } else {

      try {
        const response = await lastValueFrom(
          this.http.get<AuthResponse>(this.idTokenUrl, { observe: 'response' })
            .pipe(
              catchError((error: HttpErrorResponse) => {
                console.error('Error obtaining user token', error);
                return of(null); // Return an observable emitting null if there's an error
              })
            )
        );

        if (response && response.body) {
          this.storeTokens(response.body); // Assuming response.body contains the token
          this.roles = this.extractRolesFromToken(response.body.jwt); // Extract roles from JWT
          console.log('Retrieved new user token from server, with roles: ', this.roles);
        } else {
          console.log('Failed to retrieve JWT');
        }
      } catch (error) {
        console.error('Error occurred while obtaining the token:', error);
      }


    }
  }

  getToken(): string | null {
    let token;
    if (this.isAuthenticated()) {
      token = localStorage.getItem(this.authTokenKey);
      console.log('got auth token');
    } else {
      token = localStorage.getItem(this.guestTokenKey);
      console.log('got guest token');
    }
    console.log('read lokal token: ' + token);
    if (token === null) {
      this.retrieveGuestToken();
      token = localStorage.getItem(this.guestTokenKey);
    }
    if (token) {
      this.roles = this.extractRolesFromToken(token);
    }
    return token;
  }

  getIdToken(): string | null {
    console.log('read lokal idToken');
    return localStorage.getItem(this.idTokenKey);
  }

  loginUser(username: string, password: string): Observable<number> {
    return this.http
      .post<AuthResponse>(this.tokenUrl, { username, password }, { observe: 'response' })
      .pipe(
        tap(response => {
          this.storeTokens(response.body!);
          this.roles = this.extractRolesFromToken(response.body!.jwt);
          console.log('Retrieved user token from server, with roles: ', this.roles);
        }),
        map(response => response.status),
        catchError((error: HttpErrorResponse) => {
          console.error('Error obtaining user token', error);
          return of(error.status || 500); // Emit false if there was an error
        })
      );
  }

  registerUser(username: string, password: string): Observable<number> {
    return this.http
      .post<AuthResponse>(this.registerUrl, { username, password }, { observe: 'response' })
      .pipe(
        map(response => response.status),
        catchError((error: HttpErrorResponse) => {
          console.error('Error obtaining user token', error);
          return of(error.status || 500); // Emit false if there was an error
        })
      );
  }

  private storeTokens(tokens: AuthResponse): void {
    localStorage.setItem(this.authTokenKey, tokens.jwt);
    localStorage.setItem(this.idTokenKey, tokens.idToken);
  }

  private storeGuestToken(token: string): void {
    localStorage.setItem(this.guestTokenKey, token);
  }

  clearTokens(): void {
    localStorage.removeItem(this.authTokenKey);
    localStorage.removeItem(this.guestTokenKey);
  }

  private isTokenValid(token: string): boolean {
    try {
      let payload = JSON.parse(atob(token.split('.')[1]));
      let expiration = payload.exp;
      let now = Math.floor(Date.now() / 1000);
      if (expiration < now) {
        const idToken = localStorage.getItem(this.idTokenKey) || '';
        if (idToken !== '') {
          this.getTokenByIdToken();
          if (localStorage.getItem(this.authTokenKey)) {
            return true;
          }
        } else {
          return false;
        }
      }
      return true;

    } catch (error) {
      console.error('Invalid token format', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    let token = localStorage.getItem(this.authTokenKey) || '';
    return (token !== '' && this.isTokenValid(token));
  }

  private extractRolesFromToken(token: string): string[] {
    const payload = this.decodeToken(token);
    return payload?.role || [];
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Invalid token format', error);
      return null;
    }
  }

  hasRole(role: string): boolean {
    this.isAuthenticated();
    return this.roles.includes(role);
  }
}

