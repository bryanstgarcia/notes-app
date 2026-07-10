from django.http import Http404

from .models import Note


def get_note_for_user(note_id: int, user) -> Note:
    """
    Retrieve a note for a specific user.

    Looks up a note filtered by owner=user, raising Http404 if no match.
    A note that exists but belongs to a different user returns 404 (not 403)
    to avoid leaking whether a given note id exists for another user.

    Args:
        note_id: The ID of the note to retrieve
        user: The user requesting the note

    Returns:
        The Note object

    Raises:
        Http404: If the note is not found or belongs to a different user
    """
    try:
        return Note.objects.get(id=note_id, owner=user)
    except Note.DoesNotExist:
        raise Http404("Note not found.")


def list_notes_for_user(user):
    """
    List all notes belonging to a specific user.

    Returns notes ordered by created_at descending (most recent first),
    as defined in the Note model's Meta.ordering.

    Args:
        user: The user whose notes to retrieve

    Returns:
        QuerySet of Note objects ordered by -created_at
    """
    return Note.objects.filter(owner=user)
