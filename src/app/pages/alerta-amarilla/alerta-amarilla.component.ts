import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaAmarillaService } from '../../services/alerta-amarilla.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alerta-amarilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerta-amarilla.component.html',
  styleUrls: ['./alerta-amarilla.component.css']
})
export class AlertaAmarillaComponent implements OnInit {
  // Listado de municipios para los selects
  municipios = [
    'ÁBREGO', 'ARBOLEDAS', 'BOCHALEMA', 'BUCARASICA', 'CÁCOTA', 'CÁCHIRA', 'CHINÁCOTA', 
    'CHITAGÁ', 'CONVENCIÓN', 'CÚCUTA', 'CUCUTILLA', 'DURANIA', 'EL CARMEN', 'EL TARRA', 
    'EL ZULIA', 'GRAMALOTE', 'HACARÍ', 'HERRÁN', 'LA ESPERANZA', 'LA PLAYA DE BELÉN', 
    'LABATECA', 'LOS PATIOS', 'LOURDES', 'MUTISCUA', 'OCAÑA', 'PAMPLONA', 'PAMPLONITA', 
    'PUERTO SANTANDER', 'RAGONVALIA', 'SALAZAR DE LAS PALMAS', 'SAN CALIXTO', 'SAN CAYETANO', 
    'SANTIAGO', 'SARDINATA', 'SILOS', 'TEORAMA', 'TIBÚ', 'TOLEDO', 'VILLA CARO', 'VILLA DEL ROSARIO'
  ].sort();

  registros: any[] = [];
  nuevaAlerta: any = this.resetForm();
  idEdicion: string | null = null;
  usuario$: any;

  constructor(
    private router: Router,
    private alertaService: AlertaAmarillaService,
    private authService: AuthService,
    private sessionService: SessionService
  ) {
    // Verificación de sesión
    setTimeout(() => {
      this.authService.usuario$.subscribe(async user => {
        if (user) {
          this.sessionService.usuario$.subscribe(usuario => {
            if (usuario) {
              this.usuario$ = usuario;
            }
          });
        } else {
          this.showSessionError();
        }
      });
    }, 1000);
  }

  ngOnInit() {
    // Carga de datos desde Firebase
    this.alertaService.getAlertas().subscribe(data => {
      this.registros = data;
    });
  }

  // --- MÉTODOS DE ACCIÓN ---

  async guardarRegistro() {
    // Validar que se haya seleccionado municipio
    if (!this.nuevaAlerta.municipio || !this.nuevaAlerta.ese) {
      Swal.fire('Error', 'ESE y Municipio son obligatorios', 'error');
      return;
    }

    try {
      if (this.idEdicion) {
        await this.alertaService.updateAlerta(this.idEdicion, this.nuevaAlerta);
      } else {
        // Al guardar nuevo, podemos adjuntar quién reporta según la sesión
        this.nuevaAlerta.reportadoPor = this.usuario$?.nombres || 'Anónimo';
        await this.alertaService.addAlerta(this.nuevaAlerta);
      }
      this.cancelarEdicion();
    } catch (error) {
      console.error("Error al procesar:", error);
    }
  }

  prepararEdicion(item: any) {
    this.idEdicion = item.id;
    // Clonamos el objeto para no modificar la tabla en vivo mientras editamos
    this.nuevaAlerta = { ...item };
  }

  cancelarEdicion() {
    this.idEdicion = null;
    this.nuevaAlerta = this.resetForm();
  }

  async eliminar(id: string) {
    const result = await Swal.fire({
      title: '¿Está seguro de eliminar este registro?',
      text: "Esta acción borrará la información de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4cae4cff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await this.alertaService.deleteAlerta(id);
    }
  }

  // --- UTILIDADES ---

  resetForm() {
    return {
      ese: '',
      municipio: '',
      // Equipos Básicos de Salud (EBS)
      ebsAsignados: 0,
      ebsContratados: 0,
      ebsConformacion: '',
      ebsFechaInicio: '',
      ebsMigrantesAtendidos: 0,
      ebsVictimasCatatumbo: 0,
      ebsObservaciones: '',
      // Equipos Especialistas (EES)
      eesAsignados: 0,
      eesContratados: 0,
      eesConformacion: '',
      eesFechaInicio: '',
      eesMigrantesAtendidos: 0,
      eesVictimasCatatumbo: 0,
      eesObservaciones: ''
    };
  }

  private showSessionError() {
    Swal.fire({
      title: 'Sesión cerrada',
      text: 'No existe un usuario activo en el sistema.',
      icon: 'warning',
      confirmButtonColor: '#d70528',
      confirmButtonText: 'Ir al Login'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }
}