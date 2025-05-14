import os
import subprocess
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Builds the React frontend for production'

    def handle(self, *args, **options):
        # Ensure frontend directory exists
        frontend_dir = os.path.join(settings.BASE_DIR, 'frontend')
        if not os.path.exists(frontend_dir):
            self.stdout.write(self.style.ERROR('Frontend directory not found'))
            return

        try:
            # Change to frontend directory
            os.chdir(frontend_dir)

            # Install dependencies
            self.stdout.write('Installing frontend dependencies...')
            subprocess.run(['npm', 'install'], check=True)

            # Build React app
            self.stdout.write('Building the React app...')
            subprocess.run(['npm', 'run', 'build'], check=True)

            # Ensure static directory exists
            static_dir = os.path.join(settings.BASE_DIR, 'staticfiles')
            if not os.path.exists(static_dir):
                os.makedirs(static_dir)

            self.stdout.write(self.style.SUCCESS(
                'Frontend built successfully!'))

        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(
                f'Failed to build frontend: {e}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'An unexpected error occurred: {e}'))
