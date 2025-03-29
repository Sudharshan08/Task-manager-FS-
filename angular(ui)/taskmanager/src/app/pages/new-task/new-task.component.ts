import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from '../../models/task.model';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-new-task',
  standalone: false,
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss'
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService : TaskService, private route:ActivatedRoute, private router :Router){}

  listId!: string;

  ngOnInit(): void {
   this.route.params.subscribe(
    (params:Params)=>{
      this.listId = params['listId'];
    }
   )
  }
  

  createTask(title:string){
   this.taskService.createTask(title,this.listId).subscribe((newTask:Task)=>{
    this.router.navigate(['../'], {relativeTo: this.route});
   })
  }

}
