// src/app/pages/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StateService } from '../../core/services/state.service';
import { DeveloperScore } from '../../core/models/estimate.model';

const ALL_DEVS = [
  { id:1, nombre:"Ana Quispe", seniority:"senior", tecnologias:["react","node","postgresql","docker","typescript"], disponibilidad_pct:90, experiencia_años:6, email:"a.quispe@consultora.pe", proyectos:["Portal E-comm Lima Moda","API Gateway Fintech","Dashboard Analytics"] },
  { id:2, nombre:"Carlos Mendoza", seniority:"mid", tecnologias:["node","postgresql","rest","express"], disponibilidad_pct:100, experiencia_años:3, email:"c.mendoza@consultora.pe", proyectos:["API Inventario QROMA","Microservicio Notif."] },
  { id:3, nombre:"Lucia Torres", seniority:"mid", tecnologias:["react","typescript","tailwind","vue"], disponibilidad_pct:75, experiencia_años:3, email:"l.torres@consultora.pe", proyectos:["Catálogo QROMA","Dashboard KPIs"] },
  { id:4, nombre:"Jorge Ramos", seniority:"senior", tecnologias:["fastapi","python","docker","postgresql","shap"], disponibilidad_pct:60, experiencia_años:7, email:"j.ramos@consultora.pe", proyectos:["Motor Scoring ELDO","API Optimización Rutas","ML Pipeline EstimaIA"] },
  { id:5, nombre:"María Paz Flores", seniority:"junior", tecnologias:["react","javascript","html","css"], disponibilidad_pct:100, experiencia_años:1, email:"m.paz@consultora.pe", proyectos:["App Fuerza Ventas"] },
];

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (!dev) {
      <p class="text-gray-400">Desarrollador no encontrado.</p>
    } @else {
      <div class="max-w-2xl">
        <a routerLink="/results" class="text-sm text-brand hover:underline mb-4 inline-block">← Volver al equipo</a>

        <!-- Header -->
        <div class="card overflow-hidden mb-5">
          <div class="bg-navy px-6 py-6 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gold flex items-center justify-center font-bold text-navy text-xl">
              {{ dev.nombre.split(' ').map(n=>n[0]).join('').slice(0,2) }}
            </div>
            <div>
              <p class="text-white font-bold text-lg">{{ dev.nombre }}</p>
              <p class="text-white/70 text-sm">Full-stack Developer</p>
              <p class="text-white/50 text-xs mt-0.5">{{ dev.email }}</p>
              <span class="mt-2 inline-block bg-gold text-navy text-xs font-bold px-3 py-0.5 rounded-full">
                {{ dev.seniority }} · {{ dev.experiencia_años }} años exp.
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            <div class="p-4 text-center">
              <p class="text-2xl font-bold text-emerald-600">{{ dev.disponibilidad_pct }}%</p>
              <p class="text-xs text-gray-400 mt-0.5">Disponibilidad</p>
            </div>
            <div class="p-4 text-center">
              <p class="text-2xl font-bold text-navy">{{ dev.proyectos.length }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Proyectos previos</p>
            </div>
            <div class="p-4 text-center">
              <p class="text-2xl font-bold text-brand">{{ dev.tecnologias.length }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Tecnologías</p>
            </div>
          </div>
        </div>

        <!-- Competencias -->
        <div class="card p-5 mb-5">
          <p class="section-title">Competencias técnicas</p>
          @for (tech of dev.tecnologias; track tech; let i = $index) {
            <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span class="text-sm font-medium text-gray-700">{{ tech }}</span>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  @for (d of [1,2,3]; track d) {
                    <div class="w-2.5 h-2.5 rounded-full" [class]="d <= getLevel(i) ? 'bg-brand' : 'bg-gray-200'"></div>
                  }
                </div>
                <span class="text-xs text-gray-400 w-20">{{ getLevelLabel(i) }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Proyectos anteriores -->
        <div class="card p-5 mb-5">
          <p class="section-title">Proyectos anteriores</p>
          @for (p of dev.proyectos; track p) {
            <div class="py-2.5 border-b border-gray-50 last:border-0">
              <p class="text-sm font-semibold text-navy">{{ p }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Lead Developer · Participación reciente</p>
            </div>
          }
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button class="btn-success flex-1">✓ Confirmar en equipo</button>
          <button class="btn-secondary flex-1">✕ Descartar</button>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  dev: any = null;

  constructor(private route: ActivatedRoute, public state: StateService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.dev = ALL_DEVS.find(d => d.id === id) || null;
  }

  getLevel(i: number): number { return [3,2,3,2,3,3,2,1][i % 8] || 2; }
  getLevelLabel(i: number): string { return ['Avanzado','Intermedio','Avanzado','Intermedio','Avanzado','Avanzado','Intermedio','Básico'][i % 8]; }
}
