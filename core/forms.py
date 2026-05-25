from django import forms
from django.core.validators import EmailValidator

from .models import ContactMessage


class ContactMessageForm(forms.ModelForm):
    """Form for contact message submissions"""

    class Meta:
        model = ContactMessage
        fields = ["name", "email", "subject", "message"]
        widgets = {
            "name": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Your Name",
                    "required": True,
                }
            ),
            "email": forms.EmailInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "your.email@example.com",
                    "required": True,
                }
            ),
            "subject": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Subject",
                    "required": True,
                }
            ),
            "message": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "placeholder": "Your message...",
                    "rows": 6,
                    "required": True,
                }
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add custom validation
        self.fields["email"].validators.append(EmailValidator())

        # Make all fields required
        for field in self.fields.values():
            field.required = True

    def clean_name(self):
        """Validate name"""
        name = self.cleaned_data.get("name")
        if name and len(name) < 2:
            raise forms.ValidationError("Name must be at least 2 characters long.")
        return name
