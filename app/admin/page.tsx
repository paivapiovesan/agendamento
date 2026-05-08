import { auth } from "@/auth"
import { SignInButton, SignOutButton } from "@/components/SignInButton"
import { AvailabilityConfig } from "@/components/AvailabilityConfig"
import { BookingsList } from "@/components/BookingsList"
import { Calendar, Settings, ShieldX } from "lucide-react"
import Link from "next/link"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export default async function AdminPage() {
  const session = await auth()

  // Não logado
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Área Administrativa</h1>
          <p className="text-gray-500 text-sm mb-6">
            Entre com sua conta Google para gerenciar sua agenda.
          </p>
          <div className="flex justify-center">
            <SignInButton />
          </div>
          <Link href="/" className="block mt-4 text-xs text-gray-400 hover:text-gray-600">
            ← Voltar à página de agendamento
          </Link>
        </div>
      </div>
    )
  }

  // Logado mas e-mail não autorizado
  if (session.user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso negado</h1>
          <p className="text-gray-500 text-sm mb-2">
            A conta <strong>{session.user?.email}</strong> não tem permissão para acessar o painel admin.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Entre com o e-mail autorizado para continuar.
          </p>
          <div className="flex flex-col items-center gap-3">
            <SignOutButton label="Sair e trocar de conta" />
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              ← Voltar à página de agendamento
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Admin autorizado
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm leading-none">Painel Admin</p>
              <p className="text-xs text-gray-400 mt-0.5">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-blue-600 hover:underline">
              Ver página pública
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Configurar disponibilidade</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Defina os dias e horários em que você está disponível para atendimento.
          </p>
          <AvailabilityConfig />
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800">Agendamentos</h2>
          </div>
          <BookingsList />
        </section>
      </main>
    </div>
  )
}
