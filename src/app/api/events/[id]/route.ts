import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: { select: { guests: true } },
      products: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const totalGuests = event.registrations.reduce((sum, r) => sum + r.guests, 0);

  return NextResponse.json({
    ...event,
    totalGuests,
    spotsLeft: event.maxGuests - totalGuests,
    registrations: undefined,
  });
}
