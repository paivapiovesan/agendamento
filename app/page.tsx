import { BookingForm } from "@/components/BookingForm"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">Agendar Horário com a Paiva Piovesan</span>
          </div>
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Área admin
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Agendar Horário com a Paiva Piovesan</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Escolha a data e horário disponível abaixo.
            </p>
          </div>
          <BookingForm />
        </div>
      </main>
    </div>
  )
}
