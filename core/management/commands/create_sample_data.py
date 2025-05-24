from django.core.management.base import BaseCommand
from core.models import BandMember, Event, AboutSection, ContactInfo
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Creates sample data for the Creek Crosby website'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating sample data...'))
        self.create_band_members()
        self.create_events()
        self.create_about_section()
        self.create_contact_info()
        self.stdout.write(self.style.SUCCESS('Sample data creation complete!'))

    def create_band_members(self):
        BandMember.objects.all().delete()

        members = [
            {
                'name': 'Gene McTaggart',
                'position': 'Vocals',
                'bio': 'Lead vocalist with a powerful voice inspired by 50s rock and roll legends.',
                'order': 1,
            },
            {
                'name': 'Jim Boyd',
                'position': 'Guitar',
                'bio': 'Master guitarist who brings the classic rockabilly sound to life.',
                'order': 2,
            },
            {
                'name': 'Colin McTaggart',
                'position': 'Keys',
                'bio': 'Provides the perfect piano and keyboard accompaniment to the band\'s vintage sound.',
                'order': 3,
            },
            {
                'name': 'Johnny White',
                'position': 'Bass, Vocals',
                'bio': 'Holding down the rhythm section with solid bass lines and backup vocals.',
                'order': 4,
            },
            {
                'name': 'Jim Duncan',
                'position': 'Drums',
                'bio': 'Powerful drummer who keeps the beat and drives the band\'s energetic performances.',
                'order': 5,
            },
        ]

        for member in members:
            BandMember.objects.create(**member)

        self.stdout.write(self.style.SUCCESS(
            f"Created {len(members)} band members"))

    def create_events(self):
        Event.objects.all().delete()

        now = timezone.now()

        events = [
            {
                'title': 'Live at Blackfriars',
                'description': 'Creek Crosby returns to Blackfriars for a night of classic 50s rock and roll, rockabilly, and more.',
                'date': now + timedelta(days=30),
                'location': 'Blackfriars, Glasgow',
            },
            {
                'title': 'Concert at Da Rock',
                'description': 'Join us for an evening of music at Da Rock in Gourock.',
                'date': now + timedelta(days=45),
                'location': 'Da Rock, Gourock',
            },
            {
                'title': 'Ashtray\'s Full, Bottle\'s Empty Single Launch',
                'description': 'Special performance celebrating the launch of our debut single "Ashtray\'s Full, Bottle\'s Empty"',
                'date': now + timedelta(days=60),
                'location': 'Cafe Continental, Gourock',
            },
        ]

        for event in events:
            Event.objects.create(**event)

        self.stdout.write(self.style.SUCCESS(f"Created {len(events)} events"))

    def create_about_section(self):
        AboutSection.objects.all().delete()

        about = {
            'title': 'Creek Crosby',
            'content': 'Creek Crosby is a rock and roll band performing classic tracks from the 50s era, including Pop, Rock and Roll, Rockabilly, Country, and Blues. Based in Greenock and Gourock, the band is known for their energetic performances and authentic vintage sound. With their debut single "Ashtray\'s Full, Bottle\'s Empty", Creek Crosby has been making waves in the local music scene.',
        }

        AboutSection.objects.create(**about)
        self.stdout.write(self.style.SUCCESS("Created about section"))

    def create_contact_info(self):
        ContactInfo.objects.all().delete()

        contact = {
            'email': 'contact@creekcrosby.com',
            'phone': '07700 900000',
            'address': 'Greenock, Scotland',
            'social_facebook': 'https://facebook.com/creekhq',
            'social_instagram': 'https://instagram.com/creekcrosby',
        }

        ContactInfo.objects.create(**contact)
        self.stdout.write(self.style.SUCCESS("Created contact info"))
