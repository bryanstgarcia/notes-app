import re
import secrets
from typing import Optional

from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import IntegrityError

from .constants import (
    CREATE_USER_MAX_INTEGRITY_RETRIES,
    USERNAME_FALLBACK_BASE,
    USERNAME_GENERATION_MAX_RANDOM_ATTEMPTS,
    USERNAME_GENERATION_MAX_SEQUENTIAL_ATTEMPTS,
    USERNAME_GENERATION_RANDOM_SUFFIX_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_SUFFIX_RESERVED_LENGTH,
)
from .models import User


def derive_username_from_email(email: str) -> str:
    """
    Derive a base username from an email's local part (substring before @).

    Sanitizes to satisfy Django's UnicodeUsernameValidator (only letters, digits,
    and @/./+/-/_ permitted). Lowercases the result.

    If sanitization yields an empty string, falls back to USERNAME_FALLBACK_BASE.
    """
    local_part = email.split("@")[0]

    # Keep only allowed characters: letters, digits, @/./+/-/_
    # The UnicodeUsernameValidator regex pattern allows these characters plus unicode letters/numbers
    # For simplicity, we keep ASCII letters, digits, and the special chars
    sanitized = re.sub(r"[^a-zA-Z0-9@.+\-_]", "", local_part).lower()

    if not sanitized:
        return USERNAME_FALLBACK_BASE

    return sanitized


def _username_exists(username: str) -> bool:
    """Check if a username already exists in the database."""
    return User.objects.filter(username=username).exists()


def generate_unique_username(base_username: str) -> str:
    """
    Generate a unique username by appending numeric suffixes or random suffixes.

    1. Try the base as-is
    2. Try appending incrementing numeric suffixes (jane, jane2, jane3, ...)
       up to USERNAME_GENERATION_MAX_SEQUENTIAL_ATTEMPTS
    3. If all sequential attempts are taken, append a random suffix and retry
       up to USERNAME_GENERATION_MAX_RANDOM_ATTEMPTS times

    Truncates the base so the final username never exceeds USERNAME_MAX_LENGTH,
    reserving USERNAME_SUFFIX_RESERVED_LENGTH characters for the suffix.
    """
    # Reserve space for the suffix (e.g., "_randomsuffix" or "9999")
    max_base_length = USERNAME_MAX_LENGTH - USERNAME_SUFFIX_RESERVED_LENGTH
    truncated_base = base_username[:max_base_length]

    # Try the base as-is first
    if not _username_exists(truncated_base):
        return truncated_base

    # Try sequential suffixes
    for attempt in range(2, USERNAME_GENERATION_MAX_SEQUENTIAL_ATTEMPTS + 1):
        candidate = f"{truncated_base}{attempt}"
        if len(candidate) > USERNAME_MAX_LENGTH:
            break  # No point continuing if we exceed max length
        if not _username_exists(candidate):
            return candidate

    # Try random suffixes
    for _ in range(USERNAME_GENERATION_MAX_RANDOM_ATTEMPTS):
        random_suffix = secrets.token_hex(USERNAME_GENERATION_RANDOM_SUFFIX_LENGTH // 2)
        candidate = f"{truncated_base}_{random_suffix}"
        if len(candidate) > USERNAME_MAX_LENGTH:
            continue  # This shouldn't happen with proper constants, but be safe
        if not _username_exists(candidate):
            return candidate

    # If we get here, we've exhausted all attempts (extremely unlikely)
    raise RuntimeError("Could not generate a unique username after all retry attempts.")


def create_user_with_generated_username(email: str, password: str) -> User:
    """
    Create a user with a server-generated unique username.

    Normalizes email to lowercase, generates a unique username from the email's
    local part, and calls User.objects.create_user(). Retries on IntegrityError
    (handles race conditions where two concurrent requests derive the same username
    or email). If retries are exhausted, raises an exception.

    Args:
        email: The user's email address
        password: The user's password in plaintext

    Returns:
        The created User instance

    Raises:
        IntegrityError: If the user could not be created after all retry attempts
    """
    email = email.lower()

    for attempt in range(CREATE_USER_MAX_INTEGRITY_RETRIES):
        try:
            base_username = derive_username_from_email(email)
            username = generate_unique_username(base_username)

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            return user
        except IntegrityError:
            if attempt == CREATE_USER_MAX_INTEGRITY_RETRIES - 1:
                # Last attempt failed, re-raise the error
                raise
            # Otherwise, retry with a freshly-generated username
            continue
