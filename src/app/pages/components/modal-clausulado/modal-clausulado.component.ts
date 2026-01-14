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
      FechaClausulado: ['', Validators.required],
      NombreClausulado: ['', Validators.required],
      CCClausulado: ['', Validators.required],
      CC_CiudadClausulado: ['', Validators.required],
      NITClausulado: ['', Validators.required],
      DireccionClausulado: ['', Validators.required],
      CorreoClausulado: ['', Validators.required],
      TelefonoClausulado: ['', Validators.required],
      NumeroProcesoClausulado: ['', Validators.required],
      RequisiosClausulado: ['', Validators.required],
      ValorContratoClausulado: ['', Validators.required],
      PlazoContratoClausulado: ['', Validators.required],
      ObjetoClausulado: ['', Validators.required],
      NumeroCDPClausulado: ['', Validators.required],
      FechaCDPClausulado: ['', Validators.required],
      RubroClausulado: ['', Validators.required],
      ObligacionesEspecificasClausulado: ['', Validators.required],
      ElaboroClausulado: ['', Validators.required],
      CargoElaboroClausulado: ['', Validators.required],
      RevisoClausulado: ['', Validators.required],
      CargoRevisoClausulado: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
