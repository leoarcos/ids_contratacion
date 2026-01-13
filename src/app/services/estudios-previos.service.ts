import { Injectable } from '@angular/core';
import { query, where, Firestore, collection, addDoc, collectionData, updateDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class EstudiosPreviosService {
  private collectionName = 'estudios_previos';

  constructor(private firestore: Firestore) {}

  getEstudios(): Observable<any[]> {
    const ref = collection(this.firestore, this.collectionName);
    return collectionData(ref, { idField: 'id' }) as Observable<any[]>;
  }
  getEstudiosDireccion(): Observable<any[]> {
    const ref = collection(this.firestore, this.collectionName);
    
    // Creamos la consulta con las dos condiciones
    const q = query(
      ref, 
      where('estadoContratacion', '==', 'APROBADO'),
      where('estado', '==', 'PENDIENTE')
    );

    // Retornamos los datos de la consulta 'q' en lugar de la referencia completa
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
  getEstudiosAprobados(): Observable<any[]> {
    const ref = collection(this.firestore, this.collectionName);
    
    // Creamos la consulta con las dos condiciones
    const q = query(
      ref,  
      where('estado', '==', 'APROBADO')
    );

    // Retornamos los datos de la consulta 'q' en lugar de la referencia completa
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  async addEstudio(estudio: any) {
    try {
      const ref = collection(this.firestore, this.collectionName);
      await addDoc(ref, { ...estudio, fechaSistema: new Date().toISOString() });
      this.notify('Éxito', 'Estudio previo registrado.', 'success');
    } catch (e: any) { this.notify('Error', e.message, 'error'); }
  }

  async updateEstudio(id: string, data: any) {
    try {
      const ref = doc(this.firestore, `${this.collectionName}/${id}`);
      const { id: _, ...cleanData } = data;
      await updateDoc(ref, cleanData);
      this.notify('Actualizado', 'Registro modificado.', 'success');
    } catch (e: any) { this.notify('Error', e.message, 'error'); }
  }

  async deleteEstudio(id: string) {
    try {
      await deleteDoc(doc(this.firestore, `${this.collectionName}/${id}`));
      this.notify('Eliminado', 'Registro borrado.', 'success');
    } catch (e: any) { this.notify('Error', e.message, 'error'); }
  }

  private notify(title: string, text: string, icon: 'success' | 'error') {
    Swal.fire({ title, text, icon, confirmButtonColor: '#0d6efd' });
  }
}