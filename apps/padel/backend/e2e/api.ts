import { randomUUID } from 'node:crypto';
import { inject } from 'vitest';

type Options = { body?: unknown; user?: string };

export async function api(method: string, path: string, { body, user }: Options = {}) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (user !== undefined) headers['x-user-id'] = user;

  const res = await fetch(inject('apiUrl') + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

// Cada test crea sus propios datos y usa su propio usuario: los tests no se
// pisan aunque compartan BD y corran en paralelo.
export const someUser = () => `user-${randomUUID()}@padel.local`;

// Los correos que ha recibido `to` en el Mailpit de los tests.
export async function mailsTo(to: string) {
  const res = await fetch(`${inject('mailpitUrl')}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`);
  const { messages } = (await res.json()) as { messages: { Subject: string; Snippet: string }[] };
  return messages;
}

export async function givenClub(name = 'Club Norte') {
  return (await api('POST', '/clubs', { body: { name } })).body;
}

export async function givenCourt({ opens = '09:00', closes = '22:30' } = {}) {
  const club = await givenClub();
  return (await api('POST', `/clubs/${club.id}/courts`, { body: { name: 'Pista 1', opens, closes } })).body;
}

export async function givenBooking(courtId: number, user: string, date: string, start: string) {
  return (await api('POST', '/bookings', { user, body: { courtId, date, start } })).body;
}

// Fechas en hora LOCAL, igual que las interpreta el backend.
export function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// Una franja que empieza dentro de menos de 24 h, en una pista abierta 00:00-23:59.
export function slotWithinNext24h() {
  const t = new Date(Date.now() + 2 * 60 * 60 * 1000);
  // La franja tiene que acabar antes de las 23:59: si no cabe hoy, la primera de manana.
  if (t.getHours() * 60 + t.getMinutes() > 22 * 60) {
    t.setDate(t.getDate() + 1);
    t.setHours(0, 30);
  }
  return { date: formatDate(t), start: `${pad(t.getHours())}:${pad(t.getMinutes())}` };
}

const pad = (n: number) => String(n).padStart(2, '0');
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
