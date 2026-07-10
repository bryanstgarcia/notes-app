from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from . import services
from .models import User


class UsernameGenerationTests(TestCase):
    """Tests for username generation utilities."""

    def test_derive_username_from_email_basic(self):
        """Test basic email-to-username derivation."""
        username = services.derive_username_from_email("alice@example.com")
        self.assertEqual(username, "alice")

    def test_derive_username_from_email_with_special_chars(self):
        """Test that special characters are sanitized."""
        username = services.derive_username_from_email("alice+tag@example.com")
        self.assertEqual(username, "alice+tag")

    def test_derive_username_from_email_with_dots(self):
        """Test that dots in local part are kept."""
        username = services.derive_username_from_email("alice.smith@example.com")
        self.assertEqual(username, "alice.smith")

    def test_derive_username_from_email_invalid_chars_stripped(self):
        """Test that invalid characters are stripped."""
        username = services.derive_username_from_email("alice!@#$%@example.com")
        self.assertEqual(username, "alice")

    def test_derive_username_from_email_empty_after_sanitization(self):
        """Test fallback when email local part has no valid characters."""
        username = services.derive_username_from_email("!@#$%@example.com")
        self.assertEqual(username, "user")

    def test_derive_username_from_email_lowercased(self):
        """Test that result is lowercased."""
        username = services.derive_username_from_email("Alice@example.com")
        self.assertEqual(username, "alice")

    def test_generate_unique_username_base_available(self):
        """Test that base username is returned when available."""
        username = services.generate_unique_username("newuser")
        self.assertEqual(username, "newuser")

    def test_generate_unique_username_adds_numeric_suffix(self):
        """Test that numeric suffix is added when base is taken."""
        User.objects.create_user(username="jane", email="jane@example.com", password="password123")

        username = services.generate_unique_username("jane")
        self.assertEqual(username, "jane2")

    def test_generate_unique_username_increments_numeric_suffix(self):
        """Test that numeric suffix increments correctly."""
        User.objects.create_user(username="jane", email="jane1@example.com", password="password123")
        User.objects.create_user(username="jane2", email="jane2@example.com", password="password123")
        User.objects.create_user(username="jane3", email="jane3@example.com", password="password123")

        username = services.generate_unique_username("jane")
        self.assertEqual(username, "jane4")

    def test_create_user_with_generated_username_success(self):
        """Test successful user creation with server-generated username."""
        user = services.create_user_with_generated_username(
            email="alice@example.com",
            password="securepassword123"
        )

        self.assertEqual(user.email, "alice@example.com")
        self.assertEqual(user.username, "alice")
        self.assertTrue(user.check_password("securepassword123"))

    def test_create_user_with_generated_username_email_normalized(self):
        """Test that email is normalized to lowercase."""
        user = services.create_user_with_generated_username(
            email="Alice@Example.com",
            password="securepassword123"
        )

        self.assertEqual(user.email, "alice@example.com")

    def test_create_user_with_generated_username_duplicate_email_raises_error(self):
        """Test that duplicate email raises IntegrityError."""
        User.objects.create_user(
            username="alice",
            email="alice@example.com",
            password="password123"
        )

        with self.assertRaises(Exception):  # IntegrityError after retries
            services.create_user_with_generated_username(
                email="alice@example.com",
                password="securepassword456"
            )


class RegistrationAPITests(TestCase):
    """Tests for the registration API endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")

    def test_register_with_email_and_password_only(self):
        """Test successful registration with only email and password."""
        response = self.client.post(
            self.register_url,
            {
                "email": "newuser@example.com",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertIn("username", response.data)
        self.assertIn("email", response.data)
        self.assertEqual(response.data["email"], "newuser@example.com")
        self.assertIsNotNone(response.data["username"])
        self.assertEqual(response.data["username"], "newuser")

    def test_register_ignores_submitted_username(self):
        """Test that submitted username is ignored and server-generated instead."""
        response = self.client.post(
            self.register_url,
            {
                "email": "alice@example.com",
                "password": "securepassword123",
                "username": "submitted-username"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "alice")
        self.assertNotEqual(response.data["username"], "submitted-username")

    def test_register_duplicate_email_rejected(self):
        """Test that duplicate email is rejected with 400 error."""
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="password123"
        )

        response = self.client.post(
            self.register_url,
            {
                "email": "existing@example.com",
                "password": "newpassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_duplicate_email_case_insensitive(self):
        """Test that email uniqueness check is case-insensitive."""
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="password123"
        )

        response = self.client.post(
            self.register_url,
            {
                "email": "EXISTING@EXAMPLE.COM",
                "password": "newpassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_password_too_short(self):
        """Test that password under 8 characters is rejected."""
        response = self.client.post(
            self.register_url,
            {
                "email": "newuser@example.com",
                "password": "short123"  # 8 chars, should be ok
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(
            self.register_url,
            {
                "email": "anotheruser@example.com",
                "password": "short12"  # 7 chars, should fail
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_malformed_email_rejected(self):
        """Test that malformed email is rejected."""
        response = self.client.post(
            self.register_url,
            {
                "email": "not-an-email",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_missing_email(self):
        """Test that missing email is rejected."""
        response = self.client.post(
            self.register_url,
            {
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_missing_password(self):
        """Test that missing password is rejected."""
        response = self.client.post(
            self.register_url,
            {
                "email": "newuser@example.com"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_email_is_normalized_to_lowercase(self):
        """Test that email is stored as lowercase."""
        response = self.client.post(
            self.register_url,
            {
                "email": "NewUser@Example.COM",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "newuser@example.com")

        user = User.objects.get(id=response.data["id"])
        self.assertEqual(user.email, "newuser@example.com")

    def test_register_response_includes_id(self):
        """Test that response includes the user's ID."""
        response = self.client.post(
            self.register_url,
            {
                "email": "newuser@example.com",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("id", response.data)
        self.assertIsNotNone(response.data["id"])

    def test_register_password_is_write_only(self):
        """Test that password is not returned in response."""
        response = self.client.post(
            self.register_url,
            {
                "email": "newuser@example.com",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", response.data)


class EmailLoginAPITests(TestCase):
    """Tests for email-based login (switched from username-based auth)."""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse("login")

    def test_login_with_email_and_password_succeeds(self):
        """Test successful login with email and password."""
        services.create_user_with_generated_username(
            email="alice@example.com",
            password="securepassword123"
        )

        response = self.client.post(
            self.login_url,
            {
                "email": "alice@example.com",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_wrong_password_fails(self):
        """Test login fails with wrong password."""
        services.create_user_with_generated_username(
            email="alice@example.com",
            password="securepassword123"
        )

        response = self.client.post(
            self.login_url,
            {
                "email": "alice@example.com",
                "password": "wrongpassword"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_unknown_email_fails(self):
        """Test login fails when email is not registered."""
        response = self.client.post(
            self.login_url,
            {
                "email": "nonexistent@example.com",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_rejects_legacy_username_payload(self):
        """Test that old username-based payload now fails (regression test)."""
        services.create_user_with_generated_username(
            email="alice@example.com",
            password="securepassword123"
        )

        response = self.client.post(
            self.login_url,
            {
                "username": "alice",
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_login_missing_password(self):
        """Test login fails when password is missing."""
        response = self.client.post(
            self.login_url,
            {
                "email": "alice@example.com"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_login_missing_email(self):
        """Test login fails when email is missing."""
        response = self.client.post(
            self.login_url,
            {
                "password": "securepassword123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
