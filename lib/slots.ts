import { addMinutes, isWithinInterval, parseISO, format, startOfDay, endOfDay, addDays } from "date-fns"
import { prisma } from "./prisma"

export async function getAvailableSlots(dateStr: string) {
  const date = parseISO(dateStr)
  const dayOfWeek = date.getDay()

  const availability = await prisma.availability.findFirst({
    where: { dayOfWeek, active: true },
  })

  if (!availability) return []

  const [startHour, startMin] = availability.startTime.split(":").map(Number)
  const [endHour, endMin] = availability.endTime.split(":").map(Number)

  const rangeStart = new Date(date)
  rangeStart.setHours(startHour, startMin, 0, 0)

  const rangeEnd = new Date(date)
  rangeEnd.setHours(endHour, endMin, 0, 0)

  const existingBookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      startTime: { gte: startOfDay(date) },
      endTime: { lte: endOfDay(date) },
    },
  })

  const slots: { start: Date; end: Date }[] = []
  let current = new Date(rangeStart)

  while (addMinutes(current, availability.slotMinutes) <= rangeEnd) {
    const slotEnd = addMinutes(current, availability.slotMinutes)
    const occupied = existingBookings.some(
      (b) =>
        current < b.endTime && slotEnd > b.startTime
    )

    if (!occupied && current > new Date()) {
      slots.push({ start: new Date(current), end: slotEnd })
    }

    current = addMinutes(current, availability.slotMinutes)
  }

  return slots
}

export function getNextAvailableDays(count: number): string[] {
  const days: string[] = []
  let d = addDays(new Date(), 1)
  while (days.length < count) {
    days.push(format(d, "yyyy-MM-dd"))
    d = addDays(d, 1)
  }
  return days
}
