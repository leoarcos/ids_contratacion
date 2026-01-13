import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importante para leer archivos locales
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';
import { AuthService } from '../../services/auth.service';
import { EstudiosPreviosService } from '../../services/estudios-previos.service';
import { SessionService } from '../../services/session.service';
import Swal from 'sweetalert2';import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import JSZipUtils from 'jszip-utils';
@Component({
  selector: 'app-estructuradores',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgSelectModule],
  templateUrl: './estructuradores.component.html',
  styleUrl: './estructuradores.component.css'
})
export class EstructuradoresComponent {
  registros: any[] = [];
  pestanaActiva: string = 'TODOS';
  filtroBusqueda: string = ''; //  variable para el buscador
  registrosFiltrados: any[] = []; // Lista que se mostrará en el HTML 
  copiaRegistrosParaBusqueda: any[] = []; // Para no perder el filtro de rol al buscar
  usuario$: any;
  idEdicion: string | null = null; 
  datos_cargados: any[] = [];
  datos_cargados_objetos: any[] = [];
  datos_cargados_objetos_filtro: any[] = [];
  nombresDependencias: string[] = [];
  nombresDependencias_objetos: string[] = [];
  datosCDP = { cdpNumero: '', cdpFecha: '' };

  constructor(
      private estudiosService: EstudiosPreviosService,
      private authService: AuthService,
      private sessionService: SessionService,
      private http: HttpClient
    ) {}
  ngOnInit() {
     this.authService.usuario$.subscribe(user => {
      if (user) {
        this.sessionService.usuario$.subscribe(u => {
          this.usuario$ = u;
          setTimeout(() => {
            console.log('Usuario cargado en Estudios Previos:', this.usuario$);
             
            this.estudiosService.getEstudiosAprobados().subscribe(data => {
              this.registros = data;
              this.registrosFiltrados = [...this.registros];
                
            }); 
          }, 500);
          // Si es un nuevo registro, podemos pre-llenar la dependencia si el usuario la tiene
          //if (!this.idEdicion) this.nuevoEstudio.dependencia = u?.mnpo || ''; 
        });
      }
    });
    this.leerExcelDesdeAssets();
  }
  
  leerExcelDesdeAssets() {
    
    // Realizamos la petición con responseType 'blob' para manejar binarios
    this.http.get('assets/docs/data_cdp.xlsx', { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        
        reader.onload = (e: any) => {
          // 1. Convertir el contenido del archivo a datos binarios
          const data = new Uint8Array(e.target.result);
          
          // 2. Parsear con XLSX
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 3. Seleccionar la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 4. Convertir a JSON
          this.datos_cargados = XLSX.utils.sheet_to_json(worksheet);
          this.nombresDependencias=this.datos_cargados.map(item=>item['Dependencia_Solicitante']).filter((value, index, self)=>self.indexOf(value)===index);  
          console.log('Datos leídos desde Assets:', this.datos_cargados, this.nombresDependencias);
        };

        reader.readAsArrayBuffer(blob);
      },
      error: (err) => {
        console.error('Error al leer el archivo Excel:', err);
      }
    });
    // Realizamos la petición con responseType 'blob' para manejar binarios
    this.http.get('assets/docs/data_objetos.xlsx', { responseType: 'blob' }).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        
        reader.onload = (e: any) => {
          // 1. Convertir el contenido del archivo a datos binarios
          const data = new Uint8Array(e.target.result);
          
          // 2. Parsear con XLSX
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 3. Seleccionar la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 4. Convertir a JSON
          this.datos_cargados_objetos = XLSX.utils.sheet_to_json(worksheet);
          this.nombresDependencias_objetos=this.datos_cargados_objetos.map(item=>item['Dependencia_Solicitante']).filter((value, index, self)=>self.indexOf(value)===index);  
          console.log('objetos leídos desde Assets:', this.datos_cargados_objetos, this.nombresDependencias_objetos);
        };

        reader.readAsArrayBuffer(blob);
      },
      error: (err) => {
        console.error('Error al leer el archivo Excel:', err);
      }
    });
  }
  // Agregamos este método para gestionar el cambio de pestañas
  cambiarPestana(nuevaPestana: string) {
    this.pestanaActiva = nuevaPestana;
    //this.aplicarFiltroPorRol(); // Re-filtramos los datos según la pestaña
  }
  
  // Método para filtrar por texto
  ejecutarBusqueda() {
    const busqueda = this.filtroBusqueda.toLowerCase().trim();
    
    if (!busqueda) {
      this.registrosFiltrados = [...this.copiaRegistrosParaBusqueda];
      return;
    }

    this.registrosFiltrados = this.copiaRegistrosParaBusqueda.filter(r => 
      r.contratista?.toLowerCase().includes(busqueda) ||
      r.dependencia?.toLowerCase().includes(busqueda) ||
      r.objetoContrato?.toLowerCase().includes(busqueda)
    );
  }
  
  // Función para generar el Word
  generarWordNecesidad(registro: any) {
    console.log('Generando Word para el registro:', registro);
    if(registro.dependenciaResponsable.split(" ")[0]==='Responsable'){
      registro.dependenciaResponsable=registro.aCargoDelAreaP;
    }
    if(registro.responsableEncargado===true){

      // 1. Cargar la plantilla desde assets
      JSZipUtils.getBinaryContent('assets/templates/plantilla_necesidad_encargado.docx', (error: any, content: any) => {
        if (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
          return;
        }

        try {
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          // 2. Pasar los datos del registro a la plantilla
          // Las llaves deben coincidir exactamente con las de tu Word
          console.log(registro);
          const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
          let nombreResponsable2;
          let cargoResponsable2;
          if(registro.responsableMismoCoordinador===true){
            nombreResponsable2=registro.nombreResponsable;
            cargoResponsable2=registro.cargoResponsable;
          }else{
            nombreResponsable2=registro.nombreResponsableCoor;
            cargoResponsable2=registro.cargoResponsableCoor;

          }
          
          let cdpnum, cdpfecha;
          if(registro.cdpNumero===undefined || registro.cdpNumero===''){
            cdpnum=''
            cdpfecha='';
          } else{
            cdpnum=registro.cdpNumero;
            cdpfecha=registro.cdpFecha;
          }
          doc.setData({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            fechaFormateada: fechaFormateada,
            cdpnum: cdpnum,
            cdpfecha: cdpfecha, 
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




          });
          // 3. Renderizar el documento
          doc.render();

          // 4. Generar el archivo y descargarlo
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          saveAs(out, `Necesidad_${registro.contratista}_${registro.fechaAnalisis}.docx`);
          
          Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Error al procesar el documento Word', 'error');
        }
      });
      return;
    } 

    // 1. Cargar la plantilla desde assets
    JSZipUtils.getBinaryContent('assets/templates/plantilla_necesidad.docx', (error: any, content: any) => {
      if (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
        return;
      }

      try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        // 2. Pasar los datos del registro a la plantilla
        // Las llaves deben coincidir exactamente con las de tu Word
        console.log(registro);
        const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
        let nombreResponsable2;
        let cargoResponsable2;
        if(registro.responsableMismoCoordinador===true){
          nombreResponsable2=registro.nombreResponsable;
          cargoResponsable2=registro.cargoResponsable;
        }else{
          nombreResponsable2=registro.nombreResponsableCoor;
          cargoResponsable2=registro.cargoResponsableCoor;

        }
        
        let cdpnum, cdpfecha;
        if(registro.cdpNumero===undefined || registro.cdpNumero===''){
          cdpnum=''
          cdpfecha='';
        } else{
          cdpnum=registro.cdpNumero;
          cdpfecha=registro.cdpFecha;
        }
        doc.setData({
          ...registro,
          fechaActual: new Date().toLocaleDateString(),
          valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
          nombreResponsable2: nombreResponsable2,
          cargoResponsable2:cargoResponsable2,
          fechaFormateada: fechaFormateada,
          cdpnum: cdpnum,
          cdpfecha: cdpfecha, 
          siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
          siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
          siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
          siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




        });
        // 3. Renderizar el documento
        doc.render();

        // 4. Generar el archivo y descargarlo
        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        saveAs(out, `Necesidad_${registro.contratista}_${registro.fechaAnalisis}.docx`);
        
        Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

      } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Error al procesar el documento Word', 'error');
      }
    });
  }
  generarWordInsuficiencia(registro: any) {
    
    // 1. Cargar la plantilla desde assets
    JSZipUtils.getBinaryContent('assets/templates/plantilla_insuficiencia.docx', (error: any, content: any) => {
      if (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
        return;
      }

      try {
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        // 2. Pasar los datos del registro a la plantilla
        // Las llaves deben coincidir exactamente con las de tu Word
        console.log(registro);
        const fechaFormateada=this.formatoFechaInsuficiencia(registro.fechaAnalisis);
        let nombreResponsable2;
        let cargoResponsable2;
        if(registro.responsableMismoCoordinador===true){
          nombreResponsable2=registro.nombreResponsable;
          cargoResponsable2=registro.cargoResponsable;
        }else{
          nombreResponsable2=registro.nombreResponsableCoor;
          cargoResponsable2=registro.cargoResponsableCoor;

        }
        
        let cdpnum, cdpfecha;
        if(registro.cdpNumero===undefined || registro.cdpNumero===''){
          cdpnum=''
          cdpfecha='';
        } else{
          cdpnum=registro.cdpNumero;
          cdpfecha=registro.cdpFecha;
        }
        doc.setData({
          ...registro,
          fechaActual: new Date().toLocaleDateString(),
          valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
          nombreResponsable2: nombreResponsable2,
          cargoResponsable2:cargoResponsable2,
          fechaFormateada: fechaFormateada,
          cdpnum: cdpnum,
          cdpfecha: cdpfecha,
          siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
          siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
          siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
          siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",

        });
        // 3. Renderizar el documento
        doc.render();

        // 4. Generar el archivo y descargarlo
        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        saveAs(out, `Insuficiencia_${registro.contratista}_${registro.fechaAnalisis}.docx`);
        
        Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

      } catch (e) {
        console.error(e);
        Swal.fire('Error', 'Error al procesar el documento Word', 'error');
      }
    });
  }
  generarWordSolicitud(registro: any) {
    if(registro.dependenciaResponsable.split(" ")[0]==='Responsable'){
      registro.dependenciaResponsable=registro.aCargoDelAreaP;
    }
    if(registro.responsableEncargado===true){
      console.log('Generando solicitud con encargado');
      // 1. Cargar la plantilla desde assets
      JSZipUtils.getBinaryContent('assets/templates/plantilla_solicitud_cdp_encargado.docx', (error: any, content: any) => {
        if (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
          return;
        }

        try {
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          // 2. Pasar los datos del registro a la plantilla
          // Las llaves deben coincidir exactamente con las de tu Word
          const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
          const fecha = new Date();
          const anoActual = fecha.getFullYear();
          console.log(registro);
          let nombreResponsable2;
          let cargoResponsable2;
          if(registro.responsableMismoCoordinador===true){
            nombreResponsable2=registro.nombreResponsable;
            cargoResponsable2=registro.cargoResponsable;
          }else{
            nombreResponsable2=registro.nombreResponsableCoor;
            cargoResponsable2=registro.cargoResponsableCoor;

          }
          
          let cdpnum, cdpfecha;
          if(registro.cdpNumero===undefined || registro.cdpNumero===''){
            cdpnum=''
            cdpfecha='';
          } else{
            cdpnum=registro.cdpNumero;
            cdpfecha=registro.cdpFecha;
          }
          doc.setData({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




          });
          // 3. Renderizar el documento
          doc.render();
          console.log({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




          });
          // 4. Generar el archivo y descargarlo
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          saveAs(out, `Solicitud_CDP_${registro.contratista}_${registro.fechaAnalisis}.docx`);
          
          Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Error al procesar el documento Word', 'error');
        }
      });
    } 
    if(registro.otraFuenteFinanciacion===true){
      // 1. Cargar la plantilla desde assets
      JSZipUtils.getBinaryContent('assets/templates/plantilla_solicitud_cdp_doble_rubro.docx', (error: any, content: any) => {
        if (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
          return;
        }

        try {
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          // 2. Pasar los datos del registro a la plantilla
          // Las llaves deben coincidir exactamente con las de tu Word
          const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
          const fecha = new Date();
          const anoActual = fecha.getFullYear();
          console.log(registro);
          let nombreResponsable2;
          let cargoResponsable2;
          if(registro.responsableMismoCoordinador===true){
            nombreResponsable2=registro.nombreResponsable;
            cargoResponsable2=registro.cargoResponsable;
          }else{
            nombreResponsable2=registro.nombreResponsableCoor;
            cargoResponsable2=registro.cargoResponsableCoor;

          }
          
          let cdpnum, cdpfecha;
          if(registro.cdpNumero===undefined || registro.cdpNumero===''){
            cdpnum=''
            cdpfecha='';
          } else{
            cdpnum=registro.cdpNumero;
            cdpfecha=registro.cdpFecha;
          }
          let valor1=0, valor2=0;
          if(registro.otraFuenteFinanciacion===true){
            valor1=parseInt(registro.valorEstimado)/2;  
            valor2=parseInt(registro.valorEstimado)/2;  
          }
          doc.setData({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",
            valor1: new Intl.NumberFormat("es-CO").format(valor1),
            valor2: new Intl.NumberFormat("es-CO").format(valor2),
          });
          // 3. Renderizar el documento
          doc.render();
          console.log({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




          });
          // 4. Generar el archivo y descargarlo
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          saveAs(out, `Solicitud_CDP_${registro.contratista}_${registro.fechaAnalisis}.docx`);
          
          Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Error al procesar el documento Word', 'error');
        }
      });

    }else{
      // 1. Cargar la plantilla desde assets
      JSZipUtils.getBinaryContent('assets/templates/plantilla_solicitud_cdp.docx', (error: any, content: any) => {
        if (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
          return;
        }

        try {
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          // 2. Pasar los datos del registro a la plantilla
          // Las llaves deben coincidir exactamente con las de tu Word
          const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
          const fecha = new Date();
          const anoActual = fecha.getFullYear();
          console.log(registro);
          let nombreResponsable2;
          let cargoResponsable2;
          if(registro.responsableMismoCoordinador===true){
            nombreResponsable2=registro.nombreResponsable;
            cargoResponsable2=registro.cargoResponsable;
          }else{
            nombreResponsable2=registro.nombreResponsableCoor;
            cargoResponsable2=registro.cargoResponsableCoor;

          }
          
          let cdpnum, cdpfecha;
          if(registro.cdpNumero===undefined || registro.cdpNumero===''){
            cdpnum=''
            cdpfecha='';
          } else{
            cdpnum=registro.cdpNumero;
            cdpfecha=registro.cdpFecha;
          }
          doc.setData({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




          });
          // 3. Renderizar el documento
          doc.render();
          console.log({
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaCargoResponsable: registro.cargoResponsable.split(" ")[0][0]+"."+registro.cargoResponsable.split(" ")[1][0]+".",
            siglaCargoResponsable2: cargoResponsable2.split(" ")[0][0]+"."+cargoResponsable2.split(" ")[1][0]+".",
            siglaCargoProyecto: registro.cargoProyecto.split(" ")[0][0]+"."+(registro.cargoProyecto.split(" ").length>1 ? registro.cargoProyecto.split(" ")[1][0] : '')+".",
            siglaCargoAprobo: registro.cargoAprobo.split(" ")[0][0]+"."+registro.cargoAprobo.split(" ")[1][0]+".",




          });
          // 4. Generar el archivo y descargarlo
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          saveAs(out, `Solicitud_CDP_${registro.contratista}_${registro.fechaAnalisis}.docx`);
          
          Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Error al procesar el documento Word', 'error');
        }
      });
      
    }
  }
  generarWordEstudio(registro: any) {
    // 1. Cargar la plantilla desde assets
    console.log(registro.dependenciaResponsable, registro.aCargoDelAreaP);
    if(registro.dependenciaResponsable.split(" ")[0]==='Responsable'){
      registro.dependenciaResponsable=registro.aCargoDelAreaP;
    }
    let fechaFormateada='';
    if(registro.responsableEncargado===true){
      
      JSZipUtils.getBinaryContent('assets/templates/plantilla_estudio_previo_encargado.docx', (error: any, content: any) => {
        if (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
          return;
        }

        try {
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          });

          // 2. Pasar los datos del registro a la plantilla
          // Las llaves deben coincidir exactamente con las de tu Word
          //const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
          const fecha = new Date();
          const anoActual = fecha.getFullYear();
          console.log(registro);
          let nombreResponsable2;
          let cargoResponsable2;
          if(registro.responsableMismoCoordinador===true){
            nombreResponsable2=registro.nombreResponsable;
            cargoResponsable2=registro.cargoResponsable;
          }else{
            nombreResponsable2=registro.nombreResponsableCoor;
            cargoResponsable2=registro.cargoResponsableCoor;

          }
            let cdpnum, cdpfecha;
            if(registro.cdpNumero===undefined || registro.cdpNumero===''){
              cdpnum=''
              cdpfecha=''; 
              fechaFormateada='';
            } else{
              cdpnum=registro.cdpNumero;
              cdpfecha=registro.cdpFecha;
              fechaFormateada=this.formatoFecha(cdpfecha);
              console.log();
            }
          console.log(registro.cdpNumero);
          const valorContratoMensual=registro.valorEstimado/registro.plazoContrato; 
          if(registro.aCargoDelAreaP!='COMPONENTE DE SANIDAD PORTUARIA' && registro.aCargoDelAreaP!='COMPONENTE DE OBSERVATORIO DE SALUD PUBLICA' && registro.aCargoDelAreaP.split(" ")[0]!='PROGRAMA' ){ 
            registro.aCargoDelAreaP='PROGRAMA '+registro.aCargoDelAreaP;
          }
          if(registro.experiencia==0){
            registro.experiencia='NO APLICA';
          }else if(registro.experiencia>=1){
            registro.experiencia=registro.experiencia+' MES(ES) DE EXPERIENCIA REQUERIDA';
          }
          doc.setData({  
            ...registro,
            fechaActual: new Date().toLocaleDateString(),
            valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
            nombreResponsable2: nombreResponsable2,
            cargoResponsable2:cargoResponsable2,
            anoActual: anoActual,
            fechaFormateada: fechaFormateada,
            valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
            valorContratoLetras: this.numeroATexto(registro.valorEstimado).toUpperCase(),
            valorContratoMensual: new Intl.NumberFormat("es-CO").format(valorContratoMensual),
            valorContratoMensualLetras: this.numeroATexto(valorContratoMensual).toUpperCase(),
            cdpnum: cdpnum,
            cdpfecha: cdpfecha,
            siglaPlazoContrato:this.numeroATextoEstudio(parseInt(registro.plazoContrato)),

          });
          // 3. Renderizar el documento
          doc.render();

          // 4. Generar el archivo y descargarlo
          const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          saveAs(out, `ESTUDIO_PREVIO_${registro.contratista}_${registro.fechaAnalisis}.docx`);
          
          Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

        } catch (e) {
          console.error(e);
          Swal.fire('Error', 'Error al procesar el documento Word', 'error');
        }
      });
    }else{

      
      if(registro.otraFuenteFinanciacion===true){
        JSZipUtils.getBinaryContent('assets/templates/plantilla_estudio_previo_doble_rubro.docx', (error: any, content: any) => {
          if (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
            return;
          }

          try {
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
            });

            // 2. Pasar los datos del registro a la plantilla
            // Las llaves deben coincidir exactamente con las de tu Word
            //const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
            const fecha = new Date();
            const anoActual = fecha.getFullYear();
            console.log(registro);
            let nombreResponsable2;
            let cargoResponsable2;
            if(registro.responsableMismoCoordinador===true){
              nombreResponsable2=registro.nombreResponsable;
              cargoResponsable2=registro.cargoResponsable;
            }else{
              nombreResponsable2=registro.nombreResponsableCoor;
              cargoResponsable2=registro.cargoResponsableCoor;

            }
            let cdpnum, cdpfecha;
            if(registro.cdpNumero===undefined || registro.cdpNumero===''){
              cdpnum=''
              cdpfecha=''; 
              fechaFormateada='';
            } else{
              cdpnum=registro.cdpNumero;
              cdpfecha=registro.cdpFecha;
              fechaFormateada=this.formatoFecha(cdpfecha);
              console.log();
            }
            console.log(registro.cdpNumero);
            const valorContratoMensual=registro.valorEstimado/registro.plazoContrato; 
            if(registro.aCargoDelAreaP!='COMPONENTE DE SANIDAD PORTUARIA' && registro.aCargoDelAreaP!='COMPONENTE DE OBSERVATORIO DE SALUD PUBLICA' && registro.aCargoDelAreaP.split(" ")[0]!='PROGRAMA' ){ 
              registro.aCargoDelAreaP='PROGRAMA '+registro.aCargoDelAreaP;
            }
            if(registro.experiencia==0){
              registro.experiencia='NO APLICA';
            }else if(registro.experiencia>=1){
              registro.experiencia=registro.experiencia+' MES(ES) DE EXPERIENCIA REQUERIDA';
            }
            
            let valor1=0, valor2=0;
            if(registro.otraFuenteFinanciacion===true){
              valor1=parseInt(registro.valorEstimado)/2;  
              valor2=parseInt(registro.valorEstimado)/2;  
            }
            doc.setData({  
              ...registro,
              fechaActual: new Date().toLocaleDateString(),
              valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
              nombreResponsable2: nombreResponsable2,
              cargoResponsable2:cargoResponsable2,
              anoActual: anoActual,
              fechaFormateada: fechaFormateada,
              valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
              valorContratoLetras: this.NumeroALetras(registro.valorEstimado).toUpperCase(),
              valorContratoMensual: new Intl.NumberFormat("es-CO").format(valorContratoMensual),
              valorContratoMensualLetras: this.NumeroALetras(valorContratoMensual).toUpperCase(),
              cdpnum: cdpnum,
              cdpfecha: cdpfecha,
              siglaPlazoContrato:this.numeroATextoEstudio(parseInt(registro.plazoContrato)),
              valor1: new Intl.NumberFormat("es-CO").format(valor1),
              valor2: new Intl.NumberFormat("es-CO").format(valor2),

            });
            // 3. Renderizar el documento
            doc.render();

            // 4. Generar el archivo y descargarlo
            const out = doc.getZip().generate({
              type: 'blob',
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            saveAs(out, `ESTUDIO_PREVIO_${registro.contratista}_${registro.fechaAnalisis}.docx`);
            
            Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

          } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Error al procesar el documento Word', 'error');
          }
        });

      }else{
        JSZipUtils.getBinaryContent('assets/templates/plantilla_estudio_previo.docx', (error: any, content: any) => {
          if (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo cargar la plantilla de Word', 'error');
            return;
          }

          try {
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
            });

            // 2. Pasar los datos del registro a la plantilla
            // Las llaves deben coincidir exactamente con las de tu Word
            // const fechaFormateada=this.formatoFecha(registro.fechaAnalisis);
            const fecha = new Date();
            const anoActual = fecha.getFullYear();
            console.log(registro);
            let nombreResponsable2;
            let cargoResponsable2;
            if(registro.responsableMismoCoordinador===true){
              nombreResponsable2=registro.nombreResponsable;
              cargoResponsable2=registro.cargoResponsable;
            }else{
              nombreResponsable2=registro.nombreResponsableCoor;
              cargoResponsable2=registro.cargoResponsableCoor;

            }
            let cdpnum, cdpfecha;
            if(registro.cdpNumero===undefined || registro.cdpNumero===''){
              cdpnum=''
              cdpfecha=''; 
              fechaFormateada='';
            } else{
              cdpnum=registro.cdpNumero;
              cdpfecha=registro.cdpFecha;
              fechaFormateada=this.formatoFecha(cdpfecha);
              console.log();
            }
            console.log(registro.cdpNumero);
            const valorContratoMensual=registro.valorEstimado/registro.plazoContrato; 
            if(registro.aCargoDelAreaP!='COMPONENTE DE SANIDAD PORTUARIA' && registro.aCargoDelAreaP!='COMPONENTE DE OBSERVATORIO DE SALUD PUBLICA' && registro.aCargoDelAreaP.split(" ")[0]!='PROGRAMA' ){ 
              registro.aCargoDelAreaP='PROGRAMA '+registro.aCargoDelAreaP;
            }
            if(registro.experiencia==0){
              registro.experiencia='NO APLICA';
            }else if(registro.experiencia>=1){
              registro.experiencia=registro.experiencia+' MES(ES) DE EXPERIENCIA REQUERIDA';
            }
            doc.setData({  
              ...registro,
              fechaActual: new Date().toLocaleDateString(),
              valorMoneda: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(registro.valorEstimado),
              nombreResponsable2: nombreResponsable2,
              cargoResponsable2:cargoResponsable2,
              anoActual: anoActual,
              fechaFormateada: fechaFormateada,
              valorContrato: new Intl.NumberFormat("es-CO").format(registro.valorEstimado),
              valorContratoLetras: this.NumeroALetras(registro.valorEstimado).toUpperCase(),
              valorContratoMensual: new Intl.NumberFormat("es-CO").format(valorContratoMensual),
              valorContratoMensualLetras: this.NumeroALetras(valorContratoMensual).toUpperCase(),
              cdpnum: cdpnum,
              cdpfecha: cdpfecha,
              siglaPlazoContrato:this.numeroATextoEstudio(parseInt(registro.plazoContrato)),

            });
            // 3. Renderizar el documento
            doc.render();

            // 4. Generar el archivo y descargarlo
            const out = doc.getZip().generate({
              type: 'blob',
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            saveAs(out, `ESTUDIO_PREVIO_${registro.contratista}_${registro.fechaAnalisis}.docx`);
            
            Swal.fire('Generado', 'El documento se ha descargado con éxito', 'success');

          } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Error al procesar el documento Word', 'error');
          }
        });

      }
      

    }
  }
  formatoFecha(fechaR: any) {
    const fechaTexto = fechaR; 
    // Convertir a objeto Date
    const [anio, mes, dia] = fechaTexto.split("-");
    const fecha = new Date(anio, mes - 1, dia);

    // Meses en español
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Formato deseado
    const fechaFormateada = `${dia} de ${meses[fecha.getMonth()]} del ${anio}`;
    console.log(fechaFormateada);
    return fechaFormateada;
  }
  
  formatoFechaInsuficiencia(fechaR: any) {
    const fechaTexto = fechaR; 
    // Convertir a objeto Date
    const [anio, mes, dia] = fechaTexto.split("-");
    const fecha = new Date(anio,   mes - 1, dia);

    // Meses en español
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    // Formato deseado
    const fechaFormateada = `los ${this.numeroATextoInsuf(dia)} (${dia}) del mes de ${meses[fecha.getMonth()]} de ${anio}`;
    console.log(fechaFormateada);
    return fechaFormateada;
  }
  
  convertirMenorMil(n:any) {
    const unidades = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const especiales = ["diez", "once", "doce", "trece", "catorce", "quince"];
    const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const centenas = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    if (n === 100) return "cien";

    let texto = "";

    if (n > 99) {
      texto += centenas[Math.floor(n / 100)] + " ";
      n %= 100;
    }

    if (n >= 10 && n <= 15) {
      texto += especiales[n - 10];
    } else if (n >= 16 && n < 20) {
      texto += "dieci" + unidades[n - 10];
    } else if (n >= 20) {
      texto += decenas[Math.floor(n / 10)];
      if (n % 10 !== 0) texto += " y " + unidades[n % 10];
    } else if (n > 0) {
      texto += unidades[n];
    }

    return texto.trim();
  }

  numeroATexto(num:any) {
    if (num === 0) return "cero";

    let texto = "";

    if (num >= 1000000) {
      const millones = Math.floor(num / 1000000);
      texto += millones === 1
        ? "un millón"
        : this.convertirMenorMil(millones) + " millones";
      num %= 1000000;
      if (num > 0) texto += " ";
    }

    if (num >= 1000) {
      const miles = Math.floor(num / 1000);
      texto += miles === 1
        ? "mil"
        : this.convertirMenorMil(miles) + " mil";
      num %= 1000;
      if (num > 0) texto += " ";
    }

    if (num > 0) {
      texto += this.convertirMenorMil(num);
    }

    return texto.trim();
  } 
  numeroATextoInsuf(num:any) {
    console.log(num);
    const numerosTexto: { [key: string]: string } = {
      '0': 'cero',
      '01': 'uno',
      '02': 'dos',
      '03': 'tres',
      '04': 'cuatro',
      '05': 'cinco',
      '06': 'seis',
      '07': 'siete',
      '08': 'ocho',
      '09': 'nueve',
      '10': 'diez',
      '11': 'once',
      '12': 'doce',
      '13': 'trece',
      '14': 'catorce',
      '15': 'quince',
      '16': 'dieciséis',
      '17': 'diecisiete',
      '18': 'dieciocho',
      '19': 'diecinueve',
      '20': 'veinte',
      '21': 'veintiuno',
      '22': 'veintidós',
      '23': 'veintitrés',
      '24': 'veinticuatro',
      '25': 'veinticinco',
      '26': 'veintiséis',
      '27': 'veintisiete',
      '28': 'veintiocho',
      '29': 'veintinueve',
      '30': 'treinta',
      '31': 'treinta y uno',
      '32': 'treinta y dos'
    };

    return numerosTexto[num] ?? '';
  } 
  
  numeroATextoEstudio(num:any) {
    console.log(num);
    const numerosTexto: { [key: number]: string } = {
      0: 'cero',
      1: 'uno',
      2: 'dos',
      3: 'tres',
      4: 'cuatro',
      5: 'cinco',
      6: 'seis',
      7: 'siete',
      8: 'ocho',
      9: 'nueve',
      10: 'diez',
      11: 'once',
      12: 'doce',
      13: 'trece',
      14: 'catorce',
      15: 'quince',
      16: 'dieciséis',
      17: 'diecisiete',
      18: 'dieciocho',
      19: 'diecinueve',
      20: 'veinte',
      21: 'veintiuno',
      22: 'veintidós',
      23: 'veintitrés',
      24: 'veinticuatro',
      25: 'veinticinco',
      26: 'veintiséis',
      27: 'veintisiete',
      28: 'veintiocho',
      29: 'veintinueve',
      30: 'treinta',
      31: 'treinta y uno',
      32: 'treinta y dos'
    };

    return numerosTexto[num] ?? '';
  } 

  Unidades(num: any): string {
      switch (num) {
          case 1: return "UN";
          case 2: return "DOS";
          case 3: return "TRES";
          case 4: return "CUATRO";
          case 5: return "CINCO";
          case 6: return "SEIS";
          case 7: return "SIETE";
          case 8: return "OCHO";
          case 9: return "NUEVE";
      }
      return "";
  }

  Decenas(num: any): string {
      const decena = Math.floor(num / 10);
      const unidad = num - (decena * 10);

      switch (decena) {
          case 1:
              switch (unidad) {
                  case 0: return "DIEZ";
                  case 1: return "ONCE";
                  case 2: return "DOCE";
                  case 3: return "TRECE";
                  case 4: return "CATORCE";
                  case 5: return "QUINCE";
                  default: return "DIECI" + this.Unidades(unidad);
              }
          case 2:
              switch (unidad) {
                  case 0: return "VEINTE";
                  default: return "VEINTI" + this.Unidades(unidad);
              }
          case 3: return this.DecenasY("TREINTA", unidad);
          case 4: return this.DecenasY("CUARENTA", unidad);
          case 5: return this.DecenasY("CINCUENTA", unidad);
          case 6: return this.DecenasY("SESENTA", unidad);
          case 7: return this.DecenasY("SETENTA", unidad);
          case 8: return this.DecenasY("OCHENTA", unidad);
          case 9: return this.DecenasY("NOVENTA", unidad);
          case 0: return this.Unidades(unidad);
      }
      return "";
  }

  DecenasY(strSin: any, numUnidades: any): string {
      if (numUnidades > 0)
          return strSin + " Y " + this.Unidades(numUnidades);
      return strSin;
  }

  Centenas(num: any): string {
      const centenas = Math.floor(num / 100);
      const decenas = num - (centenas * 100);

      switch (centenas) {
          case 1:
              if (decenas > 0)
                  return "CIENTO " + this.Decenas(decenas);
              return "CIEN";
          case 2: return "DOSCIENTOS " + this.Decenas(decenas);
          case 3: return "TRESCIENTOS " + this.Decenas(decenas);
          case 4: return "CUATROCIENTOS " + this.Decenas(decenas);
          case 5: return "QUINIENTOS " + this.Decenas(decenas);
          case 6: return "SEISCIENTOS " + this.Decenas(decenas);
          case 7: return "SETECIENTOS " + this.Decenas(decenas);
          case 8: return "OCHOCIENTOS " + this.Decenas(decenas);
          case 9: return "NOVECIENTOS " + this.Decenas(decenas);
      }
      return this.Decenas(decenas);
  }

  Seccion(num: any, divisor: any, strSingular: any, strPlural: any): string {
      const cientos = Math.floor(num / divisor);
      const resto = num - (cientos * divisor);
      let letras = "";

      if (cientos > 0) {
          if (cientos > 1)
              letras = this.Centenas(cientos) + " " + strPlural;
          else
              letras = strSingular;
      }

      return letras;
  }

  Miles(num: any): string {
      const divisor = 1000;
      const cientos = Math.floor(num / divisor);
      const resto = num - (cientos * divisor);

      const strMiles = this.Seccion(num, divisor, "UN MIL", "MIL");
      const strCentenas = this.Centenas(resto);

      if (strMiles === "")
          return strCentenas;

      return strMiles + " " + strCentenas;
  }

  Millones(num: any): string {
      const divisor = 1000000;
      const cientos = Math.floor(num / divisor);
      const resto = num - (cientos * divisor);

      const strMillones = this.Seccion(num, divisor, "UN MILLON", "MILLONES");
      const strMiles = this.Miles(resto);

      if (strMillones === "")
          return strMiles;

      return strMillones + " " + strMiles;
  }

  NumeroALetras(num: any): string {
      const enteros = Math.floor(num);

      if (enteros === 0)
          return "CERO";
      
      return this.Millones(enteros).trim();
  }
}
