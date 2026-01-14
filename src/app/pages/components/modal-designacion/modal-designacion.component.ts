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
      FechaDesignacion: ['', Validators.required],
      NombreDesignacion: ['', Validators.required],
      CCDesignacion: ['', Validators.required],
      CC_CiudadDesignacion: ['', Validators.required],
      NITDesignacion: ['', Validators.required],
      DireccionDesignacion: ['', Validators.required],
      CorreoDesignacion: ['', Validators.required],
      TelefonoDesignacion: ['', Validators.required],
      NumeroProcesoDesignacion: ['', Validators.required],
      FechaProcesoDesignacion: ['', Validators.required],
      RequisiosDesignacion: ['', Validators.required],
      ValorContratoDesignacion: ['', Validators.required],
      PlazoContratoDesignacion: ['', Validators.required],
      ObjetoDesignacion: ['', Validators.required],
      NumeroCDPDesignacion: ['', Validators.required],
      FechaCDPDesignacion: ['', Validators.required],
      RubroDesignacion: ['', Validators.required],
      ObligacionesEspecificasDesignacion: ['', Validators.required],
      ElaboroDesignacion: ['', Validators.required],
      CargoElaboroDesignacion: ['', Validators.required],
      RevisoDesignacion: ['', Validators.required],
      CargoRevisoDesignacion: ['', Validators.required]
    });
  }
  
  guardar(){
    console.log('guardado');
  }

}
