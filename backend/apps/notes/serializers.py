from rest_framework import serializers

from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)

    class Meta:
        model = Note
        fields = ("id", "title", "content", "category", "owner_id", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
