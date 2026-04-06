import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail, sendWaitlistEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, guests, eventId, optInReminders = true, optInProducts = true } = body;

  if (!name || !email || !guests || !eventId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { registrations: { select: { guests: true } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const totalGuests = event.registrations.reduce((sum, r) => sum + r.guests, 0);
  const spotsLeft = event.maxGuests - totalGuests;

  if (spotsLeft >= guests) {
    const registration = await prisma.registration.create({
      data: { name, email, guests, eventId, optInReminders, optInProducts },
    });

    await sendConfirmationEmail({ to: email, name, event, guests, token: registration.token });

    return NextResponse.json({ status: "registered", token: registration.token });
  }

  // Add to waitlist
  const entry = await prisma.waitlistEntry.create({
    data: { name, email, guests, eventId, optInReminders, optInProducts },
  });

  await sendWaitlistEmail({ to: email, name, event, token: entry.token });

  return NextResponse.json({ status: "waitlisted", token: entry.token });
}
