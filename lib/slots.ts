import { addMinutes, parseISO, startOfDay, endOfDay, addDays, format } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"
import { prisma } from "./prisma"

const TZ = "America/Sao_Paulo"

function timeToZonedDate(dateStr: string, timeStr: string): Date {
  const [hour, minute] = timeStr.split(":").map(Number)
  const base = toZonedTime(parseISO(dateStr), TZ)
  base.setHours(hour, minute, 0, 0)
  return fromZonedTime(base, TZ)
}

export async function getAvailableSlots(dateStr: string) {
  const dateUtc = parseISO(dateStr)
  const zoned = toZonedTime(dateUtc, TZ)
  const dayOfWeek = zoned.getDay()

  const availability = await prisma.availability.findFirst({
    where: { dayOfWeek, active: true },
  })

  if (!availability) return []

  const rangeStart = timeToZonedDate(dateStr, availability.startTime)
  const rangeEnd = timeToZonedDate(dateStr, availability.endTime)

  const lunchStart = availability.lunchStart
    ? timeToZonedDate(dateStr, availability.lunchStart)
    : null
  const lunchEnd = availability.lunchEnd
    ? timeToZonedDate(dateStr, availability.lunchEnd)
    : null

  const dayStart = fromZonedTime(toZonedTime(parseISO(dateStr + "T00:00:00"), TZ), TZ)
  const dayEnd = fromZonedTime(toZonedTime(parseISO(dateStr + "T23:59:59"), TZ), TZ)

  const existingBookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
    },
  })

  const slots: { start: Date; end: Date }[] = []
  let current = new Date(rangeStart)
  const now = new Date()

  while (addMinutes(current, availability.slotMinutes) <= rangeEnd) {
    const slotEnd = addMinutes(current, availability.slotMinutes)

    const inLunch =
      lunchStart && lunchEnd && current < lunchEnd && slotEnd > lunchStart

    const occupied = existingBookings.some(
      (b) => current < b.endTime && slotEnd > b.startTime
    )

    if (!inLunch && !occupied && current > now) {
      slots.push({ start: new Date(current), end: slotEnd })
    }

    current = addMinutes(current, availability.slotMinutes)
  }

  return slots
}
