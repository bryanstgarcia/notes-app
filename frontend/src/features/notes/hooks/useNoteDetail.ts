"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NotesService } from "@/lib/api/services/NotesService";
import { ApiError } from "@/lib/api/core/ApiError";
import type { Note } from "@/lib/api/models/Note";
import { useAuth } from "@/features/auth/store/AuthContext";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { CategoryEnum } from "@/lib/api/models/CategoryEnum";
import type { PatchedNote } from "@/lib/api/models/PatchedNote";
import {
  AUTOSAVE_DEBOUNCE_MS,
  NOTE_LOAD_ERROR_MESSAGE,
  NOTE_SAVE_ERROR_MESSAGE,
} from "../constants";
import { formatLastEditedTimestamp } from "../../../utils/formatLastEditedTimestamp";

interface UseNoteDetailReturn {
  note: Note | null;
  isLoading: boolean;
  isNotFound: boolean;
  loadError?: string;
  title: string;
  content: string;
  categoryId: string;
  handleTitleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleTitleBlur: () => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleContentBlur: () => void;
  handleCategoryChange: (categoryId: string) => void;
  lastEditedLabel: string;
  isSaving: boolean;
  saveError?: string;
  flushPendingSave: () => Promise<void>;
}

export function useNoteDetail(noteId: number): UseNoteDetailReturn {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>(CategoryEnum.RANDOM_THOUGHTS);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const router = useRouter();
  const { logout } = useAuth();

  // Track last-saved values to know which fields changed
  const lastSavedRef = useRef<{
    title: string;
    content: string;
    categoryId: string;
  }>({
    title: "",
    content: "",
    categoryId: CategoryEnum.RANDOM_THOUGHTS,
  });

  // Monotonically increasing id for category-change requests, so a slower
  // earlier response can't clobber a faster later selection's state.
  const categoryRequestIdRef = useRef(0);

  // Debounced content save timer
  const contentSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch note on mount
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await NotesService.notesRetrieve(noteId);
        setNote(fetchedNote);
        setTitle(fetchedNote.title ?? "");
        setContent(fetchedNote.content ?? "");
        const categoryValue = (fetchedNote.category ?? CategoryEnum.RANDOM_THOUGHTS) as string;
        setCategoryId(categoryValue);
        lastSavedRef.current = {
          title: fetchedNote.title ?? "",
          content: fetchedNote.content ?? "",
          categoryId: categoryValue,
        };
        setIsLoading(false);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace(AUTH_ROUTES.LOGIN);
          return;
        }

        setLoadError(NOTE_LOAD_ERROR_MESSAGE);
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, logout, router]);

  // Save a set of fields to the backend. `isStale`, when provided, is
  // re-checked after the request resolves so an out-of-order response
  // (e.g. from rapid category switching) can't overwrite newer local state.
  const saveFields = async (
    fieldsToSave: Partial<{
      title: string;
      content: string;
      categoryId: string;
    }>,
    isStale?: () => boolean
  ) => {
    if (Object.keys(fieldsToSave).length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveError(undefined);

    try {
      const patchBody: PatchedNote = {};
      if (fieldsToSave.title !== undefined) {
        patchBody.title = fieldsToSave.title;
      }
      if (fieldsToSave.content !== undefined) {
        patchBody.content = fieldsToSave.content;
      }
      if (fieldsToSave.categoryId !== undefined) {
        patchBody.category = fieldsToSave.categoryId as CategoryEnum;
      }

      const updatedNote = await NotesService.notesPartialUpdate(noteId, patchBody);

      if (isStale?.()) {
        // A newer request for this same field has already been issued;
        // discard this response instead of reverting local state.
        setIsSaving(false);
        return;
      }

      setNote(updatedNote);
      lastSavedRef.current = {
        title: updatedNote.title ?? "",
        content: updatedNote.content ?? "",
        categoryId: (updatedNote.category ?? CategoryEnum.RANDOM_THOUGHTS) as string,
      };
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);

      if (isStale?.()) {
        return;
      }

      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace(AUTH_ROUTES.LOGIN);
        return;
      }

      if (err instanceof ApiError && err.status === 404) {
        setIsNotFound(true);
        return;
      }

      setSaveError(NOTE_SAVE_ERROR_MESSAGE);
    }
  };

  // Flush any pending debounced save (called on close button click)
  const flushPendingSave = async () => {
    if (contentSaveTimerRef.current) {
      clearTimeout(contentSaveTimerRef.current);
      contentSaveTimerRef.current = null;

      // Save if content changed
      if (content !== lastSavedRef.current.content) {
        await saveFields({ content });
      }
    }
  };

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (contentSaveTimerRef.current) {
        clearTimeout(contentSaveTimerRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (title !== lastSavedRef.current.title) {
      saveFields({ title });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);

    // Clear existing debounce timer
    if (contentSaveTimerRef.current) {
      clearTimeout(contentSaveTimerRef.current);
    }

    // Set new debounce timer for autosave. Compare against the value just
    // typed (not the stale `content` closure) so a single keystroke since
    // the last save still schedules an autosave.
    contentSaveTimerRef.current = setTimeout(() => {
      if (newValue !== lastSavedRef.current.content) {
        saveFields({ content: newValue });
      }
      contentSaveTimerRef.current = null;
    }, AUTOSAVE_DEBOUNCE_MS);
  };

  const handleContentBlur = () => {
    // Clear the debounce timer if it exists
    if (contentSaveTimerRef.current) {
      clearTimeout(contentSaveTimerRef.current);
      contentSaveTimerRef.current = null;
    }

    // Save immediately on blur
    if (content !== lastSavedRef.current.content) {
      saveFields({ content });
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);

    // Save immediately on change, guarding against a slower earlier
    // category request's response overwriting this newer selection.
    const requestId = ++categoryRequestIdRef.current;
    saveFields(
      { categoryId: newCategoryId },
      () => requestId !== categoryRequestIdRef.current
    );
  };

  const lastEditedLabel = formatLastEditedTimestamp(note?.updated_at);

  return {
    note,
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
  };
}
