import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-concepto-jueridico',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-concepto-jueridico.component.html',
  styleUrl: './modal-concepto-jueridico.component.css'
})
export class ModalConceptoJueridicoComponent {

  registro!: FormGroup;
  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
     
    
    this.registro = this.fb.group({ 
      FechaConcepto: ['', Validators.required],
      NITConcepto: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
