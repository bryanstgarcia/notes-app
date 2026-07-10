"use client";

import { useRouter } from "next/navigation";
import { ColorDropdown } from "@/components/ui/ColorDropdown";
import { CloseButton } from "@/components/ui/CloseButton";
import { TextLink } from "@/components/ui/TextLink";
import {
  NOTE_CARD_BACKGROUND_CLASSES,
  NOTE_CARD_BORDER_CLASSES,
} from "@/components/ui/NoteCard/noteCardColors";
import { EditableField } from "./components/EditableField";
import { useNoteDetail } from "./hooks/useNoteDetail";
import {
  NOTE_TITLE_PLACEHOLDER,
  NOTE_CONTENT_PLACEHOLDER,
  NOTE_NOT_FOUND_MESSAGE,
} from "./constants";
import { PLACEHOLDER_CATEGORIES } from "@/utils/constants";
import { AUTH_ROUTES } from "@/features/auth/constants";

interface NoteDetailViewProps {
  noteId: number;
}

export function NoteDetailView({ noteId }: NoteDetailViewProps) {
  const router = useRouter();
  const {
    isLoading,
    isNotFound,
    loadError,
    title,
    content,
    categoryId,
    handleTitleChange,
    handleTitleBlur,
    handleContentChange,
    handleContentBlur,
    handleCategoryChange,
    lastEditedLabel,
    isSaving,
    saveError,
    flushPendingSave,
  } = useNoteDetail(noteId);

  const handleClose = async () => {
    await flushPendingSave();
    router.push(AUTH_ROUTES.DASHBOARD);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-background">
        <p className="text-brown">Loading note...</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-background gap-4">
        <p className="text-brown text-center max-w-md">{NOTE_NOT_FOUND_MESSAGE}</p>
        <TextLink href={AUTH_ROUTES.DASHBOARD} className="font-bold">
          Back to Dashboard
        </TextLink>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-background gap-4">
        <p className="text-brown text-center">{loadError}</p>
        <TextLink href={AUTH_ROUTES.DASHBOARD} className="font-bold">
          Back to Dashboard
        </TextLink>
      </div>
    );
  }

  const backgroundColor = NOTE_CARD_BACKGROUND_CLASSES[
    PLACEHOLDER_CATEGORIES.find((cat) => cat.id === categoryId)?.color || "orange"
  ];
  const borderColor = NOTE_CARD_BORDER_CLASSES[
    PLACEHOLDER_CATEGORIES.find((cat) => cat.id === categoryId)?.color || "orange"
  ];

  return (
    <div className="flex flex-col bg-background min-h-dvh p-10">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="w-64">
          <ColorDropdown
            options={PLACEHOLDER_CATEGORIES}
            value={categoryId}
            onChange={handleCategoryChange}
            disabled={isSaving}
          />
        </div>
        <CloseButton onClick={handleClose} aria-label="Close note editor" size="lg"/>
      </div>

      <div
        className={`flex flex-col flex-1 rounded-3xl border-3 p-8 px-12 ${backgroundColor} ${borderColor}`}
      >
        {lastEditedLabel && (
          <div className="text-right text-sm text-black mb-4">
            {lastEditedLabel}
          </div>
        )}

        <EditableField
          variant="title"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder={NOTE_TITLE_PLACEHOLDER}
          className="mb-2"
        />

        <EditableField
          variant="content"
          value={content}
          onChange={handleContentChange}
          onBlur={handleContentBlur}
          placeholder={NOTE_CONTENT_PLACEHOLDER}
          className="flex-1"
        />
      </div>

      {saveError && (
        <div
          role="alert"
          className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4 text-red-600 text-sm"
        >
          {saveError}
        </div>
      )}
    </div>
  );
}
