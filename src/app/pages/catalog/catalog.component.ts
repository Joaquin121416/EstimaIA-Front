// src/app/pages/catalog/catalog.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Colaborador, ColaboradorInput, ROLES, rolBadge, rolInfo } from '../../core/data/colaboradores';
import { ColaboradoresService } from '../../core/services/colaboradores.service';
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
      <button (click)="abrirNuevo()" class="btn-primary text-sm whitespace-nowrap">+ Nuevo colaborador</button>
    </div>

    @if (error()) {
      <div class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠ {{ error() }}</div>
    }

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
          @if (loading()) {
            <tr><td colspan="8" class="px-4 py-10 text-center text-gray-400">Cargando colaboradores...</td></tr>
          }
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
                <button (click)="toggleActivo(dev)" [disabled]="guardando()"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                  [class]="dev.activo ? 'bg-emerald-500' : 'bg-gray-300'">
                  <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow"
                        [class]="dev.activo ? 'translate-x-4' : 'translate-x-1'"></span>
                </button>
              </td>
              <td class="px-4 py-3">
                @if (borrandoId === dev.id) {
                  <div class="flex gap-1 items-center">
                    <span class="text-xs text-red-600 mr-1">¿Eliminar?</span>
                    <button (click)="eliminar(dev)" [disabled]="guardando()"
                      class="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50">Sí</button>
                    <button (click)="borrandoId = null"
                      class="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">No</button>
                  </div>
                } @else {
                  <div class="flex gap-2">
                    <a [routerLink]="['/profile', dev.id]"
                       class="text-xs font-semibold text-brand bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Ver</a>
                    <button (click)="abrirEditar(dev)" class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100">Editar</button>
                    <button (click)="borrandoId = dev.id" class="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Borrar</button>
                  </div>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Modal crear / editar -->
    @if (form; as f) {
      <div class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" (click)="cerrar()">
        <div class="card w-full max-w-2xl max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <p class="font-bold text-navy">{{ editandoId ? 'Editar colaborador' : 'Nuevo colaborador' }}</p>
            <button (click)="cerrar()" class="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          </div>

          <div class="p-6 grid grid-cols-2 gap-4">
            <div>
              <label class="label">Nombre <span class="text-red-500">*</span></label>
              <input [(ngModel)]="f.nombre" class="input-field" />
            </div>
            <div>
              <label class="label">Email</label>
              <input [(ngModel)]="f.email" type="email" class="input-field" />
            </div>

            <div class="col-span-2">
              <label class="label">Rol <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-4 gap-2">
                @for (r of roles; track r.value) {
                  <button type="button" (click)="f.rol = r.value"
                    class="border rounded-lg px-3 py-2 text-left text-sm transition-colors"
                    [class]="f.rol === r.value ? 'border-brand bg-brand-xlight' : 'border-gray-200 hover:bg-gray-50'">
                    <span class="font-semibold text-navy block">{{ r.label }}</span>
                    <span class="text-[10px]" [class]="r.tipo === 'end_to_end' ? 'text-brand' : 'text-gray-400'">
                      {{ r.tipo === 'end_to_end' ? 'End-to-end' : 'Apoyo' }}
                    </span>
                  </button>
                }
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ rolInfo(f.rol).descripcion }}</p>
            </div>

            <div>
              <label class="label">Seniority</label>
              <select [(ngModel)]="f.seniority" class="input-field">
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div>
              <label class="label">Costo por hora (S/.) <span class="text-red-500">*</span></label>
              <input [(ngModel)]="f.costo_hora" type="number" min="0" step="0.5" class="input-field" />
              <p class="text-xs text-gray-400 mt-1">≈ S/ {{ (f.costo_hora || 0) * 160 | number:'1.0-0' }} al mes (160 h)</p>
            </div>
            <div>
              <label class="label">Disponibilidad (%)</label>
              <input [(ngModel)]="f.disponibilidad_pct" type="number" min="0" max="100" class="input-field" />
            </div>
            <div>
              <label class="label">Años de experiencia</label>
              <input [(ngModel)]="f.experiencia_anos" type="number" min="0" max="50" class="input-field" />
            </div>

            <div class="col-span-2">
              <label class="label">Tecnologías / herramientas</label>
              <input [(ngModel)]="tecnologiasTexto" class="input-field" placeholder="Separadas por coma: react, node, docker" />
            </div>
            <div class="col-span-2">
              <label class="label">Proyectos anteriores</label>
              <textarea [(ngModel)]="proyectosTexto" rows="3" class="input-field" placeholder="Uno por línea"></textarea>
            </div>
            <div class="col-span-2">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" [(ngModel)]="f.activo" class="w-4 h-4 accent-brand" />
                Activo (disponible para recomendar en equipos)
              </label>
            </div>
          </div>

          @if (errorForm()) {
            <div class="mx-6 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠ {{ errorForm() }}</div>
          }

          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button (click)="cerrar()" class="btn-secondary text-sm">Cancelar</button>
            <button (click)="guardar()" [disabled]="!formValido() || guardando()" class="btn-primary text-sm">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CatalogComponent implements OnInit {
  devs: Colaborador[] = [];
  roles = ROLES;
  rolBadge = rolBadge;
  rolInfo = rolInfo;
  search = '';
  filterRol: Rol | '' = '';
  filterSeniority = '';
  filterStatus = '';

  loading = signal(true);
  guardando = signal(false);
  error = signal('');
  errorForm = signal('');

  // Formulario del modal (null = cerrado)
  form: ColaboradorInput | null = null;
  editandoId: number | null = null;
  borrandoId: number | null = null;   // fila que muestra "¿Eliminar? Si / No"
  tecnologiasTexto = '';
  proyectosTexto = '';

  constructor(private api: ColaboradoresService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: list => { this.devs = list; this.loading.set(false); },
      error: err => { this.loading.set(false); this.error.set(this.mensaje(err, 'No se pudo cargar el catálogo')); }
    });
  }

  get filtered() {
    const q = this.search.toLowerCase();
    return this.devs.filter(d => {
      const matchSearch = !q || d.nombre.toLowerCase().includes(q) || (d.email ?? '').toLowerCase().includes(q);
      const matchSeniority = !this.filterSeniority || d.seniority === this.filterSeniority;
      const matchStatus = !this.filterStatus || d.activo.toString() === this.filterStatus;
      const matchRol = !this.filterRol || d.rol === this.filterRol;
      return matchSearch && matchSeniority && matchStatus && matchRol;
    });
  }

  countRol(rol: Rol) { return this.devs.filter(d => d.rol === rol).length; }

  promedioRol(rol: Rol) {
    const c = this.devs.filter(d => d.rol === rol && d.activo).map(d => d.costo_hora);
    return c.length ? c.reduce((a, b) => a + b, 0) / c.length : 0;
  }

  toggleActivo(dev: Colaborador) {
    this.guardando.set(true);
    this.api.toggleActivo(dev.id).subscribe({
      next: upd => { this.reemplazar(upd); this.guardando.set(false); },
      error: err => { this.guardando.set(false); this.error.set(this.mensaje(err, 'No se pudo cambiar el estado')); }
    });
  }

  eliminar(dev: Colaborador) {
    this.guardando.set(true);
    this.error.set('');
    this.api.delete(dev.id).subscribe({
      next: () => {
        this.devs = this.devs.filter(d => d.id !== dev.id);
        this.borrandoId = null;
        this.guardando.set(false);
      },
      error: err => {
        this.guardando.set(false);
        this.borrandoId = null;
        this.error.set(this.mensaje(err, 'No se pudo eliminar'));
      }
    });
  }

  abrirNuevo() {
    this.editandoId = null;
    this.form = {
      nombre: '', email: '', rol: 'dev', seniority: 'mid', tecnologias: [],
      disponibilidad_pct: 100, experiencia_anos: 0, costo_hora: 0, proyectos: [], activo: true,
    };
    this.tecnologiasTexto = '';
    this.proyectosTexto = '';
    this.errorForm.set('');
  }

  abrirEditar(dev: Colaborador) {
    const { id, ...datos } = dev;
    this.editandoId = id;
    this.form = { ...datos, tecnologias: [...dev.tecnologias], proyectos: [...dev.proyectos] };
    this.tecnologiasTexto = dev.tecnologias.join(', ');
    this.proyectosTexto = dev.proyectos.join('\n');
    this.errorForm.set('');
  }

  cerrar() {
    if (this.guardando()) return;
    this.form = null;
    this.editandoId = null;
  }

  formValido(): boolean {
    const f = this.form;
    return !!f && f.nombre.trim().length >= 2 && f.costo_hora !== null && f.costo_hora >= 0
      && f.disponibilidad_pct >= 0 && f.disponibilidad_pct <= 100;
  }

  guardar() {
    if (!this.form || !this.formValido()) return;
    const payload: ColaboradorInput = {
      ...this.form,
      nombre: this.form.nombre.trim(),
      email: this.form.email?.trim() || null,
      costo_hora: Number(this.form.costo_hora),
      disponibilidad_pct: Number(this.form.disponibilidad_pct),
      experiencia_anos: Number(this.form.experiencia_anos) || 0,
      tecnologias: this.tecnologiasTexto.split(',').map(t => t.trim()).filter(t => t),
      proyectos: this.proyectosTexto.split(/\r?\n/).map(p => p.trim()).filter(p => p),
    };
    this.guardando.set(true);
    this.errorForm.set('');
    const req = this.editandoId
      ? this.api.update(this.editandoId, payload)
      : this.api.create(payload);
    req.subscribe({
      next: c => {
        if (this.editandoId) this.reemplazar(c); else this.devs = [...this.devs, c];
        this.guardando.set(false);
        this.cerrar();
      },
      error: err => { this.guardando.set(false); this.errorForm.set(this.mensaje(err, 'No se pudo guardar')); }
    });
  }

  private reemplazar(c: Colaborador) {
    this.devs = this.devs.map(d => d.id === c.id ? c : d);
  }

  private mensaje(err: any, base: string): string {
    const det = err?.error?.detail;
    if (typeof det === 'string') return `${base}: ${det}`;
    if (Array.isArray(det) && det.length) return `${base}: revisa ${det.map((d: any) => d.loc?.slice(-1)[0]).join(', ')}`;
    return base;
  }

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
