from django.contrib import admin
from django.core.cache import cache

from .models import (
    AboutSection,
    BandMember,
    ContactInfo,
    ContactMessage,
    Event,
    MediaItem,
    Merchandise,
)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "location", "updated")
    search_fields = ("title", "description", "location")
    list_filter = ("date", "updated")
    ordering = ("-date",)


@admin.register(BandMember)
class BandMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "position", "order")
    search_fields = ("name", "position", "bio")
    list_editable = ("order",)
    ordering = ("order", "name")


@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "content")
    search_fields = ("title", "content")


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ("email", "phone")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created_at", "is_read", "is_replied")
    list_filter = ("is_read", "is_replied", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("created_at", "ip_address", "user_agent")
    ordering = ("-created_at",)

    fieldsets = (
        ("Message Details", {"fields": ("name", "email", "subject", "message")}),
        ("Status", {"fields": ("is_read", "is_replied")}),
        (
            "Metadata",
            {
                "fields": ("created_at", "ip_address", "user_agent"),
                "classes": ("collapse",),
            },
        ),
    )

    actions = ["mark_as_read", "mark_as_unread", "mark_as_replied"]

    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f"{updated} messages marked as read.")

    mark_as_read.short_description = "Mark selected messages as read"

    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f"{updated} messages marked as unread.")

    mark_as_unread.short_description = "Mark selected messages as unread"

    def mark_as_replied(self, request, queryset):
        updated = queryset.update(is_replied=True)
        self.message_user(request, f"{updated} messages marked as replied.")

    mark_as_replied.short_description = "Mark selected messages as replied"


@admin.register(Merchandise)
class MerchandiseAdmin(admin.ModelAdmin):
    list_display = ("name", "image")


@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ("title", "media_type", "order", "created_at")
    list_filter = ("media_type", "created_at")
    search_fields = ("title", "description")
    list_editable = ("order",)
    ordering = ("order", "-created_at")

    fieldsets = (
        (
            "Basic Information",
            {"fields": ("title", "description", "media_type", "order")},
        ),
        (
            "Media Content",
            {
                "fields": ("image", "audio_file", "video_file", "video_link"),
                "description": "Fill in the appropriate field based on the media type selected above.",
            },
        ),
    )

    def get_form(self, request, obj=None, **kwargs):
        """Customize the admin form"""
        form = super().get_form(request, obj, **kwargs)

        # Add help text to media fields
        if "image" in form.base_fields:
            form.base_fields["image"].help_text = (
                "Use for album covers, band photos, artwork (only for 'Image/Album Cover' type)"
            )
        if "audio_file" in form.base_fields:
            form.base_fields["audio_file"].help_text = (
                "Upload MP3, WAV, M4A, OGG or FLAC (only for 'Audio Track' type)"
            )
        if "video_file" in form.base_fields:
            form.base_fields["video_file"].help_text = (
                "Upload video files like MP4, WebM (only for 'Video File' type)"
            )
        if "video_link" in form.base_fields:
            form.base_fields["video_link"].help_text = (
                "YouTube, Vimeo, or other video service URLs (only for 'Video Link' type)"
            )

        return form

    def save_model(self, request, obj, form, change):
        """Clean fields based on media type before saving"""
        if obj.media_type == "image":
            obj.audio_file = None
            obj.video_file = None
            obj.video_link = None
        elif obj.media_type == "audio":
            obj.image = None
            obj.video_file = None
            obj.video_link = None
        elif obj.media_type == "video_file":
            obj.image = None
            obj.audio_file = None
            obj.video_link = None
        elif obj.media_type == "video_link":
            obj.image = None
            obj.audio_file = None
            obj.video_file = None

        super().save_model(request, obj, form, change)
        cache.delete("media_sections_v2")

    def delete_model(self, request, obj):
        super().delete_model(request, obj)
        cache.delete("media_sections_v2")
