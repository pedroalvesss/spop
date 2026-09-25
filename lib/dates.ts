// Datas no app são strings ISO "YYYY-MM-DD" no fuso de São Paulo.
// No banco (@db.Date) elas viram meia-noite UTC; toISO/fromISO fazem a ponte.

export const TIMEZONE = "America/Sao_Paulo";
export const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
export const MONTHS_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const WEEKDAYS_LONG = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const DAY_MS = 86_400_000;

export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function fromISO(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addMonths(month: string, n: number) {
  const { y, m } = parts(`${month}-01`);
  const date = new Date(Date.UTC(y, m - 1 + n, 1));
  return toISO(date).slice(0, 7);
}

// Intervalo [start, end) de um mês, pronto pra consulta no banco.
export function monthRange(month: string) {
  return { start: fromISO(`${month}-01`), end: fromISO(`${addMonths(month, 1)}-01`) };
}

// Dia do mês limitado ao tamanho do mês (dia 31 em fevereiro vira 28/29).
export function dateInMonth(month: string, day: number) {
  const { y, m } = parts(`${month}-01`);
  return `${month}-${String(Math.min(day, daysInMonth(y, m))).padStart(2, "0")}`;
}

export function diffDays(from: string, to: string) {
  return Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / DAY_MS);
}

export function shortDate(iso: string, pad = false) {
  const { m, d } = parts(iso);
  return `${pad ? String(d).padStart(2, "0") : d} ${MONTHS_SHORT[m - 1]}`;
}

export function longDate(iso: string) {
  const { m, d } = parts(iso);
  return `${WEEKDAYS_LONG[fromISO(iso).getUTCDay()]}, ${d} de ${MONTHS_LONG[m - 1]}`;
}

export function dayLabel(iso: string, today: string) {
  const diff = diffDays(iso, today);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return `${WEEKDAYS_SHORT[fromISO(iso).getUTCDay()]}, ${shortDate(iso)}`;
}

export function monthName(month: string) {
  return MONTHS_LONG[Number(month.slice(5, 7)) - 1];
}

// "dez/2026", usado em "acaba ..." e "livre de tudo em ...".
export function monthShortYear(month: string) {
  return `${MONTHS_SHORT[Number(month.slice(5, 7)) - 1]}/${month.slice(0, 4)}`;
}

export function daysUntilDay(today: string, day: number) {
  const thisMonth = dateInMonth(monthKey(today), day);
  if (thisMonth >= today) return diffDays(today, thisMonth);
  return diffDays(today, dateInMonth(addMonths(monthKey(today), 1), day));
}

export function salaryLine(days: number) {
  if (days === 0) return "Salário cai hoje";
  if (days === 1) return "Falta 1 dia pro salário";
  return `Faltam ${days} dias pro salário`;
}

// Dias que faltam pro mês acabar (mínimo 1, pra conta "por dia" não dividir por zero).
export function daysLeftInMonth(today: string) {
  const { y, m, d } = parts(today);
  return Math.max(1, daysInMonth(y, m) - d);
}
