// src/app/pages/results/results.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../core/services/state.service';
import { ApiService } from '../../core/services/api.service';
import { DeveloperScore, EstimacionOutput, Rol, TeamOutput } from '../../core/models/estimate.model';
import { ROLES, rolBadge } from '../../core/data/colaboradores';
import { GanttChartComponent } from '../../shared/components/gantt-chart.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterLink, GanttChartComponent],
  template: `
    @if (!result) {
      <div class="text-center py-20 text-gray-400">
        <p class="text-4xl mb-3">📋</p>
        <p class="font-semibold">No hay estimación activa.</p>
        <a routerLink="/estimate" class="btn-primary mt-4 inline-block text-sm">Crear nueva estimación</a>
      </div>
    } @else {
      <div class="max-w-6xl">
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
            @if (result.costo) {
              <p class="mt-3 text-sm">
                <span class="opacity-60">Costo estimado:</span>
                <span class="text-gold font-bold text-lg ml-1">S/ {{ result.costo.costo_total | number:'1.0-0' }}</span>
                <span class="opacity-60 ml-1">(S/ {{ result.costo.costo_min | number:'1.0-0' }} – {{ result.costo.costo_max | number:'1.0-0' }})</span>
              </p>
            }
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
            @if (result.costo) {
              <div><p class="text-gold font-bold text-2xl">S/ {{ result.costo.tarifa_promedio_hora | number:'1.2-2' }}</p><p class="text-xs opacity-60">costo prom. / hora</p></div>
            }
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

        <!-- AJUSTES POR VARIABLES DEL PROYECTO -->
        @if (result.ajustes?.length) {
          <div class="card p-5 mb-5">
            <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <p class="section-title !mb-0">⚙️ Ajuste por factores del proyecto</p>
              <p class="text-sm text-gray-500">
                Modelo: <span class="font-semibold text-navy">{{ result.esfuerzo_base_modelo }} h</span>
                × factor <span class="font-semibold text-navy">{{ result.factor_ajuste_total }}</span>
                = <span class="font-bold text-brand">{{ result.esfuerzo_horas }} h</span>
              </p>
            </div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2">
              @for (a of result.ajustes; track a.variable) {
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-gray-600 w-44 shrink-0 truncate">{{ a.variable }} <span class="text-gray-400">({{ a.valor }})</span></span>
                  <div class="flex-1 flex items-center h-2.5">
                    <div class="w-1/2 flex justify-end">
                      @if (a.impacto_pct < 0) { <div class="h-2.5 rounded-l-full bg-emerald-500" [style.width]="barra(a.impacto_pct)"></div> }
                    </div>
                    <div class="w-px h-4 bg-gray-300"></div>
                    <div class="w-1/2">
                      @if (a.impacto_pct > 0) { <div class="h-2.5 rounded-r-full bg-amber-500" [style.width]="barra(a.impacto_pct)"></div> }
                    </div>
                  </div>
                  <span class="w-20 text-right font-semibold" [class]="a.impacto_pct > 0 ? 'text-amber-600' : a.impacto_pct < 0 ? 'text-emerald-600' : 'text-gray-400'">
                    {{ a.impacto_horas > 0 ? '+' : '' }}{{ a.impacto_horas }} h
                  </span>
                </div>
              }
            </div>
          </div>
        }

        <!-- COSTO DEL PROYECTO -->
        @if (result.costo; as costo) {
          <div class="card mb-5">
            <div class="px-5 py-3 border-b border-gray-100 flex flex-wrap justify-between items-baseline gap-2">
              <span class="font-bold text-sm text-gray-700">💰 Costo del proyecto en horas-hombre</span>
              <span class="text-xs text-gray-500">
                Devs <span class="font-semibold text-brand">end-to-end</span> · QA, DevOps y Seguridad como <span class="font-semibold">apoyo</span>
              </span>
            </div>
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="px-4 py-2 text-left">Rol</th>
                  <th class="px-4 py-2 text-right">Horas-hombre</th>
                  <th class="px-4 py-2 text-left w-1/4">% del esfuerzo</th>
                  <th class="px-4 py-2 text-right">Costo / hora</th>
                  <th class="px-4 py-2 text-right">Costo</th>
                </tr>
              </thead>
              <tbody>
                @for (c of costo.por_rol; track c.rol) {
                  <tr class="border-t border-gray-50">
                    <td class="px-4 py-2.5">
                      <span class="text-xs font-semibold px-2 py-0.5 rounded" [class]="rolBadge(c.rol)">{{ c.rol_label }}</span>
                      <span class="text-[10px] ml-2" [class]="c.tipo === 'end_to_end' ? 'text-brand font-semibold' : 'text-gray-400'">
                        {{ c.tipo === 'end_to_end' ? 'End-to-end' : 'Apoyo' }}
                      </span>
                    </td>
                    <td class="px-4 py-2.5 text-right font-semibold text-navy">{{ c.horas | number:'1.0-0' }} h</td>
                    <td class="px-4 py-2.5">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 bg-gray-100 rounded-full h-2">
                          <div class="h-2 rounded-full" [class]="c.tipo === 'end_to_end' ? 'bg-brand' : 'bg-gray-400'" [style.width]="c.pct + '%'"></div>
                        </div>
                        <span class="text-xs text-gray-500 w-12 text-right">{{ c.pct }}%</span>
                      </div>
                    </td>
                    <td class="px-4 py-2.5 text-right text-gray-600">
                      S/ {{ c.tarifa_hora | number:'1.2-2' }}
                      @if (!c.tarifa_personalizada) { <span class="text-[10px] text-gray-400 block">prom. catálogo</span> }
                    </td>
                    <td class="px-4 py-2.5 text-right font-semibold text-navy">S/ {{ c.costo | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
              <tfoot class="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td class="px-4 py-3 font-bold text-navy">Total</td>
                  <td class="px-4 py-3 text-right font-bold text-navy">{{ result.esfuerzo_horas | number:'1.0-0' }} h</td>
                  <td></td>
                  <td class="px-4 py-3 text-right text-gray-600">S/ {{ costo.tarifa_promedio_hora | number:'1.2-2' }}</td>
                  <td class="px-4 py-3 text-right font-bold text-brand text-base">S/ {{ costo.costo_total | number:'1.2-2' }}</td>
                </tr>
              </tfoot>
            </table>
            <div class="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
              <span>Rango: <span class="font-semibold text-navy">S/ {{ costo.costo_min | number:'1.0-0' }} – S/ {{ costo.costo_max | number:'1.0-0' }}</span></span>
              @if (state.lastInput()?.presupuesto_maximo_soles; as presupuesto) {
                <span>Presupuesto del cliente: <span class="font-semibold text-navy">S/ {{ presupuesto | number:'1.0-0' }}</span>
                  @if (costo.costo_total > presupuesto) {
                    <span class="text-red-600 font-semibold ml-1">excede en S/ {{ costo.costo_total - presupuesto | number:'1.0-0' }}</span>
                  } @else {
                    <span class="text-emerald-600 font-semibold ml-1">holgura S/ {{ presupuesto - costo.costo_total | number:'1.0-0' }}</span>
                  }
                </span>
              }
            </div>
          </div>
        }

        <!-- GANTT -->
        @if (result.gantt) {
          <div class="card mb-5 overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 font-bold text-sm text-gray-700">📅 Cronograma del proyecto (Gantt)</div>
            <app-gantt-chart [gantt]="result.gantt" [proyecto]="state.lastInput()?.nombre" />
          </div>
        }

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
        @if (team(); as t) {
          <div class="card">
            <div class="px-5 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
              <span class="font-bold text-sm text-gray-700">👥 Equipo recomendado · {{ t.num_colaboradores }} colaboradores</span>
              <div class="flex gap-4 text-sm">
                <span class="text-emerald-600 font-semibold">Skills: {{ t.cobertura_skills_pct }}% ✓</span>
                <span class="text-gray-500">Balance devs σ: {{ t.balance_carga_desv_pct }}%</span>
              </div>
            </div>

            <!-- Resumen por rol -->
            <div class="grid grid-cols-5 divide-x divide-gray-100 border-b border-gray-100">
              @for (r of t.por_rol; track r.rol) {
                <div class="p-3">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded" [class]="rolBadge(r.rol)">{{ r.rol_label }}</span>
                  <p class="text-lg font-bold text-navy mt-1">{{ r.personas }} <span class="text-xs font-normal text-gray-400">pers. · {{ r.horas | number:'1.0-0' }} h</span></p>
                  <p class="text-xs text-gray-500">S/ {{ r.costo | number:'1.0-0' }}</p>
                </div>
              }
              <div class="p-3 bg-gray-50">
                <p class="text-xs font-semibold text-gray-500">Costo con tarifas reales</p>
                <p class="text-lg font-bold text-brand mt-1">S/ {{ t.costo_total | number:'1.0-0' }}</p>
                @if (result.costo) {
                  <p class="text-xs" [class]="t.costo_total > result.costo.costo_total ? 'text-amber-600' : 'text-emerald-600'">
                    {{ t.costo_total > result.costo.costo_total ? '+' : '' }}{{ t.costo_total - result.costo.costo_total | number:'1.0-0' }} vs estimado
                  </p>
                }
              </div>
            </div>

            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="px-4 py-2 text-left">#</th>
                  <th class="px-4 py-2 text-left">Colaborador</th>
                  <th class="px-4 py-2 text-left">Score</th>
                  <th class="px-4 py-2 text-left">Skills</th>
                  <th class="px-4 py-2 text-left">Dedicación</th>
                  <th class="px-4 py-2 text-right">Horas</th>
                  <th class="px-4 py-2 text-right">Costo / hora</th>
                  <th class="px-4 py-2 text-right">Costo</th>
                  <th class="px-4 py-2 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (g of grupos(t.equipo); track g.rol) {
                  <tr class="bg-gray-50/60 border-t border-gray-100">
                    <td colspan="9" class="px-4 py-1.5 text-xs font-bold text-gray-600">
                      {{ g.label }}
                      <span class="font-normal" [class]="g.tipo === 'end_to_end' ? 'text-brand' : 'text-gray-400'">
                        · {{ g.tipo === 'end_to_end' ? 'ven el proyecto end-to-end' : 'apoyo con dedicación parcial' }}
                      </span>
                    </td>
                  </tr>
                  @for (dev of g.miembros; track dev.id; let i = $index) {
                    <tr class="border-t border-gray-50 hover:bg-gray-50">
                      <td class="px-4 py-3 font-bold" [class]="i===0?'text-emerald-600':i===1?'text-brand':'text-purple-600'">{{i+1}}°</td>
                      <td class="px-4 py-3">
                        <p class="font-semibold text-navy">{{ dev.nombre }}</p>
                        <span class="text-xs font-semibold px-1.5 py-0.5 rounded mr-1" [class]="rolBadge(dev.rol)">{{ g.label }}</span>
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
                          @for (tec of dev.tecnologias.slice(0,3); track tec) {
                            <span class="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">{{ tec }}</span>
                          }
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-semibold" [class]="dev.dedicacion_pct > dev.disponibilidad_pct ? 'text-red-600' : 'text-emerald-600'">
                          {{ dev.dedicacion_pct }}%
                          <span class="text-[10px] font-normal text-gray-400">de {{ dev.disponibilidad_pct }}% disp.</span>
                        </p>
                        <div class="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                          <div class="h-1.5 rounded-full" [class]="dev.rol === 'dev' ? 'bg-emerald-500' : 'bg-gray-400'"
                               [style.width]="(dev.dedicacion_pct > 100 ? 100 : dev.dedicacion_pct) + '%'"></div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-right font-semibold text-navy">{{ dev.horas_asignadas | number:'1.0-0' }} h</td>
                      <td class="px-4 py-3 text-right text-gray-600">S/ {{ dev.costo_hora | number:'1.2-2' }}</td>
                      <td class="px-4 py-3 text-right font-semibold text-navy">S/ {{ dev.costo | number:'1.0-0' }}</td>
                      <td class="px-4 py-3">
                        <a [routerLink]="['/profile', dev.id]" class="text-xs font-semibold text-brand bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                          Ver perfil
                        </a>
                      </td>
                    </tr>
                  }
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
  rolBadge = rolBadge;

  constructor(public state: StateService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.result = this.state.lastResult();
    if (!this.result) return;
    this.team.set(this.state.lastTeam());
  }

  getTeam() {
    const r = this.result!;
    const input = this.state.lastInput()!;
    this.loadingTeam.set(true);
    this.api.assignTeam({
      esfuerzo_estimado_horas: r.esfuerzo_horas,
      tecnologia_requerida: input.tecnologia_principal,
      duracion_semanas: r.duracion_estimada_semanas,
      horas_por_rol: r.costo
        ? Object.fromEntries(r.costo.por_rol.map(c => [c.rol, c.horas]))
        : undefined
    }).subscribe({
      next: t => { this.team.set(t); this.state.lastTeam.set(t); this.loadingTeam.set(false); },
      error: () => this.loadingTeam.set(false)
    });
  }

  /** Agrupa el equipo por rol, en el orden: Desarrollo, QA, DevOps, Seguridad. */
  grupos(equipo: DeveloperScore[]) {
    return ROLES
      .map(r => ({ rol: r.value as Rol, label: r.label, tipo: r.tipo, miembros: equipo.filter(d => (d.rol ?? 'dev') === r.value) }))
      .filter(g => g.miembros.length);
  }

  /** Ancho de barra para un impacto en %, escala hasta ±30%. */
  barra(pct: number) {
    return Math.min(Math.abs(pct) / 30 * 100, 100) + '%';
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
