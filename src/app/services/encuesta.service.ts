import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  updateDoc, 
  doc, 
  deleteDoc, 
  docData 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {
  private collectionName = 'encuestas_fronterizas';

  constructor(private firestore: Firestore) {}

  // Listar encuestas en tiempo real
  getEncuestas(): Observable<any[]> {
    const encuestasRef = collection(this.firestore, this.collectionName);
    return collectionData(encuestasRef, { idField: 'id' }) as Observable<any[]>;
  }

  // Registrar nueva encuesta
  async addEncuesta(encuesta: any) {
    try {
      const encuestasRef = collection(this.firestore, this.collectionName);
      await addDoc(encuestasRef, {
        ...encuesta,
        fechaSistema: new Date().toISOString()
      });
      this.notify('Registro Exitoso', 'La encuesta se guardó en la base de datos.', 'success');
    } catch (error: any) {
      this.notify('Error', error.message, 'error');
    }
  }

  // Actualizar encuesta existente
  async updateEncuesta(id: string, data: any) {
    try {
      const encuestaRef = doc(this.firestore, `${this.collectionName}/${id}`);
      await updateDoc(encuestaRef, data);
      this.notify('Actualizado', 'Registro modificado correctamente.', 'success');
    } catch (error: any) {
      this.notify('Error', error.message, 'error');
    }
  }

  // Eliminar encuesta
  async deleteEncuesta(id: string) {
    try {
      const encuestaRef = doc(this.firestore, `${this.collectionName}/${id}`);
      await deleteDoc(encuestaRef);
      this.notify('Eliminado', 'El registro fue borrado.', 'success');
    } catch (error: any) {
      this.notify('Error', error.message, 'error');
    }
  }

  private notify(title: string, text: string, icon: 'success' | 'error') {
    Swal.fire({ title, text, icon, confirmButtonColor: '#D32F2F' });
  }
}