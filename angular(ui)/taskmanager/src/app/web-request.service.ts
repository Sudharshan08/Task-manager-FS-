import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL;

  constructor(private http: HttpClient) {
    this.ROOT_URL = 'http://localhost:3000'
   }

  get(uri:string){
    return this.http.get(`${this.ROOT_URL}/${uri}`);
  }

  post<T>(uri:string, payload:Object):Observable<T>{
    return this.http.post<T>(`${this.ROOT_URL}/${uri}`, payload);
  }

  patch(uri:string, payload:Object){
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload);
  }

  delete(uri:string){
    return this.http.delete(`${this.ROOT_URL}/${uri}`);
  }
}
