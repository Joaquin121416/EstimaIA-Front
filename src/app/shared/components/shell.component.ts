// src/app/shared/components/shell.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- NAV -->
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
      </div>
      <div class="ml-auto flex items-center gap-2 text-white/80 text-sm">
        <div class="w-8 h-8 rounded-full bg-gold flex items-center justify-center font-bold text-navy text-xs">PM</div>
        J. Cunorana
      </div>
    </nav>

    <!-- LAYOUT -->
    <div class="flex pt-14 min-h-screen">
      <!-- SIDEBAR -->
      <aside class="w-52 bg-white border-r border-gray-200 fixed top-14 bottom-0 flex flex-col py-4">
        <div class="px-4 mb-1">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Principal</span>
        </div>
        <a routerLink="/dashboard" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          🏠 Dashboard
        </a>
        <a routerLink="/estimate" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          ➕ Nuevo Proyecto
        </a>
        <a routerLink="/results" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          📋 Historial
        </a>
        <div class="px-4 mt-4 mb-1">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Gestión</span>
        </div>
        <a routerLink="/catalog" routerLinkActive="bg-blue-50 text-brand font-semibold border-r-2 border-brand"
           class="flex items-center gap-2.5 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          👥 Desarrolladores
        </a>
      </aside>

      <!-- MAIN -->
      <main class="ml-52 flex-1 p-7 bg-gray-50 min-h-screen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class ShellComponent {}
