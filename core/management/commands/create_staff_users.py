import getpass

from django.contrib.auth.models import User
from django.core.management import CommandError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Creates a staff user for editing the website"

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            help="Username for the staff user",
        )
        parser.add_argument(
            "--email",
            type=str,
            help="Email for the staff user",
        )
        parser.add_argument(
            "--password",
            type=str,
            help="Password for the staff user (will prompt if not provided)",
        )

    def handle(self, *args, **options):
        username = options.get("username")
        email = options.get("email")
        password = options.get("password")

        if not username:
            username = input("Username: ")

        if not email:
            email = input("Email: ")

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            raise CommandError(f'User "{username}" already exists.')

        if not password:
            password = getpass.getpass("Password: ")
            password2 = getpass.getpass("Password (again): ")

            if password != password2:
                raise CommandError("Passwords do not match.")

        # Create the user
        user = User.objects.create_user(
            username=username, email=email, password=password
        )

        # Make them staff
        user.is_staff = True
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created staff user "{username}". '
                f"They can now log in at /admin/ and edit content on the website."
            )
        )
