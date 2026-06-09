// src/app/pages/results/results.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';
import { EstimacionOutput, TeamOutput } from '../../core/models/estimate.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (!result) {
      <div class="text-center py-20 text-gray-400">
        <p class="text-4xl mb-3">📋</p>
        <p class="font-semibold">No hay estimación activa.</p>
        <a routerLink="/estimate" class="btn-primary mt-4 inline-block text-sm">Crear nueva estimación</a>
      </div>
    } @else {
      <div class="max-w-4xl">
        <h1 class="page-title">Resultados — {{ state.lastInput()?.nombre }}</h1>
        <p class="page-sub">{{ state.lastInput()?.tecnologia_principal }} · {{ state.lastInput()?.num_modulos }} módulos · Complejidad {{ state.lastInput()?.complejidad }}</p>

        <!-- HERO -->
        <div class="rounded-xl bg-navy text-white p-7 mb-5 flex gap-8 items-center">
          <div class="flex-1">
            <p class="text-xs uppercase tracking-widest opacity-60 mb-2">Estimación de esfuerzo</p>
            <p class="text-5xl font-bold leading-none">
              {{ result.esfuerzo_horas }}
              <span class="text-xl font-normal opacity-70 ml-1">horas-hombre</span>
            </p>
            <p class="opacity-70 mt-2 text-sm">Intervalo: {{ result.esfuerzo_min }} – {{ result.esfuerzo_max }} h (± {{ result.intervalo_confianza_pct }}%)</p>
            <div class="mt-3 inline-block bg-white/15 rounded-full px-3 py-1 text-xs">
              🤖 Modelo: {{ result.modelo_usado }} · R² = {{ result.r2_modelo }} · MMRE = {{ result.mmre_modelo }}%
            </div>
            <div class="flex gap-3 mt-4">
              <button (click)="getTeam()" [disabled]="loadingTeam()"
                class="bg-white text-brand font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
                {{ loadingTeam() ? '⏳ Cargando...' : '👥 Ver equipo recomendado' }}
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-4 text-right">
            <div><p class="text-gold font-bold text-2xl">{{ result.duracion_estimada_semanas }}</p><p class="text-xs opacity-60">semanas est.</p></div>
            <div><p class="text-gold font-bold text-2xl">{{ state.lastInput()?.tamano_equipo_previsto }}</p><p class="text-xs opacity-60">devs sugeridos</p></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-5 mb-5">
          <!-- SHAP -->
          <div class="card p-5">
            <p class="section-title">🔍 Variables de mayor impacto (SHAP)</p>
            @for (s of result.shap_top3; track s.variable) {
              <div class="flex items-center gap-3 mb-3">
                <span class="text-sm text-gray-600 w-36 shrink-0">{{ s.variable }}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div class="bg-brand h-2.5 rounded-full" [style.width]="s.impacto_pct + '%'"></div>
                </div>
                <span class="text-sm font-bold text-brand w-10 text-right">{{ s.impacto_pct }}%</span>
              </div>
            }
          </div>

          <!-- CONFIDENCE SCORE -->
          <div class="card p-5">
            <p class="section-title">🎯 Confidence Score</p>
            <div class="text-center mb-4">
              <p class="text-5xl font-bold" [class]="getScoreColor(result.confidence_score.score_total)">
                {{ result.confidence_score.score_total }}
              </p>
              <p class="text-xs text-gray-500 mt-1">/ 100</p>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-gray-500">Base modelo (R²)</span><span class="font-semibold">{{ result.confidence_score.base_modelo }} pts</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Pen. presupuesto</span><span class="font-semibold text-red-500">-{{ result.confidence_score.penalizacion_presupuesto }} pts</span></div>
              <div class="flex justify-between"><span class="text-gray-500">Pen. tiempo</span><span class="font-semibold text-red-500">-{{ result.confidence_score.penalizacion_tiempo }} pts</span></div>
            </div>
            <div class="mt-3 p-2 rounded-lg text-xs" [class]="getScoreBg(result.confidence_score.score_total)">
              {{ result.confidence_score.mensaje }}
            </div>
          </div>
        </div>

        <!-- PROYECTOS REFERENCIA -->
        <div class="card mb-5">
          <div class="px-5 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">📋 Proyectos históricos de referencia</div>
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th class="px-4 py-2 text-left">Empresa / Proyecto</th>
                <th class="px-4 py-2 text-left">Tecnología</th>
                <th class="px-4 py-2 text-left">Módulos</th>
                <th class="px-4 py-2 text-left">Esfuerzo real</th>
                <th class="px-4 py-2 text-left">Desvío</th>
                <th class="px-4 py-2 text-left">Similitud</th>
              </tr>
            </thead>
            <tbody>
              @for (ref of result.proyectos_referencia; track ref.asana_project_gid) {
                <tr class="border-t border-gray-50 hover:bg-gray-50">
                  <td class="px-4 py-2.5">
                    <p class="font-semibold text-navy">{{ ref.empresa }}</p>
                    <p class="text-xs text-gray-400">{{ ref.nombre }}</p>
                  </td>
                  <td class="px-4 py-2.5 text-gray-600">{{ ref.tecnologia_principal }}</td>
                  <td class="px-4 py-2.5 text-gray-600">{{ ref.num_modulos }}</td>
                  <td class="px-4 py-2.5 font-semibold text-navy">{{ ref.esfuerzo_real_horas }} h</td>
                  <td class="px-4 py-2.5">
                    <span [class]="ref.desvio_pct < 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'">
                      {{ ref.desvio_pct > 0 ? '+' : '' }}{{ ref.desvio_pct }}%
                    </span>
                  </td>
                  <td class="px-4 py-2.5">
                    <span class="badge-blue">{{ ref.similitud_pct }}%</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- EQUIPO RECOMENDADO -->
        @if (team()) {
          <div class="card">
            <div class="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
              <span class="font-bold text-sm text-gray-700">👥 Equipo recomendado</span>
              <div class="flex gap-4 text-sm">
                <span class="text-emerald-600 font-semibold">Skills: {{ team()!.cobertura_skills_pct }}% ✓</span>
                <span class="text-gray-500">Balance σ: {{ team()!.balance_carga_desv_pct }}%</span>
              </div>
            </div>
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="px-4 py-2 text-left">#</th>
                  <th class="px-4 py-2 text-left">Desarrollador</th>
                  <th class="px-4 py-2 text-left">Score</th>
                  <th class="px-4 py-2 text-left">Skills</th>
                  <th class="px-4 py-2 text-left">Disponibilidad</th>
                  <th class="px-4 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (dev of team()!.equipo; track dev.id; let i = $index) {
                  <tr class="border-t border-gray-50 hover:bg-gray-50">
                    <td class="px-4 py-3 font-bold" [class]="i===0?'text-emerald-600':i===1?'text-brand':'text-purple-600'">{{i+1}}°</td>
                    <td class="px-4 py-3">
                      <p class="font-semibold text-navy">{{ dev.nombre }}</p>
                      <span class="badge-{{ dev.seniority === 'senior' ? 'amber' : dev.seniority === 'mid' ? 'blue' : 'green' }} text-xs">
                        {{ dev.seniority }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-bold text-brand text-base">{{ dev.score_total }}</p>
                      <p class="text-xs text-gray-400">S:{{ dev.score_skills }} E:{{ dev.score_experiencia }} D:{{ dev.score_disponibilidad }}</p>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        @for (t of dev.tecnologias.slice(0,3); track t) {
                          <span class="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">{{ t }}</span>
                        }
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-semibold text-emerald-600">{{ dev.disponibilidad_pct }}%</p>
                      <div class="w-16 bg-gray-100 rounded-full h-1.5 mt-1">
                        <div class="bg-emerald-500 h-1.5 rounded-full" [style.width]="dev.disponibilidad_pct + '%'"></div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <a [routerLink]="['/profile', dev.id]" class="text-xs font-semibold text-brand bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                        Ver perfil
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <div class="mt-5 flex gap-3">
          <a routerLink="/estimate" class="btn-secondary text-sm">← Nueva estimación</a>
        </div>
      </div>
    }
  `
})
export class ResultsComponent implements OnInit {
  result: EstimacionOutput | null = null;
  team = signal<TeamOutput | null>(null);
  loadingTeam = signal(false);

  constructor(public state: StateService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.result = this.state.lastResult();
    if (!this.result) return;
  }

  getTeam() {
    const r = this.result!;
    const input = this.state.lastInput()!;
    this.loadingTeam.set(true);
    this.api.assignTeam({
      esfuerzo_estimado_horas: r.esfuerzo_horas,
      tecnologia_requerida: input.tecnologia_principal,
      duracion_semanas: r.duracion_estimada_semanas
    }).subscribe({
      next: t => { this.team.set(t); this.state.lastTeam.set(t); this.loadingTeam.set(false); },
      error: () => this.loadingTeam.set(false)
    });
  }

  getScoreColor(s: number) {
    if (s >= 75) return 'text-emerald-600';
    if (s >= 50) return 'text-amber-500';
    return 'text-red-500';
  }

  getScoreBg(s: number) {
    if (s >= 75) return 'bg-emerald-50 text-emerald-700';
    if (s >= 50) return 'bg-amber-50 text-amber-700';
    return 'bg-red-50 text-red-700';
  }
}
