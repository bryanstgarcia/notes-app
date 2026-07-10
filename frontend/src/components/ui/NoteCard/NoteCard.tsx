import React from "react";
import { CategoryColor } from "../ColorDropdown";
import { getRelativeNoteDateLabel } from "./formatNoteDate";
import {
  NOTE_CARD_BACKGROUND_CLASSES,
  NOTE_CARD_BORDER_CLASSES,
} from "./noteCardColors";

export interface NoteCardProps {
  category?: string;
  title: string;
  description: string;
  updatedAt: Date | string;
  color: CategoryColor;
  className?: string;
}

const TITLE_LINE_CLAMP = "line-clamp-2";
const DESCRIPTION_LINE_CLAMP = "line-clamp-4";

export const NoteCard = React.forwardRef<HTMLElement, NoteCardProps>(
  (
    { category, title, description, updatedAt, color, className },
    ref
  ) => {
    const dateLabel = getRelativeNoteDateLabel(updatedAt);
    const backgroundClass = NOTE_CARD_BACKGROUND_CLASSES[color];
    const borderClass = NOTE_CARD_BORDER_CLASSES[color];

    const baseClasses = `flex flex-col rounded-2xl border-3 p-6 h-64 min-w-52 w-full ${backgroundClass} ${borderClass}`;
    const computedClassName = `${baseClasses}${className ? ` ${className}` : ""}`;

    return (
      <article ref={ref} className={computedClassName}>
        <div className="flex items-center gap-2 mb-3">
          {dateLabel && (
            <span className="font-bold text-black">
              {dateLabel}
            </span>
          )}
          {category && (
            <span
              className="text-black/70 truncate"
              title={category}
            >
              {category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-title font-bold text-2xl text-black break-words mb-2 ${TITLE_LINE_CLAMP}`}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className={`font-sans text-sm text-black/80 break-words ${DESCRIPTION_LINE_CLAMP}`}>
            {description}
          </p>
        )}
      </article>
    );
  }
);

NoteCard.displayName = "NoteCard";
