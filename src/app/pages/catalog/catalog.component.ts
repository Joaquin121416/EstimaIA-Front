// src/app/pages/catalog/catalog.component.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

const DEVELOPERS = [
  { id:1, nombre:"Ana Quispe", email:"a.quispe@consultora.pe", seniority:"senior", tecnologias:["react","node","postgresql","docker"], disponibilidad_pct:90, activo:true },
  { id:2, nombre:"Carlos Mendoza", email:"c.mendoza@consultora.pe", seniority:"mid", tecnologias:["node","postgresql","rest"], disponibilidad_pct:100, activo:true },
  { id:3, nombre:"Lucia Torres", email:"l.torres@consultora.pe", seniority:"mid", tecnologias:["react","typescript","tailwind"], disponibilidad_pct:75, activo:true },
  { id:4, nombre:"Jorge Ramos", email:"j.ramos@consultora.pe", seniority:"senior", tecnologias:["fastapi","python","docker"], disponibilidad_pct:60, activo:true },
  { id:5, nombre:"Maria Paz Flores", email:"m.paz@consultora.pe", seniority:"junior", tecnologias:["react","javascript"], disponibilidad_pct:100, activo:true },
  { id:6, nombre:"Diego Paredes", email:"d.paredes@consultora.pe", seniority:"mid", tecnologias:["angular","typescript","net"], disponibilidad_pct:80, activo:true },
  { id:7, nombre:"Valeria Rios", email:"v.rios@consultora.pe", seniority:"senior", tecnologias:["react_native","react","firebase"], disponibilidad_pct:70, activo:true },
  { id:8, nombre:"Andres Castillo", email:"a.castillo@consultora.pe", seniority:"mid", tecnologias:["node","fastapi","docker"], disponibilidad_pct:90, activo:true },
  { id:9, nombre:"Camila Vega", email:"c.vega@consultora.pe", seniority:"junior", tecnologias:["vue","javascript","node"], disponibilidad_pct:100, activo:true },
  { id:10, nombre:"Roberto Salas", email:"r.salas@consultora.pe", seniority:"senior", tecnologias:["angular","java","spring"], disponibilidad_pct:50, activo:false },
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h1 class="page-title">Catalogo de Desarrolladores</h1>
    <p class="page-sub">Gestion de perfiles, competencias y disponibilidad · {{ devs.length }} desarrolladores registrados</p>

    <!-- Toolbar -->
    <div class="flex gap-3 mb-5 flex-wrap">
      <input [(ngModel)]="search" class="input-field flex-1 min-w-48" placeholder="Buscar por nombre o email..." />
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
      <button class="btn-primary text-sm whitespace-nowrap">+ Nuevo desarrollador</button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
        <span class="text-sm font-bold text-gray-700">Desarrolladores</span>
        <span class="text-xs text-gray-400">Mostrando {{ filtered().length }} de {{ devs.length }}</span>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th class="px-4 py-2.5 text-left">Desarrollador</th>
            <th class="px-4 py-2.5 text-left">Seniority</th>
            <th class="px-4 py-2.5 text-left">Tecnologias</th>
            <th class="px-4 py-2.5 text-left">Disponibilidad</th>
            <th class="px-4 py-2.5 text-left">Estado</th>
            <th class="px-4 py-2.5 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (dev of filtered(); track dev.id) {
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
  devs = DEVELOPERS.map(d => ({ ...d }));
  search = '';
  filterSeniority = '';
  filterStatus = '';

  filtered = computed(() => {
    return this.devs.filter(d => {
      const matchSearch = !this.search ||
        d.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
        d.email.toLowerCase().includes(this.search.toLowerCase());
      const matchSeniority = !this.filterSeniority || d.seniority === this.filterSeniority;
      const matchStatus = !this.filterStatus || d.activo.toString() === this.filterStatus;
      return matchSearch && matchSeniority && matchStatus;
    });
  });

  toggleActivo(dev: any) { dev.activo = !dev.activo; }

  getInitials(nombre: string): string {
    return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getColor(id: number): string {
    const colors = ['#1A5FAD','#059669','#7C3AED','#D97706','#DC2626','#0891B2','#7C3AED','#059669','#6B7280','#9CA3AF'];
    return colors[(id - 1) % colors.length];
  }

  getSeniorityBadge(s: string): string {
    if (s === 'senior') return 'badge-amber';
    if (s === 'mid') return 'badge-blue';
    return 'badge-green';
  }
}
