import { useEffect, useState } from 'react';

const API = 'http://localhost:3000';

export default function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || 'ana@padel.local');
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubId, setClubId] = useState<any>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [courtId, setCourtId] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [clubName, setClubName] = useState('');
  const [courtName, setCourtName] = useState('');
  const [opens, setOpens] = useState('09:00');
  const [closes, setCloses] = useState('22:30');
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('userId', userId);
    fetch(API + '/clubs')
      .then((r) => r.json())
      .then(setClubs);
    fetch(API + '/me/bookings', { headers: { 'x-user-id': userId } })
      .then((r) => r.json())
      .then(setMyBookings);
  }, [userId]);

  useEffect(() => {
    if (!clubId) return;
    fetch(API + '/clubs/' + clubId + '/courts')
      .then((r) => r.json())
      .then(setCourts);
  }, [clubId]);

  useEffect(() => {
    if (!courtId) return;
    fetch(API + '/courts/' + courtId + '/availability?date=' + date)
      .then((r) => r.json())
      .then(setSlots);
  }, [courtId, date]);

  async function createClub() {
    await fetch(API + '/clubs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: clubName }),
    });
    setClubName('');
    fetch(API + '/clubs')
      .then((r) => r.json())
      .then(setClubs);
  }

  async function createCourt() {
    await fetch(API + '/clubs/' + clubId + '/courts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: courtName, opens, closes }),
    });
    setCourtName('');
    fetch(API + '/clubs/' + clubId + '/courts')
      .then((r) => r.json())
      .then(setCourts);
  }

  async function book(start: string) {
    setError('');
    const res = await fetch(API + '/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ courtId, date, start }),
    });
    if (!res.ok) setError((await res.json()).message);
    fetch(API + '/courts/' + courtId + '/availability?date=' + date)
      .then((r) => r.json())
      .then(setSlots);
    fetch(API + '/me/bookings', { headers: { 'x-user-id': userId } })
      .then((r) => r.json())
      .then(setMyBookings);
  }

  async function cancel(id: number) {
    setError('');
    const res = await fetch(API + '/bookings/' + id, { method: 'DELETE', headers: { 'x-user-id': userId } });
    if (!res.ok) setError((await res.json()).message);
    fetch(API + '/me/bookings', { headers: { 'x-user-id': userId } })
      .then((r) => r.json())
      .then(setMyBookings);
    if (courtId)
      fetch(API + '/courts/' + courtId + '/availability?date=' + date)
        .then((r) => r.json())
        .then(setSlots);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h1>🎾 Pádel</h1>
      <p>
        Soy: <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 32 }}>
        <div>
          <h2>Clubs</h2>
          {clubs.map((c) => (
            <div key={c.id}>
              <button onClick={() => setClubId(c.id)} style={{ fontWeight: c.id === clubId ? 'bold' : 'normal' }}>
                {c.name}
              </button>
            </div>
          ))}
          <input placeholder="nombre del club" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          <button onClick={createClub}>Crear club</button>
        </div>

        {clubId && (
          <div>
            <h2>Pistas</h2>
            {courts.map((c) => (
              <div key={c.id}>
                <button onClick={() => setCourtId(c.id)} style={{ fontWeight: c.id === courtId ? 'bold' : 'normal' }}>
                  {c.name} ({c.opens}-{c.closes})
                </button>
              </div>
            ))}
            <input placeholder="nombre de la pista" value={courtName} onChange={(e) => setCourtName(e.target.value)} />
            <input value={opens} onChange={(e) => setOpens(e.target.value)} size={5} />
            <input value={closes} onChange={(e) => setCloses(e.target.value)} size={5} />
            <button onClick={createCourt}>Crear pista</button>
          </div>
        )}

        {courtId && (
          <div>
            <h2>Disponibilidad</h2>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            {slots.map((s) => (
              <div key={s.start}>
                {s.start}-{s.end}{' '}
                {s.free ? <button onClick={() => book(s.start)}>Reservar</button> : <span>ocupada</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <h2>Mis reservas</h2>
      {myBookings.map((b) => (
        <div key={b.id}>
          {b.club_name} · {b.court_name} · {b.date} {b.start}-{b.end}{' '}
          <button onClick={() => cancel(b.id)}>Cancelar</button>
        </div>
      ))}
    </div>
  );
}
