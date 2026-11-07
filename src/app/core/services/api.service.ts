// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProjectInput, EstimacionOutput,
  TeamInput, TeamOutput, HealthResponse, ConfirmarEstimacionInput
} from '../models/estimate.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'https://web-production-9290c.up.railway.app';

  constructor(private http: HttpClient) {}

  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.base}/health`);
  }

  estimate(payload: ProjectInput): Observable<EstimacionOutput> {
    return this.http.post<EstimacionOutput>(`${this.base}/api/v1/estimate`, payload);
  }

  /** Guarda en BD la estimacion que el PM confirmo (recalcula en el servidor). */
  confirmEstimate(payload: ConfirmarEstimacionInput): Observable<EstimacionOutput> {
    return this.http.post<EstimacionOutput>(`${this.base}/api/v1/estimate/confirmar`, payload);
  }

  assignTeam(payload: TeamInput): Observable<TeamOutput> {
    return this.http.post<TeamOutput>(`${this.base}/api/v1/assign-team`, payload);
  }
}
