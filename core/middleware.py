from django.utils.deprecation import MiddlewareMixin
from django.conf import settings


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers to all responses
    """

    def process_response(self, request, response):
        # Content Security Policy
        if not settings.DEBUG:
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "font-src 'self'; "
                "connect-src 'self';"
            )
            response['Content-Security-Policy'] = csp

        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'

        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'

        # Enable XSS filter in browser
        response['X-XSS-Protection'] = '1; mode=block'

        # Control the referrer information sent in requests
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Feature Policy to disable potentially dangerous features
        response['Feature-Policy'] = "camera 'none'; microphone 'none'; geolocation 'none'"

        return response
