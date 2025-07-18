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
    footer_contact_partial,
    footer_social_partial,
    footer_thanks_partial,
    merchandise_partial,

    # Inline editing views
    edit_about_section,
    upload_about_image,
    delete_about_image,
    add_about_section,
    delete_about_section,
    edit_band_member,
    upload_band_image,
    add_band_member,
    delete_band_member,
    reorder_band_members,
    edit_contact_info,

    # Event editing views
    edit_event,
    upload_event_image,
    add_event,
    delete_event,

    # API Views (keeping for backward compatibility)
    EventViewSet,
    BandMemberViewSet,
    AboutSectionViewSet,
    ContactInfoViewSet
)

# API Router for REST endpoints
router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
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
    path('partials/footer-contact/', footer_contact_partial, name='footer_contact_partial'),
    path('partials/footer-social/', footer_social_partial, name='footer_social_partial'),
    path('partials/thanks/', footer_thanks_partial, name='footer_thanks_partial'),
    path('partials/merchandise', merchandise_partial, name='merchandise_partial'),

    # HTMX actions
    path('contact-form/', contact_form, name='contact_form'),
    path('search-events/', search_events, name='search_events'),

    # Inline editing endpoints - About
    path('edit/about/<int:section_id>/', edit_about_section, name='edit_about_section'),
    path('edit/about/<int:section_id>/image/',
         upload_about_image, name='upload_about_image'),
    path('edit/about/<int:section_id>/delete-image/',
         delete_about_image, name='delete_about_image'),
    path('edit/about/add/', add_about_section, name='add_about_section'),
    path('edit/about/<int:section_id>/delete/',
         delete_about_section, name='delete_about_section'),

    # Inline editing endpoints - Band
    path('edit/band/<int:member_id>/', edit_band_member, name='edit_band_member'),
    path('edit/band/<int:member_id>/image/', upload_band_image, name='upload_band_image'),
    path('edit/band/add/', add_band_member, name='add_band_member'),
    path('edit/band/<int:member_id>/delete/',
         delete_band_member, name='delete_band_member'),
    path('edit/band/reorder/', reorder_band_members, name='reorder_band_members'),

    # Inline editing endpoints - Contact
    path('edit/contact/', edit_contact_info, name='edit_contact_info'),

    # Inline editing endpoints - Events
    path('edit/event/<int:event_id>/', edit_event, name='edit_event'),
    path('edit/event/<int:event_id>/image/',
         upload_event_image, name='upload_event_image'),
    path('edit/event/add/', add_event, name='add_event'),
    path('edit/event/<int:event_id>/delete/', delete_event, name='delete_event'),

    # API endpoints (keeping for backward compatibility)
    path('api/', include(router.urls)),
]
