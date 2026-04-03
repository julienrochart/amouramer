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
  return new Date(date).toLocaleDateString("fr-FR", {
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
    subject: `Inscription confirmée - ${event.title}`,
    html: `
      <h2>Bonjour ${name} !</h2>
      <p>Votre inscription est confirmée pour :</p>
      <p><strong>${event.title}</strong><br/>
      ${formatDate(event.date)}<br/>
      ${event.location}</p>
      <p>Nombre de personnes : <strong>${guests}</strong></p>
      <p><a href="${editUrl}">Modifier mon inscription</a></p>
      <p>À bientôt !<br/>Amour Amer</p>
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
    subject: `Liste d'attente - ${event.title}`,
    html: `
      <h2>Bonjour ${name} !</h2>
      <p>L'événement <strong>${event.title}</strong> est complet.</p>
      <p>Vous êtes sur la liste d'attente. Nous vous contacterons si une place se libère.</p>
      <p>À bientôt !<br/>Amour Amer</p>
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
  type: "day-before" | "hours-before";
}) {
  const editUrl = `${appUrl}/registration/${token}`;
  const subject =
    type === "day-before"
      ? `Rappel : ${event.title} demain !`
      : `C'est ce soir ! ${event.title}`;

  const intro =
    type === "day-before"
      ? "C'est demain ! On a hâte de vous voir."
      : "C'est ce soir ! On vous attend.";

  await getResend().emails.send({
    from,
    to,
    subject,
    html: `
      <h2>Bonjour ${name} !</h2>
      <p>${intro}</p>
      <p><strong>${event.title}</strong><br/>
      ${formatDate(event.date)}<br/>
      ${event.location}</p>
      <p><a href="${editUrl}">Modifier mon inscription</a></p>
      <p>À très vite !<br/>Amour Amer</p>
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
    subject: `Vos dégustations - ${event.title}`,
    html: `
      <h2>Bonjour ${name} !</h2>
      <p>Merci d'avoir participé à <strong>${event.title}</strong> !</p>
      <p>Voici les produits que vous avez dégustés :</p>
      <ul>${productList}</ul>
      <p>Retrouvez-les en boutique chez Amour Amer !</p>
      <p>À bientôt !<br/>Amour Amer</p>
    `,
  });
}
