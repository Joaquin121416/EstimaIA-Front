// src/app/pages/estimate/estimate.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { ProjectInput } from '../../core/models/estimate.model';

@Component({
  selector: 'app-estimate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl">
      <h1 class="page-title">Nueva Estimación de Esfuerzo</h1>
      <p class="page-sub">Ingresa los parámetros del proyecto para obtener una predicción basada en Machine Learning</p>

      <div class="card">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
          <span class="text-sm font-bold text-emerald-700">Paso 1 de 2 — Parámetros del proyecto</span>
        </div>

        <div class="p-6 grid grid-cols-2 gap-5">
          <!-- Nombre -->
          <div class="col-span-2">
            <label class="label">Nombre del proyecto <span class="text-red-500">*</span></label>
            <input [(ngModel)]="form.nombre" class="input-field" placeholder="Ej: Portal E-Commerce Retail SA" />
          </div>

          <!-- Tipo sistema -->
          <div>
            <label class="label">Tipo de sistema <span class="text-red-500">*</span></label>
            <select [(ngModel)]="form.tipo_sistema" class="input-field">
              <option value="">Seleccionar...</option>
              <option value="web">Aplicación web</option>
              <option value="api">API REST</option>
              <option value="mobile">Aplicación móvil</option>
              <option value="microservices">Microservicios</option>
            </select>
          </div>

          <!-- Tecnología -->
          <div>
            <label class="label">Tecnología principal <span class="text-red-500">*</span></label>
            <select [(ngModel)]="form.tecnologia_principal" class="input-field">
              <option value="">Seleccionar...</option>
              <option value="react">React + Node.js</option>
              <option value="angular">Angular + .NET</option>
              <option value="vue">Vue + Django</option>
              <option value="react_native">React Native</option>
              <option value="fastapi">FastAPI + PostgreSQL</option>
              <option value="node">Node.js</option>
            </select>
          </div>

          <!-- Módulos -->
          <div>
            <label class="label">Número de módulos <span class="text-red-500">*</span></label>
            <input [(ngModel)]="form.num_modulos" type="number" min="1" max="50" class="input-field" placeholder="Ej: 7" />
            <p class="text-xs text-gray-400 mt-1">Login, carrito, pagos, reportes = 4 módulos</p>
          </div>

          <!-- Equipo -->
          <div>
            <label class="label">Tamaño previsto del equipo <span class="text-red-500">*</span></label>
            <input [(ngModel)]="form.tamano_equipo_previsto" type="number" min="1" max="20" class="input-field" placeholder="Ej: 3" />
          </div>

          <!-- Complejidad -->
          <div class="col-span-2">
            <label class="label">Complejidad general <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              @for (n of [1,2,3,4,5]; track n) {
                <button (click)="form.complejidad = n" class="flex-1 py-2.5 rounded-lg border-2 transition-colors text-center"
                  [class]="form.complejidad === n ? 'border-brand bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'">
                  <p class="font-bold text-base" [class]="form.complejidad === n ? 'text-brand' : 'text-gray-700'">{{n}}</p>
                  <p class="text-xs" [class]="form.complejidad === n ? 'text-brand' : 'text-gray-400'">
                    {{['Muy baja','Baja','Media','Alta','Muy alta'][n-1]}}
                  </p>
                </button>
              }
            </div>
          </div>

          <!-- Factores del proyecto -->
          <div class="col-span-2 border-t border-gray-100 pt-4">
            <button (click)="showFactores = !showFactores" class="text-xs font-semibold text-brand flex items-center gap-1">
              {{ showFactores ? '▲' : '▼' }} Factores del proyecto (opcional, mejoran la precisión)
            </button>
            <p class="text-xs text-gray-400 mt-1">Ajustan la predicción del modelo. Los que dejes vacíos no la modifican.</p>
          </div>

          @if (showFactores) {
            @for (r of ratings; track r.key) {
              <div class="col-span-2">
                <label class="label">{{ r.label }}</label>
                <div class="flex gap-2">
                  @for (n of [1,2,3,4,5]; track n) {
                    <button type="button" (click)="toggleRating(r.key, n)" class="flex-1 py-1.5 rounded-lg border-2 transition-colors text-center"
                      [class]="form[r.key] === n ? 'border-brand bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'">
                      <p class="font-bold text-sm" [class]="form[r.key] === n ? 'text-brand' : 'text-gray-700'">{{n}}</p>
                      <p class="text-[11px]" [class]="form[r.key] === n ? 'text-brand' : 'text-gray-400'">{{ niveles[n-1] }}</p>
                    </button>
                  }
                </div>
                <p class="text-xs text-gray-400 mt-1">{{ r.hint }}</p>
              </div>
            }

            <div>
              <label class="label">Metodología</label>
              <select [(ngModel)]="form.metodologia" class="input-field">
                <option [ngValue]="undefined">Sin especificar</option>
                <option value="scrum">Scrum</option>
                <option value="kanban">Kanban</option>
                <option value="hibrido">Híbrida</option>
                <option value="cascada">Cascada</option>
              </select>
            </div>

            <div>
              <label class="label">Requisitos de seguridad</label>
              <select [(ngModel)]="form.nivel_seguridad" class="input-field">
                <option [ngValue]="undefined">Sin especificar</option>
                <option value="bajo">Bajos (app interna)</option>
                <option value="medio">Medios (datos personales)</option>
                <option value="alto">Altos (pagos, salud, banca)</option>
              </select>
            </div>

            <div>
              <label class="label">Integraciones externas</label>
              <input [(ngModel)]="form.num_integraciones" type="number" min="0" max="20" class="input-field" placeholder="Ej: 2 (pasarela de pago, ERP)" />
            </div>

            <div>
              <label class="label">Plataformas destino</label>
              <input [(ngModel)]="form.plataformas_destino" type="number" min="1" max="5" class="input-field" placeholder="Ej: 2 (web + Android)" />
            </div>

            <div>
              <label class="label">Reutilización de código (%)</label>
              <input [(ngModel)]="form.reutilizacion_pct" type="number" min="0" max="80" class="input-field" placeholder="Ej: 20" />
            </div>

            <div>
              <label class="label">Dedicación del equipo (%)</label>
              <input [(ngModel)]="form.disponibilidad_equipo_pct" type="number" min="25" max="100" class="input-field" placeholder="100 = tiempo completo" />
            </div>

            <div>
              <label class="label">Documentación requerida</label>
              <select [(ngModel)]="form.documentacion" class="input-field">
                <option [ngValue]="undefined">Sin especificar</option>
                <option value="basica">Básica</option>
                <option value="estandar">Estándar</option>
                <option value="exhaustiva">Exhaustiva</option>
              </select>
            </div>

            <div class="flex items-end pb-2">
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" [(ngModel)]="form.pruebas_automatizadas" class="w-4 h-4 accent-brand" />
                Incluye pruebas automatizadas
              </label>
            </div>
          }

          <!-- Cronograma -->
          <div class="col-span-2 border-t border-gray-100 pt-4">
            <p class="text-xs font-semibold text-brand">📅 Cronograma (Gantt)</p>
          </div>
          <div>
            <label class="label">Fecha de inicio</label>
            <input [(ngModel)]="form.fecha_inicio" type="date" class="input-field" />
            <p class="text-xs text-gray-400 mt-1">Por defecto, hoy</p>
          </div>
          <div>
            <label class="label">Nombres de los módulos</label>
            <textarea [(ngModel)]="modulosTexto" rows="3" class="input-field" placeholder="Uno por línea: Login, Carrito, Pagos..."></textarea>
          </div>

          <!-- Opcionales -->
          <div class="col-span-2">
            <button (click)="showAdvanced = !showAdvanced" class="text-xs font-semibold text-brand flex items-center gap-1">
              {{ showAdvanced ? '▲' : '▼' }} Restricciones del cliente (opcional)
            </button>
          </div>

          @if (showAdvanced) {
            <div>
              <label class="label">Presupuesto máximo (S/.)</label>
              <input [(ngModel)]="form.presupuesto_maximo_soles" type="number" class="input-field" placeholder="Ej: 8000" />
            </div>
            <div>
              <label class="label">Deadline (semanas)</label>
              <input [(ngModel)]="form.deadline_semanas" type="number" class="input-field" placeholder="Ej: 10" />
            </div>
            <div>
              <label class="label">Duración estimada (días Asana)</label>
              <input [(ngModel)]="form.duracion_dias" type="number" class="input-field" placeholder="Inferido automáticamente" />
            </div>
            <div>
              <label class="label">Nº tareas en Asana</label>
              <input [(ngModel)]="form.num_tareas" type="number" class="input-field" placeholder="Inferido automáticamente" />
            </div>
          }
        </div>

        <div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <span class="text-xs text-gray-400">* Campos obligatorios</span>
          <div class="flex gap-3">
            <button class="btn-secondary text-sm" (click)="reset()">Cancelar</button>
            <button class="btn-primary text-sm flex items-center gap-2"
              [disabled]="!isValid() || loading()"
              (click)="submit()">
              @if (loading()) { <span class="animate-spin">⏳</span> Estimando... }
              @else { ⚡ Estimar esfuerzo }
            </button>
          </div>
        </div>
      </div>

      @if (error()) {
        <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          ⚠ Error al conectar con el API: {{ error() }}
        </div>
      }
    </div>
  `
})
export class EstimateComponent {
  
  form: ProjectInput = {
    nombre: '',
    empresa: 'ELDO',   // ✅ AGREGAR (puedes dejar default)
    tipo_sistema: '',
    tecnologia_principal: '',
    num_modulos: 0,
    complejidad: 3,
    tamano_equipo_previsto: 0
  };

  showAdvanced = false;
  showFactores = true;
  modulosTexto = '';
  niveles = ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'];
  ratings: { key: 'experiencia_equipo' | 'claridad_requisitos'; label: string; hint: string }[] = [
    { key: 'experiencia_equipo', label: 'Experiencia del equipo en la tecnología', hint: 'Más experiencia = menos horas' },
    { key: 'claridad_requisitos', label: 'Claridad de los requisitos', hint: 'Requisitos difusos generan retrabajo' },
  ];
  loading = signal(false);
  error = signal('');

  constructor(private api: ApiService, private state: StateService, private router: Router) {}

  isValid(): boolean {
    return !!(this.form.nombre && this.form.tipo_sistema && this.form.tecnologia_principal
      && this.form.num_modulos > 0 && this.form.complejidad > 0 && this.form.tamano_equipo_previsto > 0);
  }

  toggleRating(key: 'experiencia_equipo' | 'claridad_requisitos', n: number) {
    this.form[key] = this.form[key] === n ? undefined : n;
  }

  /** Quita los campos vacíos para que el backend use sus valores por defecto. */
  private buildPayload(): ProjectInput {
    const payload: any = {};
    for (const [k, v] of Object.entries(this.form)) {
      if (v !== null && v !== undefined && v !== '') payload[k] = v;
    }
    const nombres = this.modulosTexto.split(/\r?\n|,/).map(m => m.trim()).filter(m => m);
    if (nombres.length) payload.nombres_modulos = nombres;
    return payload as ProjectInput;
  }

  submit() {
    this.loading.set(true);
    this.error.set('');
    const payload = this.buildPayload();
    this.api.estimate(payload).subscribe({
      next: result => {
        this.state.lastInput.set(payload);
        this.state.lastResult.set(result);
        this.loading.set(false);
        this.router.navigate(['/results']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.message || 'Error desconocido');
      }
    });
  }

  
reset() {
  this.form = {
    nombre: '',
    empresa: 'ELDO',   // ✅ AGREGAR ESTO
    tipo_sistema: '',
    tecnologia_principal: '',
    num_modulos: 0,
    complejidad: 3,
    tamano_equipo_previsto: 0
  };
  this.modulosTexto = '';
}

}
