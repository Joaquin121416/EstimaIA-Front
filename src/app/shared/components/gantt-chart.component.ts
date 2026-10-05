// src/app/shared/components/gantt-chart.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GanttOutput, GanttTarea } from '../../core/models/estimate.model';

interface FilaFase {
  nombre: string;
  inicio: string;
  fin: string;
  horas: number;
  tareas: GanttTarea[];
}

interface Columna {
  label: string;
  left: number;
  width: number;
}

const ORDEN_FASES = ['Gestion', 'Inicio', 'Analisis', 'Diseno', 'Desarrollo', 'Pruebas', 'Despliegue', 'Cierre'];

const NOMBRE_FASE: Record<string, string> = {
  Gestion: 'Gestión', Inicio: 'Inicio', Analisis: 'Análisis', Diseno: 'Diseño',
  Desarrollo: 'Desarrollo', Pruebas: 'Pruebas', Despliegue: 'Despliegue', Cierre: 'Cierre',
};

const COLOR_FASE: Record<string, string> = {
  Gestion: 'bg-slate-400', Inicio: 'bg-sky-500', Analisis: 'bg-indigo-500', Diseno: 'bg-purple-500',
  Desarrollo: 'bg-brand', Pruebas: 'bg-amber-500', Despliegue: 'bg-emerald-500', Cierre: 'bg-teal-600',
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Resumen -->
    <div class="px-5 pt-4 pb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <div><span class="text-gray-400 text-xs block">Inicio</span><span class="font-semibold text-navy">{{ fmtLargo(gantt.fecha_inicio) }}</span></div>
      <div><span class="text-gray-400 text-xs block">Fin estimado</span><span class="font-semibold text-navy">{{ fmtLargo(gantt.fecha_fin) }}</span></div>
      <div><span class="text-gray-400 text-xs block">Duración</span><span class="font-semibold text-navy">{{ gantt.dias_habiles }} días hábiles</span></div>
      <div><span class="text-gray-400 text-xs block">Tareas / hitos</span><span class="font-semibold text-navy">{{ numTareas }} / {{ numHitos }}</span></div>
      <div><span class="text-gray-400 text-xs block">Frentes de desarrollo en paralelo</span><span class="font-semibold text-navy">{{ gantt.carriles_desarrollo }}</span></div>

      <div class="ml-auto flex items-center gap-2">
        <label class="flex items-center gap-1.5 text-xs font-semibold text-gray-600 cursor-pointer mr-2">
          <input type="checkbox" [checked]="resaltarCritica" (change)="resaltarCritica = !resaltarCritica" class="accent-red-500" />
          Resaltar ruta crítica
        </label>
        <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
          <button type="button" (click)="setZoom('dia')" class="px-2.5 py-1"
            [class]="zoom === 'dia' ? 'bg-brand text-white' : 'bg-white text-gray-600'">Días</button>
          <button type="button" (click)="setZoom('semana')" class="px-2.5 py-1"
            [class]="zoom === 'semana' ? 'bg-brand text-white' : 'bg-white text-gray-600'">Semanas</button>
        </div>
        <button type="button" (click)="exportarCsv()" class="btn-secondary text-xs !px-2.5 !py-1">⬇ CSV</button>
      </div>
    </div>

    <!-- Diagrama -->
    <div class="overflow-auto max-h-[640px] border-t border-gray-100 text-xs">
      <div [style.width.px]="ANCHO_IZQ + anchoTimeline">

        <!-- Cabecera -->
        <div class="flex sticky top-0 z-20 bg-gray-50 border-b border-gray-200">
          <div class="sticky left-0 z-30 bg-gray-50 shrink-0 flex items-end px-3 pb-1.5 font-semibold text-gray-500 uppercase border-r border-gray-200"
            [style.width.px]="ANCHO_IZQ">
            <span class="w-10">ID</span><span class="flex-1">Tarea</span><span class="w-12 text-right">Horas</span><span class="w-24 text-right">Fechas</span>
          </div>
          <div class="relative shrink-0 h-12" [style.width.px]="anchoTimeline">
            @for (m of meses; track m.left) {
              <div class="absolute top-0 h-6 border-l border-gray-200 px-1.5 pt-1 font-semibold text-gray-600 truncate"
                [style.left.px]="m.left" [style.width.px]="m.width">{{ m.label }}</div>
            }
            @for (s of semanas; track s.left) {
              <div class="absolute top-6 h-6 border-l border-t border-gray-200 px-1 pt-1 text-gray-400 truncate"
                [style.left.px]="s.left" [style.width.px]="s.width">{{ s.label }}</div>
            }
          </div>
        </div>

        <!-- Filas -->
        @for (f of filas; track f.nombre) {
          <!-- Fila de fase -->
          <div class="flex border-b border-gray-100 bg-gray-50/60 hover:bg-gray-100 cursor-pointer" (click)="toggleFase(f.nombre)">
            <div class="sticky left-0 z-10 bg-gray-50 shrink-0 flex items-center px-3 h-8 font-bold text-navy border-r border-gray-200"
              [style.width.px]="ANCHO_IZQ">
              <span class="w-10 text-gray-400">{{ colapsadas.has(f.nombre) ? '▶' : '▼' }}</span>
              <span class="flex-1 truncate">{{ nombreFase(f.nombre) }}</span>
              <span class="w-12 text-right">{{ f.horas }}</span>
              <span class="w-24 text-right font-normal text-gray-500">{{ fmt(f.inicio) }} – {{ fmt(f.fin) }}</span>
            </div>
            <div class="relative shrink-0 h-8" [style.width.px]="anchoTimeline" [style.background]="fondo">
              <div class="absolute top-3 h-2 rounded-sm bg-navy/70"
                [style.left.px]="x(f.inicio)" [style.width.px]="ancho(f.inicio, f.fin)"></div>
              @if (hoyX !== null) { <div class="absolute top-0 bottom-0 w-px bg-red-400" [style.left.px]="hoyX"></div> }
            </div>
          </div>

          <!-- Tareas -->
          @if (!colapsadas.has(f.nombre)) {
            @for (t of f.tareas; track t.id) {
              <div class="flex border-b border-gray-50 hover:bg-blue-50/40">
                <div class="sticky left-0 z-10 bg-white shrink-0 flex items-center px-3 h-8 text-gray-700 border-r border-gray-200"
                  [style.width.px]="ANCHO_IZQ" [title]="tooltip(t)">
                  <span class="w-10 text-gray-400">{{ t.id }}</span>
                  <span class="flex-1 truncate pl-2" [class.font-semibold]="t.tipo === 'hito'">
                    {{ t.tipo === 'hito' ? '◆ ' : '' }}{{ t.nombre }}
                    <span class="text-gray-400 font-normal"> · {{ t.rol }}</span>
                  </span>
                  <span class="w-12 text-right">{{ t.tipo === 'hito' ? '' : t.horas }}</span>
                  <span class="w-24 text-right text-gray-500">{{ t.tipo === 'hito' ? fmt(t.fin) : fmt(t.inicio) + ' – ' + fmt(t.fin) }}</span>
                </div>
                <div class="relative shrink-0 h-8" [style.width.px]="anchoTimeline" [style.background]="fondo">
                  @if (t.tipo === 'hito') {
                    <div class="absolute top-2.5 w-3 h-3 rotate-45"
                      [class]="resaltarCritica && t.critica ? 'bg-red-500' : 'bg-navy'"
                      [style.left.px]="x(t.fin) + pxDia / 2 - 6" [title]="tooltip(t)"></div>
                  } @else {
                    <div class="absolute top-2 h-4 rounded"
                      [class]="(resaltarCritica && t.critica ? 'bg-red-500' : color(t.fase)) + (t.id === '0' ? ' opacity-40' : '')"
                      [style.left.px]="x(t.inicio)" [style.width.px]="ancho(t.inicio, t.fin)" [title]="tooltip(t)">
                      @if (ancho(t.inicio, t.fin) > 44) {
                        <span class="text-[10px] text-white font-semibold px-1.5 leading-4 block truncate">{{ t.duracion_dias }}d · {{ t.personas }}p</span>
                      }
                    </div>
                    @if (t.holgura_dias > 0 && t.id !== '0') {
                      <div class="absolute top-[15px] h-px border-t border-dashed border-gray-300"
                        [style.left.px]="x(t.fin) + pxDia" [style.width.px]="t.holgura_dias * pxDiaHabil"></div>
                    }
                  }
                  @if (hoyX !== null) { <div class="absolute top-0 bottom-0 w-px bg-red-400" [style.left.px]="hoyX"></div> }
                </div>
              </div>
            }
          }
        }
      </div>
    </div>

    <!-- Leyenda -->
    <div class="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
      @for (fase of fasesLeyenda; track fase) {
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm" [class]="color(fase)"></span>{{ nombreFase(fase) }}</span>
      }
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-red-500"></span>Ruta crítica</span>
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rotate-45 bg-navy"></span>Hito</span>
      <span class="flex items-center gap-1.5"><span class="w-4 border-t border-dashed border-gray-400"></span>Holgura</span>
      <span class="flex items-center gap-1.5"><span class="w-px h-3 bg-red-400"></span>Hoy</span>
      <span class="ml-auto">Fines de semana sombreados · pasa el cursor sobre una tarea para ver el detalle</span>
    </div>
  `,
})
export class GanttChartComponent implements OnChanges {
  @Input({ required: true }) gantt!: GanttOutput;

  readonly ANCHO_IZQ = 460;
  zoom: 'dia' | 'semana' = 'semana';
  pxDia = 10;
  resaltarCritica = true;
  colapsadas = new Set<string>();

  filas: FilaFase[] = [];
  meses: Columna[] = [];
  semanas: Columna[] = [];
  fasesLeyenda: string[] = [];
  anchoTimeline = 0;
  totalDias = 0;
  numTareas = 0;
  numHitos = 0;
  hoyX: number | null = null;
  fondo = '';

  private inicio = new Date();

  ngOnChanges() {
    if (!this.gantt) return;
    this.inicio = this.parse(this.gantt.fecha_inicio);
    this.totalDias = this.dias(this.gantt.fecha_fin) + 1;
    this.numHitos = this.gantt.tareas.filter(t => t.tipo === 'hito').length;
    this.numTareas = this.gantt.tareas.length - this.numHitos;

    const porFase = new Map<string, GanttTarea[]>();
    for (const t of this.gantt.tareas) {
      if (!porFase.has(t.fase)) porFase.set(t.fase, []);
      porFase.get(t.fase)!.push(t);
    }
    this.filas = ORDEN_FASES.filter(f => porFase.has(f)).map(nombre => {
      const tareas = porFase.get(nombre)!;
      return {
        nombre,
        tareas,
        inicio: tareas.map(t => t.inicio).sort()[0],
        fin: tareas.map(t => t.fin).sort().reverse()[0],
        horas: Math.round(tareas.reduce((s, t) => s + t.horas, 0)),
      };
    });
    this.fasesLeyenda = this.filas.map(f => f.nombre);
    this.calcularEscala();
  }

  setZoom(z: 'dia' | 'semana') {
    this.zoom = z;
    this.calcularEscala();
  }

  private calcularEscala() {
    this.pxDia = this.zoom === 'dia' ? 26 : 10;
    // Al menos 1 semana extra para que se vean los ultimos hitos
    this.anchoTimeline = (this.totalDias + 7) * this.pxDia;

    // Meses
    this.meses = [];
    const fin = new Date(this.inicio);
    fin.setDate(fin.getDate() + this.totalDias + 7);
    let d = new Date(this.inicio);
    while (d < fin) {
      const sig = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const left = this.diffDias(this.inicio, d) * this.pxDia;
      const width = Math.min(this.diffDias(d, sig), this.diffDias(d, fin)) * this.pxDia;
      this.meses.push({ label: `${MESES[d.getMonth()]} ${d.getFullYear()}`, left, width });
      d = sig;
    }

    // Semanas (empiezan en lunes)
    this.semanas = [];
    const lunes = new Date(this.inicio);
    lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
    let n = 1;
    for (let s = new Date(lunes); s < fin; s.setDate(s.getDate() + 7), n++) {
      const left = this.diffDias(this.inicio, s) * this.pxDia;
      const etiqueta = this.zoom === 'dia' ? `S${n} · ${this.fmtDate(s)}` : `S${n}`;
      this.semanas.push({ label: etiqueta, left: Math.max(left, 0), width: 7 * this.pxDia + Math.min(left, 0) });
    }

    // Fondo con fines de semana sombreados
    const offLunes = this.diffDias(this.inicio, lunes) * this.pxDia; // <= 0
    const p = this.pxDia;
    this.fondo = `linear-gradient(to right, transparent 0 ${5 * p}px, rgba(148,163,184,0.12) ${5 * p}px ${7 * p}px) ${offLunes}px 0 / ${7 * p}px 100% repeat-x`;

    // Linea de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dh = this.diffDias(this.inicio, hoy);
    this.hoyX = dh >= 0 && dh <= this.totalDias ? dh * this.pxDia : null;
  }

  /** Ancho medio de un dia habil en el grafico (los fines de semana ocupan espacio). */
  get pxDiaHabil() {
    return this.pxDia * 7 / 5;
  }

  toggleFase(nombre: string) {
    if (this.colapsadas.has(nombre)) this.colapsadas.delete(nombre);
    else this.colapsadas.add(nombre);
  }

  x(fecha: string) {
    return this.dias(fecha) * this.pxDia;
  }

  ancho(inicio: string, fin: string) {
    return Math.max((this.dias(fin) - this.dias(inicio) + 1) * this.pxDia, 3);
  }

  color(fase: string) {
    return COLOR_FASE[fase] ?? 'bg-gray-400';
  }

  nombreFase(fase: string) {
    return NOMBRE_FASE[fase] ?? fase;
  }

  tooltip(t: GanttTarea) {
    const partes = [
      `${t.id} · ${t.nombre}`,
      `Fase: ${this.nombreFase(t.fase)} · Rol: ${t.rol}`,
      t.tipo === 'hito'
        ? `Fecha: ${this.fmtLargo(t.fin)}`
        : `${this.fmtLargo(t.inicio)} → ${this.fmtLargo(t.fin)} (${t.duracion_dias} días hábiles)`,
    ];
    if (t.tipo !== 'hito') partes.push(`Esfuerzo: ${t.horas} h · ${t.personas} persona(s)`);
    if (t.dependencias.length) partes.push(`Depende de: ${t.dependencias.join(', ')}`);
    partes.push(t.critica ? 'En la ruta crítica' : `Holgura: ${t.holgura_dias} días`);
    return partes.join('\n');
  }

  exportarCsv() {
    const enc = ['ID', 'Fase', 'Tarea', 'Tipo', 'Rol', 'Horas', 'Personas', 'Inicio', 'Fin',
      'Dias habiles', 'Dependencias', 'Holgura (dias)', 'Ruta critica'];
    const esc = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
    const filas = this.gantt.tareas.map(t => [
      t.id, this.nombreFase(t.fase), t.nombre, t.tipo, t.rol, t.horas, t.personas, t.inicio, t.fin,
      t.duracion_dias, t.dependencias.join(' '), t.holgura_dias, t.critica ? 'Si' : 'No',
    ].map(esc).join(';'));
    const csv = '﻿' + [enc.map(esc).join(';'), ...filas].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cronograma-gantt.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Fechas (se parsean en hora local para evitar desfases de zona horaria) ---
  private parse(iso: string) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private diffDias(a: Date, b: Date) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  private dias(iso: string) {
    return this.diffDias(this.inicio, this.parse(iso));
  }

  private fmtDate(d: Date) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  fmt(iso: string) {
    return this.fmtDate(this.parse(iso));
  }

  fmtLargo(iso: string) {
    const d = this.parse(iso);
    return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }
}
