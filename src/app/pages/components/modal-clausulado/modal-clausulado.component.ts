import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-clausulado',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-clausulado.component.html',
  styleUrl: './modal-clausulado.component.css'
})
export class ModalClausuladoComponent {

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
