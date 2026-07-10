from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from . import services
from .models import Note
from .serializers import NoteSerializer


class NoteListCreateView(ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return services.list_notes_for_user(self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class NoteDetailView(RetrieveUpdateAPIView):
    serializer_class = NoteSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        note_id = self.kwargs["pk"]
        return services.get_note_for_user(note_id, self.request.user)
