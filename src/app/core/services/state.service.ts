// src/app/core/services/state.service.ts
import { Injectable, signal } from '@angular/core';
import { EstimacionOutput, TeamOutput, ProjectInput } from '../models/estimate.model';

@Injectable({ providedIn: 'root' })
export class StateService {
  lastInput  = signal<ProjectInput | null>(null);
  lastResult = signal<EstimacionOutput | null>(null);
  lastTeam   = signal<TeamOutput | null>(null);
}
