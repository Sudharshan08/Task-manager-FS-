import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './auth.service';
import { List } from './models/list.model';
import { Task } from './models/task.model';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService : WebRequestService, private authService : AuthService) { }

  createList(title:string):Observable<List>{
    //web request to send a list
    return this.webReqService.post<List>('lists', {title});
}


  //for creating new tasks
  createTask(title:string, listId:string):Observable<Task>{
    //web request to send a list
    return this.webReqService.post<Task>(`lists/${listId}/tasks`, {title});
  }

  //code for the get list in task-view component
  getLists(){
    return this.webReqService.get('lists');
  }

  /*getTasks(listId:string){
    const headers = new HttpHeaders({
      'x-access-token': localStorage.getItem('x-access-token') || ''
    });
    return this.webReqService.get(`lists/${listId}/tasks`);
  }*/

    getTasks(listId: string) {
      return this.webReqService.get(`lists/${listId}/tasks`);
    }

  //method for showing completion
  complete(task:Task){
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, {
      completed:!task.completed,
    })
  }
}
