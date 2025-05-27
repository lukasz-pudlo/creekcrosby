from django.conf import settings
from django.http import HttpResponsePermanentRedirect
from django.utils.deprecation import MiddlewareMixin


class DisableCSRFForAPI:
    """Temporarily disable CSRF for API endpoints during development"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Disable CSRF for all API requests
        if request.path.startswith("/api/"):
            setattr(request, "_dont_enforce_csrf_checks", True)

        response = self.get_response(request)
        return response


class TrailingSlashMiddleware:
    """Add trailing slash to URLs that need it"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List of paths that should have trailing slashes
        paths_needing_slash = ["/admin"]

        path = request.path_info

        # Check if path needs a trailing slash and doesn't have one
        for needed_path in paths_needing_slash:
            if path == needed_path and not path.endswith("/"):
                # Redirect to version with trailing slash
                new_path = path + "/"
                if request.GET:
                    new_path += "?" + request.GET.urlencode()
                return HttpResponsePermanentRedirect(new_path)

        response = self.get_response(request)
        return response


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
            response["Content-Security-Policy"] = csp

        # Prevent MIME type sniffing
        response["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response["X-Frame-Options"] = "DENY"

        # Enable XSS filter in browser
        response["X-XSS-Protection"] = "1; mode=block"

        # Control the referrer information sent in requests
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Feature Policy to disable potentially dangerous features
        response["Feature-Policy"] = (
            "camera 'none'; microphone 'none'; geolocation 'none'"
        )

        return response


class NgrokAllowedHostMiddleware(MiddlewareMixin):
    """
    Middleware to dynamically add ngrok hosts to allowed hosts.

    This middleware checks if the request is coming from an ngrok.io or
    ngrok-free.app domain and if so, adds that domain to Django's
    ALLOWED_HOSTS setting dynamically.
    """

    def process_request(self, request):
        # Get the host from the request
        host = request.get_host()

        # Check if it's an ngrok host
        if "ngrok" in host and host not in request.META.get("ALLOWED_HOSTS", []):
            # Add the host to ALLOWED_HOSTS
            from django.conf import settings

            if hasattr(settings, "ALLOWED_HOSTS"):
                if host not in settings.ALLOWED_HOSTS:
                    settings.ALLOWED_HOSTS.append(host)
                    print(f"Added {host} to ALLOWED_HOSTS dynamically")

                    # Also add to CSRF_TRUSTED_ORIGINS if available
                    if hasattr(settings, "CSRF_TRUSTED_ORIGINS"):
                        https_host = f"https://{host}"
                        if https_host not in settings.CSRF_TRUSTED_ORIGINS:
                            settings.CSRF_TRUSTED_ORIGINS.append(https_host)
                            print(f"Added {https_host} to CSRF_TRUSTED_ORIGINS")

        # Continue processing the request
        return None
