from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # HTMX Views
    index,
    events_partial,
    band_partial,
    about_partial,
    contact_partial,
    contact_form,
    search_events,

    # API Views (keeping for backward compatibility)
    EventViewSet,
    BandMemberViewSet,
    AboutSectionViewSet,
    ContactInfoViewSet
)

# API Router for REST endpoints
router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'band', BandMemberViewSet)
router.register(r'about', AboutSectionViewSet)
router.register(r'contact', ContactInfoViewSet)

urlpatterns = [
    # Main page
    path('', index, name='index'),

    # HTMX partials
    path('partials/events/', events_partial, name='events_partial'),
    path('partials/band/', band_partial, name='band_partial'),
    path('partials/about/', about_partial, name='about_partial'),
    path('partials/contact/', contact_partial, name='contact_partial'),

    # HTMX actions
    path('contact-form/', contact_form, name='contact_form'),
    path('search-events/', search_events, name='search_events'),

    # API endpoints (keeping for backward compatibility)
    path('api/', include(router.urls)),
]
