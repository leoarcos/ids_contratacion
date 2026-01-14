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
      FechaPropuesta: ['', Validators.required],
      NombrePropuesta: ['', Validators.required],
      CCPropuesta: ['', Validators.required],
      CC_CiudadPropuesta: ['', Validators.required],
      NITPropuesta: ['', Validators.required],
      DireccionPropuesta: ['', Validators.required],
      CorreoPropuesta: ['', Validators.required],
      TelefonoPropuesta: ['', Validators.required],
      NumeroProcesoPropuesta: ['', Validators.required],
      RequisiosPropuesta: ['', Validators.required],
      ValorContratoPropuesta: ['', Validators.required],
      PlazoContratoPropuesta: ['', Validators.required],
      ObjetoPropuesta: ['', Validators.required],
      NumeroCDPPropuesta: ['', Validators.required],
      FechaCDPPropuesta: ['', Validators.required],
      RubroPropuesta: ['', Validators.required],
      ObligacionesEspecificasPropuesta: ['', Validators.required],
      ElaboroPropuesta: ['', Validators.required],
      CargoElaboroPropuesta: ['', Validators.required],
      RevisoPropuesta: ['', Validators.required],
      CargoRevisoPropuesta: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
