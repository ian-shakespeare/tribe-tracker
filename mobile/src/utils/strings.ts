const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function toTitleCase(s: string): string {
  return s
    .split(" ")
    .map((word) =>
      word.length < 2
        ? word.toUpperCase()
        : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export function formatDate(date: Date): string {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}
