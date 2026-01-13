import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms'; 
declare var bootstrap: any; // si usas Bootstrap 5 puro
import { FilterPipe } from '../filter.pipe'; // ruta a tu pipe
import { FirebaseService } from '../../services/firebase.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import * as bcrypt from 'bcryptjs';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilterPipe, FormsModule],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  usuarioForm!: FormGroup;
  submitted = false;
  submittedbtn = false;
  usuarios: any[] = []; // lista de usuarios de prueba 
  searchText: string = '';
  editarForm!: FormGroup;

  usuarioSeleccionado: any = null;
  constructor(private fb: FormBuilder, private fbService: FirebaseService, private authService: AuthService) {}

  ngOnInit(): void {
    this.usuarioForm = this.fb.group({ 
      numid: ['', Validators.required],
      tipoid: ['', Validators.required],
      nombres: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      rol: ['', Validators.required],
      mnpo: ['', Validators.required],
      institucion: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      estado: [1, Validators.required],
      uid: ['']
    });
     this.editarForm = this.fb.group({
      uid: [''],
      numid: ['', Validators.required],
      tipoid: ['', Validators.required],
      nombres: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      rol: ['', Validators.required],
      mnpo: ['', Validators.required],
      institucion: ['', Validators.required],
      estado: [1, Validators.required]
    });
     this.fbService.getUsuarios().subscribe(data => {
      this.usuarios = data;
      console.log(this.usuarios);
    });
  }

  // getter para acceder fácilmente a los campos
  get f() {
    return this.usuarioForm.controls;
  } 
  get fe() {
    return this.editarForm.controls;
  }

  abrirModalConfirmacion() {
    this.submitted = true;
    this.submittedbtn = true;
    if (this.usuarioForm.invalid) {
      
      this.submittedbtn = false;
      return;
    }

    
    const valores = this.usuarioForm.value;

    Swal.fire({
      title: 'Confirmar Registro',
      html: `
        <p>Revisa los datos antes de registrar:</p>
        <ul class="list-group text-start small" style="font-size: 0.85rem;">
          <li class="list-group-item"><b>Tipo ID:</b> ${valores.tipoid}</li>
          <li class="list-group-item"><b>Número ID:</b> ${valores.numid}</li>
          <li class="list-group-item"><b>Nombres:</b> ${valores.nombres }</li>
          <li class="list-group-item"><b>Teléfono:</b> ${valores.telefono}</li>
          <li class="list-group-item"><b>Correo:</b> ${valores.correo}</li>
          <li class="list-group-item"><b>Contraseña:</b> ${valores.password}</li>
          <li class="list-group-item"><b>Rol:</b> ${valores.rol}</li>
          <li class="list-group-item"><b>Departamento/Municipio:</b> ${valores.mnpo}</li>
          <li class="list-group-item"><b>Institución:</b> ${valores.institucion}</li>
        </ul>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.registrarUsuario();
      }else{
        this.submittedbtn = false;
      }
    });
    /*
    const modal = new bootstrap.Modal(document.getElementById('confirmacionModal'));
    modal.show();*/
  }

  async registrarUsuario() {
    this.submitted = false;
    console.log(this.usuarioForm.value); 

    const result = await this.authService.registrarUsuarioSinCambiarSesion(this.usuarioForm.value.correo, this.usuarioForm.value.password);
    console.log(result);
    if (result.success) {
      console.log('Usuario registrado en Auth :', result.uid);
      // Aquí puedes mostrar un SweetAlert de éxito
      
      this.usuarioForm.patchValue({uid: result.uid});
      console.log('✅ Registrando usuario Firestore con UID...', this.usuarioForm.value);
      // Guardar usuario 
      this.fbService.addUsuario(this.usuarioForm.value)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario registrado',
          text: 'El usuario ha sido registrado correctamente',
          confirmButtonColor: '#d33'
        }).then((result) => {
          window.location.reload();
          
        });
        
        this.submittedbtn = false;
        this.usuarioForm.reset();
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar el usuario: ' + error,
          confirmButtonColor: '#d33'
        });
        this.submittedbtn = false;
      });
    } else {
      console.error('Error:', result);
       Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo registrar el usuario: ' + result.error,
          confirmButtonColor: '#d33'
        });
        this.submittedbtn = false;
      // Aquí puedes mostrar un SweetAlert de error
    }
    
    const salt = bcrypt.genSaltSync(10);
    
    //this.usuarioForm.patchValue({ password: bcrypt.hashSync(this.usuarioForm.value.password, salt) });
   
    //const nuevoUsuario = this.usuarioForm.value;
    //this.usuarios.push(nuevoUsuario);
     

    /*
    if (this.usuarioForm.invalid) {
      return;
    }

    // Guardar usuario
    const nuevoUsuario = this.usuarioForm.value;
    this.usuarios.push(nuevoUsuario);

    // Resetear
    this.usuarioForm.reset();
    this.submitted = false;
    const modalEl = document.getElementById('confirmacionModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();*/
  }

 

  eliminarUsuario(usuario:any) {
    console.log('Eliminar', usuario);
    
    this.usuarioSeleccionado = usuario;
     const valores = this.usuarioSeleccionado;

    Swal.fire({
      title: 'Confirmar eliminar',
      html: `
        <p>Revisa los datos antes de continuar:</p>
        <ul class="list-group text-start small" style="font-size: 0.85rem;">
          <li class="list-group-item"><b>Tipo ID:</b> ${valores.tipoid}</li>
          <li class="list-group-item"><b>Número ID:</b> ${valores.numid}</li>
          <li class="list-group-item"><b>Nombres:</b> ${valores.nombres}</li> 
          <li class="list-group-item"><b>Departamento/Municipio:</b> ${valores.mnpo}</li>
          <li class="list-group-item"><b>Institución:</b> ${valores.institucion}</li>
        </ul>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fbService.eliminarUsuario(this.usuarioSeleccionado.id)
        .then(() => {
          //Object.assign(this.usuarioSeleccionado, this.editarForm.value);
          console.log(this.editarForm.value);
          console.log('Usuario eliminado:', this.usuarioSeleccionado);
           
          Swal.fire({
            title: 'Actualizado!',
            text: 'El usuario ha sido eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#d33'
          });
              
        }).catch((error) => {
          Swal.fire('❌ Error', error.message, 'error');
        });
      }
    });
  }

  darDeBaja(usuario: any) {
    console.log('Dar de baja', usuario);
    this.usuarioSeleccionado = usuario;
     const valores = this.usuarioSeleccionado;

    Swal.fire({
      title: 'Confirmar dar de baja',
      html: `
        <p>Revisa los datos antes de continuar:</p>
        <ul class="list-group text-start small" style="font-size: 0.85rem;">
          <li class="list-group-item"><b>Tipo ID:</b> ${valores.tipoid}</li>
          <li class="list-group-item"><b>Número ID:</b> ${valores.numid}</li>
          <li class="list-group-item"><b>Nombres:</b> ${valores.nombres}</li> 
          <li class="list-group-item"><b>Departamento/Municipio:</b> ${valores.mnpo}</li>
          <li class="list-group-item"><b>Institución:</b> ${valores.institucion}</li>
        </ul>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fbService.actualizarEstadoUsuario(this.usuarioSeleccionado.id, {estado:0})
        .then(() => {
          //Object.assign(this.usuarioSeleccionado, this.editarForm.value);
          console.log(this.editarForm.value);
          console.log('Usuario dado de baja:', this.usuarioSeleccionado);
           
          Swal.fire({
            title: 'Actualizado!',
            text: 'El usuario ha sido dado de baja correctamente.',
            icon: 'success',
            confirmButtonColor: '#d33'
          });
              
        }).catch((error) => {
          Swal.fire('❌ Error', error.message, 'error');
        });
       
        
      }
    });
  }

  activarUsuario(usuario: any) {
    console.log('activar', usuario);
    this.usuarioSeleccionado = usuario;
     const valores = this.usuarioSeleccionado;

    Swal.fire({
      title: 'Confirmar activar usuario',
      html: `
        <p>Revisa los datos antes de continuar:</p>
        <ul class="list-group text-start small" style="font-size: 0.85rem;">
          <li class="list-group-item"><b>Tipo ID:</b> ${valores.tipoid}</li>
          <li class="list-group-item"><b>Número ID:</b> ${valores.numid}</li>
          <li class="list-group-item"><b>Nombres:</b> ${valores.nombres}</li> 
          <li class="list-group-item"><b>Departamento/Municipio:</b> ${valores.mnpo}</li>
          <li class="list-group-item"><b>Institución:</b> ${valores.institucion}</li>
        </ul>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fbService.actualizarEstadoUsuario(this.usuarioSeleccionado.id, {estado:1})
        .then(() => {
          //Object.assign(this.usuarioSeleccionado, this.editarForm.value);
          console.log(this.editarForm.value);
          console.log('Usuario activado:', this.usuarioSeleccionado);
           
          Swal.fire({
            title: 'Actualizado!',
            text: 'El usuario ha sido activado correctamente.',
            icon: 'success',
            confirmButtonColor: '#d33'
          });
              
        }).catch((error) => {
          Swal.fire('❌ Error', error.message, 'error');
        });
       
        
      }
    });
  }

  
  abrirEditarUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.editarForm.patchValue(usuario); // cargar datos en el form
  }

  actualizarUsuario() {
    this.submitted=true;        
    if (this.editarForm.invalid) return;
    
    const valores = this.editarForm.value;

    Swal.fire({
      title: 'Confirmar Actualización',
      html: `
        <p>Revisa los datos antes de actualizar:</p>
        <ul class="list-group text-start small" style="font-size: 0.85rem;">
          <li class="list-group-item"><b>Tipo ID:</b> ${valores.tipoid}</li>
          <li class="list-group-item"><b>Número ID:</b> ${valores.numid}</li>
          <li class="list-group-item"><b>Nombres:</b> ${valores.nombres}</li>
          <li class="list-group-item"><b>Teléfono:</b> ${valores.telefono}</li>
          <li class="list-group-item"><b>Correo:</b> ${valores.correo}</li>
          <li class="list-group-item"><b>Rol:</b> ${valores.rol}</li>
          <li class="list-group-item"><b>Departamento/Municipio:</b> ${valores.mnpo}</li>
          <li class="list-group-item"><b>Institución:</b> ${valores.institucion}</li>
        </ul>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fbService.updateUsuario(this.usuarioSeleccionado.id, this.editarForm.value)
        .then(() => {
          //Object.assign(this.usuarioSeleccionado, this.editarForm.value);
          console.log(this.editarForm.value);
          console.log('Usuario actualizado:', this.usuarioSeleccionado);
          
          this.submitted = false;
          this.cerrarModal('editarUsuarioModal');
          Swal.fire({
            title: 'Actualizado!',
            text: 'El usuario ha sido actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#d33'
          });
              
        }).catch((error) => {
          Swal.fire('❌ Error', error.message, 'error');
        });
       
        
      }
    });
   
    // Aquí deberías llamar a tu servicio para guardar cambios en BD
  }
  
  cerrarModal(id:string){

    const modalEl = document.getElementById(id);
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  }

}
