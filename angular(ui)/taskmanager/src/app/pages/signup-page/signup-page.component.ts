import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: false,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss'
})
export class SignupPageComponent {

  constructor(private authService : AuthService){}

   onSignupButtonClicked(email: string, password: string) {
      this.authService.signup(email, password).subscribe((res:HttpResponse<any>)=>{
        console.log(res);
      })
       
}
}
