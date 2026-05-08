"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Mail, User, X } from "lucide-react"

type Booking = {
  id: string
  guestName: string
  guestEmail: string
  startTime: string
  endTime: string
  notes?: string
  status: string
  createdAt: string
}

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/bookings")
    if (res.ok) setBookings(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const cancel = async (id: string) => {
    if (!confirm("Cancelar este agendamento?")) return
    setCancelling(id)
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setCancelling(null)
    load()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Carregando...</div>

  const upcoming = bookings.filter((b) => new Date(b.startTime) >= new Date())
  const past = bookings.filter((b) => new Date(b.startTime) < new Date())

  return (
    <div className="space-y-6">
      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum agendamento ainda.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Próximos ({upcoming.length})
          </h3>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={cancel} cancelling={cancelling} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Anteriores ({past.length})
          </h3>
          <div className="space-y-3 opacity-60">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={cancel} cancelling={cancelling} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BookingCard({
  booking,
  onCancel,
  cancelling,
  isPast,
}: {
  booking: Booking
  onCancel: (id: string) => void
  cancelling: string | null
  isPast?: boolean
}) {
  const start = new Date(booking.startTime)
  const end = new Date(booking.endTime)

  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex-shrink-0 text-center w-12">
        <div className="text-xs font-semibold text-blue-600 uppercase">
          {format(start, "MMM", { locale: ptBR })}
        </div>
        <div className="text-2xl font-bold text-gray-800 leading-none">
          {format(start, "dd")}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{booking.guestName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{booking.guestEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {format(start, "HH:mm")} – {format(end, "HH:mm")}
          </span>
        </div>
        {booking.notes && (
          <p className="text-sm text-gray-400 mt-1 truncate">{booking.notes}</p>
        )}
      </div>

      {!isPast && (
        <button
          onClick={() => onCancel(booking.id)}
          disabled={cancelling === booking.id}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
