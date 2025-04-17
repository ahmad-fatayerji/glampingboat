'use client'

import { useState, useEffect } from 'react'
import { useSession }          from 'next-auth/react'

export default function ReserverPage() {
  // will redirect to /auth/signin if not logged‑in
  const { data: session } = useSession({ required: true })

  const [date, setDate]         = useState('')
  const [timeSlot, setTimeSlot] = useState('09:00')
  const [reservations, setReservations] = useState<any[]>([])
  const slots = ['09:00','11:00','13:00','15:00','17:00']

  // load existing reservations
  useEffect(() => {
    fetch('/api/reservations')
      .then(r => r.json())
      .then(setReservations)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, timeSlot })
    })
    if (res.ok) {
      const newRes = await res.json()
      setReservations([ ...reservations, newRes ])
    } else {
      alert(await res.text())
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Réserver un créneau</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label>Heure</label>
          <select
            value={timeSlot}
            onChange={e => setTimeSlot(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {slots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Réserver
        </button>
      </form>

      <hr className="my-8" />

      <h2 className="text-xl font-semibold mb-4">Vos réservations</h2>
      <ul className="space-y-2">
        {reservations.map(r => (
          <li key={r.id} className="border p-3 rounded">
            {new Date(r.date).toLocaleDateString('fr-FR')} à {r.timeSlot}
          </li>
        ))}
      </ul>
    </div>
  )
}
