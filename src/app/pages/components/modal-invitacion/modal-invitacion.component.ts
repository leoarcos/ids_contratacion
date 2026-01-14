import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-invitacion',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-invitacion.component.html',
  styleUrl: './modal-invitacion.component.css'
})
export class ModalInvitacionComponent {

  registro!: FormGroup;
  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
     
    
    this.registro = this.fb.group({ 
      FechaInvitacion: ['', Validators.required], 
      NombreInvitacion: ['', Validators.required],
      CCInvitacion: ['', Validators.required],
      CC_CiudadInvitacion: ['', Validators.required],
      DireccionInvitacion: ['', Validators.required], 
      CorreoInvitacion: ['', Validators.required], 
      TelefonoInvitacion: ['', Validators.required], 
      NumeroProcesoInvitacion: ['', Validators.required], 
      RequisiosInvitacion: ['', Validators.required], 
      ElaboroInvitacion: ['', Validators.required], 
      RevisoInvitacion: ['', Validators.required] 
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
