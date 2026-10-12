// src/app/shared/utils/gantt-excel.ts
//
// Genera un .xlsx con el diagrama de Gantt dibujado en celdas (barras de color por
// fase, ruta critica, hitos, holgura, fines de semana, linea de hoy y leyenda),
// mas una hoja "Datos" con la tabla plana. No usa librerias externas: un .xlsx es
// un ZIP con archivos XML, y aqui se arma directamente.

import type { GanttOutput, GanttTarea } from '../../core/models/estimate.model';

// ---------------------------------------------------------------- Configuracion

export interface OpcionesExcelGantt {
  proyecto?: string;
  resaltarCritica?: boolean;
}

const ORDEN_FASES = ['Gestion', 'Inicio', 'Analisis', 'Diseno', 'Desarrollo', 'Pruebas', 'Despliegue', 'Cierre'];

const NOMBRE_FASE: Record<string, string> = {
  Gestion: 'Gestión', Inicio: 'Inicio', Analisis: 'Análisis', Diseno: 'Diseño',
  Desarrollo: 'Desarrollo', Pruebas: 'Pruebas', Despliegue: 'Despliegue', Cierre: 'Cierre',
};

// Mismos colores que el Gantt web (Tailwind)
const COLOR_FASE: Record<string, string> = {
  Gestion: '94A3B8', Inicio: '0EA5E9', Analisis: '6366F1', Diseno: 'A855F7',
  Desarrollo: '1A5FAD', Pruebas: 'F59E0B', Despliegue: '10B981', Cierre: '0D9488',
};

const C = {
  navy: '0F2B4E', navyBar: '4B6079', brand: '1A5FAD', rojo: 'EF4444', rojoHoy: 'F87171',
  gris50: 'F9FAFB', gris100: 'F3F4F6', gris200: 'E5E7EB', gris400: '9CA3AF', gris500: '6B7280',
  gris700: '374151', faseFondo: 'F1F5F9', finde: 'F2F4F7', blanco: 'FFFFFF',
};

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const COLS_IZQ = 8;            // A..H: ID, Tarea, Rol, Horas, Pers., Inicio, Fin, Dias
const FILA_CAB = 6;            // primera fila de cabecera de la tabla
const FILA_DATOS = FILA_CAB + 3;

// ---------------------------------------------------------------- Estilos

interface Borde { estilo: 'thin' | 'medium' | 'hair' | 'dashed'; color: string }
interface Estilo {
  b?: boolean; i?: boolean; sz?: number; color?: string;
  fill?: string;
  l?: Borde; r?: Borde; t?: Borde; bt?: Borde;
  h?: 'left' | 'center' | 'right'; v?: 'top' | 'center' | 'bottom'; indent?: number; wrap?: boolean;
  fecha?: boolean;
}

class Estilos {
  private fonts: string[] = ['<font><sz val="10"/><color rgb="FF374151"/><name val="Calibri"/><family val="2"/></font>'];
  private fills: string[] = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
  private borders: string[] = ['<border><left/><right/><top/><bottom/><diagonal/></border>'];
  private xfs: string[] = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];
  private cache = new Map<string, number>();

  id(e: Estilo): number {
    const clave = JSON.stringify(e);
    const enCache = this.cache.get(clave);
    if (enCache !== undefined) return enCache;

    const font = `<font>${e.b ? '<b/>' : ''}${e.i ? '<i/>' : ''}<sz val="${e.sz ?? 10}"/>` +
      `<color rgb="FF${e.color ?? C.gris700}"/><name val="Calibri"/><family val="2"/></font>`;
    const fill = e.fill
      ? `<fill><patternFill patternType="solid"><fgColor rgb="FF${e.fill}"/><bgColor indexed="64"/></patternFill></fill>`
      : this.fills[0];
    const lado = (tag: string, b?: Borde) =>
      b ? `<${tag} style="${b.estilo}"><color rgb="FF${b.color}"/></${tag}>` : `<${tag}/>`;
    const border = `<border>${lado('left', e.l)}${lado('right', e.r)}${lado('top', e.t)}${lado('bottom', e.bt)}<diagonal/></border>`;

    const fontId = this.agregar(this.fonts, font);
    const fillId = this.agregar(this.fills, fill);
    const borderId = this.agregar(this.borders, border);
    const numFmt = e.fecha ? 164 : 0;
    const alin = (e.h || e.v || e.indent || e.wrap)
      ? `<alignment${e.h ? ` horizontal="${e.h}"` : ''} vertical="${e.v ?? 'center'}"` +
        `${e.indent ? ` indent="${e.indent}"` : ''}${e.wrap ? ' wrapText="1"' : ''}/>`
      : '<alignment vertical="center"/>';

    const xf = `<xf numFmtId="${numFmt}" fontId="${fontId}" fillId="${fillId}" borderId="${borderId}" xfId="0"` +
      ` applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">${alin}</xf>`;
    const idx = this.xfs.length;
    this.xfs.push(xf);
    this.cache.set(clave, idx);
    return idx;
  }

  private agregar(lista: string[], xml: string) {
    const i = lista.indexOf(xml);
    if (i >= 0) return i;
    lista.push(xml);
    return lista.length - 1;
  }

  xml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>
<fonts count="${this.fonts.length}">${this.fonts.join('')}</fonts>
<fills count="${this.fills.length}">${this.fills.join('')}</fills>
<borders count="${this.borders.length}">${this.borders.join('')}</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${this.xfs.length}">${this.xfs.join('')}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
  }
}

// ---------------------------------------------------------------- Hoja

type Valor = string | number | null;
interface Celda { v: Valor; s: number }

class Hoja {
  private filas = new Map<number, Map<number, Celda>>();
  private alturas = new Map<number, number>();
  private nivel = new Map<number, number>();
  private merges: string[] = [];
  anchos: number[] = [];
  congelar: { col: number; fila: number } | null = null;
  autoFiltro: string | null = null;
  horizontal = false;
  agrupar = false;

  set(fila: number, col: number, v: Valor, s: number) {
    if (!this.filas.has(fila)) this.filas.set(fila, new Map());
    this.filas.get(fila)!.set(col, { v, s });
  }

  merge(f1: number, c1: number, f2: number, c2: number) {
    if (f1 === f2 && c1 === c2) return;
    this.merges.push(`${ref(f1, c1)}:${ref(f2, c2)}`);
  }

  /** Escribe un bloque combinado con el mismo estilo en todas sus celdas (para que los bordes salgan completos). */
  bloque(f1: number, c1: number, f2: number, c2: number, v: Valor, s: number) {
    for (let f = f1; f <= f2; f++) for (let c = c1; c <= c2; c++) this.set(f, c, f === f1 && c === c1 ? v : null, s);
    this.merge(f1, c1, f2, c2);
  }

  altura(fila: number, pt: number) { this.alturas.set(fila, pt); }
  nivelFila(fila: number, n: number) { this.nivel.set(fila, n); }

  xml() {
    const nums = [...this.filas.keys()].sort((a, b) => a - b);
    let maxCol = 1;
    const filasXml = nums.map(r => {
      const celdas = [...this.filas.get(r)!.entries()].sort((a, b) => a[0] - b[0]);
      maxCol = Math.max(maxCol, celdas[celdas.length - 1][0]);
      const ht = this.alturas.get(r);
      const lvl = this.nivel.get(r);
      const attrs = `${ht ? ` ht="${ht}" customHeight="1"` : ''}${lvl ? ` outlineLevel="${lvl}"` : ''}`;
      const cs = celdas.map(([c, { v, s }]) => {
        const r1 = ref(r, c);
        if (v === null || v === '') return `<c r="${r1}" s="${s}"/>`;
        if (typeof v === 'number') return `<c r="${r1}" s="${s}"><v>${v}</v></c>`;
        return `<c r="${r1}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
      }).join('');
      return `<row r="${r}"${attrs}>${cs}</row>`;
    }).join('');

    const ultimaFila = nums.length ? nums[nums.length - 1] : 1;
    const vista = this.congelar
      ? `<pane xSplit="${this.congelar.col - 1}" ySplit="${this.congelar.fila - 1}" topLeftCell="${ref(this.congelar.fila, this.congelar.col)}" activePane="bottomRight" state="frozen"/>` +
        `<selection pane="bottomRight" activeCell="${ref(this.congelar.fila, this.congelar.col)}" sqref="${ref(this.congelar.fila, this.congelar.col)}"/>`
      : '';
    const cols = this.anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetPr>${this.agrupar ? '<outlinePr summaryBelow="0"/>' : ''}${this.horizontal ? '<pageSetUpPr fitToPage="1"/>' : ''}</sheetPr>
<dimension ref="A1:${ref(ultimaFila, maxCol)}"/>
<sheetViews><sheetView workbookViewId="0" showGridLines="0" zoomScale="100">${vista}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"${this.agrupar ? ' outlineLevelRow="1"' : ''}/>
${cols ? `<cols>${cols}</cols>` : ''}
<sheetData>${filasXml}</sheetData>
${this.autoFiltro ? `<autoFilter ref="${this.autoFiltro}"/>` : ''}
${this.merges.length ? `<mergeCells count="${this.merges.length}">${this.merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''}
<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>
${this.horizontal ? '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' : ''}
</worksheet>`;
  }
}

// ---------------------------------------------------------------- Construccion

export function generarExcelGantt(gantt: GanttOutput, op: OpcionesExcelGantt = {}): Uint8Array {
  const critica = op.resaltarCritica ?? true;
  const st = new Estilos();
  const inicio = parse(gantt.fecha_inicio);
  const totalDias = diff(inicio, parse(gantt.fecha_fin)) + 1;
  const nDias = totalDias + 7;                  // una semana extra, como en la web
  const col0 = COLS_IZQ + 1;                    // primera columna del timeline
  const colDe = (iso: string) => col0 + diff(inicio, parse(iso));
  const fechaDeCol = (c: number) => sumar(inicio, c - col0);
  const esFinde = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const esLunes = (d: Date) => d.getDay() === 1;

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dHoy = diff(inicio, hoy);
  const colHoy = dHoy >= 0 && dHoy <= totalDias ? col0 + dHoy : null;

  const hitos = gantt.tareas.filter(t => t.tipo === 'hito').length;
  const tareasN = gantt.tareas.length - hitos;

  // Fases ordenadas como en la web
  const porFase = new Map<string, GanttTarea[]>();
  for (const t of gantt.tareas) {
    if (!porFase.has(t.fase)) porFase.set(t.fase, []);
    porFase.get(t.fase)!.push(t);
  }
  const fases = [...ORDEN_FASES.filter(f => porFase.has(f)), ...[...porFase.keys()].filter(f => !ORDEN_FASES.includes(f))];

  // ===== Hoja 1: Cronograma
  const h = new Hoja();
  h.horizontal = true;
  h.agrupar = true;
  h.anchos = [7, 44, 16, 7, 6, 11, 11, 6, ...Array(nDias).fill(2.7)];
  const ultimaCol = col0 + nDias - 1;

  const lineaGris: Borde = { estilo: 'thin', color: C.gris200 };
  const lineaSuave: Borde = { estilo: 'hair', color: C.gris200 };

  // Titulo
  h.altura(1, 26);
  h.set(1, 1, `Cronograma del proyecto${op.proyecto ? ' — ' + op.proyecto : ''}`, st.id({ b: true, sz: 16, color: C.navy }));
  h.set(2, 1, `Generado por EstimaIA el ${fmtLargo(hoy)}`, st.id({ i: true, sz: 9, color: C.gris400 }));

  // Tarjetas de resumen (fila 3 etiqueta, fila 4 valor)
  const etq = st.id({ sz: 8, color: C.gris400, fill: C.gris50, l: lineaGris, r: lineaGris, t: lineaGris, indent: 1, h: 'left' });
  const val = st.id({ b: true, sz: 11, color: C.navy, fill: C.gris50, l: lineaGris, r: lineaGris, bt: lineaGris, indent: 1, h: 'left' });
  const tarjetas: [number, number, string, string][] = [
    [1, 2, 'Inicio', fmtLargo(inicio)],
    [3, 3, 'Fin estimado', fmtLargo(parse(gantt.fecha_fin))],
    [4, 6, 'Duración', `${gantt.dias_habiles} días hábiles`],
    [7, 8, 'Tareas / hitos', `${tareasN} / ${hitos}`],
    [col0, Math.min(col0 + 13, ultimaCol), 'Frentes de desarrollo en paralelo', String(gantt.carriles_desarrollo)],
  ];
  h.altura(3, 14); h.altura(4, 20);
  for (const [c1, c2, e, v] of tarjetas) {
    h.bloque(3, c1, 3, c2, e, etq);
    h.bloque(4, c1, 4, c2, v, val);
  }
  h.altura(5, 8);

  // Cabecera de la tabla
  const cabIzq = st.id({ b: true, sz: 9, color: C.blanco, fill: C.navy, h: 'center', v: 'center', l: { estilo: 'thin', color: '1A3A5C' } });
  const cabIzqTarea = st.id({ b: true, sz: 9, color: C.blanco, fill: C.navy, h: 'left', v: 'center', indent: 1, l: { estilo: 'thin', color: '1A3A5C' } });
  const titulos = ['ID', 'Tarea', 'Rol', 'Horas', 'Pers.', 'Inicio', 'Fin', 'Días'];
  titulos.forEach((t, i) => h.bloque(FILA_CAB, i + 1, FILA_CAB + 2, i + 1, t, i === 1 || i === 2 ? cabIzqTarea : cabIzq));
  h.altura(FILA_CAB, 18); h.altura(FILA_CAB + 1, 16); h.altura(FILA_CAB + 2, 14);

  // Meses
  const cabMes = st.id({ b: true, sz: 9, color: C.navy, fill: C.gris100, h: 'left', indent: 1, l: lineaGris, bt: lineaGris });
  for (let c = col0; c <= ultimaCol;) {
    const d = fechaDeCol(c);
    const finMes = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const c2 = Math.min(c + diff(d, finMes) - 1, ultimaCol);
    const ancho = c2 - c + 1;
    const etiqueta = ancho >= 10 ? `${MESES_LARGOS[d.getMonth()]} ${d.getFullYear()}`
      : ancho >= 4 ? `${MESES_CORTOS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}` : '';
    h.bloque(FILA_CAB, c, FILA_CAB, c2, etiqueta, cabMes);
    c = c2 + 1;
  }

  // Semanas (empiezan en lunes, como en la web)
  const cabSem = st.id({ sz: 8, color: C.gris500, fill: C.gris50, h: 'left', l: lineaGris, bt: lineaGris });
  const lunes0 = sumar(inicio, -((inicio.getDay() + 6) % 7));
  for (let n = 1, l = new Date(lunes0); diff(inicio, l) < nDias; l = sumar(l, 7), n++) {
    const c1 = Math.max(col0, col0 + diff(inicio, l));
    const c2 = Math.min(col0 + diff(inicio, l) + 6, ultimaCol);
    const ancho = c2 - c1 + 1;
    h.bloque(FILA_CAB + 1, c1, FILA_CAB + 1, c2, ancho >= 5 ? `S${n} · ${fmtCorto(l)}` : ancho >= 2 ? `S${n}` : '', cabSem);
  }

  // Dias
  for (let c = col0; c <= ultimaCol; c++) {
    const d = fechaDeCol(c);
    const fin = esFinde(d);
    h.set(FILA_CAB + 2, c, d.getDate(), st.id({
      sz: 7, color: fin ? C.gris400 : C.gris500, fill: c === colHoy ? 'FEE2E2' : fin ? C.finde : C.blanco,
      h: 'center', bt: lineaGris, l: esLunes(d) ? lineaGris : undefined,
    }));
  }

  // Celda del timeline segun su contenido
  // esBarra: dentro de una barra no se dibujan separadores de semana, para que se vea continua
  const celdaTimeline = (c: number, relleno: string | null, extra: Estilo = {}, esBarra = false) => {
    const d = fechaDeCol(c);
    const e: Estilo = {
      fill: relleno ?? (esFinde(d) ? C.finde : undefined),
      bt: { estilo: 'hair', color: C.gris100 },
      l: c === colHoy ? { estilo: 'medium', color: C.rojoHoy } : esLunes(d) && !esBarra ? lineaSuave : undefined,
      ...extra,
    };
    return st.id(e);
  };

  let fila = FILA_DATOS;
  const filaBase = (relleno?: string): Estilo => ({ fill: relleno, bt: { estilo: 'hair', color: C.gris200 } });

  for (const fase of fases) {
    const tareas = porFase.get(fase)!;
    const fi = tareas.map(t => t.inicio).sort()[0];
    const ff = tareas.map(t => t.fin).sort().reverse()[0];
    const horas = Math.round(tareas.reduce((s, t) => s + t.horas, 0));
    const color = COLOR_FASE[fase] ?? C.gris400;

    // --- fila de fase
    h.altura(fila, 18);
    const fBase = filaBase(C.faseFondo);
    h.set(fila, 1, null, st.id({ ...fBase, fill: color }));
    h.set(fila, 2, NOMBRE_FASE[fase] ?? fase, st.id({ ...fBase, b: true, color: C.navy, sz: 10, indent: 1, h: 'left' }));
    h.set(fila, 3, `${tareas.length} ${tareas.length === 1 ? 'elemento' : 'elementos'}`, st.id({ ...fBase, sz: 8, color: C.gris400, indent: 1, h: 'left' }));
    h.set(fila, 4, horas, st.id({ ...fBase, b: true, color: C.navy, h: 'right' }));
    h.set(fila, 5, null, st.id(fBase));
    h.set(fila, 6, serial(parse(fi)), st.id({ ...fBase, b: true, color: C.navy, fecha: true, h: 'center' }));
    h.set(fila, 7, serial(parse(ff)), st.id({ ...fBase, b: true, color: C.navy, fecha: true, h: 'center' }));
    h.set(fila, 8, null, st.id({ ...fBase, r: lineaGris }));
    const cfi = colDe(fi), cff = colDe(ff);
    for (let c = col0; c <= ultimaCol; c++) {
      const enBarra = c >= cfi && c <= cff;
      h.set(fila, c, null, celdaTimeline(c, enBarra ? C.navyBar : C.faseFondo, {}, enBarra));
    }
    fila++;

    // --- tareas
    for (const t of tareas) {
      const esHito = t.tipo === 'hito';
      const enCritica = critica && t.critica;
      const colorBarra = enCritica ? C.rojo : t.id === '0' ? mezclar(color, 0.6) : color;
      const tBase = filaBase();
      h.altura(fila, 17);
      h.nivelFila(fila, 1);
      h.set(fila, 1, t.id, st.id({ ...tBase, sz: 9, color: C.gris400, h: 'center' }));
      h.set(fila, 2, (esHito ? '◆ ' : '') + t.nombre, st.id({ ...tBase, b: esHito, color: esHito ? C.navy : C.gris700, indent: 2, h: 'left' }));
      h.set(fila, 3, t.rol, st.id({ ...tBase, sz: 9, color: C.gris500, indent: 1, h: 'left' }));
      h.set(fila, 4, esHito ? null : t.horas, st.id({ ...tBase, h: 'right' }));
      h.set(fila, 5, esHito ? null : t.personas, st.id({ ...tBase, h: 'center' }));
      h.set(fila, 6, esHito ? null : serial(parse(t.inicio)), st.id({ ...tBase, sz: 9, color: C.gris500, fecha: true, h: 'center' }));
      h.set(fila, 7, serial(parse(t.fin)), st.id({ ...tBase, sz: 9, color: C.gris500, fecha: true, h: 'center' }));
      h.set(fila, 8, esHito ? null : t.duracion_dias, st.id({ ...tBase, h: 'center', r: lineaGris, b: enCritica, color: enCritica ? C.rojo : C.gris700 }));

      const ci = colDe(t.inicio), cf = colDe(t.fin);
      // holgura: dias habiles despues del fin
      let holguraHasta = cf;
      if (!esHito && t.holgura_dias > 0 && t.id !== '0') {
        let d = parse(t.fin), n = 0;
        while (n < t.holgura_dias) { d = sumar(d, 1); if (!esFinde(d)) n++; }
        holguraHasta = colDe(iso(d));
      }
      const etiqueta = cf - ci + 1 >= 5 && t.id !== '0' ? `${t.duracion_dias}d · ${t.personas}p` : '';

      for (let c = col0; c <= ultimaCol; c++) {
        if (esHito) {
          if (c === cf) h.set(fila, c, '◆', celdaTimeline(c, null, { b: true, sz: 11, color: enCritica ? C.rojo : C.navy, h: 'center' }));
          else h.set(fila, c, null, celdaTimeline(c, null));
        } else if (c >= ci && c <= cf) {
          h.set(fila, c, c === ci ? etiqueta : null,
            celdaTimeline(c, colorBarra, c === ci ? { b: true, sz: 7, color: C.blanco, h: 'left' } : {}, true));
        } else if (c > cf && c <= holguraHasta) {
          h.set(fila, c, null, celdaTimeline(c, mezclar(color, 0.85), {}, true));
        } else {
          h.set(fila, c, null, celdaTimeline(c, null));
        }
      }
      fila++;
    }
  }

  // Leyenda
  fila += 1;
  h.set(fila, 2, 'Leyenda', st.id({ b: true, color: C.navy, sz: 10 }));
  fila++;
  const etiquetaLeyenda = st.id({ sz: 9, color: C.gris500, indent: 1 });
  const chip = (relleno: string | null, texto: string, simbolo = '', colorSimbolo = C.navy) => {
    h.set(fila, 1, simbolo || null, st.id({
      fill: relleno ?? undefined, h: 'center', b: true, color: colorSimbolo,
      l: lineaGris, r: lineaGris, t: lineaGris, bt: lineaGris,
    }));
    h.set(fila, 2, texto, etiquetaLeyenda);
    h.altura(fila, 15);
    fila++;
  };
  for (const f of fases) chip(COLOR_FASE[f] ?? C.gris400, NOMBRE_FASE[f] ?? f);
  chip(C.navyBar, 'Duración total de la fase');
  if (critica) chip(C.rojo, 'Ruta crítica (tareas sin holgura)');
  chip(null, 'Hito', '◆');
  chip(mezclar(COLOR_FASE['Desarrollo'], 0.85), 'Holgura (días hábiles que la tarea puede retrasarse)');
  chip(C.finde, 'Fin de semana');
  if (colHoy !== null) chip('FEE2E2', 'Hoy (línea roja vertical)');
  h.set(fila, 2, 'Usa los botones + / − a la izquierda para contraer o expandir cada fase.', st.id({ i: true, sz: 8, color: C.gris400, indent: 1 }));

  h.congelar = { col: col0, fila: FILA_DATOS };

  // ===== Hoja 2: Datos (tabla plana para filtrar)
  const d2 = new Hoja();
  const enc = ['ID', 'Fase', 'Tarea', 'Tipo', 'Rol', 'Horas', 'Personas', 'Inicio', 'Fin',
    'Días hábiles', 'Dependencias', 'Holgura (días)', 'Ruta crítica'];
  d2.anchos = [7, 13, 46, 8, 18, 8, 9, 11, 11, 11, 16, 13, 11];
  const cabD = st.id({ b: true, sz: 10, color: C.blanco, fill: C.navy, h: 'center', l: { estilo: 'thin', color: '1A3A5C' } });
  enc.forEach((e, i) => d2.set(1, i + 1, e, cabD));
  d2.altura(1, 20);
  gantt.tareas.forEach((t, i) => {
    const r = i + 2;
    const zebra = i % 2 ? C.gris50 : undefined;
    const b: Estilo = { fill: zebra, bt: { estilo: 'hair', color: C.gris200 } };
    const s = st.id(b), sc = st.id({ ...b, h: 'center' }), sf = st.id({ ...b, fecha: true, h: 'center' });
    const sCrit = st.id({ ...b, h: 'center', b: t.critica, color: t.critica ? C.rojo : C.gris700 });
    const vals: [Valor, number][] = [
      [t.id, sc], [NOMBRE_FASE[t.fase] ?? t.fase, s], [t.nombre, s], [t.tipo === 'hito' ? 'Hito' : 'Tarea', sc], [t.rol, s],
      [t.horas, s], [t.personas, sc], [serial(parse(t.inicio)), sf], [serial(parse(t.fin)), sf],
      [t.duracion_dias, sc], [t.dependencias.join(', '), s], [t.holgura_dias, sc], [t.critica ? 'Sí' : 'No', sCrit],
    ];
    vals.forEach(([v, sty], c) => d2.set(r, c + 1, v, sty));
  });
  d2.congelar = { col: 1, fila: 2 };
  d2.horizontal = true;
  d2.autoFiltro = `A1:${ref(gantt.tareas.length + 1, enc.length)}`;

  // ===== Empaquetado
  const hojas = ['Cronograma', 'Datos'];
  const archivos: [string, string][] = [
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${hojas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('\n')}
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<bookViews><workbookView activeTab="0"/></bookViews>
<sheets>${hojas.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets>
<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="1" hidden="1">Datos!$A$1:$${letra(enc.length)}$${gantt.tareas.length + 1}</definedName></definedNames>
</workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${hojas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('\n')}
<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`],
    ['xl/worksheets/sheet1.xml', h.xml()],
    ['xl/worksheets/sheet2.xml', d2.xml()],
    ['xl/styles.xml', st.xml()],
  ];
  return zip(archivos);
}

/** Genera el archivo y lo descarga en el navegador. */
export function descargarExcelGantt(gantt: GanttOutput, op: OpcionesExcelGantt = {}) {
  const datos = generarExcelGantt(gantt, op);
  const blob = new Blob([datos.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = (op.proyecto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  a.download = `cronograma-gantt${slug ? '-' + slug : ''}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------------------------------------------------------------- Utilidades

function letra(col: number) {
  let s = '';
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}
function ref(fila: number, col: number) { return `${letra(col)}${fila}`; }

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

function parse(isoStr: string) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function diff(a: Date, b: Date) { return Math.round((b.getTime() - a.getTime()) / 86400000); }
function sumar(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function fmtCorto(d: Date) { return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`; }
function fmtLargo(d: Date) { return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`; }
/** Numero de serie de fecha de Excel (dias desde 30/12/1899). */
function serial(d: Date) { return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000); }

/** Mezcla un color hex con blanco (t = 0 → color, t = 1 → blanco). */
function mezclar(hex: string, t: number) {
  const n = parseInt(hex, 16);
  const canal = (v: number) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0');
  return (canal((n >> 16) & 255) + canal((n >> 8) & 255) + canal(n & 255)).toUpperCase();
}

// --- ZIP sin compresion (STORE) -------------------------------------------------

const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(b: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLA_CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(archivos: [string, string][]): Uint8Array {
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const ahora = new Date();
  const hora = (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | (ahora.getSeconds() >> 1);
  const fecha = ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate();

  for (const [nombre, contenido] of archivos) {
    const n = enc.encode(nombre);
    const datos = enc.encode(contenido);
    const crc = crc32(datos);

    const local = new Uint8Array(30 + n.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);          // nombres en UTF-8
    lv.setUint16(8, 0, true);               // STORE
    lv.setUint16(10, hora, true);
    lv.setUint16(12, fecha, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, datos.length, true);
    lv.setUint32(22, datos.length, true);
    lv.setUint16(26, n.length, true);
    lv.setUint16(28, 0, true);
    local.set(n, 30);

    const cen = new Uint8Array(46 + n.length);
    const cv = new DataView(cen.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, hora, true);
    cv.setUint16(14, fecha, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, datos.length, true);
    cv.setUint32(24, datos.length, true);
    cv.setUint16(28, n.length, true);
    cv.setUint32(42, offset, true);
    cen.set(n, 46);

    partes.push(local, datos);
    central.push(cen);
    offset += local.length + datos.length;
  }

  const tamCentral = central.reduce((s, c) => s + c.length, 0);
  const fin = new Uint8Array(22);
  const fv = new DataView(fin.buffer);
  fv.setUint32(0, 0x06054b50, true);
  fv.setUint16(8, archivos.length, true);
  fv.setUint16(10, archivos.length, true);
  fv.setUint32(12, tamCentral, true);
  fv.setUint32(16, offset, true);

  const total = new Uint8Array(offset + tamCentral + 22);
  let p = 0;
  for (const x of [...partes, ...central, fin]) { total.set(x, p); p += x.length; }
  return total;
}
