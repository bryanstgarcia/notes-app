import { Button } from "@/components/ui/Button";
import { NEW_NOTE_BUTTON_LABEL } from "./../../constants";

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export interface NewNoteButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
}

export function NewNoteButton({
  onClick,
  disabled = false,
  label = NEW_NOTE_BUTTON_LABEL,
}: NewNoteButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} size="md">
      <span aria-hidden="true" className="w-5 h-5 flex items-center justify-center">
        <PlusIcon />
      </span>
      {label}
    </Button>
  );
}
