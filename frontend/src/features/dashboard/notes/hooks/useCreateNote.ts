"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotesService } from "@/lib/api/services/NotesService";
import { ApiError } from "@/lib/api/core/ApiError";
import { useAuth } from "@/features/auth/store/AuthContext";
import { AUTH_ROUTES } from "@/features/auth/constants";
import {
  CREATE_NOTE_GENERIC_ERROR,
  NOTE_ROUTES,
} from "./../../constants";

interface UseCreateNoteReturn {
  isCreating: boolean;
  error?: string;
  handleCreate: () => void;
}

export function useCreateNote(): UseCreateNoteReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const router = useRouter();
  const { logout } = useAuth();

  const handleCreate = async () => {
    if (isCreating) return;

    setError(undefined);
    setIsCreating(true);

    try {
      const note = await NotesService.notesCreate();
      setIsCreating(false);
      router.push(NOTE_ROUTES.detail(note.id));
    } catch (err) {
      setIsCreating(false);

      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace(AUTH_ROUTES.LOGIN);
        return;
      }

      setError(CREATE_NOTE_GENERIC_ERROR);
    }
  };

  return {
    isCreating,
    error,
    handleCreate,
  };
}
