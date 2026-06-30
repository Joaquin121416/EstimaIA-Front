import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SincerarService } from '../../core/services/sincerar.service';
@Component({
  selector: 'app-sincerar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Sinceración de proyectos</h1>

      <table class="w-full text-sm border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-left">Proyecto</th>
            <th class="p-2">Estimado (h)</th>
            <th class="p-2">Real (h)</th>
            <th class="p-2">Fin real</th>
            <th class="p-2">MMRE</th>
            <th class="p-2">Training</th>
            <th class="p-2"></th>
          </tr>
        </thead>

        <tbody>
          @for (p of proyectos(); track p.id) {
            <tr class="border-t" [class.bg-red-50]="p.mmre > 0.25">

              <td class="p-2">
                {{ p.nombre }}
              </td>

              <td class="p-2 text-center">
                {{ p.esfuerzo_estimado_horas }}
              </td>

              <td class="p-2">
                <input
                  type="number"
                  [(ngModel)]="p.esfuerzo_real_horas"
                  class="w-20 border rounded px-1">
              </td>

              <td class="p-2">
                <input
                  type="date"
                  [(ngModel)]="p.completed_at"
                  class="border rounded px-1">
              </td>

              <td
                class="p-2 text-center"
                [class.text-red-600]="p.mmre > 0.25">

                {{ p.mmre != null ? (p.mmre * 100 | number:'1.0-1') + '%' : '—' }}

              </td>

              <td class="p-2 text-center">
                <input
                  type="checkbox"
                  [checked]="p.incluir_en_training"
                  (change)="toggle(p)">
              </td>

              <td class="p-2">
                <button
                  (click)="guardar(p)"
                  class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Guardar
                </button>
              </td>

            </tr>
          }
        </tbody>
      </table>

      <button
        (click)="reentrenar()"
        [disabled]="cargando()"
        class="mt-6 bg-green-600 text-white px-5 py-2 rounded disabled:opacity-50 hover:bg-green-700">

        {{ cargando() ? 'Reentrenando...' : 'Reentrenar modelo' }}

      </button>

      @if (resultadoRetrain(); as r) {

        <div
          class="mt-4 p-4 rounded border"
          [class.bg-green-50]="r.modelo_promovido"
          [class.bg-yellow-50]="!r.modelo_promovido">

          <p class="font-semibold">
            {{ r.mensaje }}
          </p>

          <p>
            Proyectos usados: {{ r.proyectos_usados }}
          </p>

          <p>
            R² anterior:
            {{ r.r2_anterior ?? '—' }}
            →
            R² nuevo:
            {{ r.r2_nuevo }}
          </p>

          <p>
            MMRE nuevo:
            {{ (r.mmre_nuevo * 100 | number:'1.0-1') }}%
          </p>

        </div>

      }

    </div>
  `
})
export class SincerarComponent implements OnInit {

  private srv = inject(SincerarService);

  proyectos = signal<any[]>([]);
  resultadoRetrain = signal<any>(null);
  cargando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.srv.listarPendientes().subscribe(d => this.proyectos.set(d));
  }

  guardar(p: any) {
    this.srv.sincerar(p.id, {
      esfuerzo_real_horas: p.esfuerzo_real_horas,
      completed_at: p.completed_at,
      tasks_count: p.tasks_count,
      incluir_en_training: p.incluir_en_training ?? true,
    }).subscribe(() => this.cargar());
  }

  toggle(p: any) {
    this.srv.toggleTraining(p.id).subscribe(() => this.cargar());
  }

  reentrenar() {
    this.cargando.set(true);

    this.srv.reentrenar().subscribe({
      next: r => {
        this.resultadoRetrain.set(r);
        this.cargando.set(false);
      },
      error: e => {
        this.resultadoRetrain.set(e.error);
        this.cargando.set(false);
      }
    });
  }

}