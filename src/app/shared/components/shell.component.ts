// shared/components/shell.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="bg-navy h-14 flex items-center px-6 gap-4 fixed top-0 left-0 right-0 z-50">
      <span class="text-white font-bold text-lg tracking-wide">
        Estima<span class="text-gold">IA</span>
      </span>
      <div class="flex gap-1 ml-8">
        <a routerLink="/dashboard" routerLinkActive="bg-white/20 text-white font-semibold"
           class="text-white/65 text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Dashboard</a>
        <a routerLink="/estimate" routerLinkActive="bg-white/20 text-white font-semibold"
           class="text-white/65 text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Nuevo Proyecto</a>
        <a routerLink="/catalog" routerLinkActive="bg-white/20 text-white font-semibold"
           class="text-white/65 text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Equipo</a>
        @if (auth.isAdmin()) {
          <a routerLink="/users" routerLinkActive="bg-white/20 text-white font-semibold"
             class="text-white/65 text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">Usuarios</a>
        }
      </div>
      <div class="ml-auto flex items-center gap-3 text-white/80 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-navy text-xs"
               [style.background]="auth.isAdmin() ? '#C8973A' : '#F0B94A'">
            {{ initials() }}
          </div>
          <div class="hidden md:block">
            <p class="text-xs font-semibold leading-tight">{{ auth.currentUser()?.nombre }}</p>
            <p class="text-[10px] text-white/50 leading-tight">{{ auth.isAdmin() ? 'Administrador' : 'Project Manager' }}</p>
          </div>
        </div>
        <button (click)="logout()" class="text-white/60 hover:text-white text-xs border-l border-white/20 pl-3" title="Cerrar sesion">
          Salir
        </button>
      </div>
    </nav>

    <div class="flex pt-14 min-h-screen">
      <aside class="w-52 bg-white border-r border-gray-200 fixed top-14 bottom-0 flex flex-col py-4">
        <div class="px-4 mb-1"><span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Principal</span></div>
        <a routerLink="/dashboard" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">🏠 Dashboard</a>
        <a routerLink="/estimate" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">➕ Nuevo Proyecto</a>
        <a routerLink="/results" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">📋 Historial</a>
        <div class="px-4 mt-4 mb-1"><span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Gestion</span></div>
        <a routerLink="/catalog" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">👥 Desarrolladores</a>
        @if (auth.isAdmin()) {
          <a routerLink="/users" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
             class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">🔐 Usuarios y Roles</a>
          <a routerLink="/sincerar"
            routerLinkActive="bg-white/20 text-white font-semibold"
            class="text-white/65 text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors">
            Sinceración
          </a>
        }
      </aside>

      <main class="ml-52 flex-1 p-7 bg-gray-50 min-h-screen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class ShellComponent {
  constructor(public auth: AuthService, private router: Router) {}

  initials(): string {
    const n = this.auth.currentUser()?.nombre ?? '';
    return n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
