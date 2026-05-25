from django.db import models
from django.utils.translation import gettext_lazy as _


class Event(models.Model):
    """Model for storing band event information"""

    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField(blank=True, null=True)
    location = models.TextField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to="events/", blank=True, null=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date"]
        verbose_name = _("Event")
        verbose_name_plural = _("Events")

    def __str__(self):
        return self.title


class BandMember(models.Model):
    """Model for storing band band member information"""

    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="band/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = _("Band Member")
        verbose_name_plural = _("Band Members")

    def __str__(self):
        return self.name


class AboutSection(models.Model):
    """Model for storing band's about information"""

    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to="about/", blank=True, null=True)

    class Meta:
        verbose_name = _("About Section")
        verbose_name_plural = _("About Sections")

    def __str__(self):
        return self.title


class ContactInfo(models.Model):
    """Model for storing band contact information"""

    email = models.EmailField(blank=True, null=True)
    phone = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    social_facebook = models.URLField(blank=True, null=True)
    social_twitter = models.URLField(blank=True, null=True)
    social_instagram = models.URLField(blank=True, null=True)
    social_linkedin = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name = _("Contact Information")
        verbose_name_plural = _("Contact Information")

    def __str__(self):
        return self.email


class ContactMessage(models.Model):
    """Model for storing contact form submissions"""

    name = models.CharField(max_length=100, verbose_name=_("Name"))
    email = models.EmailField(verbose_name=_("Email"))
    subject = models.CharField(max_length=200, verbose_name=_("Subject"))
    message = models.TextField(verbose_name=_("Message"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    is_read = models.BooleanField(default=False, verbose_name=_("Is Read"))
    is_replied = models.BooleanField(default=False, verbose_name=_("Is Replied"))
    ip_address = models.GenericIPAddressField(
        blank=True, null=True, verbose_name=_("IP Address")
    )
    user_agent = models.TextField(blank=True, null=True, verbose_name=_("User Agent"))

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Contact Message")
        verbose_name_plural = _("Contact Messages")

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

    def mark_as_read(self):
        """Mark message as read"""
        self.is_read = True
        self.save(update_fields=["is_read"])

    def mark_as_replied(self):
        """Mark message as replied"""
        self.is_replied = True
        self.save(update_fields=["is_replied"])


class Merchandise(models.Model):
    name = models.CharField(blank=True, null=True)
    image = models.ImageField(upload_to="merchandise/", blank=True, null=True)


class MediaItem(models.Model):
    """Model for storing media items (images, videos, album covers)"""

    MEDIA_TYPE_CHOICES = [
        ("image", "Image/Album Cover"),
        ("video_file", "Video File"),
        ("video_link", "Video Link (YouTube/Vimeo)"),
    ]

    title = models.CharField(
        max_length=200, help_text="Title of the media item", blank=True, null=True
    )
    description = models.TextField(
        blank=True, null=True, help_text="Optional description"
    )
    media_type = models.CharField(
        max_length=20, choices=MEDIA_TYPE_CHOICES, help_text="Type of media content"
    )

    # Image field for album covers, photos, etc.
    image = models.ImageField(
        upload_to="media/images/",
        blank=True,
        null=True,
        help_text="Upload an image or album cover",
    )

    # Video file upload
    video_file = models.FileField(
        upload_to="media/videos/",
        blank=True,
        null=True,
        help_text="Upload a video file (MP4, WebM, etc.)",
    )

    # Video link for YouTube, Vimeo, etc.
    video_link = models.URLField(
        blank=True, null=True, help_text="YouTube, Vimeo, or other video link"
    )

    # Ordering
    order = models.PositiveIntegerField(
        default=0, help_text="Order for displaying items (lower numbers appear first)"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = _("Media Item")
        verbose_name_plural = _("Media Items")

    def __str__(self):
        return f"{self.title} ({self.get_media_type_display()})"

    def clean(self):
        """Validate that the appropriate field is filled based on media_type"""
        from django.core.exceptions import ValidationError

        if self.media_type == "image" and not self.image:
            raise ValidationError("Image is required for image media type.")
        elif self.media_type == "video_file" and not self.video_file:
            raise ValidationError("Video file is required for video file media type.")
        elif self.media_type == "video_link" and not self.video_link:
            raise ValidationError("Video link is required for video link media type.")

    def get_video_embed_url(self):
        """Convert video link to embed URL for YouTube/Vimeo"""
        if not self.video_link:
            return None

        # YouTube
        if "youtube.com/watch?v=" in self.video_link:
            video_id = self.video_link.split("watch?v=")[1].split("&")[0]
            return f"https://www.youtube.com/embed/{video_id}"
        elif "youtu.be/" in self.video_link:
            video_id = self.video_link.split("youtu.be/")[1].split("?")[0]
            return f"https://www.youtube.com/embed/{video_id}"

        # Vimeo
        elif "vimeo.com/" in self.video_link:
            video_id = self.video_link.split("vimeo.com/")[1].split("?")[0]
            return f"https://player.vimeo.com/video/{video_id}"

        # Return original link for other services
        return self.video_link
