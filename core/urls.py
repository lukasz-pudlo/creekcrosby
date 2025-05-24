from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    BandMemberViewSet,
    AboutSectionViewSet,
    ContactInfoViewSet
)

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'band', BandMemberViewSet)
router.register(r'about', AboutSectionViewSet)
router.register(r'contact', ContactInfoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
