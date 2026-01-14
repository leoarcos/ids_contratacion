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
      NombreConcepto: ['', Validators.required],
      CCConcepto: ['', Validators.required],
      CC_CiudadConcepto: ['', Validators.required],
      NITConcepto: ['', Validators.required],
      DireccionConcepto: ['', Validators.required],
      CorreoConcepto: ['', Validators.required],
      TelefonoConcepto: ['', Validators.required],
      NumeroProcesoConcepto: ['', Validators.required],
      FechaProcesoConcepto: ['', Validators.required],
      RequisiosConcepto: ['', Validators.required],
      ValorContratoConcepto: ['', Validators.required],
      PlazoContratoConcepto: ['', Validators.required],
      ObjetoConcepto: ['', Validators.required],
      NumeroCDPConcepto: ['', Validators.required],
      FechaCDPConcepto: ['', Validators.required],
      RubroConcepto: ['', Validators.required],
      ObligacionesEspecificasConcepto: ['', Validators.required],
      ResponsableConcepto: ['', Validators.required],
      CargoResponsableConcepto: ['', Validators.required],
      ElaboroConcepto: ['', Validators.required],
      CargoElaboroConcepto: ['', Validators.required],
      RevisoConcepto: ['', Validators.required],
      CargoRevisoConcepto: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
