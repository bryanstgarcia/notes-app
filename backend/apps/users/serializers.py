from rest_framework import serializers

from . import services
from .constants import EMAIL_ALREADY_REGISTERED_ERROR, PASSWORD_MIN_LENGTH
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=PASSWORD_MIN_LENGTH)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
        read_only_fields = ("username",)

    def validate_email(self, value):
        """Validate that email is unique (case-insensitive) and lowercase it."""
        email_lower = value.lower()
        if User.objects.filter(email__iexact=email_lower).exists():
            raise serializers.ValidationError(EMAIL_ALREADY_REGISTERED_ERROR)
        return email_lower

    def create(self, validated_data):
        """Create user with server-generated username."""
        email = validated_data["email"]
        password = validated_data["password"]
        return services.create_user_with_generated_username(email, password)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")
