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

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;

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

export function ellipsify(s: string, length: number): string {
  if (s.length < length) {
    return s;
  }

  return s.slice(0, length - 3) + "...";
}

export function formatTimeDelta(from: Date, until: Date = new Date()): string {
  const fromTimestamp = Math.floor(from.getTime() / 1000);
  const untilTimestamp = Math.floor(until.getTime() / 1000);

  const delta = untilTimestamp - fromTimestamp;

  const weekDelta = Math.floor(delta / SECONDS_IN_WEEK);
  if (weekDelta >= 1) {
    return `${weekDelta} week(s) ago`;
  }

  const dayDelta = Math.floor(delta / SECONDS_IN_DAY);
  if (dayDelta >= 1) {
    return `${dayDelta} day(s) ago`;
  }

  const hourDelta = Math.floor(delta / SECONDS_IN_HOUR);
  if (hourDelta >= 1) {
    return `${hourDelta} hour(s) ago`;
  }

  const minuteDelta = Math.floor(delta / SECONDS_IN_MINUTE);
  if (minuteDelta >= 1) {
    return `${minuteDelta} minute(s) ago`;
  }

  return `${delta} seconds ago`;
}
