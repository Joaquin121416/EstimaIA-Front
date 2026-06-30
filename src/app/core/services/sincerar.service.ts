// src/app/services/sincerar.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SincerarService {
  private base = 'https://web-production-9290c.up.railway.app/api/v1/admin';

  constructor(private http: HttpClient) {}

  listarPendientes() {
    return this.http.get<any[]>(`${this.base}/sincerar/pendientes`);
  }

  sincerar(id: number, datos: any) {
    return this.http.put(`${this.base}/sincerar/${id}`, datos);
  }

  toggleTraining(id: number) {
    return this.http.patch(`${this.base}/sincerar/${id}/toggle-training`, {});
  }

  reentrenar() {
    return this.http.post(`${this.base}/retrain`, {});
  }
}