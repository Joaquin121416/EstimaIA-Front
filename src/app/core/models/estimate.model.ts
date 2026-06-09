// src/app/core/models/estimate.model.ts

export interface ProjectInput {
  nombre: string;
  tipo_sistema: string;
  tecnologia_principal: string;
  num_modulos: number;
  complejidad: number;
  tamano_equipo_previsto: number;
  duracion_dias?: number;
  num_tareas?: number;
  presupuesto_maximo_soles?: number;
  deadline_semanas?: number;
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
