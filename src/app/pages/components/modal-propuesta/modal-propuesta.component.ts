import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-propuesta',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-propuesta.component.html',
  styleUrl: './modal-propuesta.component.css'
})
export class ModalPropuestaComponent {

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
