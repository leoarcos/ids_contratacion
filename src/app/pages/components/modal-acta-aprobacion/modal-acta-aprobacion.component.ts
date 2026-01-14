import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-acta-aprobacion',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-acta-aprobacion.component.html',
  styleUrl: './modal-acta-aprobacion.component.css'
})
export class ModalActaAprobacionComponent {

  registro!: FormGroup;
  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
    this.registro = this.fb.group({
      FechaAprovacion: ['', Validators.required],
      NombreAprovacion: ['', Validators.required],
      CC_Aprovacion: ['', Validators.required],
      DepartamentoCC_Aprovacion: ['', Validators.required],
      CiudadCC_Aprovacion: ['', Validators.required],
      NIT_Aprovacion: ['', Validators.required],
      DireccionAprovacion: ['', Validators.required],
      CorreoAprovacion: ['', Validators.required],
      TelefonoAprovacion: ['', Validators.required],
      NumeroProcesoAprovacion: ['', Validators.required],
      FechaProcesoAprovacion: ['', Validators.required],
      RequisiosAprovacion: ['', Validators.required],
      ValorContratoAprovacion: ['', Validators.required],
      PlazoContratoAprovacion: ['', Validators.required],
      ObjetoAprovacion: ['', Validators.required],
      NumeroCDPAprovacion: ['', Validators.required],
      FechaCDPAprovacion: ['', Validators.required],
      RubroAprovacion: ['', Validators.required],
      ObligacionesEspecificasAprovacion: ['', Validators.required],
      NumeroPolizaAprovacion: ['', Validators.required],
      FechaPolizaAprovacion: ['', Validators.required],
      CompaniaAprovacion: ['', Validators.required],
      CompaniaNITAprovacion: ['', Validators.required],
      FechaDEinicio: ['', Validators.required],
      FechaDEfin: ['', Validators.required],
      ObservacionesAprovacion: ['', Validators.required],
      ResponsableAprovacion: ['', Validators.required],
      CargoResponsableAprovacion: ['', Validators.required],
      ElaboroAprovacion: ['', Validators.required],
      CargoElaboroAprovacion: ['', Validators.required],
      RevisoAprovacion: ['', Validators.required],
      CargoRevisoAprovacion: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
