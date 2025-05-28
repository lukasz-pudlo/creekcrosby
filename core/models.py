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
    bio = models.TextField()
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

    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    social_facebook = models.URLField(blank=True, null=True)
    social_twitter = models.URLField(blank=True, null=True)
    social_instagram = models.URLField(blank=True, null=True)
    social_linkedin = models.URLField(blank=True, null=True)

    class Meta:
        verbose_name = _("Contact Information")
        verbose_name_plural = _("Contact Information")

    def __str__(self):
        return self.email
