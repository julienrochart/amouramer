import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/auth";
import { sendPostEventEmail } from "@/lib/email";

export async function POST(
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
      registrations: true,
      products: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.products.length === 0) {
    return NextResponse.json({ error: "No products to send" }, { status: 400 });
  }

  let sent = 0;
  for (const reg of event.registrations) {
    await sendPostEventEmail({
      to: reg.email,
      name: reg.name,
      event,
      products: event.products,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
