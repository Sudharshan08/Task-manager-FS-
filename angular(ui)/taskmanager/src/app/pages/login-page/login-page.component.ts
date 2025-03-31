import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  email: any;
  password: any;
  

constructor(private authService: AuthService, private router: Router){}

  //login method logic
 
  onLoginButtonClicked(email: string, password: string) {
    this.authService.login(email, password)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          console.log("Login successful!", res);
          console.log("Stored Refresh Token:", localStorage.getItem('x-refresh-token')); // Debugging
          setTimeout(() => {
            this.router.navigate(['/lists']);
          }, 100);
        },
        error: (err: any) => console.error("Login failed!", err),
      });
  }
}  