import os

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Ensures media directory exists and has proper permissions"

    def handle(self, *args, **options):
        """Create media directory if it doesn't exist"""

        media_root = settings.MEDIA_ROOT

        if not os.path.exists(media_root):
            try:
                os.makedirs(media_root, exist_ok=True)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Successfully created media directory: {media_root}"
                    )
                )
            except OSError as e:
                self.stdout.write(
                    self.style.ERROR(f"Failed to create media directory: {e}")
                )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Media directory already exists: {media_root}")
            )

        # Create subdirectories for different media types
        subdirs = ["band", "events", "about"]
        for subdir in subdirs:
            subdir_path = os.path.join(media_root, subdir)
            if not os.path.exists(subdir_path):
                try:
                    os.makedirs(subdir_path, exist_ok=True)
                    self.stdout.write(
                        self.style.SUCCESS(f"Created media subdirectory: {subdir_path}")
                    )
                except OSError as e:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Could not create subdirectory {subdir_path}: {e}"
                        )
                    )
