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
      variable: ['', Validators.required] 
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
