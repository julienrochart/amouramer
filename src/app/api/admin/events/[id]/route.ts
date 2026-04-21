import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";
import { sendCancellationEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "asc" } },
      waitlist: { orderBy: { createdAt: "asc" } },
      products: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, description, date, location, maxGuests } = body;

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(date && { date: new Date(date) }),
      ...(location && { location }),
      ...(maxGuests && { maxGuests }),
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let notify = false;
  try {
    const body = await request.json();
    notify = body?.notify === true;
  } catch {
    // no body, notify stays false
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: { registrations: true, waitlist: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let notified = 0;
  if (notify) {
    const eventInfo = { title: event.title, date: event.date, location: event.location };
    const recipients = [
      ...event.registrations.map((r) => ({ to: r.email, name: r.name })),
      ...event.waitlist.map((w) => ({ to: w.email, name: w.name })),
    ];
    const results = await Promise.allSettled(
      recipients.map((r) => sendCancellationEmail({ to: r.to, name: r.name, event: eventInfo }))
    );
    notified = results.filter((r) => r.status === "fulfilled").length;
  }

  try {
    await prisma.event.delete({ where: { id } });
  } catch (err) {
    console.error("Event delete failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Delete failed: ${message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "deleted", notified });
}
