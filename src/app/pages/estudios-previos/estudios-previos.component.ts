import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiosPreviosService } from '../../services/estudios-previos.service';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import Swal from 'sweetalert2';import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import JSZipUtils from 'jszip-utils';
import * as XLSX from 'xlsx';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importante para leer archivos locales
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-estudios-previos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgSelectModule],
  templateUrl: './estudios-previos.component.html',
  styleUrls: ['./estudios-previos.component.css']
})
export class EstudiosPreviosComponent implements OnInit {
  registros: any[] = [];
  registrosFiltrados: any[] = []; // Lista que se mostrará en el HTML
  registrosFiltradosPendientes: any[] = [];
  registrosFiltradosAprobados: any[] = [];
  registrosFiltradosRechazados: any[] = [];
  nuevoEstudio: any = this.resetForm();
  idEdicion: string | null = null;
  usuario$: any;
  idRechazo: string = '';
  // Variables para el modal de CDP
  estudioSeleccionadoCDP: any = null;
  datosCDP = { cdpNumero: '', cdpFecha: '' };
  rechazoContratacion: string = '';
  rechazoDireccion: string = '';
  rechazoPresupuesto: string = '';
  datos_cargados: any[] = [];
  datos_cargados_objetos: any[] = [];
  datos_cargados_objetos_filtro: any[] = [];
  nombresDependencias: string[] = [];
  nombresDependencias_objetos: string[] = [];
  datosPrograma: any[] = [];
  datosFuentes: any[] =[];
  datosFuentes2: any[] =[];
  datosAtributos: any[] = [];
  datosProductos: any[] = [];
  datosBPIN: any[] = [];
  submitbtn: boolean=false; 
  filtroBusqueda: string = ''; // Nueva variable para el buscador
  copiaRegistrosParaBusqueda: any[] = []; // Para no perder el filtro de rol al buscar
  pestanaActiva: string = 'TODOS'; // Pestaña por defecto
  constructor(
    private estudiosService: EstudiosPreviosService,
    private authService: AuthService,
    private sessionService: SessionService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log(this.NumeroALetras(22032000));
    this.authService.usuario$.subscribe(user => {
      if (user) {
        this.sessionService.usuario$.subscribe(u => {
          this.usuario$ = u;
          setTimeout(() => {
            console.log('Usuario cargado en Estudios Previos:', this.usuario$);
            if(this.usuario$.rol==='Direccion'){
              this.estudiosService.getEstudiosDireccion().subscribe(data => {
                this.registros = data;
                console.log(this.registros);
                this.aplicarFiltroPorRol();
              });

            }else{
              this.estudiosService.getEstudios().subscribe(data => {
                this.registros = data;
                this.aplicarFiltroPorRol();
              });
            }
          }, 500);
          // Si es un nuevo registro, podemos pre-llenar la dependencia si el usuario la tiene
          if (!this.idEdicion) this.nuevoEstudio.dependencia = u?.mnpo || ''; 
        });
      }
    });
    this.leerExcelDesdeAssets();
  }
  cambioDependenciaResp(){
    this.nuevoEstudio.dependenciaResponsable = this.nuevoEstudio.aCargoDelAreaP;
    if(this.nuevoEstudio.dependenciaResponsable=== 'COMPONENTE DE OBSERVATORIO DE SALUD PUBLICA'){
      this.nuevoEstudio.nombreResponsable='NOHORA ERLINDA CADENA';
      this.nuevoEstudio.cargoResponsable='Profesional Especializado';
    }

    console.log('cambio dependencia responsabel',this.nuevoEstudio.dependenciaResponsable);
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
  obtenerDatosPrograma() {
    this.nuevoEstudio.dependenciaResponsable=this.nuevoEstudio.dependencia;
    const programaSeleccionado = this.nuevoEstudio.dependencia;
    console.log(programaSeleccionado);
    this.nuevoEstudio.aCargoDelAreaP=programaSeleccionado;
    this.datosPrograma = this.datos_cargados.filter(fila => 
            fila.Dependencia_Solicitante === programaSeleccionado);
    console.log('Datos del programa seleccionado:', this.datosPrograma);
    this.seleccionarCoordResp();
    console.log('Responsable y coordinador asignados:', this.nuevoEstudio.nombreResponsable, this.nuevoEstudio.nombreCoordinador);
  
    if(programaSeleccionado===''){
      this.datos_cargados_objetos_filtro = this.datos_cargados_objetos;
      return;
    }
    this.datos_cargados_objetos_filtro = this.datos_cargados_objetos.filter(fila =>
            fila.Dependencia_Solicitante === programaSeleccionado || fila.Dependencia_Solicitante === 'TODAS LAS DEPENDENCIAS');
    console.log('objetos del programa seleccionado:', this.datos_cargados_objetos_filtro);
  }
  obtenerDatosFuente(){ 
    console.log(this.nuevoEstudio.fuenteFinanciacion);
    this.datosFuentes = this.datos_cargados.filter(fila => 
            fila.Dependencia_Solicitante === this.nuevoEstudio.dependencia && 
            fila.Fuente === this.nuevoEstudio.fuenteFinanciacion);
    console.log('Datos del programa seleccionado:', this.datosFuentes);
  }
  obtenerDatosFuente2(){ 
    console.log(this.nuevoEstudio.fuenteFinanciacion2);
    this.datosFuentes2 = this.datos_cargados.filter(fila => 
            fila.Dependencia_Solicitante === this.nuevoEstudio.dependencia && 
            fila.Fuente === this.nuevoEstudio.fuenteFinanciacion2);
    console.log('Datos del programa seleccionado:', this.datosFuentes2);
  }
  obtenerDatosAtributo(){ 
    console.log(this.nuevoEstudio.fuenteFinanciacion);
    this.datosAtributos = this.datos_cargados.filter(fila => 
            fila.Dependencia_Solicitante === this.nuevoEstudio.dependencia && 
            fila.Fuente === this.nuevoEstudio.fuenteFinanciacion && 
            fila.Atributo === this.nuevoEstudio.atributo);
    console.log('Datos del programa seleccionado:', this.datosAtributos);
  }
  obtenerDatosProducto(){ 
    console.log(this.nuevoEstudio.producto);
    this.datosProductos = this.datos_cargados.filter(fila => 
            fila.Dependencia_Solicitante === this.nuevoEstudio.dependencia && 
            fila.Fuente === this.nuevoEstudio.fuenteFinanciacion && 
            fila.Atributo === this.nuevoEstudio.atributo && 
            fila.Producto === this.nuevoEstudio.producto);
    console.log('Datos del programa seleccionado:', this.datosProductos);
  }
  obtenerDatosBPIN(){ 
    console.log(this.nuevoEstudio.producto);
    this.datosBPIN = this.datos_cargados.filter(fila => 
            fila.Dependencia_Solicitante === this.nuevoEstudio.dependencia && 
            fila.Fuente === this.nuevoEstudio.fuenteFinanciacion && 
            fila.Atributo === this.nuevoEstudio.atributo && 
            fila.Producto === this.nuevoEstudio.producto && 
            fila.BPIN === this.nuevoEstudio.codigoBPIN);
    console.log('Datos del programa seleccionado:', this.datosProductos);
  }
  seleccionarCoordResp(){
    
    const responsable=this.datosPrograma.map(item=>item['Nombre_responsable']).filter((value, index, self)=>self.indexOf(value)===index); 
    const responsableCargo=this.datosPrograma.map(item=>item['Cargo_responsable']).filter((value, index, self)=>self.indexOf(value)===index); 
    const coordinador=this.datosPrograma.map(item=>item['Nombre_coordinador']).filter((value, index, self)=>self.indexOf(value)===index); 
    const coordinadorCargo=this.datosPrograma.map(item=>item['Cargo_coordinador']).filter((value, index, self)=>self.indexOf(value)===index); 
    const grupo=this.datosPrograma.map(item=>item['Grupo']).filter((value, index, self)=>self.indexOf(value)===index);  
    this.nuevoEstudio.nombreResponsable=responsable[0];
    this.nuevoEstudio.nombreResponsableCoor=coordinador[0];
    this.nuevoEstudio.dependenciaCoor=grupo[0];
    this.nuevoEstudio.cargoResponsable= responsableCargo[0];
    this.nuevoEstudio.cargoResponsableCoor= coordinadorCargo[0];
  
  }
  aplicarFiltroPorRol() {
      console.log(this.usuario$?.rol);
    // Lógica de filtrado: Si es Supervisor, solo ve sus registros por correo
    if (this.usuario$?.rol === 'Supervisor') {
      this.registrosFiltrados = this.registros.filter(r => r.correoCreador === this.usuario$.correo);
    } else if (this.usuario$?.rol === 'Contratacion'){
      // Otros roles (Admin, Dirección, etc.) ven todo
      this.registrosFiltrados = this.registros.filter(r => r.estadoContratacion === 'REVISION' && r.estado !='RECHAZADO');
      this.registrosFiltradosPendientes = this.registros.filter(r => r.estadoContratacion === 'REVISION' && r.estado ==='PENDIENTE');
      this.registrosFiltradosRechazados = this.registros.filter(r => r.estadoContratacion === 'RECHAZADO' && r.estado ==='RECHAZADO');
      this.registrosFiltradosAprobados = this.registros.filter(r => r.estadoContratacion === 'APROBADO' && (r.estado ==='PENDIENTE' || r.estado ==='APROBADO'));
    } else if (this.usuario$?.rol === 'Direccion'){
      // Otros roles (Admin, Dirección, etc.) ven todo
      this.registrosFiltrados = this.registros.filter(r => r.estadoDireccion === 'REVISION' && r.estado !='RECHAZADO');
      this.registrosFiltradosPendientes = this.registros.filter(r => r.estadoDireccion === 'REVISION' && r.estadoContratacion === 'APROBADO' && r.estado ==='PENDIENTE');
      this.registrosFiltradosRechazados = this.registros.filter(r => r.estadoDireccion === 'RECHAZADO' && r.estado ==='RECHAZADO');
      this.registrosFiltradosAprobados = this.registros.filter(r => r.estadoDireccion === 'APROBADO' && (r.estado ==='PENDIENTE' || r.estado ==='APROBADO'));
    } else if (this.usuario$?.rol === 'Presupuesto'){
      // Otros roles (Admin, Dirección, etc.) ven todo
      this.registrosFiltrados = this.registros.filter(r => r.estadoPresupuesto === 'REVISION' && r.estadoContratacion === 'APROBADO' && r.estadoDireccion === 'APROBADO');
      this.registrosFiltradosPendientes = this.registros.filter(r => r.estadoPresupuesto === 'REVISION' && r.estado ==='PENDIENTE');
      this.registrosFiltradosRechazados = this.registros.filter(r => r.estadoPresupuesto === 'RECHAZADO' && r.estado ==='RECHAZADO');
      this.registrosFiltradosAprobados = this.registros.filter(r => r.estadoPresupuesto === 'APROBADO' &&  r.estado ==='APROBADO');
    } else {
      // Otros roles (Admin, Dirección, etc.) ven todo
      this.registrosFiltrados = this.registros;
    }
    this.copiaRegistrosParaBusqueda = this.registrosFiltrados; // Guardamos la base filtrada por rol
    this.ejecutarBusqueda(); // Llamamos a la búsqueda para aplicar si hay algo escrito
    console.log('Registros filtrados:', this.registrosFiltrados);
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

  // Agregamos este método para gestionar el cambio de pestañas
  cambiarPestana(nuevaPestana: string) {
    this.pestanaActiva = nuevaPestana;
    //this.aplicarFiltroPorRol(); // Re-filtramos los datos según la pestaña
  }
  validarFormulario(): boolean {
    // Se omiten campos automáticos o de flujo posterior (CDP)
    const camposOmitir = [
      'id', 'fechaSistema', 'responsableMismoCoordinador', 
      'cdpNumero', 'cdpFecha', 'estado', 'creadoPor', 'fechaFirma',
      'estadoContratacionRechazo', 'estadoDireccionRechazo', 'estadoPresupuestoRechazo',
      'fuenteFinanciacion2', 'atributo2', 'otraFuenteFinanciacion'
    ];
    
    const llaves = Object.keys(this.nuevoEstudio);

    for (const llave of llaves) {
      if (camposOmitir.includes(llave)) continue;
      
      const valor = this.nuevoEstudio[llave];
      
      // Validar campos vacíos o números inválidos
      if (valor === '' || valor === null || valor === undefined || (typeof valor === 'number' && valor < 0)) {
        // Ignorar validación de coordinador si es el mismo responsable
        if (this.nuevoEstudio.responsableMismoCoordinador && llave.includes('Coor')) continue;
        
        this.notificarError(llave);
        return false;
      }
    }
    return true;
  }

  notificarError(campo: string) {
    const nombreLegible = campo.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    Swal.fire({ title: 'Campo Obligatorio', text: `Por favor, complete: ${nombreLegible}`, icon: 'warning' });
  }

  async guardar() {
    if (!this.validarFormulario()) return;
    this.submitbtn = true;
    try {
      if (this.idEdicion) {
        // Auditoría de edición
        this.nuevoEstudio.modificadoPor = this.usuario$?.correo || 'Desconocido';
        
        this.nuevoEstudio.estadoContratacion = 'REVISION';
        this.nuevoEstudio.estadoDireccion = 'REVISION';
        this.nuevoEstudio.estadoPresupuesto = 'REVISION';
        this.nuevoEstudio.estado = 'PENDIENTE';
        await this.estudiosService.updateEstudio(this.idEdicion, this.nuevoEstudio);
      } else {
        // Auditoría de creación
        this.nuevoEstudio.creadoPor = this.usuario$?.nombres || this.usuario$?.correo || 'Sistema';
        this.nuevoEstudio.correoCreador = this.usuario$?.correo || '';

        this.nuevoEstudio.estadoContratacion = 'REVISION';
        this.nuevoEstudio.estadoContratacionRechazo = '';

        this.nuevoEstudio.estadoDireccion = 'REVISION';
        this.nuevoEstudio.estadoDireccionRechazo = '';
        
        this.nuevoEstudio.estadoPresupuesto = 'REVISION';
        this.nuevoEstudio.estadoPresupuestoRechazo = '';

        await this.estudiosService.addEstudio(this.nuevoEstudio);
      }
      
      this.cancelar();
      this.cerrarModal('modalEstudio');
      this.submitbtn = false;
      Swal.fire('Éxito', 'Registro guardado correctamente', 'success');
    } catch (error) {
      this.submitbtn = false;
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
    }
  }

  prepararCDP(item: any) {
    this.estudioSeleccionadoCDP = item;
    this.datosCDP = { cdpNumero: item.cdpNumero || '', cdpFecha: item.cdpFecha || '' };
  }

  async guardarCDP() {
    if (!this.datosCDP.cdpNumero || !this.datosCDP.cdpFecha) {
      Swal.fire('Atención', 'Debe completar Número y Fecha de CDP', 'warning');
      return;
    }
    try { 
      await this.estudiosService.updateEstudio(this.estudioSeleccionadoCDP.id, {
        ...this.datosCDP,
        cdpRegistradoPor: this.usuario$?.correo || 'Sistema',
        estadoPresupuesto: 'APROBADO',
        estado: 'APROBADO'
      });
      this.cerrarModal('modalCDP');
      Swal.fire('CDP Registrado', 'Información presupuestal actualizada', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo registrar el CDP', 'error');
    }
  }
  alistarIdRechazo(item: any) {
    this.idRechazo = item;
  }

  async cambiarEstado(item: any, nuevoEstado: string) {
    const confirm = await Swal.fire({
      title: `¿Confirmar estado: ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd'
    });

    if (confirm.isConfirmed) {
      await this.estudiosService.updateEstudio(item.id, { 
        estado: nuevoEstado,
        estadoContratacion: nuevoEstado,
        estadoDireccion: nuevoEstado,
        estadoPresupuesto: nuevoEstado,
        cambioEstadoPor: this.usuario$?.correo || 'Sistema'
      });
      Swal.fire('Estado Actualizado', `El registro ahora está ${nuevoEstado}`, 'success');
    }
  }

  onCheckCoordinadorChange() {
    if (this.nuevoEstudio.responsableMismoCoordinador) {
      this.nuevoEstudio.nombreResponsableCoor = this.nuevoEstudio.nombreResponsable;
      this.nuevoEstudio.cargoResponsableCoor = this.nuevoEstudio.cargoResponsable;
      this.nuevoEstudio.dependenciaCoor = this.nuevoEstudio.dependencia;
    } else {
      this.nuevoEstudio.nombreResponsableCoor = '';
      this.nuevoEstudio.cargoResponsableCoor = '';
      this.nuevoEstudio.dependenciaCoor = '';
    }
  }

  prepararEdicion(item: any) {
    this.idEdicion = item.id; 
    console.log(new Date().toISOString().split('T')[0]);
    item.fechaAnalisis=new Date().toISOString().split('T')[0];
    this.nuevoEstudio = { ...item };
    this.obtenerDatosPrograma();
    this.obtenerDatosFuente();
    this.obtenerDatosFuente2();
    this.obtenerDatosAtributo();
    this.obtenerDatosProducto();
    this.obtenerDatosBPIN();
  }

  cancelar() {
    this.idEdicion = null;
    this.nuevoEstudio = this.resetForm();
  }

  cerrarModal(id: string) {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  async eliminar(id: string) {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true
    });
    if (result.isConfirmed) await this.estudiosService.deleteEstudio(id);
  }

  resetForm() {
    return {
      contratista: '',
      dependencia: '',
      fechaAnalisis: '',
      objetoContrato: '',
      justificacion: '',
      nivelEstudios: '',
      experiencia: '',
      recursos: '',
      plazoContrato: 0,
      valorEstimado: 0,
      fuenteFinanciacion: '',
      atributo: '',
      producto: '',
      codigoBPIN: '',
      codigoDANE: '',
      rubroPresupuestal: '',
      lugarEjecucionZona: '',
      lugarEjecucionMunicipios: '',
      obligaciones: '',
      aCargoDel: '',
      nombreResponsable: '',
      cargoResponsable: '',
      dependenciaResponsable: '',
      nombreResponsableCoor: '',
      cargoResponsableCoor: '',
      dependenciaCoor: '',
      nombreProyecto: '',
      cargoProyecto: '',
      fechaProyecto: '',
      nombreAprobo: '',
      cargoAprobo: '',
      fechaAprobacion: '',
      responsableMismoCoordinador: false,
      responsableEncargado: false,
      estado: 'PENDIENTE',
      fechaFirma: new Date().toISOString().split('T')[0],
      estadoContratacion: 'REVISION',
      estadoContratacionRechazo: '',
      estadoDireccion: 'REVISION',
      estadoDireccionRechazo: '',
      estadoPresupuesto: 'REVISION',
      estadoPresupuestoRechazo: '',
      nombreDirector: 'JUAN ALBERTO BITAR MEJIA',
      codigoProyecto: '',
      aCargoDelAreaP:'',
      otraFuenteFinanciacion: false,
      fuenteFinanciacion2:'',
      atributo2:''
    };
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
  async cambiarEstadoContratacion(item: any, nuevoEstado: string) {
    const confirm = await Swal.fire({
      title: `¿Confirmar estado: ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd'
    });

    this.cerrarModal('modalRechazoContratacion');
    if (confirm.isConfirmed) {
      if(nuevoEstado==='RECHAZADO'){

        await this.estudiosService.updateEstudio(item.id, { 
          estadoContratacion: nuevoEstado,
          estado: nuevoEstado,
          estadoContratacionRechazo: this.rechazoContratacion
        });
      }else{
        await this.estudiosService.updateEstudio(item.id, { 
          estadoContratacion: nuevoEstado
        });

      } 
      Swal.fire('Estado Actualizado', `El registro ahora está ${nuevoEstado}`, 'success');
    }
  }
  
  async cambiarEstadoDireccion(item: any, nuevoEstado: string) {
    console.log(nuevoEstado, item.id);
    const confirm = await Swal.fire({
      title: `¿Confirmar estado D: ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd'
    });

    this.cerrarModal('modalRechazoDireccion');
    if (confirm.isConfirmed) {
      if(nuevoEstado==='RECHAZADO'){

        await this.estudiosService.updateEstudio(item.id, { 
          estadoDireccion: nuevoEstado,
          estado: nuevoEstado,
          estadoDireccionRechazo: this.rechazoDireccion
        });
      }else{
        await this.estudiosService.updateEstudio(item.id, { 
          estadoDireccion: nuevoEstado
        });

      }
      Swal.fire('Estado Actualizado', `El registro ahora está ${nuevoEstado}`, 'success');
    }
  }
  
  async cambiarEstadoPresupuesto(item: any, nuevoEstado: string) {
    const confirm = await Swal.fire({
      title: `¿Confirmar estado: ${nuevoEstado}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd'
    });

    this.cerrarModal('modalRechazoPresupuesto');
    if (confirm.isConfirmed) {
      if(nuevoEstado==='RECHAZADO'){

        await this.estudiosService.updateEstudio(item.id, { 
          estadoPresupuesto: nuevoEstado,
          estado: nuevoEstado,
          estadoPresupuestoRechazo: this.rechazoPresupuesto
        });
      }else{
        await this.estudiosService.updateEstudio(item.id, { 
          estadoPresupuesto: nuevoEstado
        });

      }
      
      Swal.fire('Estado Actualizado', `El registro ahora está ${nuevoEstado}`, 'success');
    }
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