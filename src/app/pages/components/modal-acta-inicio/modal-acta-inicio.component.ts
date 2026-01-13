import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-acta-inicio',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-acta-inicio.component.html',
  styleUrl: './modal-acta-inicio.component.css'
})
export class ModalActaInicioComponent {

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
