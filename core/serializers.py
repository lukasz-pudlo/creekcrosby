from rest_framework import serializers

from .models import AboutSection, BandMember, ContactInfo, Event, MediaItem, Merchandise


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


class BandMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = BandMember
        fields = "__all__"


class AboutSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutSection
        fields = "__all__"


class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = "__all__"


class MerchandiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchandise
        fields = "__all__"


class MediaItemSerializer(serializers.ModelSerializer):
    embed_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaItem
        fields = "__all__"

    def get_embed_url(self, obj):
        """Get the embed URL for video links"""
        return obj.get_video_embed_url()
