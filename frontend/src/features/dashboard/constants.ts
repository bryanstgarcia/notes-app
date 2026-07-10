export const NOTES_EMPTY_STATE_MESSAGE = "I'm just here waiting for your charming notes…";
export const NEW_NOTE_BUTTON_LABEL = "New Note";
export const NEW_NOTE_BUTTON_LOADING_LABEL = "Adding...";
export const CREATE_NOTE_GENERIC_ERROR =
  "Something went wrong. Please try again.";
export const NOTES_FETCH_ERROR =
  "Failed to load notes. Please refresh the page.";
export const NO_NOTES_IN_CATEGORY_MESSAGE =
  "No notes in this category yet.";

export const ALL_CATEGORIES_LABEL = "All Categories";

export const NOTE_ROUTES = {
    detail: (id: number): string => `/note/${id}`,
  } as const;