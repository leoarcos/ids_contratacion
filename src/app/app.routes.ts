import { Routes } from '@angular/router';
import { LogInComponent } from './log-in/log-in.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { SivigilaEventosComponent } from './pages/sivigila-eventos/sivigila-eventos.component';
import { EncuestaFronterizaComponent } from './pages/encuesta-fronteriza/encuesta-fronteriza.component';
import { AlertaAmarillaComponent } from './pages/alerta-amarilla/alerta-amarilla.component';
import { EstudiosPreviosComponent } from './pages/estudios-previos/estudios-previos.component';

export const routes: Routes = [
  { path: '', component: LogInComponent }, // ruta por defecto
   {
    path: '',
    component: SidebarComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent }, 
      { path: 'usuarios', component: UsuariosComponent }, 
      { path: 'encuesta', component: EncuestaFronterizaComponent }, 
      { path: 'amarilla', component: AlertaAmarillaComponent }, 
      { path: 'estudios-previos', component: EstudiosPreviosComponent }, 
      //{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'login', component: LogInComponent },
  { path: 'recuperar', component: RecuperarPasswordComponent },
  { path: '**', redirectTo: '' }, // rutas no encontradas → login
];