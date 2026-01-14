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
      FechaIdoneidad: ['', Validators.required],
      NombreIdoneidad: ['', Validators.required],
      CCIdoneidad: ['', Validators.required],
      CC_CiudadIdoneidad: ['', Validators.required],
      NITIdoneidad: ['', Validators.required],
      DireccionIdoneidad: ['', Validators.required],
      CorreoIdoneidad: ['', Validators.required],
      TelefonoIdoneidad: ['', Validators.required],
      NumeroProcesoIdoneidad: ['', Validators.required],
      RequisiosIdoneidad: ['', Validators.required],
      ValorContratoIdoneidad: ['', Validators.required],
      PlazoContratoIdoneidad: ['', Validators.required],
      ObjetoIdoneidad: ['', Validators.required],
      NumeroCDPIdoneidad: ['', Validators.required],
      FechaCDPIdoneidad: ['', Validators.required],
      RubroIdoneidad: ['', Validators.required],
      ObligacionesEspecificasIdoneidad: ['', Validators.required],
      ServidorPublicoIdoneidad: ['', Validators.required],
      EmpleadoSectorPublicoIdoneidad: ['', Validators.required],
      TrabajadorIndependienteIdoneidad: ['', Validators.required],
      ElaboroIdoneidad: ['', Validators.required],
      CargoElaboroIdoneidad: ['', Validators.required],
      RevisoIdoneidad: ['', Validators.required],
      CargoRevisoIdoneidad: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
