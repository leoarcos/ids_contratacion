import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-designacion',
  standalone: true,
    imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-designacion.component.html',
  styleUrl: './modal-designacion.component.css'
})
export class ModalDesignacionComponent {

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
