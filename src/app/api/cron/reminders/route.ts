import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let sent = 0;

  // Events happening TODAY
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const todayEvents = await prisma.event.findMany({
    where: { date: { gte: now, lte: endOfDay } },
    include: { registrations: { where: { optInReminders: true } } },
  });

  for (const event of todayEvents) {
    for (const reg of event.registrations) {
      await sendReminderEmail({
        to: reg.email,
        name: reg.name,
        event,
        token: reg.token,
        type: "today",
      });
      sent++;
    }
  }

  // Events happening in 2 DAYS
  const twoDaysFrom = new Date(now);
  twoDaysFrom.setDate(twoDaysFrom.getDate() + 2);
  twoDaysFrom.setHours(0, 0, 0, 0);

  const twoDaysTo = new Date(twoDaysFrom);
  twoDaysTo.setHours(23, 59, 59, 999);

  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: twoDaysFrom, lte: twoDaysTo } },
    include: { registrations: { where: { optInReminders: true } } },
  });

  for (const event of upcomingEvents) {
    for (const reg of event.registrations) {
      await sendReminderEmail({
        to: reg.email,
        name: reg.name,
        event,
        token: reg.token,
        type: "two-days-before",
      });
      sent++;
    }
  }

  // ANONYMIZE data for events that ended more than 3 days ago
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const eventsToAnonymize = await prisma.event.findMany({
    where: {
      date: { lt: threeDaysAgo },
      anonymizedAt: null,
    },
    include: {
      registrations: true,
      waitlist: true,
    },
  });

  let anonymized = 0;
  for (const event of eventsToAnonymize) {
    for (const reg of event.registrations) {
      await prisma.registration.update({
        where: { id: reg.id },
        data: {
          name: "Anonymous",
          email: `anon-${reg.id}@removed.local`,
        },
      });
    }
    for (const entry of event.waitlist) {
      await prisma.waitlistEntry.update({
        where: { id: entry.id },
        data: {
          name: "Anonymous",
          email: `anon-${entry.id}@removed.local`,
        },
      });
    }
    await prisma.event.update({
      where: { id: event.id },
      data: { anonymizedAt: new Date() },
    });
    anonymized++;
  }

  return NextResponse.json({ sent, anonymized, checked: new Date().toISOString() });
}
