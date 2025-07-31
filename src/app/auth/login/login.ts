import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}
login() {
  console.log(`Login con ${this.email}`);
  this.authService.login(this.email, this.password)
    .then((result) => {
      console.log('Usuario logueado:', result.user); // 👈 VERIFICAR ESTO
      alert('Login exitoso');
      this.router.navigate(['/']); // redirige al inicio
    })
    .catch(error => {
      alert(`Error al iniciar sesión: ${error.message}`);
      console.error(error);
    });
}
}