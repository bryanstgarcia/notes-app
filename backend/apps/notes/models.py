from django.conf import settings
from django.db import models

from .constants import NOTE_CONTENT_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH


class Note(models.Model):
    class Category(models.TextChoices):
        RANDOM_THOUGHTS = "random-thoughts", "Random Thoughts"
        SCHOOL = "school", "School"
        PERSONAL = "personal", "Personal"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    title = models.CharField(
        max_length=NOTE_TITLE_MAX_LENGTH,
        blank=True,
        default="",
    )
    content = models.TextField(
        blank=True,
        default="",
    )
    category = models.CharField(
        max_length=32,
        choices=Category.choices,
        default=Category.RANDOM_THOUGHTS,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notes"
        ordering = ["-created_at"]
