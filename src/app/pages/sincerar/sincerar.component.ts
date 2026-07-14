import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SincerarService, ProyectoPendiente, RetrainResult, EstadoModelo,
} from '../../core/services/sincerar.service';

@Component({
  selector: 'app-sincerar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Sinceración y Reentrenamiento</h1>
        <p class="text-sm text-gray-500 mt-1">
          Carga el esfuerzo real de los proyectos terminados. Solo los proyectos sincerados
          alimentan el reentrenamiento del modelo (HU-06).
        </p>
      </div>

      <!-- Estado del modelo -->
      @if (estado(); as e) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white border rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">R² (validación cruzada)</p>
            <p class="text-2xl font-bold" [class.text-green-600]="e.r2_cv_actual >= 0.8"
               [class.text-amber-600]="e.r2_cv_actual < 0.8">
              {{ e.r2_cv_actual }}
            </p>
            <p class="text-xs text-gray-400">Meta ≥ 0.80</p>
          </div>
          <div class="bg-white border rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">MMRE</p>
            <p class="text-2xl font-bold text-green-600">{{ e.mmre_actual_pct }}%</p>
            <p class="text-xs text-gray-400">Meta ≤ 25%</p>
          </div>
          <div class="bg-white border rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Proyectos en el modelo</p>
            <p class="text-2xl font-bold text-gray-800">{{ e.proyectos_en_modelo }}</p>
            <p class="text-xs text-gray-400">Mínimo {{ e.minimo_requerido }}</p>
          </div>
          <div class="bg-white border rounded-lg p-4">
            <p class="text-xs text-gray-500 uppercase">Sincerados disponibles</p>
            <p class="text-2xl font-bold text-blue-600">{{ e.proyectos_sincerados_disponibles }}</p>
            <p class="text-xs text-gray-400">
              {{ e.modelo_persistido ? 'Modelo reentrenado activo' : 'Modelo base' }}
            </p>
          </div>
        </div>
      }

      <!-- Controles -->
      <div class="flex items-center justify-between mb-3">
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" [(ngModel)]="verSincerados" (change)="cargar()">
          Mostrar también los ya sincerados
        </label>
        <button (click)="reentrenar()" [disabled]="cargandoRetrain()"
                class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg
                       text-sm font-medium disabled:opacity-50">
          {{ cargandoRetrain() ? 'Reentrenando…' : 'Reentrenar modelo' }}
        </button>
      </div>

      <!-- Resultado del reentrenamiento -->
      @if (resultado(); as r) {
        <div class="mb-5 p-4 rounded-lg border"
             [class]="r.modelo_promovido
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'">
          <p class="font-semibold"
             [class]="r.modelo_promovido ? 'text-green-800' : 'text-amber-800'">
            {{ r.mensaje || r.detail }}
          </p>
          @if (r.proyectos_totales) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm text-gray-700">
              <span>Dataset: <b>{{ r.proyectos_totales }}</b>
                ({{ r.proyectos_semilla }} base + {{ r.proyectos_sincerados }} sincerados)</span>
              <span>R²(CV): <b>{{ r.r2_cv_anterior }} → {{ r.r2_cv_nuevo }}</b></span>
              <span>MMRE nuevo: <b>{{ r.mmre_nuevo_pct }}%</b></span>
              <span class="text-xs text-gray-500">Decisión por {{ r.metrica_decision }}</span>
            </div>
          }
        </div>
      }

      <!-- Tabla -->
      <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="p-3 text-left font-medium">Proyecto</th>
              <th class="p-3 text-center font-medium">Estimado (h)</th>
              <th class="p-3 text-center font-medium">Real (h)</th>
              <th class="p-3 text-center font-medium">Inicio</th>
              <th class="p-3 text-center font-medium">Fin real</th>
              <th class="p-3 text-center font-medium">Tareas</th>
              <th class="p-3 text-center font-medium">MMRE</th>
              <th class="p-3 text-center font-medium">Training</th>
              <th class="p-3 text-center font-medium"></th>
            </tr>
          </thead>
          <tbody>
            @for (p of proyectos(); track p.id) {
              <tr class="border-t hover:bg-gray-50"
                  [class.bg-red-50]="esOutlier(p)">
                <td class="p-3">
                  <div class="font-medium text-gray-800">{{ p.nombre }}</div>
                  <div class="text-xs text-gray-400">
                    {{ p.empresa }} · {{ p.tipo_sistema }} / {{ p.tecnologia_principal }}
                    · {{ p.num_modulos }} mód.
                  </div>
                </td>
                <td class="p-3 text-center text-gray-600">{{ p.esfuerzo_estimado_horas }}</td>
                <td class="p-3 text-center">
                  <input type="number" [(ngModel)]="p.esfuerzo_real_horas" min="1"
                         class="w-24 border rounded px-2 py-1 text-center">
                </td>
                <td class="p-3 text-center">
                  <input type="date" [(ngModel)]="p.start_on"
                         class="border rounded px-2 py-1 text-xs">
                </td>
                <td class="p-3 text-center">
                  <input type="date" [(ngModel)]="p.completed_at"
                         class="border rounded px-2 py-1 text-xs">
                </td>
                <td class="p-3 text-center">
                  <input type="number" [(ngModel)]="p.num_tareas_asana" min="1"
                         class="w-20 border rounded px-2 py-1 text-center">
                </td>
                <td class="p-3 text-center font-medium"
                    [class.text-red-600]="esOutlier(p)"
                    [class.text-green-600]="p.mmre != null && !esOutlier(p)">
                  {{ p.mmre != null ? (p.mmre * 100 | number:'1.0-1') + '%' : '—' }}
                </td>
                <td class="p-3 text-center">
                  <input type="checkbox" [checked]="p.incluir_en_training"
                         (change)="toggle(p)" class="w-4 h-4">
                </td>
                <td class="p-3 text-center whitespace-nowrap">
                  <button (click)="guardar(p)"
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1
                                 rounded text-xs font-medium">
                    Guardar
                  </button>
                  <button (click)="eliminar(p)"
                          class="ml-1 text-gray-400 hover:text-red-600 px-2 py-1 text-xs">
                    ✕
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="p-8 text-center text-gray-400">
                  No hay proyectos pendientes de sinceración.
                  Genera una estimación para que aparezca aquí.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <p class="text-xs text-gray-400 mt-3">
        Las filas en rojo superan el 25 % de MMRE (meta del proyecto): son candidatas a outlier.
        Desmarca "Training" para excluirlas del reentrenamiento sin borrarlas.
      </p>
    </div>
  `,
})
export class SincerarComponent implements OnInit {
  private srv = inject(SincerarService);

  proyectos = signal<ProyectoPendiente[]>([]);
  estado = signal<EstadoModelo | null>(null);
  resultado = signal<RetrainResult | null>(null);
  cargandoRetrain = signal(false);
  verSincerados = false;

  ngOnInit() {
    this.cargar();
    this.cargarEstado();
  }

  cargar() {
    this.srv.listarPendientes(this.verSincerados)
      .subscribe(d => this.proyectos.set(d));
  }

  cargarEstado() {
    this.srv.estadoModelo().subscribe(e => this.estado.set(e));
  }

  esOutlier(p: ProyectoPendiente): boolean {
    return p.mmre != null && p.mmre > 0.25;
  }

  guardar(p: ProyectoPendiente) {
    if (!p.esfuerzo_real_horas || !p.completed_at) {
      alert('Ingresa el esfuerzo real y la fecha de fin.');
      return;
    }
    this.srv.sincerar(p.id, {
      esfuerzo_real_horas: p.esfuerzo_real_horas,
      completed_at: p.completed_at,
      start_on: p.start_on || null,
      num_tareas_asana: p.num_tareas_asana || null,
      incluir_en_training: p.incluir_en_training ?? true,
    }).subscribe(() => {
      this.cargar();
      this.cargarEstado();
    });
  }

  toggle(p: ProyectoPendiente) {
    this.srv.toggleTraining(p.id).subscribe(() => this.cargar());
  }

  eliminar(p: ProyectoPendiente) {
    if (!confirm(`¿Eliminar "${p.nombre}" del dataset?`)) return;
    this.srv.eliminar(p.id).subscribe(() => {
      this.cargar();
      this.cargarEstado();
    });
  }

  reentrenar() {
    this.cargandoRetrain.set(true);
    this.srv.reentrenar().subscribe({
      next: r => {
        this.resultado.set(r);
        this.cargandoRetrain.set(false);
        this.cargarEstado();
      },
      error: e => {
        this.resultado.set(e.error);
        this.cargandoRetrain.set(false);
      },
    });
  }
}
