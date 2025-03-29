import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
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
  tasks!: Task[];

  constructor(private taskService : TaskService , private route: ActivatedRoute){}

  ngOnInit(): void {
      this.route.params.subscribe(
        (params : Params)=>{
          console.log(params);
          //change to params.listId if getting error in near future
          this.taskService.getTasks(params['listId']).subscribe((tasks: any)=>{
            this.tasks= tasks;
          })
      }
    )
//lists:any[] in the below line if getting any error in future
      this.taskService.getLists().subscribe((lists:any)=>{
        this.lists = lists;
      })
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
