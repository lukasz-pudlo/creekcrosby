"""
Custom template filters for markdown processing and rich text formatting.
"""

import re
import markdown
from django import template
from django.utils.safestring import mark_safe

register = template.Library()


@register.filter(name='markdown')
def markdown_filter(text):
    """
    Convert markdown text to HTML with safe formatting.
    Supports basic markdown: **bold**, *italic*, headers, links, and line breaks.
    """
    if not text:
        return ''
    
    # Configure markdown with safe extensions
    md = markdown.Markdown(
        extensions=[
            'markdown.extensions.nl2br',  # Convert newlines to <br>
            'markdown.extensions.fenced_code',  # Support for code blocks
            'markdown.extensions.tables',  # Support for tables
            'markdown.extensions.toc',  # Table of contents
        ],
        safe_mode=False,  # We'll handle safety ourselves
        enable_attributes=False  # Disable attribute syntax for security
    )
    
    # Convert markdown to HTML
    html = md.convert(text)
    
    # Additional safety: strip any potentially dangerous tags
    # Allow only basic formatting tags
    allowed_tags = ['p', 'br', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td']
    
    # Simple tag whitelist (basic implementation)
    # In production, consider using bleach library for more robust cleaning
    html = re.sub(r'<(?!/?(?:' + '|'.join(allowed_tags) + r')\b)[^>]*>', '', html)
    
    return mark_safe(html)


@register.filter(name='simple_format')
def simple_format(text):
    """
    Simple text formatting that preserves line breaks and basic markdown.
    Lighter alternative to full markdown processing.
    """
    if not text:
        return ''
    
    # Escape HTML first
    from django.utils.html import escape
    text = escape(text)
    
    # Convert double newlines to paragraphs
    text = re.sub(r'\n\s*\n', '</p><p>', text)
    text = f'<p>{text}</p>'
    
    # Convert single newlines to <br>
    text = re.sub(r'\n', '<br>', text)
    
    # Convert **bold** to <strong>
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Convert *italic* to <em>
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    
    # Convert [text](url) to links
    text = re.sub(
        r'\[([^\]]+)\]\(([^)]+)\)',
        r'<a href="\2" target="_blank" rel="noopener">\1</a>',
        text
    )
    
    # Convert bullet points
    text = re.sub(r'<br>•\s*', '<br>• ', text)
    
    return mark_safe(text)


@register.filter(name='truncate_words_html')
def truncate_words_html(value, arg):
    """
    Truncate HTML content to a specified number of words while preserving HTML tags.
    """
    try:
        length = int(arg)
    except ValueError:
        return value
    
    # Strip HTML for word counting
    import re
    text_only = re.sub(r'<[^>]*>', '', value)
    words = text_only.split()
    
    if len(words) <= length:
        return value
    
    # If we need to truncate, do it on the HTML version
    truncated_words = words[:length]
    truncated_text = ' '.join(truncated_words)
    
    # Simple approach: find where to cut in the original HTML
    # This is basic - for production, consider using a proper HTML parser
    return mark_safe(value[:len(truncated_text)] + '...') 