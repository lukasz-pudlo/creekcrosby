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


class NgrokAllowedHostMiddleware(MiddlewareMixin):
    """
    Middleware to dynamically add ngrok hosts to allowed hosts.

    This middleware checks if the request is coming from an ngrok.io or ngrok-free.app domain
    and if so, adds that domain to Django's ALLOWED_HOSTS setting dynamically.
    """

    def process_request(self, request):
        # Get the host from the request
        host = request.get_host()

        # Check if it's an ngrok host
        if 'ngrok' in host and host not in request.META.get('ALLOWED_HOSTS', []):
            # Add the host to ALLOWED_HOSTS
            from django.conf import settings
            if hasattr(settings, 'ALLOWED_HOSTS'):
                if host not in settings.ALLOWED_HOSTS:
                    settings.ALLOWED_HOSTS.append(host)
                    print(f"Added {host} to ALLOWED_HOSTS dynamically")

                    # Also add to CSRF_TRUSTED_ORIGINS if available
                    if hasattr(settings, 'CSRF_TRUSTED_ORIGINS'):
                        https_host = f'https://{host}'
                        if https_host not in settings.CSRF_TRUSTED_ORIGINS:
                            settings.CSRF_TRUSTED_ORIGINS.append(https_host)
                            print(
                                f"Added {https_host} to CSRF_TRUSTED_ORIGINS dynamically")

        # Continue processing the request
        return None
