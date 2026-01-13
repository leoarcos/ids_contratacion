import { Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { Firestore, collection, addDoc, collectionData, updateDoc, doc, deleteDoc, setDoc, getDocs, query, where, getDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  // Agregar usuario
  addUsuario(usuario: any) { 
    if (!usuario.uid) {
      throw new Error('El usuario debe tener un UID');
    }

    const usuarioRef = doc(this.firestore, `usuarios/${usuario.uid}`);
    return setDoc(usuarioRef, usuario); // sobrescribe si ya existe
  }

  // Listar usuarios
  getUsuarios(): Observable<any[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    return collectionData(usuariosRef, { idField: 'id' }) as Observable<any[]>;
  }
  updateUsuario(uid: string, data: any) {
    const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
    return updateDoc(usuarioRef, data);
  }
   actualizarEstadoUsuario(uid: string, data: any) {
    const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
    return updateDoc(usuarioRef, data);
  }
   eliminarUsuario(uid: string) {
    const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
    return deleteDoc(usuarioRef);
  }
   async getUsuarioByDoc(uid: string) {

    const userDoc = doc(this.firestore, `usuarios/${uid}`);
    return docData(userDoc, { idField: 'id' }); // incluye el ID en el objeto
 
  }
  async eliminarUsuarioPorCredenciales(correo:any, password:any){
    // Crear app secundaria
    const appSecundario = initializeApp(environment.firebase, 'Secundario');
    const authSecundario = getAuth(appSecundario);
    try {
        // 1. Volver a autenticar
        const userCredential = await signInWithEmailAndPassword(authSecundario, correo, password);
        const user: User | null = userCredential.user;

        if (user) {
          const uid = user.uid;

          // 2. Eliminar de Authentication
          await deleteUser(user);

          // 3. Eliminar de Firestore
          const userDocRef = doc(this.firestore, `usuarios/${uid}`);
          await deleteDoc(userDocRef);

          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            text: `✅ El usuario con correo ${correo} fue eliminado correctamente`,
            confirmButtonColor: '#3085d6'
          });
        }
      } catch (error: any) {
        console.error("❌ Error al eliminar usuario:", error);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#d33'
        });
      }

    
  }
}
