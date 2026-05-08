import { google } from "googleapis"
import { prisma } from "./prisma"

async function getOAuthClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })

  if (!account?.access_token) throw new Error("Conta Google não vinculada")

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  })

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : undefined,
        },
      })
    }
  })

  return oauth2Client
}

export async function getBusySlots(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<{ start: Date; end: Date }[]> {
  const auth = await getOAuthClient(userId)
  const calendar = google.calendar({ version: "v3", auth })

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    },
  })

  const busy = res.data.calendars?.primary?.busy ?? []
  return busy.map((slot) => ({
    start: new Date(slot.start!),
    end: new Date(slot.end!),
  }))
}

export async function createCalendarEvent(
  userId: string,
  params: {
    summary: string
    description?: string
    startTime: Date
    endTime: Date
    guestEmail: string
    guestName: string
  }
) {
  const auth = await getOAuthClient(userId)
  const calendar = google.calendar({ version: "v3", auth })

  const event = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startTime.toISOString() },
      end: { dateTime: params.endTime.toISOString() },
      attendees: [{ email: params.guestEmail, displayName: params.guestName }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    },
  })

  return event.data.id
}

export async function deleteCalendarEvent(userId: string, eventId: string) {
  const auth = await getOAuthClient(userId)
  const calendar = google.calendar({ version: "v3", auth })
  await calendar.events.delete({ calendarId: "primary", eventId })
}
