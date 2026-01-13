import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  collectionData, 
  updateDoc, 
  doc, 
  deleteDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaAmarillaService {
  // Colección independiente para Alerta Amarilla
  private collectionName = 'alertas_amarillas';

  constructor(private firestore: Firestore) {}

  // Listar registros en tiempo real
  getAlertas(): Observable<any[]> {
    const alertasRef = collection(this.firestore, this.collectionName);
    return collectionData(alertasRef, { idField: 'id' }) as Observable<any[]>;
  }

  // Registrar nueva alerta
  async addAlerta(alerta: any) {
    try {
      const alertasRef = collection(this.firestore, this.collectionName);
      await addDoc(alertasRef, {
        ...alerta,
        fechaSistema: new Date().toISOString()
      });
      this.notify('Registro Exitoso', 'El reporte de alerta se guardó correctamente.', 'success');
    } catch (error: any) {
      this.notify('Error', error.message, 'error');
    }
  }

  // Actualizar alerta existente
  async updateAlerta(id: string, data: any) {
    try {
      const alertaRef = doc(this.firestore, `${this.collectionName}/${id}`);
      // Eliminamos el ID del objeto de datos para no intentar sobreescribirlo en Firebase
      const { id: _, ...datosSinId } = data; 
      await updateDoc(alertaRef, datosSinId);
      this.notify('Actualizado', 'Reporte modificado correctamente.', 'success');
    } catch (error: any) {
      this.notify('Error', error.message, 'error');
    }
  }

  // Eliminar alerta
  async deleteAlerta(id: string) {
    try {
      const alertaRef = doc(this.firestore, `${this.collectionName}/${id}`);
      await deleteDoc(alertaRef);
      this.notify('Eliminado', 'El reporte fue borrado de la base de datos.', 'success');
    } catch (error: any) {
      this.notify('Error', error.message, 'error');
    }
  }

  private notify(title: string, text: string, icon: 'success' | 'error') {
    Swal.fire({ 
      title, 
      text, 
      icon, 
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Aceptar' 
    });
  }
}