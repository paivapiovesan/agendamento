"use client"

import { useState, useEffect } from "react"
import { Save, Check } from "lucide-react"

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

type DayConfig = {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotMinutes: number
  active: boolean
}

const defaultConfig = (): DayConfig[] =>
  DAYS.map((_, i) => ({
    dayOfWeek: i,
    startTime: "09:00",
    endTime: "18:00",
    slotMinutes: 30,
    active: i >= 1 && i <= 5,
  }))

export function AvailabilityConfig() {
  const [configs, setConfigs] = useState<DayConfig[]>(defaultConfig())
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data: DayConfig[]) => {
        setConfigs((prev) =>
          prev.map((cfg) => {
            const found = data.find((d) => d.dayOfWeek === cfg.dayOfWeek)
            return found ? { ...cfg, ...found } : cfg
          })
        )
      })
  }, [])

  const update = (index: number, field: keyof DayConfig, value: unknown) => {
    setConfigs((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )
  }

  const save = async (index: number) => {
    setSaving(index)
    const cfg = configs[index]
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    })
    setSaving(null)
    setSaved(index)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="space-y-3">
      {configs.map((cfg, i) => (
        <div
          key={i}
          className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border transition ${
            cfg.active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-60"
          }`}
        >
          <label className="flex items-center gap-2 w-28 cursor-pointer">
            <input
              type="checkbox"
              checked={cfg.active}
              onChange={(e) => update(i, "active", e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="font-medium text-sm text-gray-700">{DAYS[i]}</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={cfg.startTime}
              disabled={!cfg.active}
              onChange={(e) => update(i, "startTime", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            />
            <span className="text-gray-400 text-sm">até</span>
            <input
              type="time"
              value={cfg.endTime}
              disabled={!cfg.active}
              onChange={(e) => update(i, "endTime", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Duração:</span>
            <select
              value={cfg.slotMinutes}
              disabled={!cfg.active}
              onChange={(e) => update(i, "slotMinutes", Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h30</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          <button
            onClick={() => save(i)}
            disabled={saving === i}
            className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {saved === i ? (
              <><Check className="w-4 h-4" /> Salvo</>
            ) : (
              <><Save className="w-4 h-4" /> Salvar</>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
