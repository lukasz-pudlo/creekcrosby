from django.contrib import admin

from .models import AboutSection, BandMember, ContactInfo, Event, ContactMessage, Merchandise


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
        ("Message Details", {
            "fields": ("name", "email", "subject", "message")
        }),
        ("Status", {
            "fields": ("is_read", "is_replied")
        }),
        ("Metadata", {
            "fields": ("created_at", "ip_address", "user_agent"),
            "classes": ("collapse",)
        }),
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
