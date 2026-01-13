import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private usuarioSubject = new BehaviorSubject<any>(null); // estado interno
  usuario$: Observable<any> = this.usuarioSubject.asObservable(); // observable público

  constructor(private firestore: Firestore, private auth: Auth) {
    // 🔹 Escuchar cambios de sesión
    this.auth.onAuthStateChanged(user => {
      if (user) {
        // Si hay sesión, escuchamos cambios del documento del usuario en Firestore
        const userDoc = doc(this.firestore, `usuarios/${user.uid}`);
        docData(userDoc, { idField: 'id' }).subscribe(usuario => {
          this.usuarioSubject.next({ ...user, ...usuario }); // 🔹 combina auth + firestore
        });
      } else {
        this.usuarioSubject.next(null);
      }
    });
  }

  // ✅ Método para obtener el usuario actual en TS
  get usuarioActual() {
    return this.usuarioSubject.value;
  }

  // ✅ Método para cerrar sesión
  cerrarSesion() {
    this.auth.signOut();
    this.usuarioSubject.next(null);
  }
}
