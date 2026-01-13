import { Component } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  loginForm: FormGroup;
  submitted=false;
  submittedbtn=false;
  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  ngOnInit() {
    // Verificar si ya está loggeado
    this.authService.usuario$.subscribe(user => {
      if (user) {
        console.log('Usuario loggeado:', user.email);
        this.router.navigate(['/dashboard']); // ✅ redirigir si ya está loggeado
      } else {
        console.log('No hay sesión activa');
      }
    });
  }

  get form(){
    return this.loginForm.controls;
  }
  async onLogin() {  
    this.submitted=true;
    this.submittedbtn=true; 
    console.log(this.form); 
    console.log('Login con:', this.loginForm);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Login con:', email, password);
    
      // Aquí conectas tu servicio de autenticación
      
      const res = await this.authService.loginUser(email, password);

      if (res.success) {
 
        // aquí podrías redirigir a dashboard
        Swal.fire({
          icon: 'success',
          title: 'Ingreso exitoso',
          text: `✅ Bienvenido ${res.correo}`,
          confirmButtonColor: '#d33'
        });
        this.submittedbtn=false; 
        
        this.router.navigate(['/dashboard']);
      } else { 
        
         Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `❌ ${res.error}`,
          confirmButtonColor: '#d33'
        });
        this.submittedbtn=false; 
        
      }
    }else{
       Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `❌ Complete todos los campos`,
          confirmButtonColor: '#d33'
        });
        this.submittedbtn=false; 
    }
  }
  recuperarContrasena(){
    console.log('recuperando contraseña');
    this.router.navigate(['/recuperar']);
  }
}
