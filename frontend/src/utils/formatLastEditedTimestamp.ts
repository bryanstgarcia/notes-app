import { LAST_EDITED_LABEL_PREFIX } from "../features/notes/constants";

const LOCALE = "en-US";
const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

export function formatLastEditedTimestamp(
  dateInput: Date | string | null | undefined
): string {
  if (!dateInput) {
    return "";
  }

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat(LOCALE, FORMAT_OPTIONS);
  return LAST_EDITED_LABEL_PREFIX + formatter.format(date);
}
