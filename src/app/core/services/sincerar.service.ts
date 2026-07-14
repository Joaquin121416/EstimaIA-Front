// src/app/core/services/sincerar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProyectoPendiente {
  id: number;
  nombre?: string;
  empresa?: string;
  tipo_sistema?: string;
  tecnologia_principal?: string;
  num_modulos?: number;
  complejidad?: number;
  tamano_equipo?: number;
  num_tareas_asana?: number;
  duracion_estimada_dias?: number;
  duracion_real_dias?: number;
  start_on?: string;
  completed_at?: string;
  esfuerzo_estimado_horas?: number;
  esfuerzo_real_horas?: number;
  estado?: string;
  sincerado?: boolean;
  incluir_en_training?: boolean;
  sincerado_por?: string;
  mmre?: number | null;
  apto_para_training?: boolean;
}

export interface RetrainResult {
  proyectos_totales: number;
  proyectos_semilla: number;
  proyectos_sincerados: number;
  r2_cv_anterior: number;
  r2_cv_nuevo: number;
  r2_holdout_nuevo: number;
  mmre_nuevo_pct: number;
  modelo_promovido: boolean;
  metrica_decision: string;
  mensaje: string;
  reentrenado_por: string;
  fecha: string;
  detail?: string;
}

export interface EstadoModelo {
  r2_actual: number;
  r2_cv_actual: number;
  mmre_actual_pct: number;
  proyectos_en_modelo: number;
  proyectos_sincerados_disponibles: number;
  modelo_persistido: boolean;
  listo_para_reentrenar: boolean;
  minimo_requerido: number;
}

@Injectable({ providedIn: 'root' })
export class SincerarService {
  private base = 'https://web-production-9290c.up.railway.app/api/v1/admin';

  constructor(private http: HttpClient) {}

  listarPendientes(incluirSincerados = false): Observable<ProyectoPendiente[]> {
    return this.http.get<ProyectoPendiente[]>(
      `${this.base}/sincerar/pendientes?incluir_sincerados=${incluirSincerados}`
    );
  }

  sincerar(id: number, datos: any) {
    return this.http.put<ProyectoPendiente>(`${this.base}/sincerar/${id}`, datos);
  }

  toggleTraining(id: number) {
    return this.http.patch(`${this.base}/sincerar/${id}/toggle-training`, {});
  }

  eliminar(id: number) {
    return this.http.delete(`${this.base}/sincerar/${id}`);
  }

  estadoModelo(): Observable<EstadoModelo> {
    return this.http.get<EstadoModelo>(`${this.base}/retrain/estado`);
  }

  reentrenar(): Observable<RetrainResult> {
    return this.http.post<RetrainResult>(`${this.base}/retrain`, {});
  }
}
