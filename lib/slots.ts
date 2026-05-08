import { addMinutes } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"
import { prisma } from "./prisma"

const TZ = "America/Sao_Paulo"

// Converte "2026-05-12" + "09:00" para UTC, tratando o horário como Sao Paulo
function toUTC(dateStr: string, timeStr: string): Date {
  return fromZonedTime(`${dateStr}T${timeStr}:00`, TZ)
}

export async function getAvailableSlots(dateStr: string) {
  // Extrai dia da semana diretamente da string, sem conversão de timezone
  const [year, month, day] = dateStr.split("-").map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()

  const availability = await prisma.availability.findFirst({
    where: { dayOfWeek, active: true },
  })

  if (!availability) return []

  const rangeStart = toUTC(dateStr, availability.startTime)
  const rangeEnd   = toUTC(dateStr, availability.endTime)
  const lunchStart = availability.lunchStart ? toUTC(dateStr, availability.lunchStart) : null
  const lunchEnd   = availability.lunchEnd   ? toUTC(dateStr, availability.lunchEnd)   : null

  // Intervalo do dia em Sao Paulo para buscar reservas existentes
  const dayStart = toUTC(dateStr, "00:00")
  const dayEnd   = toUTC(dateStr, "23:59")

  const existingBookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      startTime: { gte: dayStart },
      endTime:   { lte: dayEnd },
    },
  })

  const slots: { start: Date; end: Date }[] = []
  let current = new Date(rangeStart)
  const now = new Date()

  while (addMinutes(current, availability.slotMinutes) <= rangeEnd) {
    const slotEnd = addMinutes(current, availability.slotMinutes)

    const inLunch   = lunchStart && lunchEnd && current < lunchEnd && slotEnd > lunchStart
    const occupied  = existingBookings.some((b) => current < b.endTime && slotEnd > b.startTime)
    const isPast    = current <= now

    if (!inLunch && !occupied && !isPast) {
      slots.push({ start: new Date(current), end: slotEnd })
    }

    current = addMinutes(current, availability.slotMinutes)
  }

  return slots
}
