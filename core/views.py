import os
import glob
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.generic import TemplateView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.conf import settings
from .models import Event, BandMember, AboutSection, ContactInfo
from .serializers import (
    EventSerializer,
    BandMemberSerializer,
    AboutSectionSerializer,
    ContactInfoSerializer
)


class EventViewSet(viewsets.ModelViewSet):
    """API endpoint for viewing and editing band events"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class BandMemberViewSet(viewsets.ModelViewSet):
    """API endpoint for viewing and editing band members"""
    queryset = BandMember.objects.all()
    serializer_class = BandMemberSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class AboutSectionViewSet(viewsets.ModelViewSet):
    """API endpoint for viewing and editing about sections"""
    queryset = AboutSection.objects.all()
    serializer_class = AboutSectionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class ContactInfoViewSet(viewsets.ModelViewSet):
    """API endpoint for viewing and editing contact information"""
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'Staff access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class IndexView(TemplateView):
    """Main index view that serves the React SPA"""
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Get CSS and JS files from React build
        static_root = os.path.join(settings.BASE_DIR, 'frontend/build/static')

        css_files = []
        js_files = []

        if os.path.exists(static_root):
            # Find CSS files
            css_pattern = os.path.join(static_root, 'css/*.css')
            for css_file in glob.glob(css_pattern):
                css_files.append(f'css/{os.path.basename(css_file)}')

            # Find JS files
            js_pattern = os.path.join(static_root, 'js/*.js')
            for js_file in glob.glob(js_pattern):
                js_files.append(f'js/{os.path.basename(js_file)}')

        context['css_files'] = css_files
        context['js_files'] = js_files

        return context
