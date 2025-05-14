from django.contrib import admin
from .models import Event, BandMember, AboutSection, ContactInfo


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'location')
    search_fields = ('title', 'description', 'location')
    list_filter = ('date',)


@admin.register(BandMember)
class BandMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'order')
    search_fields = ('name', 'position', 'bio')
    list_editable = ('order',)


@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title', 'content')


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('email', 'phone')
