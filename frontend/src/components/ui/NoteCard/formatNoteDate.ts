export const TODAY_LABEL = "today";
export const YESTERDAY_LABEL = "yesterday";
export const NOTE_DATE_LOCALE = "en-US";
export const NOTE_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};
export const INVALID_DATE_FALLBACK = "";

export function getRelativeNoteDateLabel(input: Date | string, now?: Date): string {
  const date = typeof input === "string" ? new Date(input) : input;

  if (isNaN(date.getTime())) {
    return INVALID_DATE_FALLBACK;
  }

  const currentDate = now ?? new Date();

  // Reconstruct dates from Y/M/D only, ignoring time-of-day, so the diff below is a whole-day count
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

  const diffMs = nowYearMonthDay.getTime() - dateYearMonthDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return TODAY_LABEL;
  }

  if (diffDays === 1) {
    return YESTERDAY_LABEL;
  }

  const formatter = new Intl.DateTimeFormat(NOTE_DATE_LOCALE, NOTE_DATE_FORMAT_OPTIONS);
  return formatter.format(date);
}
