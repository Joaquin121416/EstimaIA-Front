// core/services/auth.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, TokenResponse, Usuario, PermisosResponse } from '../models/auth.model';

const STORAGE_KEY = 'estimaia_token';
const USER_KEY = 'estimaia_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'https://web-production-9290c.up.railway.app';

  token = signal<string | null>(this.readToken());
  currentUser = signal<Usuario | null>(this.readUser());

  isLoggedIn = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.rol === 'admin');

  constructor(private http: HttpClient) {}

  private readToken(): string | null {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }
  private readUser(): Usuario | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.base}/api/v1/auth/login`, payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(payload: RegisterRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/api/v1/auth/register`, payload);
  }

  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/api/v1/auth/me`);
  }

  getMyPermissions(): Observable<PermisosResponse> {
    return this.http.get<PermisosResponse>(`${this.base}/api/v1/users/me/permisos`);
  }

  private setSession(res: TokenResponse) {
    localStorage.setItem(STORAGE_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this.token.set(res.access_token);
    this.currentUser.set(res.usuario);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }
}
