import { Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import {    Auth, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, User, UserCredential } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActual = new BehaviorSubject<User | null>(null);
  usuario$ = this.usuarioActual.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
     // Mantener sesión activa
    onAuthStateChanged(this.auth, (user) => {
      this.usuarioActual.next(user);
      console.log(user);
    });
  }

  async registrarUsuario(correo: string, password: string) {
    console.log(correo, password);
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, correo, password);

     
      console.log('✅ Usuario registrado con UID:', userCredential.user.uid);
      return { success: true,
        uid: userCredential.user.uid,
        user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Error al registrar usuario:', error.message);
      return { success: false, error: error.message };
    }
    /*
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, correo, password);
      return {
        success: true,
        uid: userCredential.user.uid,
        user: userCredential.user
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
    */
  }
  
  async registrarUsuarioSinCambiarSesion(correo: string, password: string) {
    // Crear app secundaria
    const appSecundario = initializeApp(environment.firebase, 'Secundario');
    const authSecundario = getAuth(appSecundario);

    try {
      const userCredential = await createUserWithEmailAndPassword(authSecundario, correo, password);

      console.log('Usuario creado con UID:', userCredential.user.uid);

      // 🔹 Cerrar sesión del auth secundario (para no interferir)
      await authSecundario.signOut();
      return { success: true,
              uid: userCredential.user.uid,
              user: userCredential.user };
    } catch (error:any) {
      console.error('Error al registrar usuario secundario:', error);
      return { success: false, error: error.message };
    }
  }
 // Login con correo y contraseña
  async loginUser(correo: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, correo, password);
      return {
        success: true,
        uid: userCredential.user.uid,
        correo: userCredential.user.email
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cerrar sesión
  async logout() {
    return this.auth.signOut();
  }

 
}
