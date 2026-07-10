"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NoteCard } from "@/components/ui/NoteCard/NoteCard";
import type { Note } from "@/lib/api/models/Note";
import { CategorySidebar } from "./sidebar/components/CategorySidebar";
import { NewNoteButton } from "./notes/components/NewNoteButton";
import { EmptyNotesState } from "./notes/components/EmptyNotesState";
import { useCreateNote } from "./notes/hooks/useCreateNote";
import { useNotes } from "./notes/hooks/useNotes";
import {
  ALL_CATEGORIES_LABEL,
  NEW_NOTE_BUTTON_LOADING_LABEL,
  NO_NOTES_IN_CATEGORY_MESSAGE,
  NOTE_ROUTES,
} from "./constants";
import { PLACEHOLDER_CATEGORIES } from "@/utils/constants";

const GRID_COLUMNS_CLASSES = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
const GRID_GAP_CLASSES = "gap-6";

function getCategoryColor(
  categoryId: string | undefined
): "orange" | "yellow" | "blue" | "green" {
  const category = PLACEHOLDER_CATEGORIES.find((cat) => cat.id === categoryId);
  return category?.color || "orange";
}

function computeCategoryCounts(notes: Note[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of PLACEHOLDER_CATEGORIES) {
    counts[category.id] = notes.filter(
      (note) => note.category === category.id
    ).length;
  }
  return counts;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="w-full bg-red-100 border border-red-300 rounded-lg p-4 text-red-600 text-sm"
    >
      {message}
    </div>
  );
}

export function NotesDashboardView() {
  const router = useRouter();
  const { notes, isLoading, error: fetchError } = useNotes();
  const { isCreating, error: createError, handleCreate } = useCreateNote();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryCounts = computeCategoryCounts(notes);
  const filteredNotes = activeCategory
    ? notes.filter((note) => note.category === activeCategory)
    : notes;

  const handleNoteClick = (noteId: number) => {
    router.push(NOTE_ROUTES.detail(noteId));
  };

  const isGridView = !isLoading && notes.length > 0 && filteredNotes.length > 0;

  let content: ReactNode;
  if (isLoading) {
    content = <p className="text-brown">Loading notes...</p>;
  } else if (notes.length === 0) {
    content = <EmptyNotesState />;
  } else if (filteredNotes.length === 0) {
    // At this point, notes.length > 0 is guaranteed, so filteredNotes.length === 0
    // can only happen when activeCategory is non-null (filtering a non-empty list
    // by a category with zero matches).
    content = (
      <div className="text-center">
        <p className="text-brown text-lg">{NO_NOTES_IN_CATEGORY_MESSAGE}</p>
      </div>
    );
  } else {
    content = (
      <div className={`overflow-y-auto ${GRID_COLUMNS_CLASSES} ${GRID_GAP_CLASSES}`}>
        {filteredNotes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => handleNoteClick(note.id)}
            className="text-left cursor-pointer"
          >
            <NoteCard
              title={note.title || "Note title"}
              description={note.content || "Note content..."}
              updatedAt={note.updated_at}
              color={getCategoryColor(note.category)}
              category={
                PLACEHOLDER_CATEGORIES.find(
                  (cat) => cat.id === note.category
                )?.label
              }
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-background h-dvh`}
    >
      <main
        className={`flex flex-col w-full max-w-8xl gap-8 p-10 h-full`}
      >
        <div
          className={`bg-cream flex justify-between flex-reverse items-start gap-8 h-full`}
        >
          <div>
            <CategorySidebar
              heading={ALL_CATEGORIES_LABEL}
              categories={PLACEHOLDER_CATEGORIES}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              categoryCounts={categoryCounts}
            />
          </div>
          <div className={`w-full h-full`}>
            <div className={`flex flex-col gap-6 h-full`}>
              <div className="flex justify-between items-end flex-row-reverse">
                <NewNoteButton
                  onClick={handleCreate}
                  disabled={isCreating}
                  label={isCreating ? NEW_NOTE_BUTTON_LOADING_LABEL : undefined}
                />
              </div>
              {fetchError && <ErrorBanner message={fetchError} />}
              {createError && <ErrorBanner message={createError} />}
              {isGridView ? (
                content
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  {content}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
