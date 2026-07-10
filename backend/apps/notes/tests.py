from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User
from .models import Note


class NoteCreationAPITests(TestCase):
    """Tests for the note creation endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123"
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="testuser2@example.com",
            password="testpassword123"
        )
        self.create_url = reverse("note-create")

    def test_create_note_with_empty_body_succeeds(self):
        """Test creating a note with an empty body returns 201."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.create_url,
            {},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertEqual(response.data["title"], "")
        self.assertEqual(response.data["content"], "")
        self.assertEqual(response.data["category"], "random-thoughts")
        self.assertEqual(response.data["owner_id"], self.user.id)

    def test_create_note_persists_to_database(self):
        """Test that created note is persisted to database with correct owner."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.create_url,
            {},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        note = Note.objects.get(id=response.data["id"])
        self.assertEqual(note.owner, self.user)
        self.assertEqual(note.title, "")
        self.assertEqual(note.content, "")
        self.assertEqual(note.category, "random-thoughts")

    def test_create_note_without_auth_returns_401(self):
        """Test creating a note without authentication returns 401."""
        response = self.client.post(
            self.create_url,
            {},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Note.objects.count(), 0)

    def test_create_multiple_notes_same_user_creates_distinct_notes(self):
        """Test that consecutive creates by same user create distinct notes."""
        self.client.force_authenticate(user=self.user)

        response1 = self.client.post(self.create_url, {}, format="json")
        response2 = self.client.post(self.create_url, {}, format="json")

        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response2.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response1.data["id"], response2.data["id"])
        self.assertEqual(Note.objects.filter(owner=self.user).count(), 2)

    def test_create_note_ignores_owner_in_payload(self):
        """Test that client-supplied owner in payload is ignored."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.create_url,
            {
                "owner": self.user2.id,
                "owner_id": self.user2.id,
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["owner_id"], self.user.id)
        note = Note.objects.get(id=response.data["id"])
        self.assertEqual(note.owner, self.user)

    def test_create_note_with_title_and_content(self):
        """Test creating a note with title and content."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.create_url,
            {
                "title": "My Note",
                "content": "This is my note content."
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "My Note")
        self.assertEqual(response.data["content"], "This is my note content.")
        self.assertEqual(response.data["category"], "random-thoughts")

    def test_create_note_with_custom_category(self):
        """Test creating a note with a custom category."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.create_url,
            {
                "title": "School Notes",
                "content": "Math homework",
                "category": "school"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["category"], "school")

    def test_create_note_with_invalid_category_returns_400(self):
        """Test creating a note with invalid category returns 400."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.create_url,
            {
                "category": "invalid-category"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)


class NoteDetailAPITests(TestCase):
    """Tests for the note detail (retrieve/update) endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123"
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="testuser2@example.com",
            password="testpassword123"
        )
        self.note = Note.objects.create(
            owner=self.user,
            title="My Note",
            content="My content",
            category="random-thoughts"
        )
        self.note2 = Note.objects.create(
            owner=self.user2,
            title="User 2's Note",
            content="User 2's content",
            category="school"
        )
        self.detail_url = reverse("note-detail", kwargs={"pk": self.note.id})
        self.detail_url_other = reverse("note-detail", kwargs={"pk": self.note2.id})

    def test_retrieve_note_by_owner_returns_200(self):
        """Test retrieving a note by its owner returns 200."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.note.id)
        self.assertEqual(response.data["title"], "My Note")
        self.assertEqual(response.data["content"], "My content")
        self.assertEqual(response.data["category"], "random-thoughts")
        self.assertEqual(response.data["owner_id"], self.user.id)
        self.assertIn("created_at", response.data)
        self.assertIn("updated_at", response.data)

    def test_retrieve_note_owned_by_different_user_returns_404(self):
        """Test retrieving a note owned by another user returns 404."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.detail_url_other)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_nonexistent_note_returns_404(self):
        """Test retrieving a nonexistent note returns 404."""
        self.client.force_authenticate(user=self.user)
        nonexistent_url = reverse("note-detail", kwargs={"pk": 9999})
        response = self.client.get(nonexistent_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_note_without_auth_returns_401(self):
        """Test retrieving a note without authentication returns 401."""
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_note_title_only_updates_title(self):
        """Test PATCH with only title updates only title field."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.detail_url,
            {"title": "Updated Title"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")
        self.assertEqual(response.data["content"], "My content")
        self.assertEqual(response.data["category"], "random-thoughts")

    def test_patch_note_content_only_updates_content(self):
        """Test PATCH with only content updates only content field."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.detail_url,
            {"content": "Updated content"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "My Note")
        self.assertEqual(response.data["content"], "Updated content")
        self.assertEqual(response.data["category"], "random-thoughts")

    def test_patch_note_category_only_updates_category(self):
        """Test PATCH with only category updates only category field."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.detail_url,
            {"category": "school"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "My Note")
        self.assertEqual(response.data["content"], "My content")
        self.assertEqual(response.data["category"], "school")

    def test_patch_note_updates_updated_at(self):
        """Test that PATCH updates the updated_at timestamp."""
        self.client.force_authenticate(user=self.user)
        original_updated_at = self.note.updated_at

        response = self.client.patch(
            self.detail_url,
            {"title": "New Title"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.note.refresh_from_db()
        self.assertGreater(self.note.updated_at, original_updated_at)

    def test_patch_note_with_invalid_category_returns_400(self):
        """Test PATCH with invalid category returns 400."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.detail_url,
            {"category": "invalid-category"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)

    def test_patch_note_with_title_exceeding_max_length_returns_400(self):
        """Test PATCH with title exceeding max length returns 400."""
        self.client.force_authenticate(user=self.user)
        long_title = "x" * 721  # Max is 720
        response = self.client.patch(
            self.detail_url,
            {"title": long_title},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_patch_note_on_other_user_note_returns_404(self):
        """Test PATCH on another user's note returns 404."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.detail_url_other,
            {"title": "Hacked"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_note_without_auth_returns_401(self):
        """Test PATCH without authentication returns 401."""
        response = self.client.patch(
            self.detail_url,
            {"title": "Hacked"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_put_method_not_allowed(self):
        """Test that PUT method is not allowed (only PATCH)."""
        self.client.force_authenticate(user=self.user)
        response = self.client.put(
            self.detail_url,
            {
                "title": "Full Replace",
                "content": "Full content",
                "category": "personal"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_delete_method_not_allowed(self):
        """Test that DELETE method is not allowed."""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_patch_multiple_fields_at_once(self):
        """Test PATCH with multiple fields updates all of them."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            self.detail_url,
            {
                "title": "Updated Title",
                "content": "Updated Content",
                "category": "personal"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Updated Title")
        self.assertEqual(response.data["content"], "Updated Content")
        self.assertEqual(response.data["category"], "personal")


class NoteListAPITests(TestCase):
    """Tests for the note list endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123"
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="testuser2@example.com",
            password="testpassword123"
        )
        self.list_url = reverse("note-create")

    def test_list_notes_returns_only_requesting_user_notes(self):
        """Test list endpoint returns only the authenticated user's notes."""
        note1 = Note.objects.create(
            owner=self.user,
            title="User 1 Note 1",
            content="Content 1"
        )
        note2 = Note.objects.create(
            owner=self.user,
            title="User 1 Note 2",
            content="Content 2"
        )
        note3 = Note.objects.create(
            owner=self.user2,
            title="User 2 Note 1",
            content="Content 3"
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        returned_ids = {note["id"] for note in response.data}
        self.assertEqual(returned_ids, {note1.id, note2.id})

    def test_list_notes_without_auth_returns_401(self):
        """Test list endpoint without authentication returns 401."""
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_notes_returns_empty_array_when_user_has_no_notes(self):
        """Test list endpoint returns empty array for user with zero notes."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
        self.assertEqual(response.data, [])

    def test_list_notes_respects_created_at_ordering(self):
        """Test list endpoint returns notes ordered by -created_at (most recent first)."""
        import time

        # Create notes with small delay to ensure different timestamps
        note1 = Note.objects.create(
            owner=self.user,
            title="First Note",
            content="Content 1"
        )
        time.sleep(0.01)  # Small delay to ensure different timestamps
        note2 = Note.objects.create(
            owner=self.user,
            title="Second Note",
            content="Content 2"
        )
        time.sleep(0.01)
        note3 = Note.objects.create(
            owner=self.user,
            title="Third Note",
            content="Content 3"
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        # Most recent notes should appear first
        self.assertEqual(response.data[0]["id"], note3.id)
        self.assertEqual(response.data[1]["id"], note2.id)
        self.assertEqual(response.data[2]["id"], note1.id)
