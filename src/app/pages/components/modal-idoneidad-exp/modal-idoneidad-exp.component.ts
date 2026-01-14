import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-idoneidad-exp',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-idoneidad-exp.component.html',
  styleUrl: './modal-idoneidad-exp.component.css'
})
export class ModalIdoneidadExpComponent {

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
