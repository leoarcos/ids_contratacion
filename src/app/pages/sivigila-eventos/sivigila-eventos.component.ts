import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms'; // 👈 Importar
import { CommonModule } from '@angular/common'; // 👈 Importar para directivas comunes

import { FilterPipe } from '../filter.pipe'; // ruta a tu pipe
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import html2pdf from 'html2pdf.js';



Chart.register(...registerables, ChartDataLabels);

interface Municipio {
  nombre: string;
  casosCol: number;
  casosVen: number;
  total: number;
  porcentaje: number;
  nvdf: number;
  razonPrevalencia: number;
  semana: number;
}
@Component({
  selector: 'app-sivigila-eventos',
  standalone: true,
  imports: [FormsModule, CommonModule, FilterPipe],
  templateUrl: './sivigila-eventos.component.html',
  styleUrl: './sivigila-eventos.component.css'
})
export class SivigilaEventosComponent {
  selectedFile: File | null = null;
  btnselectedFile=false;
  excelData: any[] = [];
  tableHeaders: string[] = [];
  datosValidados: any[] = [];
  totalCasos = 307;

  searchText: string = '';
   municipios: Municipio[] = [
    { nombre: 'Cúcuta', casosCol: 118, casosVen: 64, total: 182, porcentaje: 59.3, nvdf: 9895, razonPrevalencia: 18.4, semana: 26 },
    { nombre: 'Tibú', casosCol: 14, casosVen: 15, total: 28, porcentaje: 9.1, nvdf: 1496, razonPrevalencia: 18.7, semana: 9 },
    { nombre: 'Villa del Rosario', casosCol: 14, casosVen: 10, total: 24, porcentaje: 7.8, nvdf: 1228, razonPrevalencia: 19.5, semana: 7 },
    { nombre: 'Ocaña', casosCol: 6, casosVen: 6, total: 12, porcentaje: 3.9, nvdf: 1729, razonPrevalencia: 6.9, semana: 3 },
    { nombre: 'El Tarra', casosCol: 6, casosVen: 2, total: 8, porcentaje: 2.6, nvdf: 508, razonPrevalencia: 15.7, semana: 1 },
    { nombre: 'Teorama', casosCol: 7, casosVen: 0, total: 7, porcentaje: 2.3, nvdf: 225, razonPrevalencia: 31.1, semana: 3 },
    { nombre: 'El Zulia', casosCol: 7, casosVen: 0, total: 7, porcentaje: 2.3, nvdf: 457, razonPrevalencia: 15.3, semana: 1 },
    { nombre: 'Los Patios', casosCol: 4, casosVen: 0, total: 4, porcentaje: 1.3, nvdf: 877, razonPrevalencia: 4.6, semana: 0 },
    { nombre: 'Ábrego', casosCol: 3, casosVen: 1, total: 4, porcentaje: 1.3, nvdf: 377, razonPrevalencia: 10.6, semana: 2 },
    { nombre: 'Convención', casosCol: 3, casosVen: 1, total: 4, porcentaje: 1.3, nvdf: 272, razonPrevalencia: 14.7, semana: 0 },
    { nombre: 'Sardinata', casosCol: 2, casosVen: 2, total: 4, porcentaje: 1.3, nvdf: 304, razonPrevalencia: 13.2, semana: 0 },
    { nombre: 'Arboledas', casosCol: 3, casosVen: 0, total: 3, porcentaje: 1.0, nvdf: 96, razonPrevalencia: 31.3, semana: 0 },
    { nombre: 'El Carmen', casosCol: 2, casosVen: 0, total: 2, porcentaje: 0.7, nvdf: 335, razonPrevalencia: 6.0, semana: 0 },
    { nombre: 'Salazar', casosCol: 1, casosVen: 1, total: 2, porcentaje: 0.7, nvdf: 90, razonPrevalencia: 22.2, semana: 0 },
    { nombre: 'San Calixto', casosCol: 1, casosVen: 1, total: 2, porcentaje: 0.7, nvdf: 72, razonPrevalencia: 27.8, semana: 0 },
    { nombre: 'San Cayetano', casosCol: 2, casosVen: 0, total: 2, porcentaje: 0.7, nvdf: 72, razonPrevalencia: 27.8, semana: 0 },
    { nombre: 'Cácota', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 77, razonPrevalencia: 13.0, semana: 0 },
    { nombre: 'Gramalote', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 66, razonPrevalencia: 15.2, semana: 0 },
    { nombre: 'La Esperanza', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 107, razonPrevalencia: 9.3, semana: 0 },
    { nombre: 'Lourdes', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 114, razonPrevalencia: 8.8, semana: 0 },
    { nombre: 'Pamplona', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 489, razonPrevalencia: 2.0, semana: 0 },
    { nombre: 'Puerto Santander', casosCol: 0, casosVen: 1, total: 1, porcentaje: 0.3, nvdf: 246, razonPrevalencia: 4.1, semana: 0 },
    { nombre: 'Santiago', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 36, razonPrevalencia: 27.8, semana: 0 },
    { nombre: 'Villa Caro', casosCol: 1, casosVen: 0, total: 1, porcentaje: 0.3, nvdf: 57, razonPrevalencia: 17.5, semana: 0 },

    // Total
    { nombre: 'Norte de Santander', casosCol: 190, casosVen: 117, total: 307, porcentaje: 100.0, nvdf: 20449, razonPrevalencia: 15.0, semana: 43 },
  ];
  ngAfterViewInit(): void {
    this.renderChart();
  }
  // Cuando seleccionan el archivo
  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      console.error('⚠️ Solo se permite un archivo.');
      return;
    }
    this.selectedFile = target.files[0];
  }

  // Procesar archivo al enviar
  onSubmit(): void {
    this.btnselectedFile=true;
    if (!this.selectedFile){ 
      this.btnselectedFile=false;
       Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Selecciona un archivo primero',
            confirmButtonColor: '#d33'
          });
      return
    };

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });

      // Tomar la primera hoja
      const sheetName: string = workbook.SheetNames[0];
      const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (data.length > 0) {
        // Primera fila como encabezados
        this.tableHeaders = data[0] as string[];
        // El resto como datos
        let op=0;
        this.excelData = data.slice(1).map((row) => {
          
          console.log(op++);
          const obj: any = {};
          this.tableHeaders.forEach((key, i) => {
            //aca se realiza la validacion



            
            obj[key] = row[i];
          });
          
          return obj;
        });
        this.btnselectedFile=false;
        if(this.excelData.length>0){
          if(this.excelData[0].cod_eve=='113'){
            //DESNUTRICIÓN AGUDA EN MENORES DE 5 AÑOS
            this.validarDesnAgudMenor5();
          }else if(this.excelData[0].cod_eve=='750'){
            this.validarSifilis();
          }
          Swal.fire({
            icon: 'success',
            title: 'Lectura confirmada',
            text: 'Archivo ha sido leido exitosamente!..',
            confirmButtonColor: '#d33'
          });
          

        }else{
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Archivo no valido',
            confirmButtonColor: '#d33'
          });
        }
        
        console.log(this.excelData);
        
      }else{
        this.btnselectedFile=false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay datos en el archivo',
          confirmButtonColor: '#d33'
        });
      }
    };
    reader.readAsBinaryString(this.selectedFile);
  }
  validarDesnAgudMenor5(){
    //validando DESNUTRICIÓN AGUDA EN MENORES DE 5 AÑOS
    this.datosValidados=[];
    for(var i=0;i<this.excelData.length;i++){
      if(this.excelData[i].ajuste_!='D' && this.excelData[i].ajuste_!='6'){
        this.datosValidados.push(this.excelData[i]);
      }
    }

    console.log(this.datosValidados);
  } 
  validarSifilis(){
    console.log('SIFILIS GESTACIONAL', JSON.stringify(this.excelData));
    this.datosValidados = this.excelData.filter(
      (value, index, self) =>
        index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
    );
    console.log(this.datosValidados);

  }
  getColor(estado: string): string {
    switch (estado) {
      case 'incremento': return '#f1c40f'; // Amarillo
      case 'decremento': return '#7f8c8d'; // Gris oscuro
      case 'estable': return '#bdc3c7';    // Gris claro
      default: return '#ecf0f1';
    }
  }
  renderChart() {
    console.log('grafica 1');
    new Chart('casosChart', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 52 }, (_, i) => (i + 1).toString()),
        datasets: [
          {
            type: 'bar',
            label: '2025',
            data: [5, 10, 12, 14, 8, 15, 20, 18, 12, 17, 14, 10, 8, 6],
            backgroundColor: '#888',
            barThickness: 6,
          },
          {
            type: 'line',
            label: '2024',
            data: [7, 12, 15, 18, 10, 12, 16, 14, 13, 12, 11, 9, 8, 7],
            borderColor: '#f1c40f',
            backgroundColor: '#f1c40f',
            fill: false,
          },
          {
            type: 'line',
            label: '2023',
            data: [6, 9, 11, 15, 17, 14, 19, 20, 15, 18, 12, 9, 7, 6],
            borderColor: '#3498db',
            backgroundColor: '#3498db',
            fill: false,
          }
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
        display: true,
        text: 'Semanas Epidemiológicas',
        position: 'bottom',   // 👈 lo muestra abajo
        font: {
          size: 14,
          weight: 'bold'
        }
      }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });


    new Chart('edadChart', {
      type: 'bar',
      data: {
        labels: ['Menor 14', '15 a 24', '25 a 34', '35 a 44', '45 a 54'],
        datasets: [
          {
            label: 'Número de Casos',
            data: [0.7, 53.7, 34.5, 10.4, 0.7],
            backgroundColor: [
              '#007bff',  // Azul
              '#f1c40f',  // Amarillo (15 a 24)
              '#007bff',  
              '#007bff',
              '#007bff'
            ],
            //borderRadius: 5, // Bordes redondeados
            barThickness: 25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,  // 🔹 Permite ajustar libremente altura
        plugins: {  
          legend: { display: false }, // Ocultar leyenda
          datalabels: {
            anchor: 'end',
            align: 'end',
            formatter: (value) => `${value}%`, // Mostrar el valor con %
            color: '#000',
            font: {
              weight: 'bold',
              size: 12
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Número de Casos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Edad'
            }
          }
        }
      }
    }); 

    /*
    new Chart("regimenChart", {
      type: 'doughnut',
      data: {
        labels: ["Subsidado", "No asegurado", "Contributivo", "Especial"],
        datasets: [{
          data: [59.3, 24.8, 15.6, 0.3],
          backgroundColor: ["#e67e22", "#f1c40f", "#27ae60", "#7f8c8d"],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Tipo de régimen en salud',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#333'
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`
            }
          }
        }
      }
    });

    new Chart("areaChart", {
      type: 'doughnut',
      data: {
        labels: ["Cabecera Municipal", "Rural Disperso", "Centro Poblado"],
        datasets: [{
          data: [86.0, 6.8, 7.2],
          backgroundColor: ["#e67e22", "#f1c40f", "#27ae60"],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Área de Residencia',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#333'
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`
            }
          }
        }
      }
    });
    new Chart("etniaChart", {
      type: 'doughnut',
      data: {
        labels: ["Otros", "Indígena", "Rom / Gitano"],
        datasets: [{
          data: [99.0, 1.0, 0.0],
          backgroundColor: ["#e67e22", "#f1c40f", "#27ae60"],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Pertenencia Étnica',
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#333'
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`
            }
          }
        }
      }
    });
    */

  }
  imprimir() {
    //window.print();
    console.log('imprimeiendo ');
    const element = document.getElementById('contenidoImprimir');

    const options = {
      margin:       [0, 10, 20, 10], // top, left, bottom, right
      filename:     'informe-sifilis.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } // respeta saltos de página CSS
    };

    html2pdf().set(options).from(element).save();
  }
}
