import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: ''
  };

  register() {
    console.log('Usuario registrado:', this.user);
    // Aquí podrías integrar Firebase o enviar datos a una API
    alert(`¡Bienvenido, ${this.user.name}!`);
  }
}