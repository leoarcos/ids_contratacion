import { Component } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private fbService: FirebaseService) {}
  
  usuarios: any[] = []; // lista de usuarios de prueba 
  ngOnInit(): void {
     this.fbService.getUsuarios().subscribe(data => {
      this.usuarios = data;
      console.log(this.usuarios);
    });
  }
}
