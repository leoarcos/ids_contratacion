import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent {
  recuperarForm: FormGroup;
  submitted = false;
  mensaje = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get form() {
    return this.recuperarForm.controls;
  }

  onRecuperar() {
    this.submitted = true;
    if (this.recuperarForm.valid) {
      const { email } = this.recuperarForm.value;
      // Aquí iría tu llamada al backend
      this.mensaje = `Se han enviado instrucciones al correo: ${email}`;
    }
  }
  atras(){
    
    this.router.navigate(['/login']);
  }
}
