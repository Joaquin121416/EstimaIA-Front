// src/app/pages/catalog/catalog.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { COLABORADORES, ROLES, rolBadge, rolInfo } from '../../core/data/colaboradores';
import { Rol } from '../../core/models/estimate.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h1 class="page-title">Catalogo de Colaboradores</h1>
    <p class="page-sub">Gestion de perfiles, roles, competencias, disponibilidad y costo por hora · {{ devs.length }} colaboradores registrados</p>

    <!-- Resumen por rol -->
    <div class="grid grid-cols-4 gap-3 mb-5">
      @for (r of roles; track r.value) {
        <button (click)="filterRol = filterRol === r.value ? '' : r.value"
          class="card p-4 text-left transition-shadow hover:shadow-md"
          [class.ring-2]="filterRol === r.value" [class.ring-brand]="filterRol === r.value">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold px-2 py-0.5 rounded" [class]="rolBadge(r.value)">{{ r.label }}</span>
            <span class="text-[10px] uppercase tracking-wide" [class]="r.tipo === 'end_to_end' ? 'text-brand font-bold' : 'text-gray-400'">
              {{ r.tipo === 'end_to_end' ? 'End-to-end' : 'Apoyo' }}
            </span>
          </div>
          <p class="text-2xl font-bold text-navy mt-2">{{ countRol(r.value) }}</p>
          <p class="text-xs text-gray-400">Prom. S/ {{ promedioRol(r.value) | number:'1.2-2' }} / hora</p>
        </button>
      }
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 mb-5 flex-wrap">
      <input [(ngModel)]="search" class="input-field flex-1 min-w-48" placeholder="Buscar por nombre o email..." />
      <select [(ngModel)]="filterRol" class="input-field w-40">
        <option value="">Todos los roles</option>
        @for (r of roles; track r.value) { <option [value]="r.value">{{ r.label }}</option> }
      </select>
      <select [(ngModel)]="filterSeniority" class="input-field w-44">
        <option value="">Todos los seniority</option>
        <option value="senior">Senior</option>
        <option value="mid">Mid-level</option>
        <option value="junior">Junior</option>
      </select>
      <select [(ngModel)]="filterStatus" class="input-field w-36">
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
      <button class="btn-primary text-sm whitespace-nowrap">+ Nuevo colaborador</button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
        <span class="text-sm font-bold text-gray-700">Colaboradores</span>
        <span class="text-xs text-gray-400">Mostrando {{ filtered.length }} de {{ devs.length }}</span>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="px-4 py-2.5 text-left">Colaborador</th>
            <th class="px-4 py-2.5 text-left">Rol</th>
            <th class="px-4 py-2.5 text-left">Seniority</th>
            <th class="px-4 py-2.5 text-left">Tecnologias</th>
            <th class="px-4 py-2.5 text-left">Disponibilidad</th>
            <th class="px-4 py-2.5 text-right">Costo / hora</th>
            <th class="px-4 py-2.5 text-left">Estado</th>
            <th class="px-4 py-2.5 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (dev of filtered; track dev.id) {
            <tr class="border-t border-gray-50 hover:bg-gray-50 transition-colors" [class.opacity-50]="!dev.activo">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                       [style.background]="getColor(dev.id)">
                    {{ getInitials(dev.nombre) }}
                  </div>
                  <div>
                    <p class="font-semibold text-navy">{{ dev.nombre }}</p>
                    <p class="text-xs text-gray-400">{{ dev.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs font-semibold px-2 py-0.5 rounded" [class]="rolBadge(dev.rol)">{{ rolInfo(dev.rol).label }}</span>
                <p class="text-[10px] mt-1" [class]="dev.rol === 'dev' ? 'text-brand font-semibold' : 'text-gray-400'">
                  {{ dev.rol === 'dev' ? 'End-to-end' : 'Apoyo' }}
                </p>
              </td>
              <td class="px-4 py-3">
                <span [class]="getSeniorityBadge(dev.seniority)">{{ dev.seniority }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  @for (t of dev.tecnologias.slice(0,3); track t) {
                    <span class="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">{{ t }}</span>
                  }
                  @if (dev.tecnologias.length > 3) {
                    <span class="text-gray-400 text-xs">+{{ dev.tecnologias.length - 3 }}</span>
                  }
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="font-semibold" [class]="dev.disponibilidad_pct >= 70 ? 'text-emerald-600' : 'text-amber-500'">
                  {{ dev.disponibilidad_pct }}%
                </p>
                <div class="w-16 bg-gray-100 rounded-full h-1.5 mt-1">
                  <div class="h-1.5 rounded-full"
                       [class]="dev.disponibilidad_pct >= 70 ? 'bg-emerald-500' : 'bg-amber-400'"
                       [style.width]="dev.disponibilidad_pct + '%'"></div>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <p class="font-bold text-navy">S/ {{ dev.costo_hora | number:'1.2-2' }}</p>
                <p class="text-[10px] text-gray-400">≈ S/ {{ dev.costo_hora * 160 | number:'1.0-0' }} / mes</p>
              </td>
              <td class="px-4 py-3">
                <button (click)="toggleActivo(dev)"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                  [class]="dev.activo ? 'bg-emerald-500' : 'bg-gray-300'">
                  <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow"
                        [class]="dev.activo ? 'translate-x-4' : 'translate-x-1'"></span>
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <a [routerLink]="['/profile', dev.id]"
                     class="text-xs font-semibold text-brand bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Ver</a>
                  <button class="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Editar</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class CatalogComponent {
  devs = COLABORADORES.map(d => ({ ...d }));
  roles = ROLES;
  rolBadge = rolBadge;
  rolInfo = rolInfo;
  search = '';
  filterRol: Rol | '' = '';
  filterSeniority = '';
  filterStatus = '';

  get filtered() {
    return this.devs.filter(d => {
      const matchSearch = !this.search ||
        d.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
        d.email.toLowerCase().includes(this.search.toLowerCase());
      const matchSeniority = !this.filterSeniority || d.seniority === this.filterSeniority;
      const matchStatus = !this.filterStatus || d.activo.toString() === this.filterStatus;
      const matchRol = !this.filterRol || d.rol === this.filterRol;
      return matchSearch && matchSeniority && matchStatus && matchRol;
    });
  }

  countRol(rol: Rol) { return this.devs.filter(d => d.rol === rol).length; }

  promedioRol(rol: Rol) {
    const c = this.devs.filter(d => d.rol === rol).map(d => d.costo_hora);
    return c.length ? c.reduce((a, b) => a + b, 0) / c.length : 0;
  }

  toggleActivo(dev: any) { dev.activo = !dev.activo; }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getColor(id: number): string {
    const colors = ['#1A5FAD','#059669','#7C3AED','#D97706','#DC2626','#0891B2','#7C3AED','#059669','#6B7280','#9CA3AF','#9333EA','#0E7490','#B45309','#0891B2','#2563EB','#DC2626','#BE185D'];
    return colors[(id - 1) % colors.length];
  }

  getSeniorityBadge(s: string): string {
    if (s === 'senior') return 'badge-amber';
    if (s === 'mid') return 'badge-blue';
    return 'badge-green';
  }
}
