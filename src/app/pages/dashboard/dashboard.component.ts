// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StateService } from '../../core/services/state.service';
import { HealthResponse } from '../../core/models/estimate.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Bienvenido, Project Manager — EstimaIA v1.0</p>

    <!-- KPIs -->
    <div class="grid grid-cols-3 gap-4 mb-7">
      <div class="card p-5">
        <p class="text-xs text-gray-500 font-medium mb-1">Proyectos históricos</p>
        <p class="text-3xl font-bold text-navy">{{ health()?.dataset_proyectos ?? '—' }}</p>
        <p class="text-xs text-emerald-600 font-semibold mt-1">✓ Dataset activo</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500 font-medium mb-1">Precisión del modelo (MMRE)</p>
        <p class="text-3xl font-bold text-brand">{{ health() ? (health()!.mmre_pct + '%') : '—' }}</p>
        <p class="text-xs text-emerald-600 font-semibold mt-1">✓ Meta: ≤ 25%</p>
      </div>
      <div class="card p-5">
        <p class="text-xs text-gray-500 font-medium mb-1">R² del modelo</p>
        <p class="text-3xl font-bold text-purple-600">{{ health() ? health()!.r2 : '—' }}</p>
        <p class="text-xs text-amber-600 font-semibold mt-1">⚠ Meta: ≥ 0.80</p>
      </div>
    </div>

    <!-- Acciones -->
    <p class="section-title">Acciones principales</p>
    <div class="grid grid-cols-3 gap-4 mb-7">
      <a routerLink="/estimate" class="card p-5 border-t-4 border-brand hover:shadow-md transition-shadow cursor-pointer block">
        <div class="text-3xl mb-2">⚡</div>
        <p class="font-bold text-navy mb-1">Nueva Estimación</p>
        <p class="text-xs text-gray-500">Ingresa parámetros y obtén estimación de esfuerzo + equipo en segundos.</p>
        <span class="mt-3 inline-block text-xs font-semibold text-brand bg-blue-50 px-3 py-1 rounded-full">Iniciar →</span>
      </a>
      <a routerLink="/catalog" class="card p-5 border-t-4 border-emerald-500 hover:shadow-md transition-shadow cursor-pointer block">
        <div class="text-3xl mb-2">👥</div>
        <p class="font-bold text-navy mb-1">Catálogo de Desarrolladores</p>
        <p class="text-xs text-gray-500">Gestiona perfiles, competencias y disponibilidad del equipo.</p>
        <span class="mt-3 inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Ver catálogo →</span>
      </a>
      <a routerLink="/results" class="card p-5 border-t-4 border-purple-500 hover:shadow-md transition-shadow cursor-pointer block">
        <div class="text-3xl mb-2">📊</div>
        <p class="font-bold text-navy mb-1">Historial de Estimaciones</p>
        <p class="text-xs text-gray-500">Revisa estimaciones anteriores y compara con el esfuerzo real.</p>
        <span class="mt-3 inline-block text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">Ver historial →</span>
      </a>
    </div>

    <!-- Estado API -->
    <p class="section-title">Estado del sistema</p>
    <div class="card p-4 flex items-center gap-3">
      <div class="w-2.5 h-2.5 rounded-full" [class]="health() ? 'bg-emerald-500' : 'bg-amber-400'"></div>
      <span class="text-sm font-semibold text-gray-700">
        API Backend: {{ health() ? 'Online — ' + health()!.modelo : 'Cargando...' }}
      </span>
      <span class="ml-auto text-xs text-gray-400">https://web-production-69779.up.railway.app</span>
    </div>

    <!-- Última estimación -->
    @if (state.lastResult()) {
      <div class="mt-6">
        <p class="section-title">Última estimación realizada</p>
        <div class="card p-5 flex items-center gap-6">
          <div>
            <p class="text-xs text-gray-500 mb-1">Proyecto</p>
            <p class="font-bold text-navy">{{ state.lastInput()?.nombre }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Esfuerzo estimado</p>
            <p class="font-bold text-brand text-xl">{{ state.lastResult()!.esfuerzo_horas }} h</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Confidence Score</p>
            <p class="font-bold text-xl" [class]="getScoreColor(state.lastResult()!.confidence_score.score_total)">
              {{ state.lastResult()!.confidence_score.score_total }}/100
            </p>
          </div>
          <a routerLink="/results" class="ml-auto btn-secondary text-sm">Ver resultados →</a>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  health = signal<HealthResponse | null>(null);
  constructor(private api: ApiService, public state: StateService) {}

  ngOnInit() {
    this.api.health().subscribe({ next: h => this.health.set(h), error: () => {} });
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  }
}
