"""Template helpers for image rendering."""

from django import template
from django.utils.html import format_html

register = template.Library()


@register.simple_tag(name="img_dims")
def img_dims(image_field):
    """Emit width/height attributes for an ImageField.

    The browser needs the intrinsic size to reserve space before the bytes
    arrive. Without it an image occupies no height until it loads, then
    pushes everything below it down -- which makes an in-page anchor land
    short on a cold load, since the target moves after the scroll starts.

    Reading .width/.height opens the file, so a missing or unreadable upload
    would otherwise raise and take the whole page with it. Falling back to no
    attributes just restores today's behaviour for that one image.
    """
    try:
        return format_html(
            ' width="{}" height="{}"', image_field.width, image_field.height
        )
    except Exception:
        return ""
