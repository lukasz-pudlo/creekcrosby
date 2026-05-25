from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (  # HTMX Views; Inline editing views; Event editing views; API Views (keeping for backward compatibility)
    AboutSectionViewSet,
    BandMemberViewSet,
    ContactInfoViewSet,
    EventViewSet,
    MediaItemViewSet,
    about_partial,
    add_about_section,
    add_band_member,
    add_event,
    band_partial,
    band_partial_optimized,
    contact_form,
    contact_partial,
    delete_about_image,
    delete_about_section,
    delete_band_member,
    delete_event,
    edit_about_section,
    edit_band_member,
    edit_contact_info,
    edit_event,
    events_partial,
    footer_contact_partial,
    footer_social_partial,
    footer_thanks_partial,
    index,
    load_more_media,
    media_partial,
    media_partial_optimized,
    merchandise_partial,
    optimized_media_view,
    reorder_band_members,
    search_events,
    upload_about_image,
    upload_band_image,
    upload_event_image,
)

# API Router for REST endpoints
router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(r"band", BandMemberViewSet)
router.register(r"about", AboutSectionViewSet)
router.register(r"contact", ContactInfoViewSet)
router.register(r"media", MediaItemViewSet, basename="media")

urlpatterns = [
    # Main page
    path("", index, name="index"),
    # HTMX partials
    path("partials/events/", events_partial, name="events_partial"),
    path("partials/band/", band_partial, name="band_partial"),
    path("partials/about/", about_partial, name="about_partial"),
    path("partials/contact/", contact_partial, name="contact_partial"),
    path(
        "partials/footer-contact/",
        footer_contact_partial,
        name="footer_contact_partial",
    ),
    path(
        "partials/footer-social/", footer_social_partial, name="footer_social_partial"
    ),
    path("partials/thanks/", footer_thanks_partial, name="footer_thanks_partial"),
    path("partials/merchandise", merchandise_partial, name="merchandise_partial"),
    path("partials/media/", media_partial, name="media_partial"),
    path(
        "partials/media/optimized/",
        media_partial_optimized,
        name="media_partial_optimized",
    ),
    path(
        "partials/band/optimized/",
        band_partial_optimized,
        name="band_partial_optimized",
    ),
    path("api/media/load-more/", load_more_media, name="load_more_media"),
    path("media-optimized/<path:path>", optimized_media_view, name="optimized_media"),
    # HTMX actions
    path("contact-form/", contact_form, name="contact_form"),
    path("search-events/", search_events, name="search_events"),
    # Inline editing endpoints - About
    path("edit/about/<int:section_id>/", edit_about_section, name="edit_about_section"),
    path(
        "edit/about/<int:section_id>/image/",
        upload_about_image,
        name="upload_about_image",
    ),
    path(
        "edit/about/<int:section_id>/delete-image/",
        delete_about_image,
        name="delete_about_image",
    ),
    path("edit/about/add/", add_about_section, name="add_about_section"),
    path(
        "edit/about/<int:section_id>/delete/",
        delete_about_section,
        name="delete_about_section",
    ),
    # Inline editing endpoints - Band
    path("edit/band/<int:member_id>/", edit_band_member, name="edit_band_member"),
    path(
        "edit/band/<int:member_id>/image/", upload_band_image, name="upload_band_image"
    ),
    path("edit/band/add/", add_band_member, name="add_band_member"),
    path(
        "edit/band/<int:member_id>/delete/",
        delete_band_member,
        name="delete_band_member",
    ),
    path("edit/band/reorder/", reorder_band_members, name="reorder_band_members"),
    # Inline editing endpoints - Contact
    path("edit/contact/", edit_contact_info, name="edit_contact_info"),
    # Inline editing endpoints - Events
    path("edit/event/<int:event_id>/", edit_event, name="edit_event"),
    path(
        "edit/event/<int:event_id>/image/",
        upload_event_image,
        name="upload_event_image",
    ),
    path("edit/event/add/", add_event, name="add_event"),
    path("edit/event/<int:event_id>/delete/", delete_event, name="delete_event"),
    # API endpoints (keeping for backward compatibility)
    path("api/", include(router.urls)),
]
