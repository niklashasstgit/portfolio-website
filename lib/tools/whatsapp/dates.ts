/**
 * WhatsApp Web renders timestamps in the browser's locale, so an archive can
 * meet any of:
 *
 *   12/05/2024   05/12/2024   2024-05-12   12.05.2024   12/5/24
 *   "Today"  "Yesterday"  "Monday"  "Heute"  "Gestern"  "Montag"
 *   "May 12, 2024"   "12. Mai 2024"       21:34   9:34 PM
 *
 * Nothing here guesses per message: `detectOrder` inspects the whole chat
 * first, so one archive can never mix day-first and month-first readings.
 */

export interface YMD {
  y: number;
  m: number;
  d: number;
}
export interface HM {
  h: number;
  min: number;
}
export interface Stamp {
  local: string;
  date: string;
  time: string;
  ms: number;
  hasTime: boolean;
}
export type DateOrder = "DMY" | "MDY" | "YMD";

const MONTHS: Record<string, number> = {};
(
  [
    ["jan", 1, "januar", "january", "janvier", "enero", "gennaio", "janeiro"],
    ["feb", 2, "februar", "february", "fevrier", "febrero", "febbraio", "fevereiro"],
    ["mar", 3, "marz", "march", "mars", "marzo", "marco"],
    ["apr", 4, "april", "avril", "abril", "aprile"],
    ["mai", 5, "may", "mayo", "maggio", "maio"],
    ["jun", 6, "juni", "june", "juin", "junio", "giugno", "junho"],
    ["jul", 7, "juli", "july", "juillet", "julio", "luglio", "julho"],
    ["aug", 8, "august", "aout", "agosto"],
    ["sep", 9, "september", "septembre", "septiembre", "settembre", "setembro"],
    ["okt", 10, "oktober", "october", "octobre", "octubre", "ottobre", "outubro"],
    ["nov", 11, "november", "novembre", "noviembre", "novembro"],
    ["dez", 12, "dezember", "december", "decembre", "diciembre", "dicembre", "dezembro"],
  ] as [string, number, ...string[]][]
).forEach((row) => {
  const num = row[1];
  MONTHS[row[0]] = num;
  for (let i = 2; i < row.length; i++) {
    const word = row[i] as string;
    MONTHS[word] = num;
    MONTHS[word.slice(0, 3)] = num;
  }
});

const WEEKDAYS: Record<string, number> = {};
(
  [
    [0, "sunday", "sonntag", "domingo", "dimanche", "domenica"],
    [1, "monday", "montag", "lunes", "lundi", "lunedi"],
    [2, "tuesday", "dienstag", "martes", "mardi", "martedi"],
    [3, "wednesday", "mittwoch", "miercoles", "mercredi", "mercoledi"],
    [4, "thursday", "donnerstag", "jueves", "jeudi", "giovedi"],
    [5, "friday", "freitag", "viernes", "vendredi", "venerdi"],
    [6, "saturday", "samstag", "sabado", "samedi", "sabato"],
  ] as [number, ...string[]][]
).forEach((row) => {
  const day = row[0];
  for (let i = 1; i < row.length; i++) {
    const word = row[i] as string;
    WEEKDAYS[word] = day;
    WEEKDAYS[word.slice(0, 3)] = day;
  }
});

const TODAY_RX = /^(today|heute|hoy|aujourd|oggi|hoje)/i;
const YESTERDAY_RX = /^(yesterday|gestern|ayer|hier|ieri|ontem)/i;

/** Strip accents so "miércoles" matches "miercoles". */
export function fold(s: string): string {
  return String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function numericParts(str: string): [number, number, number] | null {
  const m = fold(str).match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

/** Decide day-first vs month-first once, for a whole chat. */
export function detectOrder(dateStrings: string[], fallback: DateOrder = "DMY"): DateOrder {
  let dmy = 0;
  let mdy = 0;
  for (const s of dateStrings) {
    const p = numericParts(s);
    if (!p) continue;
    if (String(p[0]).length === 4) return "YMD";
    if (p[0] > 12) dmy++;
    else if (p[1] > 12) mdy++;
  }
  if (dmy > mdy) return "DMY";
  if (mdy > dmy) return "MDY";
  return fallback;
}

function normalizeYear(y: number): number {
  if (y >= 1000) return y;
  return y < 70 ? 2000 + y : 1900 + y;
}

function ymd(date: Date): YMD {
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
}

/** `ref` is when the sweep ran, used to resolve "Today"/"Monday". */
export function parseDate(input: string, order: DateOrder = "DMY", ref: Date = new Date()): YMD | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  const s = fold(raw);

  if (TODAY_RX.test(s)) return ymd(ref);
  if (YESTERDAY_RX.test(s)) {
    const d = new Date(ref.getTime());
    d.setDate(d.getDate() - 1);
    return ymd(d);
  }

  const parts = numericParts(raw);
  if (parts) {
    let y: number, m: number, d: number;
    if (order === "YMD" || String(parts[0]).length === 4) {
      [y, m, d] = parts;
    } else if (order === "MDY") {
      [m, d, y] = parts;
    } else {
      [d, m, y] = parts;
    }
    y = normalizeYear(y);
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return { y, m, d };
  }

  // textual month: "12. Mai 2024", "May 12, 2024", "12 May"
  const words = s.replace(/[,.]/g, " ").split(/\s+/).filter(Boolean);
  let month: number | null = null;
  let day: number | null = null;
  let year: number | null = null;
  for (const w of words) {
    if (MONTHS[w] != null && month == null) {
      month = MONTHS[w];
      continue;
    }
    if (/^\d{4}$/.test(w) && year == null) {
      year = parseInt(w, 10);
      continue;
    }
    if (/^\d{1,2}$/.test(w) && day == null) {
      day = parseInt(w, 10);
      continue;
    }
  }
  if (month != null && day != null) {
    return { y: year != null ? normalizeYear(year) : ref.getFullYear(), m: month, d: day };
  }

  // bare weekday label → the most recent past occurrence
  const wd = WEEKDAYS[words[0]];
  if (wd != null) {
    const d = new Date(ref.getTime());
    let back = (d.getDay() - wd + 7) % 7;
    if (back === 0) back = 7;
    d.setDate(d.getDate() - back);
    return ymd(d);
  }

  return null;
}

export function parseTime(input: string): HM | null {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  const ampm = raw.match(/^(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?\s*([APap])\.?\s?[Mm]\.?$/);
  if (ampm) {
    let h = parseInt(ampm[1], 10) % 12;
    if (/[Pp]/.test(ampm[3])) h += 12;
    const min = parseInt(ampm[2], 10);
    return min > 59 ? null : { h, min };
  }

  const plain = raw.match(/^(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?$/);
  if (!plain) return null;
  const h = parseInt(plain[1], 10);
  const min = parseInt(plain[2], 10);
  if (h > 23 || min > 59) return null;
  return { h, min };
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** Local wall-clock timestamp. WhatsApp shows local time — no UTC shifting. */
export function combine(date: YMD | null, time: HM | null): Stamp | null {
  if (!date) return null;
  const h = time ? time.h : 0;
  const min = time ? time.min : 0;
  const js = new Date(date.y, date.m - 1, date.d, h, min, 0, 0);
  if (Number.isNaN(js.getTime())) return null;
  return {
    local: `${pad(date.y, 4)}-${pad(date.m)}-${pad(date.d)}T${pad(h)}:${pad(min)}:00`,
    date: `${pad(date.y, 4)}-${pad(date.m)}-${pad(date.d)}`,
    time: `${pad(h)}:${pad(min)}`,
    ms: js.getTime(),
    hasTime: !!time,
  };
}

export function formatDateHuman(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

/** Version ids sort chronologically as plain strings: 2026-08-20_1403 */
export function versionId(at: Date = new Date()): string {
  return (
    `${pad(at.getFullYear(), 4)}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}` +
    `_${pad(at.getHours())}${pad(at.getMinutes())}${pad(at.getSeconds())}`
  );
}
