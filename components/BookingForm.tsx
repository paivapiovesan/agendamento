"use client"

import { useState, useEffect } from "react"
import { format, parseISO, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle } from "lucide-react"

type Slot = { start: string; end: string }

export function BookingForm() {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [form, setForm] = useState({ guestName: "", guestEmail: "", notes: "" })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<"success" | "error" | "conflict" | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  const weekStart = addDays(today, weekOffset * 7 + 1)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => { setSlots(Array.isArray(data) ? data : []); setLoadingSlots(false) })
      .catch(() => setLoadingSlots(false))
  }, [selectedDate])

  const submit = async () => {
    if (!selectedSlot || !form.guestName || !form.guestEmail) return
    setSubmitting(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, startTime: selectedSlot.start, endTime: selectedSlot.end }),
    })
    setSubmitting(false)
    if (res.ok) {
      setResult("success")
    } else if (res.status === 409) {
      setResult("conflict")
    } else {
      setResult("error")
    }
  }

  if (result === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Agendamento confirmado!</h2>
        <p className="text-gray-500 mb-6">
          Um convite foi enviado para <strong>{form.guestEmail}</strong>
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
          <p><strong>{form.guestName}</strong></p>
          <p>
            {format(parseISO(selectedSlot!.start), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <p>
            {format(parseISO(selectedSlot!.start), "HH:mm")} –{" "}
            {format(parseISO(selectedSlot!.end), "HH:mm")}
          </p>
        </div>
        <button
          onClick={() => {
            setResult(null)
            setSelectedDate("")
            setSelectedSlot(null)
            setForm({ guestName: "", guestEmail: "", notes: "" })
          }}
          className="mt-6 text-blue-600 hover:underline text-sm"
        >
          Fazer outro agendamento
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Seleção de data */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-700 leading-none">Escolha uma data</h2>
            <p className="text-sm text-blue-600 font-medium mt-1 capitalize">
              {/* Mostra "Maio 2026" ou "Mai – Jun 2026" se a semana cruzar meses */}
              {(() => {
                const firstMonth = format(weekDays[0], "MMMM", { locale: ptBR })
                const lastMonth = format(weekDays[6], "MMMM", { locale: ptBR })
                const year = format(weekDays[6], "yyyy")
                if (firstMonth === lastMonth) {
                  return `${firstMonth} ${year}`
                }
                return `${format(weekDays[0], "MMM", { locale: ptBR })} – ${format(weekDays[6], "MMM", { locale: ptBR })} ${year}`
              })()}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
              disabled={weekOffset === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day) => {
            const str = format(day, "yyyy-MM-dd")
            const isSelected = selectedDate === str
            const dayName = format(day, "EEE", { locale: ptBR })
            const dayNum = format(day, "d")
            const isMonthBoundary =
              weekDays.indexOf(day) > 0 &&
              format(day, "M") !== format(weekDays[weekDays.indexOf(day) - 1], "M")
            return (
              <button
                key={str}
                onClick={() => setSelectedDate(str)}
                className={`relative flex flex-col items-center py-2.5 px-1 rounded-xl text-sm transition border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "hover:bg-blue-50 border-gray-100 text-gray-600"
                }`}
              >
                {isMonthBoundary && (
                  <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1 rounded ${isSelected ? "text-blue-200" : "text-blue-400"}`}>
                    {format(day, "MMM", { locale: ptBR })}
                  </span>
                )}
                <span className="text-xs font-medium capitalize opacity-70">{dayName}</span>
                <span className="text-base font-bold">{dayNum}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Horários disponíveis */}
      {selectedDate && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horários disponíveis
          </h2>
          {loadingSlots ? (
            <div className="text-center py-6 text-gray-400 text-sm">Carregando horários...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Nenhum horário disponível nesta data.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start
                return (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : "hover:border-blue-400 hover:text-blue-600 border-gray-200 text-gray-700"
                    }`}
                  >
                    {format(parseISO(slot.start), "HH:mm")}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Formulário de dados */}
      {selectedSlot && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700 font-medium">
            {format(parseISO(selectedSlot.start), "EEEE, d 'de' MMMM", { locale: ptBR })} •{" "}
            {format(parseISO(selectedSlot.start), "HH:mm")} –{" "}
            {format(parseISO(selectedSlot.end), "HH:mm")}
          </div>

          {result === "conflict" && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Horário já reservado. Escolha outro.
            </div>
          )}

          <div className="grid gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                placeholder="Seu nome completo"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input
                type="email"
                value={form.guestEmail}
                onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                placeholder="seu@email.com"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Alguma informação adicional..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={submitting || !form.guestName || !form.guestEmail}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Agendando..." : "Confirmar agendamento"}
          </button>
        </div>
      )}
    </div>
  )
}
