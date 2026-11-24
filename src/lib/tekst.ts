import type { Forhandler } from './data';
import { antal } from './data';

/** Kort opsummering til titler, fx "3 forhandlere, 2 med værksted". */
export function opsummering(liste: Forhandler[]): string {
  const dele = [antal(liste.length, 'forhandler', 'forhandlere')];
  const v = liste.filter((d) => d.vaerksted).length;
  if (v && v < liste.length) dele.push(`${v} med værksted`);
  else if (v) dele.push(liste.length === 1 ? 'med værksted' : 'alle med værksted');
  return dele.join(', ');
}

/** Byer i en liste, fx "Herning, Randers NV og Viborg". */
export function byer(liste: Forhandler[]): string {
  const b = [...new Set(liste.map((d) => d.by))];
  if (b.length <= 1) return b.join('');
  return `${b.slice(0, -1).join(', ')} og ${b[b.length - 1]}`;
}
