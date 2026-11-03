// src/app/pages/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { COLABORADORES, rolInfo } from '../../core/data/colaboradores';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (!dev) {
      <p class="text-gray-400">Desarrollador no encontrado.</p>
    } @else {
      <div class="max-w-2xl">
        <a routerLink="/results" class="text-sm text-brand hover:underline mb-4 inline-block">volver al equipo</a>

        <!-- Header -->
        <div class="card overflow-hidden mb-5">
          <div class="bg-navy px-6 py-6 flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-gold flex items-center justify-center font-bold text-navy text-xl">
              {{ getInitials(dev.nombre) }}
            </div>
            <div>
              <p class="text-white font-bold text-lg">{{ dev.nombre }}</p>
              <p class="text-white/70 text-sm">{{ rolInfo(dev.rol).titulo }}
                <span class="text-white/50">· {{ dev.rol === 'dev' ? 'End-to-end' : 'Apoyo' }}</span></p>
              <p class="text-white/50 text-xs mt-0.5">{{ dev.email }}</p>
              <span class="mt-2 inline-block bg-gold text-navy text-xs font-bold px-3 py-0.5 rounded-full">
                {{ dev.seniority }} - {{ dev.experiencia }} años exp.
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
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
              <p class="text-xs text-gray-400 mt-0.5">Tecnologias</p>
            </div>
            <div class="p-4 text-center">
              <p class="text-2xl font-bold text-gold">S/ {{ dev.costo_hora }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Costo por hora</p>
            </div>
          </div>
          <p class="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">{{ rolInfo(dev.rol).descripcion }}</p>
        </div>

        <!-- Competencias -->
        <div class="card p-5 mb-5">
          <p class="section-title">Competencias tecnicas</p>
          @for (tech of dev.tecnologias; track tech; let i = $index) {
            <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span class="text-sm font-medium text-gray-700">{{ tech }}</span>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  @for (d of levels; track d) {
                    <div class="w-2.5 h-2.5 rounded-full"
                         [class]="d <= getLevel(i) ? 'bg-brand' : 'bg-gray-200'"></div>
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
              <p class="text-xs text-gray-400 mt-0.5">{{ rolInfo(dev.rol).titulo }} - Participacion reciente</p>
            </div>
          }
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button class="btn-success flex-1">Confirmar en equipo</button>
          <button class="btn-secondary flex-1">Descartar</button>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  dev: any = null;
  levels = [1, 2, 3];
  rolInfo = rolInfo;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.dev = COLABORADORES.find(d => d.id === id) || null;
  }

  getInitials(nombre: string): string {
    return nombre.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getLevel(i: number): number {
    return [3, 2, 3, 2, 3, 3, 2, 1][i % 8] || 2;
  }

  getLevelLabel(i: number): string {
    return ['Avanzado','Intermedio','Avanzado','Intermedio','Avanzado','Avanzado','Intermedio','Basico'][i % 8];
  }
}
