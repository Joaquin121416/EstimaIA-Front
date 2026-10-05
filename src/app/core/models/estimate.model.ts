// src/app/core/models/estimate.model.ts

export interface ProjectInput {
  nombre: string;
  empresa: string;
  tipo_sistema: string;
  tecnologia_principal: string;
  num_modulos: number;
  complejidad: number;
  tamano_equipo_previsto: number;
  duracion_dias?: number;
  num_tareas?: number;
  presupuesto_maximo_soles?: number;
  deadline_semanas?: number;
  // Variables de ajuste (opcionales)
  experiencia_equipo?: number;          // 1..5
  claridad_requisitos?: number;         // 1..5
  metodologia?: 'scrum' | 'kanban' | 'hibrido' | 'cascada';
  num_integraciones?: number;
  nivel_seguridad?: 'bajo' | 'medio' | 'alto';
  reutilizacion_pct?: number;           // 0..80
  documentacion?: 'basica' | 'estandar' | 'exhaustiva';
  pruebas_automatizadas?: boolean;
  plataformas_destino?: number;         // 1..5
  disponibilidad_equipo_pct?: number;   // 25..100
  // Cronograma
  fecha_inicio?: string;                // YYYY-MM-DD
  nombres_modulos?: string[];
}

export interface AjusteVariable {
  variable: string;
  valor: string;
  factor: number;
  impacto_pct: number;
  impacto_horas: number;
}

export interface GanttTarea {
  id: string;
  nombre: string;
  fase: string;
  tipo: 'tarea' | 'hito';
  horas: number;
  personas: number;
  rol: string;
  dependencias: string[];
  inicio: string;
  fin: string;
  dia_inicio: number;
  duracion_dias: number;
  holgura_dias: number;
  critica: boolean;
}

export interface GanttFase {
  nombre: string;
  inicio: string;
  fin: string;
  horas: number;
}

export interface GanttOutput {
  fecha_inicio: string;
  fecha_fin: string;
  dias_habiles: number;
  dias_calendario: number;
  carriles_desarrollo: number;
  fases: GanttFase[];
  tareas: GanttTarea[];
  ruta_critica: string[];
}

export interface ShapVariable {
  variable: string;
  impacto_pct: number;
}

export interface ProyectoReferencia {
  asana_project_gid: string;
  empresa: string;
  nombre: string;
  tipo_sistema: string;
  tecnologia_principal: string;
  num_modulos: number;
  esfuerzo_real_horas: number;
  duracion_real_dias: number;
  desvio_pct: number;
  similitud_pct: number;
  fecha_inicio: string;
  fecha_fin_real: string;
}

export interface ConfidenceDetail {
  score_total: number;
  base_modelo: number;
  penalizacion_presupuesto: number;
  penalizacion_tiempo: number;
  mensaje: string;
}

export interface EstimacionOutput {
  esfuerzo_horas: number;
  esfuerzo_min: number;
  esfuerzo_max: number;
  intervalo_confianza_pct: number;
  duracion_estimada_dias: number;
  duracion_estimada_semanas: number;
  modelo_usado: string;
  mmre_modelo: number;
  r2_modelo: number;
  shap_top3: ShapVariable[];
  proyectos_referencia: ProyectoReferencia[];
  confidence_score: ConfidenceDetail;
  proyecto_id?: number;
  esfuerzo_base_modelo?: number;
  factor_ajuste_total?: number;
  ajustes?: AjusteVariable[];
  gantt?: GanttOutput;
}

export interface TeamInput {
  esfuerzo_estimado_horas: number;
  tecnologia_requerida: string;
  duracion_semanas: number;
}

export interface DeveloperScore {
  id: number;
  nombre: string;
  seniority: string;
  score_total: number;
  score_skills: number;
  score_experiencia: number;
  score_disponibilidad: number;
  tecnologias: string[];
  disponibilidad_pct: number;
}

export interface TeamOutput {
  num_devs_recomendados: number;
  equipo: DeveloperScore[];
  cobertura_skills_pct: number;
  balance_carga_desv_pct: number;
}

export interface HealthResponse {
  status: string;
  modelo: string;
  r2: number;
  mmre_pct: number;
  dataset_proyectos: number;
}
