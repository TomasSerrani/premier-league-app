import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService) {}

  register() {
  this.authService
    .register(this.user.email, this.user.password, this.user.name)
    .then(() => {
      alert('✅ Usuario registrado correctamente');
    })
    .catch(error => {
      alert(`❌ Error al registrar: ${error.message}`);
    });
}
}