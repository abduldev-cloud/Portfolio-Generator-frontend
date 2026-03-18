import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  mode: 'login' | 'register' = 'login';
  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin']);
    }
  }

  submit() {
    this.error = '';
    this.loading = true;

    if (this.mode === 'login') {
      this.authService.login(this.username, this.password).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/portfolio']);
          }
        },
        error: (err) => {
          this.error = err.error?.error || 'Login failed.';
          this.loading = false;
        }
      });
    } else {
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/portfolio']);
        },
        error: (err) => {
          this.error = err.error?.error || 'Registration failed.';
          this.loading = false;
        }
      });
    }
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }
}
