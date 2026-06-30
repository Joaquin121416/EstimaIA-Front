// pages/login/login.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-navy flex items-center justify-center px-4">
      <div class="w-full max-w-md">

        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-1 text-3xl font-bold text-white">
            Estima<span class="text-gold">IA</span>
          </div>
          <p class="text-white/50 text-sm mt-2">Sistema Inteligente de Estimacion de Esfuerzo</p>
        </div>

        <div class="bg-white rounded-xl shadow-2xl p-8">
          <h1 class="text-lg font-bold text-navy mb-1">Iniciar sesion</h1>
          <p class="text-sm text-gray-500 mb-6">Ingresa tus credenciales para continuar</p>

          <div class="space-y-4">
            <div>
              <label class="label">Correo electronico</label>
              <input [(ngModel)]="email" type="email" class="input-field"
                     placeholder="tucorreo@consultora.pe"
                     (keyup.enter)="submit()" />
            </div>
            <div>
              <label class="label">Contrasena</label>
              <input [(ngModel)]="password" type="password" class="input-field"
                     placeholder="••••••••"
                     (keyup.enter)="submit()" />
            </div>

            @if (error()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {{ error() }}
              </div>
            }

            <button class="btn-primary w-full flex items-center justify-center gap-2"
                    [disabled]="!email || !password || loading()"
                    (click)="submit()">
              @if (loading()) { <span class="animate-spin">⏳</span> Ingresando... }
              @else { 🔐 Ingresar }
            </button>
          </div>

          <div class="mt-6 pt-5 border-t border-gray-100">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Usuario de prueba</p>
            <button (click)="fillDemo()" class="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg px-3 py-2">
              <span class="badge-blue mr-2">Admin</span>
              <span class="text-gray-600">joaquin@consultora.pe</span>
            </button>
          </div>
        </div>

        <p class="text-center text-white/40 text-xs mt-6">
          UPC 2026 · Proyecto de Investigacion I
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  fillDemo() {
    this.email = 'joaquin@consultora.pe';
    this.password = 'estimaIA2026';
  }

  submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.error.set('Email o contrasena incorrectos.');
        } else if (err.status === 0) {
          this.error.set('No se pudo conectar con el servidor. Intenta de nuevo.');
        } else {
          this.error.set('Error al iniciar sesion. Intenta nuevamente.');
        }
      }
    });
  }
}
