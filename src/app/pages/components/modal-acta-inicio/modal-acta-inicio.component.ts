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
      FechaInicio: ['', Validators.required],
      NombreInicio: ['', Validators.required],
      CCInicio: ['', Validators.required],
      CC_CiudadInicio: ['', Validators.required],
      NITInicio: ['', Validators.required],
      DireccionInicio: ['', Validators.required],
      CorreoInicio: ['', Validators.required],
      TelefonoInicio: ['', Validators.required],
      NumeroProcesoInicio: ['', Validators.required],
      RequisiosInicio: ['', Validators.required],
      ValorContratoInicio: ['', Validators.required],
      PlazoContratoInicio: ['', Validators.required],
      ObjetoInicio: ['', Validators.required],
      NumeroCDPInicio: ['', Validators.required],
      FechaCDPInicio: ['', Validators.required],
      RubroInicio: ['', Validators.required],
      ObligacionesEspecificasInicio: ['', Validators.required],
      ElaboroInicio: ['', Validators.required],
      CargoElaboroInicio: ['', Validators.required],
      RevisoInicio: ['', Validators.required],
      CargoRevisoInicio: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
