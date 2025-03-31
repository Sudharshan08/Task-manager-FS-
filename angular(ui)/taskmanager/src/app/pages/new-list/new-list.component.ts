import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { List } from '../../models/list.model';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-new-list',
  standalone: false,
  templateUrl: './new-list.component.html',
  styleUrl: './new-list.component.scss'
})
export class NewListComponent {

    constructor(private taskService: TaskService, private router : Router){}

  createList(title:string){
    //in the response:any update to Task or list based on problem
    this.taskService.createList(title).subscribe((list : List)=>{
      console.log(list);
      //now navigate to lists/response.id phase
      this.router.navigate(['/lists', list._id]);
    });
  }
    
}
