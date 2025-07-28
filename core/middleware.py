import os
from django.conf import settings
from django.http import Http404, HttpResponsePermanentRedirect, StreamingHttpResponse
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


class MediaDirectoryMiddleware(MiddlewareMixin):
    """
    Middleware to ensure media directories exist when needed for file uploads.
    This creates directories only when actually needed, not during settings import.
    """

    _directories_checked = False

    def process_request(self, request):
        # Only check for file upload requests
        if request.method == 'POST' and (
            request.content_type and 'multipart' in request.content_type
        ):
            self._ensure_media_directories()

        return None

    def _ensure_media_directories(self):
        """Ensure media directories exist, but only once per app lifecycle"""
        if MediaDirectoryMiddleware._directories_checked:
            return

        try:
            # Create main media directory
            if not os.path.exists(settings.MEDIA_ROOT):
                os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
                print(f"Created media directory: {settings.MEDIA_ROOT}")

            # Create subdirectories for different upload types
            subdirs = ['band', 'events', 'about']
            for subdir in subdirs:
                subdir_path = os.path.join(settings.MEDIA_ROOT, subdir)
                if not os.path.exists(subdir_path):
                    os.makedirs(subdir_path, exist_ok=True)
                    print(f"Created media subdirectory: {subdir_path}")

            MediaDirectoryMiddleware._directories_checked = True

        except OSError as e:
            print(f"Warning: Could not create media directories: {e}")
            # Don't fail the request, just log the warning


class MediaStreamingMiddleware(MiddlewareMixin):
    """
    Middleware to stream large media files efficiently.
    This prevents timeout issues when serving large audio/video files.
    """

    def process_request(self, request):
        # Only handle media file requests
        if not request.path.startswith(settings.MEDIA_URL):
            return None

        # Get the file path
        media_path = request.path[len(settings.MEDIA_URL):]
        file_path = os.path.join(settings.MEDIA_ROOT, media_path)

        # Check if file exists
        if not os.path.exists(file_path):
            raise Http404("Media file not found")

        # Only stream large files (> 10MB)
        file_size = os.path.getsize(file_path)
        if file_size < 10 * 1024 * 1024:  # 10MB threshold
            return None

        # Stream the file
        return self._stream_file(file_path, request)

    def _stream_file(self, file_path, request):
        """Stream a file in chunks to handle large files efficiently."""

        def file_iterator(file_path, chunk_size=8192):
            """Generator to read file in chunks."""
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk

        # Get file info
        file_size = os.path.getsize(file_path)
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'

        # Handle range requests for video/audio streaming
        range_header = request.META.get('HTTP_RANGE')
        if range_header:
            return self._handle_range_request(file_path, range_header, content_type, file_size)

        # Create streaming response
        response = StreamingHttpResponse(
            file_iterator(file_path),
            content_type=content_type
        )
        response['Content-Length'] = str(file_size)
        response['Accept-Ranges'] = 'bytes'

        # Add cache headers for media files
        response['Cache-Control'] = 'public, max-age=3600'

        return response

    def _handle_range_request(self, file_path, range_header, content_type, file_size):
        """Handle HTTP range requests for streaming media."""

        # Parse range header
        range_match = range_header.replace('bytes=', '').split('-')
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else file_size - 1

        # Ensure valid range
        start = max(0, start)
        end = min(file_size - 1, end)
        content_length = end - start + 1

        def range_file_iterator(file_path, start, end, chunk_size=8192):
            """Generator to read file range in chunks."""
            with open(file_path, 'rb') as f:
                f.seek(start)
                remaining = end - start + 1
                while remaining > 0:
                    chunk_size = min(chunk_size, remaining)
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        # Create partial content response
        response = StreamingHttpResponse(
            range_file_iterator(file_path, start, end),
            status=206,
            content_type=content_type
        )

        response['Content-Length'] = str(content_length)
        response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
        response['Accept-Ranges'] = 'bytes'
        response['Cache-Control'] = 'public, max-age=3600'

        return response
