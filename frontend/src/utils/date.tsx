export const formatPL = (d: string | number | Date) =>
  new Date(d).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
