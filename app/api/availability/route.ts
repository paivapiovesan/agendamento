import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const availabilities = await prisma.availability.findMany({
    orderBy: { dayOfWeek: "asc" },
  })
  return NextResponse.json(availabilities)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { dayOfWeek, startTime, endTime, slotMinutes, active } = body

  const existing = await prisma.availability.findFirst({ where: { dayOfWeek } })

  let availability
  if (existing) {
    availability = await prisma.availability.update({
      where: { id: existing.id },
      data: { startTime, endTime, slotMinutes, active },
    })
  } else {
    availability = await prisma.availability.create({
      data: { dayOfWeek, startTime, endTime, slotMinutes, active },
    })
  }

  return NextResponse.json(availability)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await req.json()
  await prisma.availability.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
