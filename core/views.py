from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.views.generic import TemplateView
from .models import Event, BandMember, AboutSection, ContactInfo
from .serializers import (
    EventSerializer,
    BandMemberSerializer,
    AboutSectionSerializer,
    ContactInfoSerializer
)


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing band events"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]


class BandMemberViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing band band members"""
    queryset = BandMember.objects.all()
    serializer_class = BandMemberSerializer
    permission_classes = [AllowAny]


class AboutSectionViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing band about sections"""
    queryset = AboutSection.objects.all()
    serializer_class = AboutSectionSerializer
    permission_classes = [AllowAny]


class ContactInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing band contact information"""
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [AllowAny]


class IndexView(TemplateView):
    """Main index view that serves the React SPA"""
    template_name = 'index.html'
