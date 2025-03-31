import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, shareReplay, tap } from 'rxjs';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private webService : WebRequestService, private router : Router, private http : HttpClient) { }

  
/*login(email:string, password:string):Observable <HttpResponse<any>>{
  return this.webService.login(email,password).pipe(
    shareReplay(),
    tap((res:HttpResponse<any>)=>{
      //auth will be in header of this res
      this.setSession(res.body?._id || '', res.headers.get('x-access-token') || '',res.headers.get('x-refresh-token') || '')
      //this.router.navigate(['/lists']);
    })
  )
}*/


getAuthHeaders(): HttpHeaders {
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'x-access-token': this.getAccessToken() || ''
  });
}


/*login(email: string, password: string) {
  return this.webService.post('users/login', { email, password }).pipe(
    take(1), // Ensures it completes after one response
    tap((res: any) => {
      if (res.token) {
        console.log('Token received:', res.token);
        localStorage.setItem('x-access-token', res.token);
      } else {
        console.error('No token received in response');
      }
    })
  );
}*/

//updated code 
login(email: string, password: string) {
  return this.webService.post<{ token: string, refreshToken: string, _id: string }>('users/login', { email, password })
    .pipe(
      tap((res) => {
        const accessToken = res.token || '';
        const refreshToken = res.refreshToken || '';
        const userId = res._id || '';

        if (accessToken && refreshToken && userId) {
          this.setSession(userId, accessToken, refreshToken);
        } else {
          console.error("Missing tokens in response!", res);
        }
      })
    );
}








signup(email:string, password:string):Observable <HttpResponse<any>>{
  return this.webService.signup(email,password).pipe(
    shareReplay(),
    tap((res:HttpResponse<any>)=>{
      //auth will be in header of this res
      this.setSession(res.body?._id || '', res.headers.get('x-access-token') || '',res.headers.get('x-refresh-token') || '')
      
    })
  )
}


private setSession(userId:string, accessToken:string, refreshToken:string){
  if (!accessToken || !refreshToken) {
    console.error("Missing access or refresh token!");
    return;
  }
  localStorage.setItem('user-id', userId);
  localStorage.setItem('x-access-token',accessToken);
  localStorage.setItem('x-refresh-token',refreshToken);
}

private removeSession(){
  localStorage.removeItem('user-id');
  localStorage.removeItem('x-access-token');
  localStorage.removeItem('x-refresh-token');
}

//for new accesstoken after expiry

/*getNewAccessToken() {
  return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
    headers: new HttpHeaders({
      'x-refresh-token': this.getRefreshToken() || '', // Ensure no null values
      '_id': this.getUserId() || '' // Ensure no null values
    }), 
    observe: 'response'
  }).pipe(
    tap((res: HttpResponse<any>) => {
      const newAccessToken = res.headers.get('x-access-token');
      if (newAccessToken) {
        this.setAccessToken(newAccessToken);
      } else {
        console.error("Access token not found in response headers");
      }
    })
  );
}*/

getNewAccessToken() {
  return this.http.get<{ accessToken: string }>(`${this.webService['ROOT_URL']
  }/users/me/access-token`, {
    headers: new HttpHeaders({
      'x-refresh-token': this.getRefreshToken() || '',
      '_id': this.getUserId() || ''
    })
  }).pipe(
    tap((res) => {
      if (res.accessToken) {
        console.log("New access token received:", res.accessToken);
        this.setAccessToken(res.accessToken);
      } else {
        console.error("Access token not found in response body");
      }
    })
  );
}





//logout method
logout(){
  this.removeSession();

  //this.router.navigateByUrl('/login');
  setTimeout(() => {
    this.router.navigateByUrl('/login');
  }, 0);
}

//get the refresh token 
//getRefreshToken(){
  //return localStorage.getItem('x-refresh-token');
//}

getRefreshToken() {
  const refreshToken = localStorage.getItem('x-refresh-token');
  console.log("Retrieved refresh token:", refreshToken);
  return refreshToken;
}


//method for new refresh token
getUserId(){
  return localStorage.getItem('user-id');
}


//code for the get access token for the web-req-interceptor
getAccessToken(){
  return localStorage.getItem('x-access-token');
}

setAccessToken(accessToken:string){
  localStorage.setItem('x-access-token',accessToken)
}

}
