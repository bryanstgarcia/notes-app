import Image from "next/image";
import bobaIllustration from "@/assets/bobba.png";
import { NOTES_EMPTY_STATE_MESSAGE } from "./../../constants";

export interface EmptyNotesStateProps {
  message?: string;
}

export function EmptyNotesState({
  message = NOTES_EMPTY_STATE_MESSAGE,
}: EmptyNotesStateProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <Image
        src={bobaIllustration}
        alt="Illustration of a boba tea cup"
        className="w-78 h-auto"
        priority
      />
      <p className="text-center text-brown text-2xl font-inter">
        {message}
      </p>
    </div>
  );
}
