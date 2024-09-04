import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getToken', 'getIdToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: AuthService, useValue: spy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const service: AuthInterceptor = TestBed.inject(AuthInterceptor);
    expect(service).toBeTruthy();
  });

  it('should add an Authorization header for authenticated requests', () => {
    const token = 'test-token';
    authServiceSpy.getToken.and.returnValue(token);

    httpClient.get('/api/some-endpoint').subscribe();

    const req = httpMock.expectOne('/api/some-endpoint');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add an Authorization header for guest authentication requests', () => {
    httpClient.get('/api/authenticate/guest').subscribe();

    const req = httpMock.expectOne('/api/authenticate/guest');
    expect(req.request.headers.has('Authorization')).toBeFalse();
  });

  it('should add an id-token for refresh requests', () => {
    const idToken = 'id-token';
    authServiceSpy.getIdToken.and.returnValue(idToken);

    httpClient.get('/api/authenticate/refresh').subscribe();

    const req = httpMock.expectOne('/api/authenticate/refresh');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${idToken}`);
  });
});
