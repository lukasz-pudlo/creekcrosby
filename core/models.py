from django.db import models
from django.utils.translation import gettext_lazy as _


class Event(models.Model):
    """Model for storing band event information"""

    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=255)
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
        blank=True, null=True, verbose_name=_("IP Address"))
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
        self.save(update_fields=['is_read'])

    def mark_as_replied(self):
        """Mark message as replied"""
        self.is_replied = True
        self.save(update_fields=['is_replied'])
