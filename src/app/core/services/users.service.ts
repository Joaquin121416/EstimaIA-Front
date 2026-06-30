// core/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = 'https://web-production-9290c.up.railway.app';

  constructor(private http: HttpClient) {}

  listUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/api/v1/users/`);
  }

  updateRol(userId: number, rol: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/api/v1/users/${userId}/rol`, { rol });
  }

  deactivate(userId: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/api/v1/users/${userId}/desactivar`, {});
  }
}
