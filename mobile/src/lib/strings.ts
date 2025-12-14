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
