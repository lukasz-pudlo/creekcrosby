import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import TemplateView
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import AboutSection, BandMember, ContactInfo, Event
from .serializers import (
    AboutSectionSerializer,
    BandMemberSerializer,
    ContactInfoSerializer,
    EventSerializer,
)


class AuthView(View):
    """Base view for authentication"""

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class UserView(AuthView):
    """Get current user information"""

    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse(
                {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_staff": request.user.is_staff,
                    "is_superuser": request.user.is_superuser,
                }
            )
        else:
            return JsonResponse({"error": "Not authenticated"}, status=401)


class LoginView(AuthView):
    """Handle user login"""

    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            if not username or not password:
                return JsonResponse(
                    {"error": "Username and password required"}, status=400
                )

            user = authenticate(request, username=username, password=password)

            if user is not None:
                if user.is_staff:  # Only allow staff users
                    login(request, user)
                    return JsonResponse(
                        {
                            "success": True,
                            "user": {
                                "id": user.id,
                                "username": user.username,
                                "email": user.email,
                                "is_staff": user.is_staff,
                                "is_superuser": user.is_superuser,
                            },
                        }
                    )
                else:
                    return JsonResponse({"error": "Staff access required"}, status=403)
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": "Login failed"}, status=500)


class LogoutView(AuthView):
    """Handle user logout"""

    def post(self, request):
        logout(request)
        return JsonResponse({"success": True})


# Update the existing views to support PATCH/PUT for editing


class EventViewSet(viewsets.ModelViewSet):  # Changed from ReadOnlyModelViewSet
    """API endpoint for viewing and editing band events"""

    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        """Allow read access to all, write access to staff only"""
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            from rest_framework.permissions import IsAdminUser

            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class BandMemberViewSet(viewsets.ModelViewSet):  # Changed from ReadOnlyModelViewSet
    """API endpoint for viewing and editing band members"""

    queryset = BandMember.objects.all()
    serializer_class = BandMemberSerializer

    def get_permissions(self):
        """Allow read access to all, write access to staff only"""
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            from rest_framework.permissions import IsAdminUser

            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class AboutSectionViewSet(viewsets.ModelViewSet):  # Changed from ReadOnlyModelViewSet
    """API endpoint for viewing and editing about sections"""

    queryset = AboutSection.objects.all()
    serializer_class = AboutSectionSerializer

    def get_permissions(self):
        """Allow read access to all, write access to staff only"""
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            from rest_framework.permissions import IsAdminUser

            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class ContactInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing contact information (read-only)"""

    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [AllowAny]


class IndexView(TemplateView):
    """Main index view that serves the React SPA"""

    template_name = "index.html"
