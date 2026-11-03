// src/app/core/data/colaboradores.ts
// Roles de colaborador y utilidades. Los colaboradores vienen del backend (/api/v1/colaboradores).
import { Rol } from '../models/estimate.model';

export interface ColaboradorInput {
  nombre: string;
  email?: string | null;
  rol: Rol;
  seniority: 'junior' | 'mid' | 'senior';
  tecnologias: string[];
  disponibilidad_pct: number;
  experiencia_anos: number;
  costo_hora: number;       // S/. por hora
  proyectos: string[];
  activo: boolean;
}

export interface Colaborador extends ColaboradorInput {
  id: number;
}

export const ROLES: { value: Rol; label: string; titulo: string; tipo: 'end_to_end' | 'apoyo'; descripcion: string }[] = [
  { value: 'dev',       label: 'Desarrollo', titulo: 'Full-stack Developer',       tipo: 'end_to_end', descripcion: 'Lleva el proyecto de punta a punta: análisis, diseño, desarrollo, integraciones y entrega.' },
  { value: 'qa',        label: 'QA',         titulo: 'QA Engineer',                tipo: 'apoyo',      descripcion: 'Apoyo: pruebas por módulo y pruebas de sistema e integración.' },
  { value: 'devops',    label: 'DevOps',     titulo: 'DevOps Engineer',            tipo: 'apoyo',      descripcion: 'Apoyo: entornos, CI/CD, preparación de producción y despliegue.' },
  { value: 'seguridad', label: 'Seguridad',  titulo: 'Especialista de Seguridad',  tipo: 'apoyo',      descripcion: 'Apoyo: hardening y pruebas de vulnerabilidades.' },
];

export function rolInfo(rol: Rol) {
  return ROLES.find(r => r.value === rol) ?? ROLES[0];
}

/** Clases del badge de cada rol. */
export function rolBadge(rol: Rol): string {
  switch (rol) {
    case 'qa': return 'bg-purple-50 text-purple-700';
    case 'devops': return 'bg-cyan-50 text-cyan-700';
    case 'seguridad': return 'bg-red-50 text-red-700';
    default: return 'bg-blue-50 text-blue-700';
  }
}
