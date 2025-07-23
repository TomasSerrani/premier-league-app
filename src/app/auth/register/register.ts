import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  register() {
    console.log('Usuario registrado:', this.user);
    alert(`¡Bienvenido, ${this.user.name}!`);
  }
}