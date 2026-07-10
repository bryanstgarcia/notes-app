export const TODAY_LABEL = "today";
export const YESTERDAY_LABEL = "yesterday";
export const NOTE_DATE_LOCALE = "en-US";
export const NOTE_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};
export const INVALID_DATE_FALLBACK = "";

export function getRelativeNoteDateLabel(input: Date | string, now?: Date): string {
  // Normalize input to a Date
  const date = typeof input === "string" ? new Date(input) : input;

  // Check for invalid date
  if (isNaN(date.getTime())) {
    return INVALID_DATE_FALLBACK;
  }

  // Use provided `now` or default to current time
  const currentDate = now ?? new Date();

  // Calculate local calendar dates (year, month, day) ignoring time-of-day
  const dateYearMonthDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const nowYearMonthDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  // Calculate the whole-day difference in milliseconds
  const diffMs = nowYearMonthDay.getTime() - dateYearMonthDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Check for today (0 days difference)
  if (diffDays === 0) {
    return TODAY_LABEL;
  }

  // Check for yesterday (1 day difference)
  if (diffDays === 1) {
    return YESTERDAY_LABEL;
  }

  // Format via Intl.DateTimeFormat for all other cases
  const formatter = new Intl.DateTimeFormat(NOTE_DATE_LOCALE, NOTE_DATE_FORMAT_OPTIONS);
  return formatter.format(date);
}
