import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EncuestaService } from '../../services/encuesta.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-encuesta-fronteriza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encuesta-fronteriza.component.html',
  styleUrls: ['./encuesta-fronteriza.component.css']
})
export class EncuestaFronterizaComponent implements OnInit {
  municipios = [
    'ÁBREGO', 'ARBOLEDAS', 'BOCHALEMA', 'BUCARASICA', 'CÁCOTA', 'CÁCHIRA', 'CHINÁCOTA', 
    'CHITAGÁ', 'CONVENCIÓN', 'CÚCUTA', 'CUCUTILLA', 'DURANIA', 'EL CARMEN', 'EL TARRA', 
    'EL ZULIA', 'GRAMALOTE', 'HACARÍ', 'HERRÁN', 'LA ESPERANZA', 'LA PLAYA DE BELÉN', 
    'LABATECA', 'LOS PATIOS', 'LOURDES', 'MUTISCUA', 'OCAÑA', 'PAMPLONA', 'PAMPLONITA', 
    'PUERTO SANTANDER', 'RAGONVALIA', 'SALAZAR DE LAS PALMAS', 'SAN CALIXTO', 'SAN CAYETANO', 
    'SANTIAGO', 'SARDINATA', 'SILOS', 'TEORAMA', 'TIBÚ', 'TOLEDO', 'VILLA CARO', 'VILLA DEL ROSARIO'
  ].sort();
  puentesInternacionales = ['FRANCISCO DE PAULA SANTANDER', 'PUENTE LA UNION', 'SIMON BOLIVAR', 'ATANASIO GIRARDOT'];
  estadosPasos = ['HABILITADO', 'RESTRINGIDO', 'CERRADO'];

  registros: any[] = [];
  nuevaEncuesta: any = this.resetForm();
  idEdicion: string | null = null; // Controla si es edición o creación
  usuario$: any;
  // Variable para guardar el resumen
  resumenMunicipios: { nombre: string, total: number }[] = [];
  constructor(private router: Router,private encuestaService: EncuestaService, private authService: AuthService, private sessionService: SessionService) {
    
        setTimeout(() =>{
          
          // Verificar si ya está loggeado
          this.authService.usuario$.subscribe(async user => {
            if (user) {
              console.log('Usuario loggeado:', user.email);
             // this.user=user;
              this.sessionService.usuario$.subscribe(usuario => {
                if (usuario) {
                  this.usuario$ =usuario;
                  console.log("Usuario loggeado:", usuario);
                  console.log("Nombre:", usuario.nombres);
                  console.log("Correo:", usuario.correo);
                } 
              }); 
              
              
            } else {
            
              console.log('No hay sesión activa');
              Swal.fire({
                title: 'Sesion cerrada!',
                text: '❌ No existe usuario en sesión',
                icon: 'warning', 
                confirmButtonColor: '#d33',
                confirmButtonText: 'Aceptar'
              }).then((result) => {
                if (result.isConfirmed) {
                  // 🔹 Aquí pones la acción que quieres ejecutar al dar clic en Aceptar
                  console.log("✅ Usuario confirmó el mensaje");
                  // Por ejemplo, redirigir al login:
                  this.router.navigate(['/login']);
                }
              });
              //this.router.navigate(['/login']); // ✅ redirigir si no está loggeado
              
            }
          });
        },1000);
  }

  ngOnInit() {
    this.encuestaService.getEncuestas().subscribe(data => {
      this.registros = data;
    });
  }

  async guardarRegistro() {
    if (this.idEdicion) {
      await this.encuestaService.updateEncuesta(this.idEdicion, this.nuevaEncuesta);
    } else {
      await this.encuestaService.addEncuesta(this.nuevaEncuesta);
    }
    this.cancelarEdicion();
  }

  prepararEdicion(item: any) {
    this.idEdicion = item.id;
    this.nuevaEncuesta = { ...item };
  }

  cancelarEdicion() {
    this.idEdicion = null;
    this.nuevaEncuesta = this.resetForm();
  }

  async eliminar(id: string) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      await this.encuestaService.deleteEncuesta(id);
    }
  }

  resetForm() {
    return {
      municipio: '', frontera: 'Fronterizo', puenteFronterizo: 'NO', 
      puenteInternacional: '', estadoPasos: 'HABILITADO', novedadFrontera: 'NO', 
      cualNovedad: '', lugar: '', fechaHora: '', alojamientoTemporal: 'NO', 
      numPersonas: 0, observaciones: '', reporta: ''
    };
  }
  // Método para calcular el conteo
  generarResumenMunicipios() {
    // 1. Obtener la fecha actual en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    // 2. Filtrar solo los registros que coincidan con el día de hoy
    // Asumiendo que r.fechaHora viene como string "YYYY-MM-DDTHH:mm" o similar
    const registrosHoy = this.registros.filter(r => {
      if (!r.fechaHora) return false;
      return r.fechaHora.startsWith(hoy);
    });

    // 3. Mapear los municipios usando solo los registros filtrados
    const conteo = this.municipios.map(muni => {
      return {
        nombre: muni,
        total: registrosHoy.filter(r => r.municipio === muni).length
      };
    });

    // 4. Ordenar de mayor a menor y asignar
    this.resumenMunicipios = conteo.sort((a, b) => b.total - a.total);
  }
  
}