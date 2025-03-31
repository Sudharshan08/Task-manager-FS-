import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { List } from '../../models/list.model';
import { Task } from '../../models/task.model';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-task-view',
  standalone: false,
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})
export class TaskViewComponent implements OnInit {

  lists!: List[];
  //if getting error then remove the undefined from here
  tasks: Task[] =[]

  constructor(private taskService : TaskService , private route: ActivatedRoute, private router : Router){}

  ngOnInit(): void {
//redirects to login page if unauth 
    if (!localStorage.getItem('x-access-token')) { 
      this.router.navigate(['/login']);
      return;
    }

      /*this.route.params.subscribe(
        (params : Params)=>{
          if(params['listId']){
            this.taskService.getTasks(params['listId']).subscribe((tasks: any)=>{
              this.tasks= tasks;
          //change to params.listId if getting error in near future
          })
      }else{
        this.tasks= [];
      }
    }
    )
//lists:any[] in the below line if getting any error in future
      this.taskService.getLists().subscribe((lists:any)=>{
        this.lists = lists;
      })
  }*/

      this.route.params.subscribe((params: Params) => {
        if (params['listId']) {
          this.loadTasks(params['listId']);
        } else {
          this.tasks = [];
        }
      });
    
      this.loadLists();
    }
    
    loadLists() {
      this.taskService.getLists().subscribe((lists: any) => {
        this.lists = lists;
      });
    }
    
    loadTasks(listId: string) {
      this.taskService.getTasks(listId).subscribe((tasks: any) => {
        this.tasks = tasks;
      });
    }
  
  //method for showing finished task
  OnTaskClick(task:Task){
    this.taskService.complete(task).subscribe(()=>{
      console.log("Completed");
      //set to completed successfully
      task.completed= !task.completed;
    })
  }
  
}
