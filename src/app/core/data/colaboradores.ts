// src/app/core/data/colaboradores.ts
// Catálogo de colaboradores (mismo contenido que data/equipo.py del backend).
import { Rol } from '../models/estimate.model';

export interface Colaborador {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  seniority: 'junior' | 'mid' | 'senior';
  tecnologias: string[];
  disponibilidad_pct: number;
  experiencia: number;      // años
  costo_hora: number;       // S/. por hora
  proyectos: string[];
  activo: boolean;
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

export const COLABORADORES: Colaborador[] = [
  // Desarrollo (end-to-end)
  { id: 1,  nombre: 'Ana Quispe',       email: 'a.quispe@consultora.pe',     rol: 'dev', seniority: 'senior', tecnologias: ['react', 'node', 'postgresql', 'docker', 'typescript'],    disponibilidad_pct: 90,  experiencia: 6, costo_hora: 34, proyectos: ['Portal E-comm Lima Moda', 'API Gateway Fintech', 'Dashboard Analytics'], activo: true },
  { id: 2,  nombre: 'Carlos Mendoza',   email: 'c.mendoza@consultora.pe',    rol: 'dev', seniority: 'mid',    tecnologias: ['node', 'postgresql', 'rest', 'express'],                disponibilidad_pct: 100, experiencia: 3, costo_hora: 23, proyectos: ['API Inventario QROMA', 'Microservicio Notif.'], activo: true },
  { id: 3,  nombre: 'Lucia Torres',     email: 'l.torres@consultora.pe',     rol: 'dev', seniority: 'mid',    tecnologias: ['react', 'typescript', 'tailwind', 'vue'],               disponibilidad_pct: 75,  experiencia: 3, costo_hora: 23, proyectos: ['Catalogo QROMA', 'Dashboard KPIs'], activo: true },
  { id: 4,  nombre: 'Jorge Ramos',      email: 'j.ramos@consultora.pe',      rol: 'dev', seniority: 'senior', tecnologias: ['fastapi', 'python', 'docker', 'postgresql', 'shap'],     disponibilidad_pct: 60,  experiencia: 7, costo_hora: 36, proyectos: ['Motor Scoring ELDO', 'API Optimizacion Rutas', 'ML Pipeline EstimaIA'], activo: true },
  { id: 5,  nombre: 'Maria Paz Flores', email: 'm.paz@consultora.pe',        rol: 'dev', seniority: 'junior', tecnologias: ['react', 'javascript', 'html', 'css'],                   disponibilidad_pct: 100, experiencia: 1, costo_hora: 15, proyectos: ['App Fuerza Ventas'], activo: true },
  { id: 6,  nombre: 'Diego Paredes',    email: 'd.paredes@consultora.pe',    rol: 'dev', seniority: 'mid',    tecnologias: ['angular', 'typescript', 'net', 'csharp'],               disponibilidad_pct: 80,  experiencia: 4, costo_hora: 25, proyectos: ['Portal Distribuidores QROMA'], activo: true },
  { id: 7,  nombre: 'Valeria Rios',     email: 'v.rios@consultora.pe',       rol: 'dev', seniority: 'senior', tecnologias: ['react_native', 'react', 'typescript', 'firebase'],      disponibilidad_pct: 70,  experiencia: 5, costo_hora: 33, proyectos: ['App Movil ELDO', 'App Repartidor LOGIPAQ'], activo: true },
  { id: 8,  nombre: 'Andres Castillo',  email: 'a.castillo@consultora.pe',   rol: 'dev', seniority: 'mid',    tecnologias: ['node', 'fastapi', 'python', 'microservices', 'docker'], disponibilidad_pct: 90,  experiencia: 4, costo_hora: 25, proyectos: ['Microservicio Facturacion', 'API Integracion SAP'], activo: true },
  { id: 9,  nombre: 'Camila Vega',      email: 'c.vega@consultora.pe',       rol: 'dev', seniority: 'junior', tecnologias: ['vue', 'javascript', 'node'],                            disponibilidad_pct: 100, experiencia: 2, costo_hora: 16, proyectos: ['Portal Laboratorio NEXO'], activo: true },
  { id: 10, nombre: 'Roberto Salas',    email: 'r.salas@consultora.pe',      rol: 'dev', seniority: 'senior', tecnologias: ['angular', 'java', 'spring', 'postgresql'],              disponibilidad_pct: 50,  experiencia: 8, costo_hora: 38, proyectos: ['HCE NEXO SALUD', 'Sistema Pedidos QROMA'], activo: false },
  // QA (apoyo)
  { id: 11, nombre: 'Patricia Huaman',  email: 'p.huaman@consultora.pe',     rol: 'qa', seniority: 'senior', tecnologias: ['selenium', 'cypress', 'postman', 'jmeter', 'react'],     disponibilidad_pct: 80,  experiencia: 6, costo_hora: 26, proyectos: ['Portal E-comm Lima Moda', 'HCE NEXO SALUD'], activo: true },
  { id: 12, nombre: 'Luis Cardenas',    email: 'l.cardenas@consultora.pe',   rol: 'qa', seniority: 'mid',    tecnologias: ['cypress', 'playwright', 'postman', 'jest', 'angular'],  disponibilidad_pct: 100, experiencia: 3, costo_hora: 20, proyectos: ['Portal Distribuidores QROMA'], activo: true },
  { id: 13, nombre: 'Karen Espinoza',   email: 'k.espinoza@consultora.pe',   rol: 'qa', seniority: 'junior', tecnologias: ['pruebas_manuales', 'postman', 'jira'],                  disponibilidad_pct: 100, experiencia: 1, costo_hora: 14, proyectos: ['App Fuerza Ventas'], activo: true },
  // DevOps (apoyo)
  { id: 14, nombre: 'Renzo Villanueva', email: 'r.villanueva@consultora.pe', rol: 'devops', seniority: 'senior', tecnologias: ['docker', 'kubernetes', 'aws', 'terraform', 'github_actions'], disponibilidad_pct: 60, experiencia: 7, costo_hora: 38, proyectos: ['API Gateway Fintech', 'Microservicio Facturacion'], activo: true },
  { id: 15, nombre: 'Sofia Chavez',     email: 's.chavez@consultora.pe',     rol: 'devops', seniority: 'mid',    tecnologias: ['docker', 'railway', 'azure', 'github_actions', 'linux'],     disponibilidad_pct: 90, experiencia: 4, costo_hora: 28, proyectos: ['ML Pipeline EstimaIA'], activo: true },
  // Seguridad (apoyo)
  { id: 16, nombre: 'Miguel Alarcon',   email: 'm.alarcon@consultora.pe',    rol: 'seguridad', seniority: 'senior', tecnologias: ['owasp', 'pentesting', 'burp_suite', 'iso27001'], disponibilidad_pct: 50, experiencia: 8, costo_hora: 42, proyectos: ['API Gateway Fintech', 'HCE NEXO SALUD'], activo: true },
  { id: 17, nombre: 'Daniela Rojas',    email: 'd.rojas@consultora.pe',      rol: 'seguridad', seniority: 'mid',    tecnologias: ['owasp', 'sast', 'dast', 'sonarqube'],          disponibilidad_pct: 80, experiencia: 3, costo_hora: 30, proyectos: ['Motor Scoring ELDO'], activo: true },
];

/** Costo por hora promedio de cada rol según el catálogo (igual que el backend). */
export function tarifaPromedio(rol: Rol): number {
  const c = COLABORADORES.filter(x => x.rol === rol).map(x => x.costo_hora);
  return c.length ? Math.round(c.reduce((a, b) => a + b, 0) / c.length * 100) / 100 : 0;
}
