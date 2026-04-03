import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find events happening in ~24 hours (window: 23h30 to 24h30)
  const dayBefore = {
    from: new Date(now.getTime() + 23.5 * 60 * 60 * 1000),
    to: new Date(now.getTime() + 24.5 * 60 * 60 * 1000),
  };

  // Find events happening in ~3 hours (window: 2h30 to 3h30)
  const hoursBefore = {
    from: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
    to: new Date(now.getTime() + 3.5 * 60 * 60 * 1000),
  };

  let sent = 0;

  // Day-before reminders
  const dayEvents = await prisma.event.findMany({
    where: { date: { gte: dayBefore.from, lte: dayBefore.to } },
    include: { registrations: true },
  });

  for (const event of dayEvents) {
    for (const reg of event.registrations) {
      await sendReminderEmail({
        to: reg.email,
        name: reg.name,
        event,
        token: reg.token,
        type: "day-before",
      });
      sent++;
    }
  }

  // Hours-before reminders
  const hourEvents = await prisma.event.findMany({
    where: { date: { gte: hoursBefore.from, lte: hoursBefore.to } },
    include: { registrations: true },
  });

  for (const event of hourEvents) {
    for (const reg of event.registrations) {
      await sendReminderEmail({
        to: reg.email,
        name: reg.name,
        event,
        token: reg.token,
        type: "hours-before",
      });
      sent++;
    }
  }

  return NextResponse.json({ sent, checked: new Date().toISOString() });
}
