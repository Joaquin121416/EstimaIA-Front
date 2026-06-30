// pages/users/users.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/auth.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Gestion de Usuarios</h1>
    <p class="page-sub">Administra los roles y el acceso de los usuarios del sistema (HU-14)</p>

    @if (loading()) {
      <div class="card p-10 text-center text-gray-400">Cargando usuarios...</div>
    } @else if (error()) {
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{{ error() }}</div>
    } @else {

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="card p-4">
          <p class="text-xs text-gray-500 mb-1">Total de usuarios</p>
          <p class="text-2xl font-bold text-navy">{{ users().length }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500 mb-1">Administradores</p>
          <p class="text-2xl font-bold text-amber-600">{{ countByRole('admin') }}</p>
        </div>
        <div class="card p-4">
          <p class="text-xs text-gray-500 mb-1">Project Managers</p>
          <p class="text-2xl font-bold text-brand">{{ countByRole('pm') }}</p>
        </div>
      </div>

      <div class="card overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">
          Usuarios del sistema
        </div>
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-2.5 text-left">Usuario</th>
              <th class="px-4 py-2.5 text-left">Rol</th>
              <th class="px-4 py-2.5 text-left">Estado</th>
              <th class="px-4 py-2.5 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr class="border-t border-gray-50 hover:bg-gray-50" [class.opacity-50]="!u.activo">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                         [style.background]="u.rol === 'admin' ? '#D97706' : '#1A5FAD'">
                      {{ getInitials(u.nombre) }}
                    </div>
                    <div>
                      <p class="font-semibold text-navy">{{ u.nombre }}</p>
                      <p class="text-xs text-gray-400">{{ u.email }}</p>
                    </div>
                    @if (u.email === currentEmail()) {
                      <span class="badge-blue text-[10px]">Tu</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-3">
                  <select class="text-xs font-semibold border rounded-lg px-2 py-1"
                          [class]="u.rol === 'admin' ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-blue-300 text-blue-700 bg-blue-50'"
                          [value]="u.rol"
                          [disabled]="u.email === currentEmail()"
                          (change)="onRoleChange(u, $event)">
                    <option value="pm">PM</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <span [class]="u.activo ? 'badge-green' : 'badge-amber'">
                    {{ u.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button
                    [disabled]="!u.activo || u.email === currentEmail()"
                    (click)="onDeactivate(u)"
                    class="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    Desactivar
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (actionMsg()) {
        <div class="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
          ✓ {{ actionMsg() }}
        </div>
      }
    }
  `
})
export class UsersComponent implements OnInit {
  users = signal<Usuario[]>([]);
  loading = signal(true);
  error = signal('');
  actionMsg = signal('');

  constructor(private usersService: UsersService, private auth: AuthService) {}

  currentEmail = () => this.auth.currentUser()?.email ?? '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.usersService.listUsers().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.status === 403
          ? 'No tienes permisos de Administrador para ver esta seccion.'
          : 'Error al cargar usuarios.');
      }
    });
  }

  countByRole(rol: string): number {
    return this.users().filter(u => u.rol === rol).length;
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  onRoleChange(user: Usuario, event: Event) {
    const nuevoRol = (event.target as HTMLSelectElement).value;
    this.usersService.updateRol(user.id, nuevoRol).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.actionMsg.set(`Rol de ${user.nombre} actualizado a ${nuevoRol}.`);
        setTimeout(() => this.actionMsg.set(''), 3000);
      },
      error: () => this.error.set('No se pudo actualizar el rol.')
    });
  }

  onDeactivate(user: Usuario) {
    this.usersService.deactivate(user.id).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.actionMsg.set(`${user.nombre} fue desactivado.`);
        setTimeout(() => this.actionMsg.set(''), 3000);
      },
      error: () => this.error.set('No se pudo desactivar el usuario.')
    });
  }
}
