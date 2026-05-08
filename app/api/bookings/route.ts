import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar"
import { parseISO } from "date-fns"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { status: "confirmed" },
    orderBy: { startTime: "asc" },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { guestName, guestEmail, startTime, endTime, notes } = body

  if (!guestName || !guestEmail || !startTime || !endTime) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
  }

  const start = parseISO(startTime)
  const end = parseISO(endTime)

  const conflict = await prisma.booking.findFirst({
    where: {
      status: "confirmed",
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  })

  if (conflict) {
    return NextResponse.json({ error: "Horário indisponível" }, { status: 409 })
  }

  const adminAccount = await prisma.account.findFirst({
    where: { provider: "google" },
    include: { user: true },
  })

  let googleEventId: string | undefined

  if (adminAccount) {
    try {
      googleEventId = (await createCalendarEvent(adminAccount.userId, {
        summary: `Agendamento: ${guestName}`,
        description: notes,
        startTime: start,
        endTime: end,
        guestEmail,
        guestName,
      })) ?? undefined
    } catch (err) {
      console.error("Erro ao criar evento no Google Calendar:", err)
    }
  }

  const booking = await prisma.booking.create({
    data: { guestName, guestEmail, startTime: start, endTime: end, notes, googleEventId },
  })

  return NextResponse.json(booking, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await req.json()
  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })

  if (booking.googleEventId) {
    const adminAccount = await prisma.account.findFirst({ where: { provider: "google" } })
    if (adminAccount) {
      try {
        await deleteCalendarEvent(adminAccount.userId, booking.googleEventId)
      } catch {}
    }
  }

  await prisma.booking.update({ where: { id }, data: { status: "cancelled" } })
  return NextResponse.json({ ok: true })
}
