import { NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/slots"

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date")
  if (!date) return NextResponse.json({ error: "Data obrigatória" }, { status: 400 })

  try {
    const slots = await getAvailableSlots(date)
    return NextResponse.json(slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    })))
  } catch {
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 })
  }
}
