from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField("email address", max_length=254, unique=True, blank=False)

    # Switch primary authentication field from username to email.
    # NOTE: This is a KNOWN, ACCEPTED limitation — login email lookup is case-sensitive
    # (exact match on the email column) even though RegisterSerializer.validate_email()
    # lowercases emails at registration time. A user typing a different case at login
    # than what they registered with will incorrectly get a 401. Out of scope to fix.
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
