/*import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, empty, Observable, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService : AuthService) { }

  refreshingAccessToken!: boolean;

  intercept(request:HttpRequest<any>, next:HttpHandler):Observable<any>{

    //handle the req
    request = this.addAuthHeader(request);
    return next.handle(request).pipe(
      catchError((error:HttpErrorResponse)=>{
        console.log(error);

        if(error.status === 401 && !this.refreshingAccessToken){
          //401 error

          //refresh the access token 
          return this.refreshAccessToken()
          .pipe(switchMap(()=>{
            request = this.addAuthHeader(request);
            return next.handle(request);
          }),
        )
        }

        return throwError(() => error);
      })
    )
  }

  refreshAccessToken(){
    //call a method in auth service 
    this.refreshingAccessToken = true;
    return this.authService.getNewAccessToken().pipe(
      tap(()=>{
      this.refreshingAccessToken = false;
        console.log("access token refreshed");
      }),
      catchError((err:any)=>{
        console.log(err);
        this.authService.logout();
        return empty();
      })
    )
  }

  addAuthHeader(request:HttpRequest<any>){
    //get the access token
    const token = this.authService.getAccessToken();

    if(token){
      return request.clone({
        setHeaders:{
          'x-access-token':token
        }
      })
    }
    return request;
  }
}*/





//updated code

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  private refreshingAccessToken: boolean = false;
  private accessTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("HTTP Error:", error);

        if (error.status === 401) {
          if (error.error?.message?.toLowerCase().includes("jwt expired")) {
            return this.handle401Error(request, next);
          } else {
            console.warn("Unauthorized request, possibly missing tokens. Logging out.");
            this.authService.logout();
            return EMPTY;
          }
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.refreshingAccessToken) {
      this.refreshingAccessToken = true;
      this.accessTokenSubject.next(null);
  
      return this.authService.getNewAccessToken().pipe(
        switchMap((response: any) => {
          const newToken = response?.accessToken;
  
          if (!newToken) {
            console.warn("No new access token received. Logging out.");
            this.authService.logout();
            return throwError(() => new Error("Session expired. Please log in again."));
          }
  
          console.log("Access token refreshed:", newToken);
          this.refreshingAccessToken = false;
          this.accessTokenSubject.next(newToken);
  
          // **Retry the original request with new token**
          return next.handle(this.addAuthHeader(request));
        }),
        catchError((err) => {
          console.error("Refresh token expired or invalid:", err);
          this.refreshingAccessToken = false;
          this.authService.logout();
          return EMPTY;
        })
      );
    } else {
      return this.accessTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addAuthHeader(request)))
      );
    }
  }
  

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getAccessToken();

    if (!token) {
      console.warn("No access token found. Request might fail.");
    }

    return token ? request.clone({
      setHeaders: { 'x-access-token': token }
    }) : request;
  }
}
