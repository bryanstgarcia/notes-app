"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NotesService } from "@/lib/api/services/NotesService";
import { ApiError } from "@/lib/api/core/ApiError";
import type { Note } from "@/lib/api/models/Note";
import { useAuth } from "@/features/auth/store/AuthContext";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { NOTES_FETCH_ERROR } from "../../constants";

interface UseNotesReturn {
  notes: Note[];
  isLoading: boolean;
  error?: string;
  refetch: () => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const router = useRouter();
  const { logout } = useAuth();

  const fetchNotes = async () => {
    setError(undefined);
    setIsLoading(true);

    try {
      const fetchedNotes = await NotesService.notesList();
      setNotes(fetchedNotes);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);

      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace(AUTH_ROUTES.LOGIN);
        return;
      }

      setError(NOTES_FETCH_ERROR);
    }
  };

  // Fetch notes on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, []);

  return {
    notes,
    isLoading,
    error,
    refetch: fetchNotes,
  };
}
