import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL;

  constructor(private http: HttpClient, private injector: Injector) {
    this.ROOT_URL = 'http://localhost:3000'
   }

   private get authService(): AuthService {
    return this.injector.get(AuthService);  // Lazily inject AuthService
  }

  //get(uri: string,){
   // return this.http.get(`${this.ROOT_URL}/${uri}`,  );
  //}

  get(uri: string): Observable<any> {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    
    if (token) {
      headers = headers.set('x-access-token', token);
    }
  
    return this.http.get(`${this.ROOT_URL}/${uri}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn("Unauthorized. Refreshing token...");
          return this.refreshAccessToken().pipe(
            switchMap(newToken => {
              localStorage.setItem('x-access-token', newToken);
              return this.http.get(`${this.ROOT_URL}/${uri}`, {
                headers: new HttpHeaders({ 'x-access-token': newToken })
              });
            }),
            catchError(err => {
              console.error("Token refresh failed. Logging out...");
              this.authService.logout();
              return throwError(() => err);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
  
 

  //post<T>(uri: string, payload: Object,):Observable<T>{
    //return this.http.post<T>(`${this.ROOT_URL}/${uri}`, payload ,);
  //}

  /*post<T>(uri: string, payload: Object): Observable<T> {
    const token = localStorage.getItem('x-access-token');
  
    // Ensure token is available
    if (!token) {
      console.error("No authentication token found!");
      return throwError(() => new Error("No authentication token found"));
    }
  
    const headers = new HttpHeaders({
      'x-access-token': token // Include token
    });
  
    return this.http.post<T>(`${this.ROOT_URL}/${uri}`, payload, { headers });
  }*/

    post<T>(uri: string, payload: Object, includeToken: boolean = true): Observable<T> {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
      // Only include the token if includeToken is true
      if (includeToken) {
          const token = localStorage.getItem('x-access-token');
          if (token) {
              headers = headers.set('x-access-token', token);
          } else {
              console.warn("No authentication token found, skipping authorization...");
          }
      }
  
      return this.http.post<T>(`${this.ROOT_URL}/${uri}`, payload, { headers }).pipe(
          catchError((error: HttpErrorResponse) => {
              if (error.status === 401 && includeToken) {  // Only refresh token if authorization was needed
                  console.warn("Unauthorized. Refreshing token...");
                  return this.refreshAccessToken().pipe(
                      switchMap(newToken => {
                          localStorage.setItem('x-access-token', newToken);
                          return this.http.post<T>(`${this.ROOT_URL}/${uri}`, payload, {
                              headers: new HttpHeaders({
                                  'Content-Type': 'application/json',
                                  'x-access-token': newToken
                              })
                          });
                      }),
                      catchError(err => {
                          console.error("Token refresh failed. Logging out...");
                          this.authService.logout();
                          return throwError(() => err);
                      })
                  );
              }
              return throwError(() => error);
          })
      );
  }
  
    

  
  // Inject AuthService

  refreshAccessToken(): Observable<string> {
    const refreshToken = localStorage.getItem('x-refresh-token');
    const userId = localStorage.getItem('user-id');

    if (!refreshToken || !userId) {
      console.error("No refresh token found, logging out...");
      this.authService.logout(); // Now this works without circular dependency
      return throwError(() => new Error("No refresh token found"));
    }

    return this.http.get<{ accessToken: string }>(`${this.ROOT_URL}/users/me/access-token`, {
      headers: new HttpHeaders({
        'x-refresh-token': refreshToken,
        '_id': userId
      })
    }).pipe(
      map(response => response.accessToken)
    );
  }




  patch(uri:string, payload:Object){
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload);
  }

  delete(uri:string){
    return this.http.delete(`${this.ROOT_URL}/${uri}`);
  }

  //for the signig method in auth service

  login(email:string, password:string){
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email,
      password,
    },{observe: 'response'});
  }

  signup(email:string, password:string){
    return this.http.post(`${this.ROOT_URL}/users`, {
      email,
      password,
    },{observe: 'response'});
  }

}
