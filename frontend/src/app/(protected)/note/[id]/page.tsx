import { NoteDetailView } from "@/features/notes/NoteDetailView";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const noteId = Number(resolvedParams.id);

  if (isNaN(noteId)) {
    return (
      <div className="flex items-center justify-center h-dvh bg-background">
        <p className="text-brown">Invalid note ID</p>
      </div>
    );
  }

  return <NoteDetailView noteId={noteId} />;
}
