import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-crp',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './modal-crp.component.html',
  styleUrl: './modal-crp.component.css'
})
export class ModalCRPComponent {

  registro!: FormGroup;
  constructor(private fb: FormBuilder) { }
  ngOnInit(): void {
    this.registro = this.fb.group({
      FechaCRP: ['', Validators.required],
      NombreCRP: ['', Validators.required],
      CCCRP: ['', Validators.required],
      CC_CiudadCRP: ['', Validators.required],
      NITCRP: ['', Validators.required],
      DireccionCRP: ['', Validators.required],
      CorreoCRP: ['', Validators.required],
      TelefonoCRP: ['', Validators.required],
      NumeroProcesoCRP: ['', Validators.required],
      FechaProcesoCRP: ['', Validators.required],
      RequisiosCRP: ['', Validators.required],
      ValorContratoCRP: ['', Validators.required],
      PlazoContratoCRP: ['', Validators.required],
      ObjetoCRP: ['', Validators.required],
      NumeroCDPCR: ['', Validators.required],
      FechaCDPCRP: ['', Validators.required],
      RubroCRP: ['', Validators.required],
      ObligacionesEspecificasCRP: ['', Validators.required],
      ProyectaCRP: ['', Validators.required],
      CargoProyectaCRP: ['', Validators.required],
      DigitaCRP: ['', Validators.required],
      CargoDigitaCRP: ['', Validators.required],
      ElaboroCRP: ['', Validators.required],
      CargoElaboroCRP: ['', Validators.required],
      RevisoCRP: ['', Validators.required],
      CargoRevisoCRP: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
