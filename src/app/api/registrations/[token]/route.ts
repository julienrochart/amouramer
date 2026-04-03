import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendUpdateEmail } from "@/lib/email";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const registration = await prisma.registration.findUnique({
    where: { token },
    include: { event: true },
  });

  if (registration) {
    return NextResponse.json({ type: "registration", ...registration });
  }

  const waitlist = await prisma.waitlistEntry.findUnique({
    where: { token },
    include: { event: true },
  });

  if (waitlist) {
    return NextResponse.json({ type: "waitlist", ...waitlist });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const { name, email, guests, optInReminders, optInProducts } = body;

  const registration = await prisma.registration.findUnique({
    where: { token },
    include: { event: { include: { registrations: { select: { id: true, guests: true } } } } },
  });

  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check capacity if guests increased
  if (guests > registration.guests) {
    const otherGuests = registration.event.registrations
      .filter((r) => r.id !== registration.id)
      .reduce((sum, r) => sum + r.guests, 0);
    const spotsLeft = registration.event.maxGuests - otherGuests;

    if (guests > spotsLeft) {
      return NextResponse.json(
        { error: `Only ${spotsLeft} spots available` },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.registration.update({
    where: { token },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(guests && { guests }),
      ...(optInReminders !== undefined && { optInReminders }),
      ...(optInProducts !== undefined && { optInProducts }),
    },
  });

  await sendUpdateEmail({
    to: updated.email,
    name: updated.name,
    event: registration.event,
    guests: updated.guests,
    token,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const registration = await prisma.registration.findUnique({
    where: { token },
  });

  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.registration.delete({ where: { token } });

  // Promote first waitlist entry if available
  const nextInLine = await prisma.waitlistEntry.findFirst({
    where: { eventId: registration.eventId },
    orderBy: { createdAt: "asc" },
  });

  if (nextInLine) {
    await prisma.registration.create({
      data: {
        name: nextInLine.name,
        email: nextInLine.email,
        guests: nextInLine.guests,
        eventId: nextInLine.eventId,
      },
    });
    await prisma.waitlistEntry.delete({ where: { id: nextInLine.id } });
    // TODO: send promotion email to nextInLine
  }

  return NextResponse.json({ status: "cancelled" });
}
