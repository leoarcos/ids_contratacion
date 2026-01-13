import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { FirebaseService } from '../services/firebase.service';
import { SessionService } from '../services/session.service';
import { SpinnerComponent } from '../pages/spinner/spinner.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent { 

   isOpen = false;
   user:any;
  usuario$: any;

  loading = false;

  constructor( private router: Router, private authService: AuthService, private fbService: FirebaseService,private sessionService: SessionService) {
    this.router.events.subscribe(event => {
      console.log(event);
      
        this.loading = true;
      /*
      
      if (event instanceof NavigationStart) {
        this.loading = true;
      }
       */

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loading = false, 3500);
      }
    });
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
    },3000);

  }
  ngOnInit() {
    
  }
 
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  cerrarSesion() {
    Swal.fire({
      title: 'Confirmar Cerrar sesión',
      html: `
        <p>Se cerrara la sesión actual</p>
        
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().then(() => {
          console.log('✅ Sesión cerrada');
          this.router.navigate(['/login']); // redirigir al login
        }).catch(err => {
          console.error('❌ Error al cerrar sesión', err);
        });
      }
    });
      
  }
   closeOnMobile() {
    if (window.innerWidth < 768) {  // Solo se oculta en móviles
      this.isOpen = false;
    }
  }
}
