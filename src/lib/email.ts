import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}
const from = "Amour Amer <onboarding@resend.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface EventInfo {
  title: string;
  date: Date;
  location: string;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function sendConfirmationEmail({
  to,
  name,
  event,
  guests,
  token,
}: {
  to: string;
  name: string;
  event: EventInfo;
  guests: number;
  token: string;
}) {
  const editUrl = `${appUrl}/registration/${token}`;

  await getResend().emails.send({
    from,
    to,
    subject: `Registration confirmed - ${event.title}`,
    html: `
      <h2>Hi ${name}!</h2>
      <p>Your registration is confirmed for:</p>
      <p><strong>${event.title}</strong><br/>
      ${formatDate(event.date)}<br/>
      ${event.location}</p>
      <p>Number of guests: <strong>${guests}</strong></p>
      <p><a href="${editUrl}">Edit my registration</a></p>
      <p>See you soon!<br/>Amour Amer</p>
    `,
  });
}

export async function sendWaitlistEmail({
  to,
  name,
  event,
}: {
  to: string;
  name: string;
  event: EventInfo;
}) {
  await getResend().emails.send({
    from,
    to,
    subject: `Waitlist - ${event.title}`,
    html: `
      <h2>Hi ${name}!</h2>
      <p>The event <strong>${event.title}</strong> is full.</p>
      <p>You've been added to the waitlist. We'll notify you if a spot opens up.</p>
      <p>See you soon!<br/>Amour Amer</p>
    `,
  });
}

export async function sendUpdateEmail({
  to,
  name,
  event,
  guests,
  token,
}: {
  to: string;
  name: string;
  event: EventInfo;
  guests: number;
  token: string;
}) {
  const editUrl = `${appUrl}/registration/${token}`;

  await getResend().emails.send({
    from,
    to,
    subject: `Registration updated - ${event.title}`,
    html: `
      <h2>Hi ${name}!</h2>
      <p>Your registration has been updated:</p>
      <p><strong>${event.title}</strong><br/>
      ${formatDate(event.date)}<br/>
      ${event.location}</p>
      <p>Number of guests: <strong>${guests}</strong></p>
      <p><a href="${editUrl}">Edit my registration</a></p>
      <p>See you soon!<br/>Amour Amer</p>
    `,
  });
}

export async function sendReminderEmail({
  to,
  name,
  event,
  token,
  type,
}: {
  to: string;
  name: string;
  event: EventInfo;
  token: string;
  type: "today" | "two-days-before";
}) {
  const editUrl = `${appUrl}/registration/${token}`;
  const subject =
    type === "today"
      ? `It's today! ${event.title}`
      : `Reminder: ${event.title} in 2 days`;
  const intro =
    type === "today"
      ? "It's today! We can't wait to see you."
      : "Your tasting is coming up! See you in 2 days.";

  await getResend().emails.send({
    from,
    to,
    subject,
    html: `
      <h2>Hi ${name}!</h2>
      <p>${intro}</p>
      <p><strong>${event.title}</strong><br/>
      ${formatDate(event.date)}<br/>
      ${event.location}</p>
      <p><a href="${editUrl}">Edit my registration</a></p>
      <p>See you soon!<br/>Amour Amer</p>
    `,
  });
}

export async function sendPostEventEmail({
  to,
  name,
  event,
  products,
}: {
  to: string;
  name: string;
  event: EventInfo;
  products: { name: string; description?: string | null; price?: number | null }[];
}) {
  const productList = products
    .map(
      (p) =>
        `<li><strong>${p.name}</strong>${p.description ? ` — ${p.description}` : ""}${p.price ? ` (${p.price.toFixed(2)} €)` : ""}</li>`
    )
    .join("");

  await getResend().emails.send({
    from,
    to,
    subject: `Your tastings - ${event.title}`,
    html: `
      <h2>Hi ${name}!</h2>
      <p>Thank you for attending <strong>${event.title}</strong>!</p>
      <p>Here are the products you tasted:</p>
      <ul>${productList}</ul>
      <p>Find them at the Amour Amer shop!</p>
      <p>See you soon!<br/>Amour Amer</p>
    `,
  });
}
