import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Creates a superuser if none exists"

    def handle(self, *args, **options):
        # Check if any superuser exists
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.SUCCESS("Superuser already exists. Skipping creation.")
            )
            return

        # Get credentials from environment variables
        username = "ccadmin"
        password = os.environ.get("RENDER_ADMIN_PASSWORD")
        email = os.environ.get("ADMIN_EMAIL", "admin@creekcrosby.co.uk")

        if not password:
            self.stdout.write(
                self.style.ERROR(
                    "RENDER_ADMIN_PASSWORD environment variable is not set. "
                    "Cannot create superuser."
                )
            )
            return

        # Create the superuser
        try:
            user = User.objects.create_superuser(
                username=username, email=email, password=password
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created superuser "{username}". '
                    f"You can now log in at /admin/ with username: {username}"
                )
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating superuser: {str(e)}"))
