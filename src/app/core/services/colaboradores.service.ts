// src/app/core/services/colaboradores.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Colaborador, ColaboradorInput } from '../data/colaboradores';
import { Rol } from '../models/estimate.model';

@Injectable({ providedIn: 'root' })
export class ColaboradoresService {
  private base = 'https://web-production-9290c.up.railway.app/api/v1/colaboradores';

  constructor(private http: HttpClient) {}

  list(): Observable<Colaborador[]> {
    return this.http.get<Colaborador[]>(`${this.base}/`);
  }

  get(id: number): Observable<Colaborador> {
    return this.http.get<Colaborador>(`${this.base}/${id}`);
  }

  create(data: ColaboradorInput): Observable<Colaborador> {
    return this.http.post<Colaborador>(`${this.base}/`, data);
  }

  update(id: number, data: ColaboradorInput): Observable<Colaborador> {
    return this.http.put<Colaborador>(`${this.base}/${id}`, data);
  }

  toggleActivo(id: number): Observable<Colaborador> {
    return this.http.patch<Colaborador>(`${this.base}/${id}/activo`, {});
  }

  /** Costo por hora promedio de cada rol (colaboradores activos). */
  tarifasPromedio(): Observable<Record<Rol, number>> {
    return this.http.get<Record<Rol, number>>(`${this.base}/tarifas-promedio`);
  }
}
