from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    BandMemberViewSet,
    AboutSectionViewSet,
    ContactInfoViewSet
)
from . import auth_views

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'band', BandMemberViewSet)
router.register(r'about', AboutSectionViewSet)
router.register(r'contact', ContactInfoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Auth endpoints for checking login status
    path('auth/status/', auth_views.auth_status, name='auth_status'),
    path('auth/csrf/', auth_views.csrf_token, name='csrf_token'),
    path('auth/logout/', auth_views.logout_view, name='logout'),
]
