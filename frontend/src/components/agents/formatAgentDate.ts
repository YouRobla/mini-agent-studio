const shortDateFormatter = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Fecha corta en español, por ejemplo «12 nov 2026». */
export function formatAgentDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(isoDate));
}
