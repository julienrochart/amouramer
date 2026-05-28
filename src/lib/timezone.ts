export const TIMEZONE = "Europe/Amsterdam";

export function parseAsAmsterdam(dateTimeLocal: string): Date {
  const normalized = dateTimeLocal.length === 16 ? dateTimeLocal + ":00" : dateTimeLocal;
  const asUTC = new Date(normalized + "Z").getTime();

  const amsLocal = new Date(asUTC).toLocaleString("sv-SE", { timeZone: TIMEZONE });
  const amsAsUTC = new Date(amsLocal.replace(" ", "T") + "Z").getTime();
  const offset = amsAsUTC - asUTC;

  return new Date(asUTC - offset);
}
